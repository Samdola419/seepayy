import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SP-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const { fullName, momoNumber, momoNetwork } = await req.json();

    if (!fullName || !momoNumber || !momoNetwork) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    // Check if agent already exists with this MoMo number
    const { data: existingAgent } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('momo_number', momoNumber.trim())
      .maybeSingle();

    if (existingAgent) {
      return NextResponse.json({ success: true, agent: existingAgent, existing: true });
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const { data: collision } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (!collision) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
        attempts++;
      }
    }

    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .insert({
        full_name: fullName.trim(),
        momo_number: momoNumber.trim(),
        momo_network: momoNetwork,
        referral_code: referralCode,
        balance_earned: 0.00,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, agent });
  } catch (err: any) {
    console.error('Agent registration error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
