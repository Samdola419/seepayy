import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const cleanSubdomain = (subdomain || '').toLowerCase().trim();

    const { data: vendor, error: vErr } = await supabaseAdmin
      .from('vendors')
      .select('id, business_name, subdomain, whatsapp_number, owner_momo_network, is_active, activation_fee_paid')
      .eq('subdomain', cleanSubdomain)
      .maybeSingle();

    if (vErr || !vendor) {
      return NextResponse.json({ error: 'Storefront not found' }, { status: 404 });
    }

    const { data: products } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      vendor,
      products: products || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch store' }, { status: 500 });
  }
}
