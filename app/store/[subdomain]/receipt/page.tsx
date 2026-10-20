'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Store, ArrowRight, MessageCircle } from 'lucide-react';

export default function OrderReceiptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07130F] flex items-center justify-center text-slate-400">Loading receipt...</div>}>
      <OrderReceiptContent />
    </Suspense>
  );
}

function OrderReceiptContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = (params.subdomain as string) || '';
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="max-w-md w-full bg-[#0B1E17] border border-emerald-900/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">Order Confirmed!</h2>
          <p className="text-xs text-slate-400 mt-1">
            Your MoMo payment was verified successfully. The vendor has received your order and an SMS receipt has been sent to your phone.
          </p>
        </div>

        {orderId && (
          <div className="p-3 rounded-xl bg-[#07130F] border border-emerald-900/40 text-xs font-mono text-emerald-400">
            Order ID: {orderId}
          </div>
        )}

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href={`/store/${subdomain}`}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <span>Return to Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
