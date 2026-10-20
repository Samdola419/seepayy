import { NextResponse } from 'next/server';
import { verifyPaystackSignature, AGENT_COMMISSION_GHS } from '@/lib/paystack';
import { supabaseAdmin } from '@/lib/supabase';
import { sendArkeselSMS } from '@/lib/arkesel';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';

    // Verify webhook authenticity
    const isValid = verifyPaystackSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Paystack signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    if (event === 'charge.success') {
      const metadata = data.metadata || {};
      const { type, vendor_id, order_id, agent_id } = metadata;

      // ========================================================================
      // 1. VENDOR ACTIVATION FEE (GHS 150.00)
      // ========================================================================
      if (type === 'activation' && vendor_id) {
        // Mark vendor as active and paid
        const { data: vendor, error: vErr } = await supabaseAdmin
          .from('vendors')
          .update({
            is_active: true,
            activation_fee_paid: true,
          })
          .eq('id', vendor_id)
          .select()
          .single();

        if (vErr) {
          console.error('Failed to update vendor activation status:', vErr);
        }

        const effectiveAgentId = agent_id || vendor?.agent_id;

        // Process Agent Commission (GHS 50.00) if referred
        if (effectiveAgentId) {
          // Increment agent balance
          const { data: agent } = await supabaseAdmin
            .from('agents')
            .select('*')
            .eq('id', effectiveAgentId)
            .single();

          if (agent) {
            const newBalance = Number(agent.balance_earned || 0) + AGENT_COMMISSION_GHS;
            await supabaseAdmin
              .from('agents')
              .update({ balance_earned: newBalance })
              .eq('id', effectiveAgentId);

            // Record in commissions / payouts
            try {
              await supabaseAdmin.from('commissions').insert({
                agent_id: effectiveAgentId,
                vendor_id: vendor_id,
                amount: AGENT_COMMISSION_GHS,
                status: 'paid',
              });
            } catch (cErr) {
              // Fallback to payouts if commissions table is not present
              await supabaseAdmin.from('payouts').insert({
                agent_id: effectiveAgentId,
                amount: AGENT_COMMISSION_GHS,
                status: 'pending',
                momo_reference: data.reference,
              });
            }

            // Send instant SMS alert to Agent
            await sendArkeselSMS(
              agent.momo_number,
              `SeePay: Congratulations! Vendor "${vendor?.business_name || 'Your referral'}" has activated. GH₵${AGENT_COMMISSION_GHS.toFixed(2)} commission credited to your balance.`
            );
          }
        }

        // Send instant SMS alert to Vendor
        if (vendor?.whatsapp_number || vendor?.owner_momo_number) {
          const vendorPhone = vendor.whatsapp_number || vendor.owner_momo_number;
          await sendArkeselSMS(
            vendorPhone,
            `SeePay: Congratulations! Your online store is officially LIVE at ${vendor.subdomain}.seepay.shop. You can now receive instant MoMo orders directly to your wallet!`
          );
        }
      }

      // ========================================================================
      // 2. CUSTOMER ORDER COMPLETED
      // ========================================================================
      if (type === 'order' && order_id) {
        // Mark order as paid
        const { data: order, error: oErr } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            paystack_reference: data.reference,
          })
          .eq('id', order_id)
          .select()
          .single();

        if (oErr) {
          console.error('Failed to update order status:', oErr);
        }

        if (order) {
          // Fetch vendor for details
          const { data: vendor } = await supabaseAdmin
            .from('vendors')
            .select('*')
            .eq('id', order.vendor_id)
            .single();

          const totalFormatted = `GH₵${Number(order.total_amount).toFixed(2)}`;

          // 1. Instant SMS alert to Customer
          if (order.customer_phone) {
            await sendArkeselSMS(
              order.customer_phone,
              `SeePay: Payment of ${totalFormatted} received for your order at ${vendor?.business_name || 'the store'}! Ref: ${data.reference}. You will be contacted for delivery.`
            );
          }

          // 2. Instant SMS alert to Vendor
          if (vendor?.whatsapp_number || vendor?.owner_momo_number) {
            const vendorPhone = vendor.whatsapp_number || vendor.owner_momo_number;
            await sendArkeselSMS(
              vendorPhone,
              `SeePay: New Paid Order! Customer: ${order.customer_name} (${order.customer_phone}). Total: ${totalFormatted}. Check your SeePay dashboard to fulfill.`
            );
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Paystack webhook error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
