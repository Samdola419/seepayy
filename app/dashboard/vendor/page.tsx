'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Bell,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Clock,
  Phone,
  MessageCircle,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Check,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { playOrderChime } from '@/lib/audio';
import { Vendor, Product, Order } from '@/lib/types';

export default function VendorDashboard() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');

  // Realtime pop-up notification state
  const [newOrderAlert, setNewOrderAlert] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: 'General',
    isAvailable: true,
  });

  // Activation state
  const [activating, setActivating] = useState(false);

  // Load vendor session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('seepay_vendor');
    if (!saved) {
      router.push('/login');
      return;
    }

    try {
      const parsed: Vendor = JSON.parse(saved);
      setVendor(parsed);
      fetchVendorData(parsed.id);
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Fetch orders and products for this vendor
  const fetchVendorData = async (vendorId: string) => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch(`/api/orders?vendorId=${vendorId}`),
        fetch(`/api/products?vendorId=${vendorId}`),
      ]);

      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();

      if (ordersData.orders) setOrders(ordersData.orders);
      if (productsData.products) setProducts(productsData.products);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup Supabase Realtime Listener on orders
  useEffect(() => {
    if (!vendor) return;

    const channel = supabase
      .channel(`vendor-realtime-${vendor.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `vendor_id=eq.${vendor.id}`,
        },
        (payload) => {
          console.log('Realtime order change detected:', payload);
          const changedOrder = payload.new as Order;

          if (payload.eventType === 'INSERT' || (payload.eventType === 'UPDATE' && changedOrder.payment_status === 'paid')) {
            // Play audio chime alert
            if (soundEnabled) {
              playOrderChime();
            }

            // Display visual alert pop-up
            setNewOrderAlert(changedOrder);

            // Auto dismiss after 8 seconds
            setTimeout(() => {
              setNewOrderAlert((current) => (current?.id === changedOrder.id ? null : current));
            }, 8000);
          }

          // Refresh orders list
          fetchVendorData(vendor.id);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendor, soundEnabled]);

  const getStoreUrl = () => {
    if (!vendor) return '';
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host.includes('vercel.app') || host.includes('localhost')) {
        return `${window.location.protocol}//${host}/store/${vendor.subdomain}`;
      }
    }
    return `https://${vendor.subdomain}.seepay.shop`;
  };

  const getStoreDisplayUrl = () => {
    if (!vendor) return '';
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host.includes('vercel.app')) {
        return `${host}/store/${vendor.subdomain}`;
      }
    }
    return `${vendor.subdomain}.seepay.shop`;
  };

  // Copy Storefront Link
  const handleCopyLink = () => {
    if (!vendor) return;
    const url = getStoreUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Pay Activation Fee via Paystack
  const handleActivateStore = async () => {
    if (!vendor) return;
    setActivating(true);
    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'activation',
          vendorId: vendor.id,
          customerPhone: vendor.owner_momo_number,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize activation');

      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActivating(false);
    }
  };

  // Product CRUD
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      category: 'General',
      isAvailable: true,
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price.toString(),
      imageUrl: prod.image_url || '',
      category: prod.category || 'General',
      isAvailable: prod.is_available,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    try {
      if (editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingProduct.id,
            name: productForm.name,
            description: productForm.description,
            price: Number(productForm.price),
            imageUrl: productForm.imageUrl,
            category: productForm.category,
            isAvailable: productForm.isAvailable,
          }),
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vendorId: vendor.id,
            name: productForm.name,
            description: productForm.description,
            price: Number(productForm.price),
            imageUrl: productForm.imageUrl,
            category: productForm.category,
            isAvailable: productForm.isAvailable,
          }),
        });
        if (!res.ok) throw new Error('Failed to add product');
      }

      setShowProductModal(false);
      fetchVendorData(vendor.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (vendor) fetchVendorData(vendor.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleProductAvailability = async (prod: Product) => {
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: prod.id,
          isAvailable: !prod.is_available,
        }),
      });
      if (vendor) fetchVendorData(vendor.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('seepay_vendor');
    localStorage.removeItem('seepay_role');
    router.push('/login');
  };

  if (!vendor) {
    return <div className="min-h-screen bg-[#07130F] flex items-center justify-center text-slate-400">Loading dashboard...</div>;
  }

  // Analytics Computations
  const paidOrders = orders.filter((o) => o.payment_status === 'paid');
  const totalSalesGHS = paidOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const pendingFulfillCount = orders.filter((o) => o.payment_status === 'paid' && o.fulfillment_status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Realtime Order Alert Pop-up Modal Banner */}
      <AnimatePresence>
        {newOrderAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-md w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl border border-emerald-300/40 flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
                  New Paid Order Received!
                </span>
                <button
                  onClick={() => setNewOrderAlert(null)}
                  className="text-white/80 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="font-bold text-base mt-0.5">
                GH₵ {Number(newOrderAlert.total_amount).toFixed(2)} from {newOrderAlert.customer_name}
              </p>
              <p className="text-xs text-emerald-100 mt-1">
                MoMo: {newOrderAlert.customer_phone}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07130F]/90 border-b border-emerald-950/60 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-slate-950">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">{vendor.business_name}</h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    vendor.is_active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {vendor.is_active ? 'Live Store' : 'Setup Pending'}
                </span>
              </div>
              <a
                href={`/store/${vendor.subdomain}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                {vendor.subdomain}.seepay.shop <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime WebSocket Pulse Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B1E17] border border-emerald-900/60 text-xs text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  realtimeConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span className="hidden md:inline font-mono text-[11px]">Realtime WebSockets</span>
            </div>

            {/* Audio Toggle & Test Button */}
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              title={soundEnabled ? 'Chime sound is enabled' : 'Chime sound is muted'}
              className="p-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 hover:border-emerald-500/40 text-slate-300 hover:text-white"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Copy Store Link Button */}
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 text-slate-400 hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 pt-3 border-t border-emerald-950/40 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Orders
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px]">
                {orders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'products'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Storefront Editor
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px]">
              {products.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Activation Banner if unpaid */}
        {!vendor.is_active && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#0B1E17] to-emerald-950/40 border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">One Step Left: Activate Your Storefront</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Pay the one-time GH₵ 150.00 setup fee to make your store live at{' '}
                  <span className="text-emerald-400 font-mono">{vendor.subdomain}.seepay.shop</span> and start receiving verified MoMo orders directly into your {vendor.owner_momo_network} wallet.
                </p>
              </div>
            </div>
            <button
              onClick={handleActivateStore}
              disabled={activating}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shrink-0 shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform disabled:opacity-50"
            >
              {activating ? 'Connecting MoMo...' : 'Pay GH₵ 150.00 via MoMo'}
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Verified MoMo Sales</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">
                  GH₵ {totalSalesGHS.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Paid directly to your {vendor.owner_momo_network} MoMo</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-teal-400" />
                </div>
                <div className="text-3xl font-black text-white">{orders.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">{paidOrders.length} confirmed paid orders</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Pending Delivery</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">{pendingFulfillCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Paid orders ready to pack & deliver</div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0B1E17] border border-emerald-900/50">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Active Catalog</span>
                  <Store className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">{products.length}</div>
                <div className="text-[11px] text-slate-500 mt-1">Listed products on your storefront</div>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Recent Incoming Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    View All Orders →
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl bg-[#0B1E17] border border-emerald-900/40 text-slate-500">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40 text-slate-400" />
                    <p className="text-sm font-semibold text-slate-400">No orders yet</p>
                    <p className="text-xs mt-1">Share your link <code className="text-emerald-400">{vendor.subdomain}.seepay.shop</code> on WhatsApp or Instagram to get orders!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-[#0B1E17] border border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{order.customer_name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                order.payment_status === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {order.payment_status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {order.items?.length || 0} items · MoMo: {order.customer_phone}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-black text-white text-base">
                              GH₵ {Number(order.total_amount).toFixed(2)}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <a
                            href={`https://wa.me/${order.customer_phone.replace(/^0/, '233')}?text=${encodeURIComponent(
                              `Hello ${order.customer_name}, this is ${vendor.business_name}. We have received your order for GH₵${Number(order.total_amount).toFixed(2)} and are preparing it now!`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Storefront Link Card */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Your Storefront Link</h3>
                <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0B1E17] to-[#07130F] border border-emerald-900/60 space-y-4">
                  <div className="p-3 rounded-xl bg-[#07130F] border border-emerald-900/40 text-xs font-mono text-emerald-400 break-all">
                    {getStoreUrl()}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Store Link'}</span>
                    </button>

                    <a
                      href={getStoreUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-xl bg-[#0B1E17] border border-emerald-900/60 hover:border-emerald-500/40 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Storefront
                    </a>
                  </div>

                  <div className="pt-4 border-t border-emerald-950/60 text-xs text-slate-400 space-y-2">
                    <div className="flex justify-between">
                      <span>Payout Network:</span>
                      <span className="font-semibold text-white">{vendor.owner_momo_network}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payout MoMo Wallet:</span>
                      <span className="font-mono text-white">{vendor.owner_momo_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Cut per order:</span>
                      <span className="text-emerald-400 font-bold">GH₵ 0.20</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">All Store Orders</h2>
                <p className="text-xs text-slate-400">Realtime live orders from {vendor.subdomain}.seepay.shop</p>
              </div>
              <button
                onClick={() => fetchVendorData(vendor.id)}
                className="px-3 py-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-[#0B1E17] border border-emerald-900/40">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                <h4 className="font-bold text-white">No Orders Placed Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Your store is ready. Share your link with customers to begin taking MoMo orders!
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#0B1E17] border border-emerald-900/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#07130F] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-emerald-900/50">
                      <tr>
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Items Ordered</th>
                        <th className="py-4 px-6">Total (GH₵)</th>
                        <th className="py-4 px-6">Payment</th>
                        <th className="py-4 px-6">Date</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/50">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#07130F]/40 transition-colors">
                          <td className="py-4 px-6">
                            <div className="font-bold text-white text-sm">{o.customer_name}</div>
                            <div className="font-mono text-slate-400">{o.customer_phone}</div>
                            {o.customer_address && (
                              <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs">{o.customer_address}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              {(o.items || []).map((it, idx) => (
                                <div key={idx} className="text-slate-300">
                                  {it.quantity}x {it.name} (GH₵{it.price})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-white text-sm">
                            GH₵ {Number(o.total_amount).toFixed(2)}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                o.payment_status === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {o.payment_status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {new Date(o.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <a
                              href={`https://wa.me/${o.customer_phone.replace(/^0/, '233')}?text=${encodeURIComponent(
                                `Hello ${o.customer_name}, this is ${vendor.business_name} regarding your SeePay order of GH₵${Number(o.total_amount).toFixed(2)}!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold text-xs"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Storefront Editor & Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Storefront Editor & Products</h2>
                <p className="text-xs text-slate-400">Add and manage items displayed on {vendor.subdomain}.seepay.shop</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            {products.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-[#0B1E17] border border-emerald-900/40">
                <Store className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                <h4 className="font-bold text-white">No Products in Your Store Yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm mx-auto">
                  Add your first food menu item, clothing, or product so customers can start buying.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-6 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Add Product Now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-[#0B1E17] border border-emerald-900/50 p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      {p.image_url ? (
                        <div className="h-44 rounded-xl overflow-hidden bg-[#07130F] mb-4">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-28 rounded-xl bg-[#07130F] border border-emerald-900/30 flex items-center justify-center text-slate-600 mb-4">
                          <ShoppingBag className="w-8 h-8 opacity-40" />
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-white text-base">{p.name}</h4>
                          <span className="text-[11px] font-semibold text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded">
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

                    <div className="mt-6 pt-4 border-t border-emerald-950/60 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleProductAvailability(p)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.is_available
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {p.is_available ? 'Available' : 'Out of Stock'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-2 rounded-lg bg-[#07130F] text-slate-300 hover:text-white"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 rounded-lg bg-[#07130F] text-slate-300 hover:text-rose-400"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Product Add / Edit Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0B1E17] border border-emerald-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-950/60 mb-6">
                <h3 className="text-lg font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Product / Item Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jollof Rice with Fried Chicken"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Price (GH₵)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="45.00"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Meals, Drinks"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Hot & spicy smokey Ghanaian jollof rice served with coleslaw..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                    className="rounded accent-emerald-500 w-4 h-4"
                  />
                  <label htmlFor="isAvailable" className="text-xs text-slate-300 font-semibold cursor-pointer">
                    Item is in stock and available for order
                  </label>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#07130F] text-slate-400 hover:text-white text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
