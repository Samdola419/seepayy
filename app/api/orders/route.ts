import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PLATFORM_CUT_GHS } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const { vendorId, customerName, customerPhone, customerAddress, items, totalAmount } = await req.json();

    if (!vendorId || !customerName || !customerPhone || !items || !items.length || !totalAmount) {
      return NextResponse.json({ error: 'Please provide all order details' }, { status: 400 });
    }

    const numericTotal = Number(totalAmount);
    const platformFee = PLATFORM_CUT_GHS;
    const vendorAmount = Math.max(0, numericTotal - platformFee);

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        vendor_id: vendorId,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress ? customerAddress.trim() : null,
        total_amount: numericTotal,
        platform_fee: platformFee,
        vendor_amount: vendorAmount,
        payment_status: 'pending',
        fulfillment_status: 'pending',
        items: items,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId parameter is required' }, { status: 400 });
    }

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, fulfillmentStatus, paymentStatus } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (fulfillmentStatus) updates.fulfillment_status = fulfillmentStatus;
    if (paymentStatus) updates.payment_status = paymentStatus;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update order' }, { status: 500 });
  }
}
