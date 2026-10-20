'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, Users, Zap, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'vendor' | 'agent'>('vendor');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your details.');
      }

      if (role === 'vendor' && data.data) {
        localStorage.setItem('seepay_vendor', JSON.stringify(data.data));
        localStorage.setItem('seepay_role', 'vendor');
        router.push('/dashboard/vendor');
      } else if (role === 'agent' && data.data) {
        localStorage.setItem('seepay_agent', JSON.stringify(data.data));
        localStorage.setItem('seepay_role', 'agent');
        router.push('/dashboard/agent');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-emerald-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            See<span className="text-emerald-400">Pay</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Welcome Back</h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Sign in to manage your storefront or track your agent earnings.
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
            Agent
          </button>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#0B1E17] py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-emerald-900/60">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {role === 'vendor' ? 'MoMo / WhatsApp Phone or Store Subdomain' : 'Agent MoMo Number or Referral Code'}
              </label>
              <input
                type="text"
                required
                placeholder={role === 'vendor' ? '024XXXXXXX or mamachops' : '024XXXXXXX or SP-XXXXX'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-sm shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                role === 'vendor'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-emerald-500/20 hover:scale-[1.01]'
                  : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-amber-500/20 hover:scale-[1.01]'
              }`}
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="text-emerald-400 font-bold hover:underline">
              Create an Account Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
