import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const suggestionId = formData.get('suggestionId') as string;

    if (!suggestionId) {
      return NextResponse.json({ error: 'Missing suggestionId' }, { status: 400 });
    }

    // 1. Fetch the suggestion
    const suggestion = await prisma.campaignSuggestion.findUnique({
      where: { id: suggestionId }
    });

    if (!suggestion || suggestion.status !== 'pending') {
      return NextResponse.json({ error: 'Invalid or already processed suggestion' }, { status: 400 });
    }

    // 2. Resolve the Target Audience using the structured targetTags
    const tagsToMatch: string[] = suggestion.targetTags ? JSON.parse(suggestion.targetTags) : [];
    
    // Fetch all customers and filter (fine for a prototype with 500 rows)
    const allCustomers = await prisma.customer.findMany();
    const targetedCustomers = allCustomers.filter(c => {
      const cTags = c.tags ? JSON.parse(c.tags) : [];
      if (tagsToMatch.length === 0) return true; // fallback
      return tagsToMatch.some(t => cTags.includes(t));
    });

    // If no one matches, just take 5 random people for the demo's sake
    const finalAudience = targetedCustomers.length > 0 ? targetedCustomers : allCustomers.slice(0, 5);

    // 3. Create the Database Records
    // Create Segment
    const segment = await prisma.segment.create({
      data: {
        name: `AI Segment: ${suggestion.title}`,
        description: suggestion.suggestedSegment,
        rules: JSON.stringify(tagsToMatch)
      }
    });

    // Create Campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: suggestion.title,
        segmentId: segment.id,
        messageTemplate: suggestion.suggestedMessage,
        status: 'sending'
      }
    });

    // Create Communication Logs (pending state)
    const logsData = finalAudience.map(customer => ({
      campaignId: campaign.id,
      customerId: customer.id,
      channel: 'email', // Defaulting to email for prototype
      status: 'pending'
    }));

    await prisma.communicationLog.createMany({ data: logsData });

    // Fetch the logs back so we have their IDs to send to the channel stub
    const createdLogs = await prisma.communicationLog.findMany({
      where: { campaignId: campaign.id }
    });

    // 4. Send to the Channel Service Stub
    // In a real system, you'd enqueue this in a message broker (RabbitMQ/Kafka).
    await fetch('http://localhost:3000/api/channel-stub/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.id,
        communications: createdLogs.map(log => ({
          id: log.id,
          customerId: log.customerId,
          message: suggestion.suggestedMessage
        }))
      })
    });

    // 5. Update Suggestion Status
    await prisma.campaignSuggestion.update({
      where: { id: suggestion.id },
      data: { status: 'accepted' }
    });

    // Redirect to the Campaigns dashboard to watch the webhook magic!
    return NextResponse.redirect(new URL('/campaigns', req.url), { status: 303 });

  } catch (error) {
    console.error('Error executing campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
