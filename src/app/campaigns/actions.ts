'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteCampaign(id: string) {
  // Delete communication logs first to satisfy foreign key constraints
  await prisma.communicationLog.deleteMany({
    where: { campaignId: id }
  });
  
  await prisma.campaign.delete({
    where: { id }
  });

  revalidatePath('/campaigns');
}
