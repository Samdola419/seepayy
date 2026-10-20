'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Smartphone,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Users,
  Store,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';

export default function LandingPage() {
  // Calculator state
  const [monthlyOrders, setMonthlyOrders] = useState<number>(350);
  const [avgOrderValue, setAvgOrderValue] = useState<number>(85);

  const monthlyTurnover = monthlyOrders * avgOrderValue;
  // Delivery apps typically charge 20% commission on turnover
  const deliveryAppCost = monthlyTurnover * 0.20;
  // SeePay charges flat GHS 0.20 per order
  const seepayCost = monthlyOrders * 0.20;
  const monthlySavings = deliveryAppCost - seepayCost;

  // Agent earnings calculator
  const [agentVendors, setAgentVendors] = useState<number>(15);
  const agentEarnings = agentVendors * 50;

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-2.5 px-4 text-center text-xs md:text-sm font-medium text-white flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Ghana&apos;s #1 MoMo Storefront Engine. Stop losing revenue to fake payment screenshots!</span>
        <Link href="/register" className="underline font-bold hover:text-amber-200 ml-1 inline-flex items-center">
          Claim Your Shop <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07130F]/80 border-b border-emerald-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                See<span className="text-emerald-400">Pay</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider border border-emerald-500/30">Ghana</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Instant MoMo Commerce</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Why SeePay</a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">Savings Calculator</a>
            <a href="#agents" className="hover:text-emerald-400 transition-colors">Agent Program (GH₵50/shop)</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-emerald-950/40 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="relative group overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 p-[1px] font-semibold text-sm shadow-lg shadow-emerald-500/20"
            >
              <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#07130F] group-hover:bg-opacity-0 transition-all text-emerald-300 group-hover:text-slate-950 font-bold">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-semibold mb-8 backdrop-blur-md shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Built Specifically for Ghanaian Merchants, Food Vendors & Brands</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.12]"
          >
            Instant MoMo Storefronts for{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Ghanaian Businesses.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Stop losing money to fake payment screenshots and manual WhatsApp back-and-forth.
            Get your own branded <code className="text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">yourname.seepay.shop</code> store with instant automated MTN & Telecel MoMo checkout.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Store className="w-5 h-5" />
              Open Your Storefront
            </Link>
            <Link
              href="/store/mama"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 text-slate-200 border border-slate-800 hover:border-emerald-500/40 hover:text-white font-semibold text-base transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              View Live Store Demo
            </Link>
          </motion.div>

          {/* Social Proof badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Fake Screenshots</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct MoMo STK Push</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Arkesel SMS Alerts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Flat GH₵ 0.20 per order</span>
            </div>
          </motion.div>

          {/* Hero Mockup Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-5xl mx-auto rounded-3xl p-3 bg-gradient-to-b from-emerald-500/20 via-emerald-950/20 to-transparent border border-emerald-500/30 shadow-2xl shadow-emerald-950"
          >
            <div className="rounded-2xl bg-[#0B1E17] border border-emerald-900/60 p-6 md:p-8 text-left">
              <div className="flex items-center justify-between pb-6 border-b border-emerald-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <div className="ml-2 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    https://mama-chops.seepay.shop
                  </div>
                </div>
                <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verified Paystack MoMo Checkout
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="p-4 rounded-xl bg-[#07130F] border border-emerald-900/40">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Today&apos;s Verified MoMo Sales</span>
                    <span className="text-emerald-400 font-semibold">+18.4%</span>
                  </div>
                  <div className="text-2xl font-black text-white">GH₵ 3,840.00</div>
                  <div className="text-[11px] text-slate-500 mt-1">42 orders settled straight to MTN MoMo</div>
                </div>

                <div className="p-4 rounded-xl bg-[#07130F] border border-emerald-900/40">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Fake Screenshot Attempts</span>
                    <span className="text-emerald-400 font-semibold">Blocked 100%</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">0 Fraud Losses</div>
                  <div className="text-[11px] text-slate-500 mt-1">Orders only dispatch upon Paystack webhook confirmation</div>
                </div>

                <div className="p-4 rounded-xl bg-[#07130F] border border-emerald-900/40">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Realtime Webhook Alerts</span>
                    <span className="text-amber-400 font-semibold">Active</span>
                  </div>
                  <div className="text-2xl font-black text-white">Instant Chime + SMS</div>
                  <div className="text-[11px] text-slate-500 mt-1">Live customer notification via Arkesel Ghana</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcase: Eliminating Fraud & Manual Work */}
      <section id="features" className="py-24 bg-[#0A1A14] border-y border-emerald-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest mb-3">
              The Ghanaian Merchant Problem, Solved
            </h2>
            <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Why 1,000s of vendors are ditching manual WhatsApp orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl p-8 bg-[#07130F] border border-emerald-900/50 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Zero Fake MoMo Screenshots</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Fraudsters regularly edit SMS notifications and send fake payment proofs. With SeePay, customers pay via direct STK push. You only fulfill when the system confirms verified cash in your account.
              </p>
            </div>

            <div className="rounded-2xl p-8 bg-[#07130F] border border-emerald-900/50 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Realtime Audio Chime</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Keep your dashboard open on your phone or laptop. The moment a customer taps &quot;Pay&quot; and enters their MoMo PIN, your dashboard chimes and shows the order details with delivery instructions.
              </p>
            </div>

            <div className="rounded-2xl p-8 bg-[#07130F] border border-emerald-900/50 hover:border-emerald-500/50 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Instant Arkesel SMS to Buyer & Seller</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Both you and your customer instantly receive automated transactional SMS receipts through Arkesel. No more typing manual WhatsApp confirmation messages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section id="calculator" className="py-24 bg-[#07130F] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              Profit Protection Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
              See How Much You Save Compared to Food & Delivery Apps
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Traditional platforms take 15% to 25% of your hard-earned revenue. SeePay charges a flat GH₵ 0.20 per order.
            </p>
          </div>

          <div className="rounded-3xl bg-[#0B1E17] border border-emerald-900/60 p-8 sm:p-12 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">Monthly Orders:</span>
                    <span className="text-emerald-400 font-bold text-base">{monthlyOrders} orders</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="2000"
                    step="10"
                    value={monthlyOrders}
                    onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>20</span>
                    <span>500</span>
                    <span>1,000</span>
                    <span>2,000+</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">Average Order Value:</span>
                    <span className="text-emerald-400 font-bold text-base">GH₵ {avgOrderValue}.00</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="500"
                    step="5"
                    value={avgOrderValue}
                    onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>GH₵ 15</span>
                    <span>GH₵ 100</span>
                    <span>GH₵ 250</span>
                    <span>GH₵ 500</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#07130F] border border-emerald-900/40 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Monthly Sales Volume:</span>
                    <span className="font-bold text-white">GH₵ {monthlyTurnover.toLocaleString()}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery App Commission (20%):</span>
                    <span className="text-rose-400 font-bold">GH₵ {deliveryAppCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SeePay Fee (GH₵ 0.20/order):</span>
                    <span className="text-emerald-400 font-bold">GH₵ {seepayCost.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Result card */}
              <div className="flex flex-col justify-center items-center text-center p-8 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-[#07130F] border border-emerald-500/30">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                  Your Extra Monthly Profit
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white mt-3 mb-2">
                  GH₵ {monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <p className="text-xs text-slate-400 max-w-xs mb-6">
                  That is money kept in your pocket every month instead of lost to third-party delivery commissions!
                </p>
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Start Saving Today
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Referral Section */}
      <section id="agents" className="py-24 bg-gradient-to-b from-[#0A1A14] to-[#07130F] border-t border-emerald-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
                <Users className="w-3.5 h-3.5" />
                <span>Earn Big as a SeePay Agent</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Get Paid <span className="text-amber-400">GH₵ 50.00</span> for Every Vendor You Onboard.
              </h2>
              <p className="mt-4 text-slate-300 text-base leading-relaxed">
                Know food sellers, fashion boutiques, tech shops, or makeup artists in Accra, Kumasi, or Takoradi?
                Sign up as an agent, share your referral link, and earn GH₵ 50 instantly via Mobile Money whenever they activate their store.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Instant MoMo Commission Payouts</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Commissions are automatically credited and withdrawable directly to your MTN or Telecel wallet.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">Dedicated Realtime Agent Dashboard</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Track every shop onboarded, live activation statuses, and your total earnings in real time.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/register?role=agent"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-transform"
                >
                  Join Agent Partner Program
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Agent Calculator Card */}
            <div className="rounded-3xl bg-[#0B1E17] border border-amber-500/30 p-8 sm:p-10 shadow-2xl relative">
              <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
                Agent Earning Simulator
              </div>

              <h3 className="text-lg font-bold text-white mb-6">How much could you earn each month?</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span className="text-slate-300">Shops You Onboard:</span>
                    <span className="text-amber-400 font-bold text-base">{agentVendors} businesses</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={agentVendors}
                    onChange={(e) => setAgentVendors(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>1 shop (GH₵50)</span>
                    <span>20 shops (GH₵1,000)</span>
                    <span>50 shops (GH₵2,500)</span>
                    <span>100 (GH₵5,000)</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-[#07130F] border border-amber-500/20 text-center">
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Your Estimated Agent Cash</div>
                  <div className="text-4xl sm:text-5xl font-black text-amber-400 my-2">
                    GH₵ {agentEarnings.toLocaleString()}.00
                  </div>
                  <p className="text-xs text-slate-400">Directly transferred to your MoMo number</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-24 bg-[#07130F] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Simple, Transparent Pricing</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-2 mb-4">No Monthly Fees. No Percentages.</h2>
          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-16">
            Everything you need to run a high-converting MoMo storefront without recurring monthly subscriptions.
          </p>

          <div className="max-w-md mx-auto rounded-3xl bg-[#0B1E17] border-2 border-emerald-500 p-8 sm:p-10 shadow-2xl relative text-left">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider">
              Complete Storefront Package
            </div>

            <div className="text-center py-4 border-b border-emerald-900/60">
              <div className="text-4xl sm:text-5xl font-black text-white">GH₵ 150.00</div>
              <div className="text-xs text-slate-400 mt-1">One-time setup & activation fee</div>
            </div>

            <ul className="py-6 space-y-4 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Custom subdomain (<code className="text-emerald-300">yourstore.seepay.shop</code>)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Direct MTN & Telecel MoMo checkout integration</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Realtime audio chime on incoming orders</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Instant Arkesel SMS notifications to you & buyers</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Flat GH₵ 0.20 per order platform cut (0% percentage)</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Zero monthly hosting or recurring maintenance fees</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-center block shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
            >
              Get Your Store Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-emerald-950/60 bg-[#050D0A] text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
            <span className="text-base font-bold text-white">SeePay</span>
            <span className="text-slate-500">© {new Date().getFullYear()} SeePay Ghana. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/register" className="hover:text-emerald-400">Open Shop</Link>
            <Link href="/login" className="hover:text-emerald-400">Sign In</Link>
            <Link href="/register?role=agent" className="hover:text-amber-400">Agent Program</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}