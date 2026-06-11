import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // 1. Gather context from the database to feed to the AI
    // We aggregate data instead of sending raw PII (Privacy by design!)
    const totalCustomers = await prisma.customer.count();
    
    // Get a sample of tags and their distributions (simulated by just fetching some customers)
    const recentCustomers = await prisma.customer.findMany({
      take: 100,
      select: { tags: true, orders: { select: { amount: true, status: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // Simple aggregation for the prompt
    let highValueCount = 0;
    let churnRiskCount = 0;
    
    recentCustomers.forEach(c => {
      const tags = c.tags ? JSON.parse(c.tags) : [];
      if (tags.includes('high-value')) highValueCount++;
      if (tags.includes('churn-risk')) churnRiskCount++;
    });

    const context = `
      We have ${totalCustomers} total customers.
      In a recent sample of 100 customers:
      - ${highValueCount} are tagged as 'high-value'.
      - ${churnRiskCount} are tagged as 'churn-risk'.
      
      The ONLY valid tags in our database are: ['high-value', 'churn-risk', 'new-user', 'frequent-buyer', 'discount-seeker'].
      
      We are an e-commerce brand looking to increase retention and average order value.
    `;

    // 2. Call Vercel AI SDK with Gemini OR use a Mock if no API key is provided
    let suggestions = [];
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY || 
        process.env.GOOGLE_GENERATIVE_AI_API_KEY === "paste_your_key_here" ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY === "your_api_key_here") {
      console.log("No Gemini API key found. Using Mock AI Service for local development.");
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockPool = [
        {
          title: "Win-Back High Value Users",
          reasoning: `We noticed ${churnRiskCount} users are tagged as 'churn-risk'. Targeting the high-value segment among them with an aggressive discount can salvage significant revenue.`,
          suggestedSegment: "Customers with tags 'high-value' AND 'churn-risk'",
          targetTags: ["high-value", "churn-risk"],
          suggestedMessage: "Hey! We've missed you. Here's an exclusive 20% off your next purchase to welcome you back."
        },
        {
          title: "Loyalty VIP Access",
          reasoning: "Reward frequent buyers who aren't currently at risk to increase lifetime value and brand advocacy.",
          suggestedSegment: "Customers with tags 'frequent-buyer' without 'churn-risk'",
          targetTags: ["frequent-buyer"],
          suggestedMessage: "Thanks for being a top customer! Enjoy early access to our upcoming holiday sale."
        },
        {
          title: "New User Onboarding",
          reasoning: "New users who haven't made a second purchase within 14 days have a 70% drop-off rate. A quick nudge increases conversion.",
          suggestedSegment: "Customers with tag 'new-user' with exactly 1 order",
          targetTags: ["new-user"],
          suggestedMessage: "Still thinking about it? Use code WELCOME10 for 10% off your next order."
        },
        {
          title: "Clearance for Discount Seekers",
          reasoning: "Users tagged as 'discount-seeker' have high price elasticity. Notifying them of a flash sale moves stagnant inventory quickly.",
          suggestedSegment: "Customers with tag 'discount-seeker'",
          targetTags: ["discount-seeker"],
          suggestedMessage: "Flash Sale Alert! ⚡ 48 hours only. Grab your favorites at up to 50% off before they are gone."
        }
      ];
      
      // Shuffle and pick 3
      suggestions = mockPool.sort(() => 0.5 - Math.random()).slice(0, 3);
    } else {
      const { object } = await generateObject({
        model: google('gemini-2.5-flash'),
        system: 'You are a proactive, data-driven Chief Marketing Officer AI. Analyze the database context and suggest 3 to 4 actionable, highly diverse marketing campaigns covering different segments.',
        prompt: `Analyze the following CRM data and suggest highly diverse campaigns (e.g. win-backs, loyalty rewards, new user onboarding):\n\n${context}`,
        schema: z.object({
          suggestions: z.array(z.object({
            title: z.string().describe('Catchy internal name for the campaign'),
            reasoning: z.string().describe('Why this campaign makes sense based on the data'),
            suggestedSegment: z.string().describe('Description of the target audience (e.g., "Customers tagged as churn-risk")'),
            targetTags: z.array(z.string()).describe('An array of exact string tags to target. YOU MUST ONLY USE TAGS FROM THE PROVIDED LIST (e.g. "high-value", "churn-risk", "new-user", "frequent-buyer", "discount-seeker"). Do not hallucinate new tags.'),
            suggestedMessage: z.string().describe('A draft of the SMS or Email message to send'),
          })).min(3).max(4),
        }),
      });
      suggestions = object.suggestions;
    }

    // 3. Save the suggestions to the database
    for (const suggestion of suggestions) {
      await prisma.campaignSuggestion.create({
        data: {
          title: suggestion.title,
          reasoning: suggestion.reasoning,
          suggestedSegment: suggestion.suggestedSegment,
          targetTags: JSON.stringify(suggestion.targetTags || []),
          suggestedMessage: suggestion.suggestedMessage,
          status: 'pending',
        }
      });
    }

    // 4. Redirect back to the dashboard to see the new insights
    return NextResponse.redirect(new URL('/', req.url), { status: 303 });

  } catch (error: any) {
    console.error('Error running Insight Engine:', error);
    
    // Attempt to parse the error message to identify rate limits or service unavailability
    const errorMessage = error?.message?.toLowerCase() || '';
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('too many requests');
    const isUnavailable = errorMessage.includes('503') || errorMessage.includes('unavailable') || errorMessage.includes('overloaded');
    
    const errorType = isRateLimit ? 'rate_limit' : (isUnavailable ? 'service_unavailable' : 'engine_failed');
    
    return NextResponse.redirect(new URL(`/?error=${errorType}`, req.url), { status: 303 });
  }
}
