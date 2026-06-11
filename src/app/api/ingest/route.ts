import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Data Ingestion API
 * Requirement: "A simple API endpoint where customer data and orders are pushed into the CRM."
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.type || !data.payload) {
      return NextResponse.json({ error: 'Missing type or payload in request body' }, { status: 400 });
    }

    // 1. Ingest Customer Data
    if (data.type === 'customer') {
      const customer = await prisma.customer.upsert({
        where: { email: data.payload.email },
        update: {
          name: data.payload.name,
          phone: data.payload.phone,
          // Merge new tags or just stringify
          tags: data.payload.tags ? JSON.stringify(data.payload.tags) : undefined,
        },
        create: {
          name: data.payload.name,
          email: data.payload.email,
          phone: data.payload.phone || null,
          tags: data.payload.tags ? JSON.stringify(data.payload.tags) : null,
        }
      });
      return NextResponse.json({ success: true, message: 'Customer ingested', data: customer }, { status: 201 });
    }

    // 2. Ingest Order Data
    if (data.type === 'order') {
      const order = await prisma.order.create({
        data: {
          customerId: data.payload.customerId,
          amount: data.payload.amount,
          status: data.payload.status || 'completed',
          orderDate: data.payload.orderDate ? new Date(data.payload.orderDate) : new Date(),
        }
      });
      return NextResponse.json({ success: true, message: 'Order ingested', data: order }, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type. Expected "customer" or "order"' }, { status: 400 });

  } catch (error: any) {
    console.error("Data Ingestion Error:", error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
