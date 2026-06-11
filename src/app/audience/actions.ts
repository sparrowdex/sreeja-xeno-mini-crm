'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({ where: { id } });
    revalidatePath('/audience');
  } catch (error) {
    console.error("Failed to delete customer:", error);
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    
    await prisma.customer.update({
      where: { id },
      data: { name, phone: phone || null }
    });
    revalidatePath('/audience');
  } catch (error) {
    console.error("Failed to update customer:", error);
  }
}
