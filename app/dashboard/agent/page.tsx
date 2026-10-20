'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Copy,
  Check,
  DollarSign,
  Store,
  Clock,
  CheckCircle2,
  Share2,
  ExternalLink,
  MessageCircle,
  Zap,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Agent, Vendor } from '@/lib/types';

export default function AgentDashboard() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [stats, setStats] = useState({
    totalReferred: 0,
    activatedCount: 0,
    pendingCount: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('seepay_agent');
    if (!saved) {
      router.push('/login');
      return;
    }

    try {
      const parsed: Agent = JSON.parse(saved);
      setAgent(parsed);
      loadAgentData(parsed.id);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const loadAgentData = async (agentId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      const data = await res.json();
      if (data.agent) setAgent(data.agent);
      if (data.stats) setStats(data.stats);
      if (data.vendors) setVendors(data.vendors);
    } catch (err) {
      console.error('Failed to load agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = agent ? `https://seepay.shop/register?ref=${agent.referral_code}` : '';

  const handleCopyCode = () => {
    if (!agent) return;
    navigator.clipboard.writeText(agent.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSignOut = () => {
    localStorage.removeItem('seepay_agent');
    localStorage.removeItem('seepay_role');
    router.push('/login');
  };

  if (!agent) {
    return <div className="min-h-screen bg-[#07130F] flex items-center justify-center text-slate-400">Loading agent portal...</div>;
  }

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07130F]/90 border-b border-emerald-950/60 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-slate-950">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">{agent.full_name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Certified Agent
                </span>
              </div>
              <p className="text-xs text-slate-400">Payout MoMo: {agent.momo_number} ({agent.momo_network})</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAgentData(agent.id)}
              className="px-3 py-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 text-slate-400 hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Banner with Referral Link */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#0B1E17] to-emerald-950/40 border border-amber-500/30 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Earn GH₵ 50.00 for every business that goes live</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Your Exclusive Referral Link
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Send this link to food vendors, online sellers, or businesses. When they register and pay their setup fee, your MoMo balance automatically gets GH₵ 50.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#07130F] border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Referral Code</span>
                  <span className="text-lg font-black font-mono text-amber-400">{agent.referral_code}</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-amber-300"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hello! Stop losing money to fake MoMo payment screenshots. Launch your branded online store on SeePay in 2 minutes: ${referralLink}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total Earned</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">
              GH₵ {stats.totalEarnings.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">GH₵ 50.00 × {stats.activatedCount} activated shops</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Shops Onboarded</span>
              <Store className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalReferred}</div>
            <div className="text-[11px] text-slate-500 mt-1">Total merchants signed up with your link</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Activated (Paid)</span>
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.activatedCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Stores that paid setup and earned you cash</div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Pending Setup</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-black text-slate-300">{stats.pendingCount}</div>
            <div className="text-[11px] text-slate-500 mt-1">Nudge them on WhatsApp to activate</div>
          </div>
        </div>

        {/* Commission Tracker Live Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Referred Vendors & Commission Tracker</h3>
              <p className="text-xs text-slate-400">Track each shop you signed up and your payout status</p>
            </div>

            {stats.totalEarnings > 0 && (
              <button
                onClick={() => {
                  setPayoutRequested(true);
                  setTimeout(() => setPayoutRequested(false), 3000);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors"
              >
                {payoutRequested ? 'Withdrawal Submitted!' : 'Request MoMo Payout'}
              </button>
            )}
          </div>

          {vendors.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-[#0B1E17] border border-emerald-900/40">
              <Users className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <h4 className="font-bold text-white">No Vendors Onboarded Yet</h4>
              <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                Share your referral link on WhatsApp status, Instagram, or visit local shops in your area to get started!
              </p>
              <button
                onClick={handleCopyLink}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Copy My Referral Link
              </button>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#0B1E17] border border-emerald-900/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#07130F] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-emerald-900/50">
                    <tr>
                      <th className="py-4 px-6">Business Name</th>
                      <th className="py-4 px-6">Store Subdomain</th>
                      <th className="py-4 px-6">Date Registered</th>
                      <th className="py-4 px-6">Store Status</th>
                      <th className="py-4 px-6 text-right">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-950/50">
                    {vendors.map((v) => (
                      <tr key={v.id} className="hover:bg-[#07130F]/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          {v.business_name}
                        </td>
                        <td className="py-4 px-6 font-mono text-emerald-400">
                          {v.subdomain}.seepay.shop
                        </td>
                        <td className="py-4 px-6 text-slate-400">
                          {new Date(v.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              v.activation_fee_paid
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {v.activation_fee_paid ? 'ACTIVE (PAID)' : 'PENDING SETUP'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-sm">
                          {v.activation_fee_paid ? (
                            <span className="text-amber-400">GH₵ 50.00</span>
                          ) : (
                            <span className="text-slate-500">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
