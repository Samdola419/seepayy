import { NextResponse } from 'next/server';
import { initializeTransaction, ACTIVATION_FEE_GHS, PLATFORM_CUT_GHS } from '@/lib/paystack';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, vendorId, orderId, email, customerPhone, customerName, callbackUrl } = body;

    const userEmail = email || (customerPhone ? `${customerPhone}@seepay.shop` : 'support@seepay.shop');

    // Case 1: Vendor Activation Fee (GHS 150.00)
    if (type === 'activation') {
      if (!vendorId) {
        return NextResponse.json({ error: 'Vendor ID is required for activation' }, { status: 400 });
      }

      const { data: vendor, error } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (error || !vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
      }

      const host = req.headers.get('host') || 'seepay.shop';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const finalCallback = callbackUrl || `${protocol}://${host}/dashboard/vendor?activated=success`;

      const result = await initializeTransaction({
        email: userEmail,
        amountInGHS: ACTIVATION_FEE_GHS,
        callbackUrl: finalCallback,
        metadata: {
          type: 'activation',
          vendor_id: vendor.id,
          business_name: vendor.business_name,
          agent_id: vendor.agent_id,
        },
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        authorization_url: result.authorization_url,
        reference: result.reference,
      });
    }

    // Case 2: Customer Order on Storefront
    if (type === 'order') {
      if (!orderId || !vendorId) {
        return NextResponse.json({ error: 'Order ID and Vendor ID are required' }, { status: 400 });
      }

      const { data: order, error: orderErr } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderErr || !order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const { data: vendor } = await supabaseAdmin
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      const host = req.headers.get('host') || 'seepay.shop';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const finalCallback = callbackUrl || `${protocol}://${host}/store/${vendor?.subdomain || ''}/receipt?orderId=${order.id}`;

      const result = await initializeTransaction({
        email: userEmail,
        amountInGHS: Number(order.total_amount),
        subaccountCode: vendor?.paystack_subaccount_code,
        platformCutGHS: PLATFORM_CUT_GHS,
        callbackUrl: finalCallback,
        metadata: {
          type: 'order',
          order_id: order.id,
          vendor_id: order.vendor_id,
          customer_name: customerName || order.customer_name,
          customer_phone: customerPhone || order.customer_phone,
          vendor_name: vendor?.business_name,
        },
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      // Update order reference
      await supabaseAdmin
        .from('orders')
        .update({ paystack_reference: result.reference })
        .eq('id', order.id);

      return NextResponse.json({
        success: true,
        authorization_url: result.authorization_url,
        reference: result.reference,
      });
    }

    return NextResponse.json({ error: 'Invalid transaction type specified' }, { status: 400 });
  } catch (err: any) {
    console.error('Paystack initialize error:', err);
    return NextResponse.json({ error: err.message || 'Payment initialization failed' }, { status: 500 });
  }
}
