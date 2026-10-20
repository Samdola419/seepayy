import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createPaystackSubaccount } from '@/lib/paystack';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      businessName,
      subdomain,
      whatsappNumber,
      ownerMomoNumber,
      ownerMomoNetwork,
      referralCode,
    } = body;

    if (!businessName || !subdomain || !whatsappNumber || !ownerMomoNumber || !ownerMomoNetwork) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9\-]/g, '');

    // Check if subdomain is already taken
    const { data: existingVendor } = await supabaseAdmin
      .from('vendors')
      .select('id')
      .eq('subdomain', cleanSubdomain)
      .maybeSingle();

    if (existingVendor) {
      return NextResponse.json(
        { error: `The store address "${cleanSubdomain}.seepay.shop" is already taken. Please choose another.` },
        { status: 409 }
      );
    }

    // Resolve agent if referral code provided
    let agentId: string | null = null;
    if (referralCode && typeof referralCode === 'string') {
      const { data: agent } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .maybeSingle();

      if (agent) {
        agentId = agent.id;
      }
    }

    // Attempt Paystack subaccount creation
    let subaccountCode: string | null = null;
    const subaccountResult = await createPaystackSubaccount({
      business_name: businessName,
      owner_momo_number: ownerMomoNumber,
      owner_momo_network: ownerMomoNetwork,
    });
    if (subaccountResult.success && subaccountResult.subaccountCode) {
      subaccountCode = subaccountResult.subaccountCode;
    }

    // Insert new vendor
    const { data: vendor, error } = await supabaseAdmin
      .from('vendors')
      .insert({
        business_name: businessName,
        subdomain: cleanSubdomain,
        whatsapp_number: whatsappNumber,
        owner_momo_number: ownerMomoNumber,
        owner_momo_network: ownerMomoNetwork,
        paystack_subaccount_code: subaccountCode,
        agent_id: agentId,
        is_active: false,
        activation_fee_paid: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, vendor });
  } catch (err: any) {
    console.error('Vendor registration error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
