
Video Walkthrough Transcript

00:00 Hello, Xeno team! My name is Sreeja. Welcome to my submission for the AI-Native Mini CRM. I am starting here on this entry portal to show you why I did not build an authentication layer. Basically, for a full-scale app, I would use something like Clerk, but to make it frictionless and focus on the features of what I incorporated, I've just added an intentional UI choice for now.

00:24 Let's move on to the next page. Now we have hit the Insight Engine. Instead of building a basic chatbot, I designed a proactive co-marketer that will analyze buyer data to suggest high-performing strategies. I'll touch this on a second, but let's look at our Campaigns tab first.

00:41 I wanted you to see what a mature campaign lifecycle looks like. This completed card will track a real-time metrics payload: the sent count, the delivered states, the calculated open and click conversion rates. To actually see how this goes in motion, we will create a new campaign. Since this is mostly AI-native, it redirects us to the Insight Engine.

01:03 Now, when I run this analysis, the backend leverages the Gemini API via the Vercel AI SDK. To keep our code highly resilient, the engine will use strict JSON structured output with Zod validation instead of brittle regex string parsing. An unexpected error came up, which is the high demand due to the Gemini API usage, so we will try again.

01:33 Hopefully, this will give us our suggestions. Yes! So, based on our seeded data of 5,000 customers—which I did using Faker.js—this has generated about three suggestions: High-Value Customers, Newly Registered, and Churn-Risk Win-Back Behavior. So, let's just use one. This is how the message payload would go, suppose in WhatsApp. Let's approve the run.

02:07 The moment I hit send, our Next.js monolith—which is the tech stack that I'm using—will trigger an event-driven loop. The CRM will then fire the payload directly to my isolated channel stub backend file, which is the api/channel-stub/send if you check in the GitHub repo. This stub will immediately hand back a 202 Accepted status, and this will handle concurrency without blocking the main thread, so it will beautifully mimic a real-world API gateway such as Twilio, maybe.

02:34 This send stub file will execute simulated network delays, and it will, in batches, fire callback packets back into our receiver endpoint, which is the webhook receipt that I set up. This completes the two-service callback loop that was required in the initial requirements. To display this live telemetry, as you can see that in real-time it's updating, what I did is I built an auto-refresher component that auto-refreshes every 4 seconds, only while a campaign is actively sending messages. And it will destroy its own loop immediately after the campaign is completed.

03:09 This is case-insensitive, so any status updates that we send to the backend, it will accordingly match it and then close the loop accordingly.

03:19 For a completed lifecycle, we also have reports for any and all failed messages. I chose to, earlier in my deployment, choose to try the retry failed messages, so currently we only have one failed message delivery. We can try this again.

03:36 This is only because if, for any unexpected reason, the message failed to send. So, as you can see, it is back into the sending process. It will now in real-time update, and as you can see, it has sent the final one failed message, and now it is fully complete. Since this is 971 total users, it will take a lot of time before it's actually completed. So now we will move on to the Audience tab.

03:59 This, of course, is to see, based on which marketer, can see how many people they are assigned to. Here you can see a lot of data, and this is paginated so that it is not heavy on the database if we keep on querying a full, large database of 5,000 users each time. Also, we can, in the viewport, add multiple users at one time instead of like a normal table database.

04:28 All of this is also mobile responsive, as you can see. Any and all cards that have, or people that have multiple tags, it will automatically auto-swipe, so if there are very many tags, then the user doesn't have to explicitly search for it. They can also search for the name accordingly. Customers... so many they can check from. They can check by their search filter tags, and it will update accordingly.

05:03 Since this is quite a bit of information for mobile, I made it swipeable from, as you can see, depending on the suggestions. You can also dismiss these suggestions and run the AI analysis again if you need it.

05:20 Yeah, this is mostly the things that I wanted to show you. The final thing that I wanted to show you is the UI choice that I did: the global background. I incorporated the Xeno logo and added a blue, dark blue gradient. The original Xeno site has lighter accents of this same hue of blue, so I wanted to make it like a high-focus separate thing and incorporate brand marketing. So, that is all my architecture design. I hope you liked it. Thank you.