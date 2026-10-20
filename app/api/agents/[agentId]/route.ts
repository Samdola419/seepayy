import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params;

    const { data: agent, error: aErr } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (aErr || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Fetch vendors referred by this agent
    const { data: referredVendors } = await supabaseAdmin
      .from('vendors')
      .select('id, business_name, subdomain, is_active, activation_fee_paid, created_at')
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false });

    // Count activated vendors
    const activatedCount = (referredVendors || []).filter(v => v.activation_fee_paid).length;
    const pendingCount = (referredVendors || []).length - activatedCount;
    const computedEarnings = activatedCount * 50.00;

    return NextResponse.json({
      success: true,
      agent: {
        ...agent,
        balance_earned: Number(agent.balance_earned) || computedEarnings,
      },
      stats: {
        totalReferred: (referredVendors || []).length,
        activatedCount,
        pendingCount,
        totalEarnings: Number(agent.balance_earned) || computedEarnings,
      },
      vendors: referredVendors || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch agent profile' }, { status: 500 });
  }
}
