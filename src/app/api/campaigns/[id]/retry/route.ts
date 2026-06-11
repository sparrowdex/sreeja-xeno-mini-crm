import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const campaignId = params.id;

    // Fetch the campaign and failed logs
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        communicationLogs: {
          where: { status: 'failed' }
        }
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const failedLogs = campaign.communicationLogs;
    if (failedLogs.length === 0) {
      return NextResponse.json({ message: 'No failed logs to retry' }, { status: 200 });
    }

    // Update campaign status to sending if it was completed
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: 'sending' }
    });

    // Reset failed logs to pending
    const logIds = failedLogs.map(log => log.id);
    await prisma.communicationLog.updateMany({
      where: { id: { in: logIds } },
      data: { status: 'pending' }
    });

    // Re-queue to the channel stub
    await fetch('http://localhost:3000/api/channel-stub/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: campaign.id,
        communications: failedLogs.map(log => ({
          id: log.id,
          customerId: log.customerId,
          message: campaign.messageTemplate
        }))
      })
    });

    return NextResponse.json({ message: 'Retried successfully' });
  } catch (error) {
    console.error('Error retrying campaign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
