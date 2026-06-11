import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, communications } = body;

    // In a real system, you'd validate the payload here.
    if (!campaignId || !communications || !Array.isArray(communications)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    console.log(`[Channel Stub] Received batch for Campaign ${campaignId}. Count: ${communications.length}`);

    // Fire-and-forget simulation logic
    // We don't await this so we can return 202 Accepted immediately.
    simulateDeliveryProcess(campaignId, communications);

    return NextResponse.json({ message: 'Batch accepted for processing' }, { status: 202 });

  } catch (error) {
    console.error('[Channel Stub] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Simulated background process
async function simulateDeliveryProcess(campaignId: string, communications: any[]) {
  // Wait a few seconds to simulate initial processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  for (const comm of communications) {
    // 1. Simulate "Sent" / "Delivered" delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    // Determine random outcome
    const random = Math.random();
    let status = 'delivered';
    if (random > 0.95) status = 'failed';
    else if (random < 0.2) status = 'clicked';
    else if (random < 0.5) status = 'opened';

    // 2. Fire webhook back to the CRM
    try {
      // In local dev, we hardcode localhost. In prod, this would be an env variable (e.g. process.env.WEBHOOK_BASE_URL)
      const res = await fetch('http://localhost:3000/api/webhooks/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communicationId: comm.id,
          campaignId: campaignId,
          status: status,
          timestamp: new Date().toISOString()
        })
      });
      
      const data = await res.json();
      if (data.warning === 'Record not found') {
        console.warn(`[Channel Stub] CRM reported record not found. Aborting remaining batch for Campaign ${campaignId} (Simulated Queue Purge).`);
        break; // Stop processing the rest of the array!
      }
      
      console.log(`[Channel Stub] Fired webhook for ${comm.id} -> ${status}`);
    } catch (err) {
      console.error(`[Channel Stub] Webhook failed for ${comm.id}`, err);
    }
  }
}
