import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { communicationId, status, timestamp } = payload;

    if (!communicationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[Webhook] Received receipt for ${communicationId}: ${status}`);

    // Update the CommunicationLog in our database
    try {
      await prisma.communicationLog.update({
        where: { id: communicationId },
        data: {
          status: status,
          updatedAt: new Date(timestamp || Date.now())
        }
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        console.warn(`[Webhook] CommunicationLog not found for ${communicationId}. Ignoring to prevent retries.`);
        return NextResponse.json({ success: true, warning: 'Record not found' }, { status: 200 });
      }
      throw e;
    }

    // In a real system, we might push this update to a WebSocket or Redis cache here
    // to update the UI in real-time.

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('[Webhook] Error processing receipt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
