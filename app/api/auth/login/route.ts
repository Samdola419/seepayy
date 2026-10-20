import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { identifier, role } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Please enter your phone number or shop address' }, { status: 400 });
    }

    const cleanInput = identifier.trim().toLowerCase();

    if (role === 'agent') {
      const { data: agent, error } = await supabaseAdmin
        .from('agents')
        .select('*')
        .or(`momo_number.eq.${cleanInput},referral_code.eq.${cleanInput.toUpperCase()}`)
        .maybeSingle();

      if (error || !agent) {
        return NextResponse.json({ error: 'No agent account found with these details' }, { status: 404 });
      }

      return NextResponse.json({ success: true, role: 'agent', data: agent });
    }

    // Default to vendor
    const { data: vendor, error } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .or(`owner_momo_number.eq.${cleanInput},whatsapp_number.eq.${cleanInput},subdomain.eq.${cleanInput.replace('.seepay.shop', '')}`)
      .maybeSingle();

    if (error || !vendor) {
      return NextResponse.json({ error: 'No vendor store found with this phone number or subdomain' }, { status: 404 });
    }

    return NextResponse.json({ success: true, role: 'vendor', data: vendor });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Login failed' }, { status: 500 });
  }
}
