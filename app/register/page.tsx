'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
} from 'lucide-react';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07130F] flex items-center justify-center text-slate-400">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'agent' ? 'agent' : 'vendor';
  const initialRef = searchParams.get('ref') || '';

  const [role, setRole] = useState<'vendor' | 'agent'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vendor Fields
  const [vendorFullName, setVendorFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [ownerMomoNumber, setOwnerMomoNumber] = useState('');
  const [ownerMomoNetwork, setOwnerMomoNetwork] = useState('MTN');
  const [referralCode, setReferralCode] = useState(initialRef);

  // Agent Fields
  const [agentFullName, setAgentFullName] = useState('');
  const [agentMomoNumber, setAgentMomoNumber] = useState('');
  const [agentMomoNetwork, setAgentMomoNetwork] = useState('MTN');

  // Auto-generate subdomain slug as business name is typed
  const handleBusinessNameChange = (val: string) => {
    setBusinessName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setSubdomain(slug);
  };

  const handleVendorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName,
          subdomain,
          whatsappNumber: whatsappNumber || ownerMomoNumber,
          ownerMomoNumber,
          ownerMomoNetwork,
          referralCode: referralCode ? referralCode.trim() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register shop');
      }

      // Store vendor session locally
      if (typeof window !== 'undefined' && data.vendor) {
        localStorage.setItem('seepay_vendor', JSON.stringify(data.vendor));
        localStorage.setItem('seepay_role', 'vendor');
      }

      router.push('/dashboard/vendor?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: agentFullName,
          momoNumber: agentMomoNumber,
          momoNetwork: agentMomoNetwork,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to register agent account');
      }

      // Store agent session
      if (typeof window !== 'undefined' && data.agent) {
        localStorage.setItem('seepay_agent', JSON.stringify(data.agent));
        localStorage.setItem('seepay_role', 'agent');
      }

      router.push('/dashboard/agent?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            See<span className="text-emerald-400">Pay</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          {role === 'vendor' ? 'Launch Your MoMo Storefront' : 'Join as a SeePay Agent'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          {role === 'vendor'
            ? 'Set up in 2 minutes and start taking verified MoMo orders.'
            : 'Earn GH₵ 50.00 cash for every vendor you onboard.'}
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 p-1 rounded-2xl bg-[#0B1E17] border border-emerald-900/60 flex max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => { setRole('vendor'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'vendor'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4" />
            Vendor
          </button>
          <button
            type="button"
            onClick={() => { setRole('agent'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              role === 'agent'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Agent (GH₵50)
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-[#0B1E17] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-emerald-900/60">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {role === 'vendor' ? (
              <motion.form
                key="vendor-form"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleVendorRegister}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ama Serwaa"
                    value={vendorFullName}
                    onChange={(e) => setVendorFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Business / Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mama Chops Kitchen"
                    value={businessName}
                    onChange={(e) => handleBusinessNameChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Storefront Address (Subdomain)
                  </label>
                  <div className="flex items-center rounded-xl bg-[#07130F] border border-emerald-900/60 px-4 py-3 focus-within:border-emerald-500">
                    <input
                      type="text"
                      required
                      placeholder="mamachops"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ''))}
                      className="w-full bg-transparent text-white placeholder-slate-600 focus:outline-none text-sm font-mono"
                    />
                    <span className="text-emerald-400 font-mono text-xs font-semibold shrink-0">.seepay.shop</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">This will be your live shareable link on Instagram and WhatsApp.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      MoMo Payout Network
                    </label>
                    <select
                      value={ownerMomoNetwork}
                      onChange={(e) => setOwnerMomoNetwork(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white focus:outline-none focus:border-emerald-500 text-sm"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="TELECEL">Telecel Cash (Vodafone)</option>
                      <option value="AIRTELTIGO">AT Money (AirtelTigo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      MoMo Wallet Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="024XXXXXXX"
                      value={ownerMomoNumber}
                      onChange={(e) => setOwnerMomoNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    WhatsApp Customer Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="054XXXXXXX"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Agent Referral Code (Optional)</span>
                    <span className="text-amber-400/80 font-normal normal-case">If an agent helped you sign up</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SP-A8X92"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-400 text-sm font-mono uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Creating Your Storefront...</span>
                  ) : (
                    <>
                      <span>Open My Free Storefront</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="agent-form"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleAgentRegister}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Get your personalized referral link. Earn GH₵ 50.00 for every business that activates on SeePay.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Agent Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwesi Mensah"
                    value={agentFullName}
                    onChange={(e) => setAgentFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Commission MoMo Network
                  </label>
                  <select
                    value={agentMomoNetwork}
                    onChange={(e) => setAgentMomoNetwork(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white focus:outline-none focus:border-amber-400 text-sm"
                  >
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="TELECEL">Telecel Cash (Vodafone)</option>
                    <option value="AIRTELTIGO">AT Money (AirtelTigo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    MoMo Number (For Cash Payouts)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="024XXXXXXX"
                    value={agentMomoNumber}
                    onChange={(e) => setAgentMomoNumber(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 text-sm font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Registering Agent Account...</span>
                  ) : (
                    <>
                      <span>Get My Agent Referral Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}