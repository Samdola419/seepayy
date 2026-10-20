'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Store,
  Phone,
  MapPin,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Vendor, Product, CartItem } from '@/lib/types';

export default function StorefrontPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#07130F] flex items-center justify-center text-slate-400">Loading storefront...</div>}>
      <StorefrontContent />
    </Suspense>
  );
}

function StorefrontContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawSubdomain = params.subdomain as string;
  const subdomain = (rawSubdomain || '').toLowerCase();

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Checkout inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [momoNetwork, setMomoNetwork] = useState('MTN');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Success state from query params
  const isSuccess = searchParams.get('status') === 'success';
  const orderRef = searchParams.get('reference');

  useEffect(() => {
    if (!subdomain) return;

    async function loadStore() {
      setLoading(true);
      try {
        const res = await fetch(`/api/store/${subdomain}`);
        const data = await res.json();

        if (!res.ok || !data.vendor) {
          throw new Error(data.error || 'Storefront not found');
        }

        setVendor(data.vendor);
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, [subdomain]);

  // Cart actions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Categories list
  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category || 'General')))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || (p.category || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle Checkout & Paystack MoMo Payment
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || cart.length === 0) return;

    setCheckingOut(true);
    setCheckoutError(null);

    try {
      // 1. Create order in Supabase
      const orderItems = cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          customerName,
          customerPhone,
          customerAddress,
          items: orderItems,
          totalAmount: cartTotal,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order) {
        throw new Error(orderData.error || 'Failed to place order');
      }

      // 2. Initialize Paystack transaction with split subaccount
      const payRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'order',
          vendorId: vendor.id,
          orderId: orderData.order.id,
          customerPhone,
          customerName,
        }),
      });

      const payData = await payRes.json();
      if (!payRes.ok || !payData.authorization_url) {
        throw new Error(payData.error || 'Failed to initialize MoMo payment');
      }

      // Clear local cart
      setCart([]);
      setShowCheckout(false);

      // Redirect to Paystack STK push authorization
      window.location.href = payData.authorization_url;
    } catch (err: any) {
      setCheckoutError(err.message);
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07130F] flex items-center justify-center text-slate-300">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 animate-pulse">
            <Store className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold">Loading Storefront...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-[#07130F] flex items-center justify-center p-4 text-slate-100">
        <div className="max-w-md w-full bg-[#0B1E17] border border-emerald-900/60 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Storefront Not Found</h2>
          <p className="text-xs text-slate-400">
            The store <code className="text-emerald-400">{subdomain}.seepay.shop</code> does not exist or has not been registered yet.
          </p>
          <a
            href="https://seepay.shop/register"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs"
          >
            Claim This Subdomain on SeePay
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 selection:bg-emerald-500 selection:text-white flex flex-col pb-28">
      {/* Success Notification Banner if returning from payment */}
      {isSuccess && (
        <div className="bg-emerald-600 text-white py-3 px-4 text-center text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>Payment Confirmed! Your order has been placed successfully via Paystack MoMo.</span>
        </div>
      )}

      {/* Store Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07130F]/90 border-b border-emerald-950/60 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white">{vendor.business_name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Store
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {vendor.subdomain}.seepay.shop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* WhatsApp Contact */}
            {vendor.whatsapp_number && (
              <a
                href={`https://wa.me/${vendor.whatsapp_number.replace(/^0/, '233')}?text=${encodeURIComponent(
                  `Hello ${vendor.business_name}, I am viewing your online store!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#0B1E17] border border-emerald-900/60 hover:border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 text-xs font-semibold"
                title="Chat with Store on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setShowCheckout(true)}
              className="relative p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-105 transition-transform"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs hidden sm:inline">GH₵ {cartTotal.toFixed(2)}</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Search and Category Filter */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, items, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0B1E17] border border-emerald-900/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Categories Tab */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                    : 'bg-[#0B1E17] border border-emerald-900/50 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#0B1E17] border border-emerald-900/40">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-500 mb-3 opacity-40" />
            <h3 className="font-bold text-white text-base">No items found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const inCart = cart.find((it) => it.product.id === p.id);

              return (
                <div
                  key={p.id}
                  className="rounded-3xl bg-[#0B1E17] border border-emerald-900/50 p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors group"
                >
                  <div>
                    {p.image_url ? (
                      <div className="h-44 rounded-2xl overflow-hidden bg-[#07130F] mb-4">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-28 rounded-2xl bg-[#07130F] border border-emerald-900/30 flex items-center justify-center text-slate-600 mb-4">
                        <ShoppingBag className="w-8 h-8 opacity-40" />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-white text-base">{p.name}</h3>
                        <span className="text-[10px] font-semibold text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded">
                          {p.category || 'General'}
                        </span>
                      </div>
                      <div className="text-lg font-black text-white">
                        GH₵ {Number(p.price).toFixed(2)}
                      </div>
                    </div>

                    {p.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-emerald-950/60">
                    {p.is_available === false ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold"
                      >
                        Out of Stock
                      </button>
                    ) : inCart ? (
                      <div className="flex items-center justify-between bg-[#07130F] rounded-xl p-1 border border-emerald-500/40">
                        <button
                          onClick={() => updateQuantity(p.id, -1)}
                          className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold hover:bg-emerald-900"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-sm text-white">{inCart.quantity} in cart</span>
                        <button
                          onClick={() => updateQuantity(p.id, 1)}
                          className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold hover:bg-emerald-400"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to MoMo Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (Mobile) */}
      {cartItemCount > 0 && !showCheckout && (
        <div className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-2xl flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">MoMo Cart Total</div>
              <div className="text-xl font-black">GH₵ {cartTotal.toFixed(2)}</div>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-slate-900"
            >
              Checkout ({cartItemCount})
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0B1E17] border border-emerald-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-950/60 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Your MoMo Order</h3>
                  <p className="text-xs text-slate-400">Buying from {vendor.business_name}</p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {checkoutError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {checkoutError}
                </div>
              )}

              {/* Items Summary */}
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-xl bg-[#07130F] border border-emerald-900/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-white">{item.product.name}</div>
                      <div className="text-xs text-slate-400">
                        GH₵ {Number(item.product.price).toFixed(2)} each
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-emerald-950 text-emerald-300 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-sm text-white w-20 text-right">
                        GH₵ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-2 flex justify-between items-center text-sm font-bold text-white px-1">
                  <span>Total Amount:</span>
                  <span className="text-xl font-black text-emerald-400">GH₵ {cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Delivery Details Form */}
              <form onSubmit={handleInitiatePayment} className="space-y-4">
                <div className="border-t border-emerald-950/60 pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                    Delivery & MoMo Details
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kojo Ansah"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        MoMo & WhatsApp Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="024XXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        You will receive an automated STK Push prompt on this phone to enter your MoMo PIN.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Delivery Address / Landmark
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. East Legon, near Shell Station"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        MoMo Network
                      </label>
                      <select
                        value={momoNetwork}
                        onChange={(e) => setMomoNetwork(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="TELECEL">Telecel Cash (Vodafone)</option>
                        <option value="AIRTELTIGO">AT Money (AirtelTigo)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={checkingOut || cart.length === 0}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {checkingOut ? (
                    <span>Initializing Paystack MoMo STK Push...</span>
                  ) : (
                    <>
                      <span>Pay GH₵ {cartTotal.toFixed(2)} with MoMo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}