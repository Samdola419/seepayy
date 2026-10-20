'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  ExternalLink,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Vendor, Product } from '@/lib/types';

export default function StorefrontEditorPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for store settings
  const [businessName, setBusinessName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Product modal
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
      setBusinessName(parsed.business_name);
      setWhatsappNumber(parsed.whatsapp_number);
      loadProducts(parsed.id);
    } catch {
      router.push('/login');
    }
  }, [router]);

  const loadProducts = async (vendorId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?vendorId=${vendorId}`);
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        await fetch('/api/products', {
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
      } else {
        await fetch('/api/products', {
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
      }

      setShowProductModal(false);
      loadProducts(vendor.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (vendor) loadProducts(vendor.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!vendor) {
    return <div className="min-h-screen bg-[#07130F] flex items-center justify-center text-slate-400">Loading editor...</div>;
  }

  return (
    <div className="min-h-screen bg-[#07130F] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07130F]/90 border-b border-emerald-950/60 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/vendor"
              className="p-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white">Storefront Editor</h1>
              <p className="text-xs text-slate-400 font-mono">{vendor.subdomain}.seepay.shop</p>
            </div>
          </div>

          <a
            href={`/store/${vendor.subdomain}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-[#0B1E17] border border-emerald-900/60 hover:border-emerald-500/40 text-xs font-semibold text-emerald-400 flex items-center gap-1.5"
          >
            <span>Preview Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Editor Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Contact & Brand Settings */}
        <div className="p-6 rounded-3xl bg-[#0B1E17] border border-emerald-900/50 space-y-4">
          <h2 className="text-base font-bold text-white">Store Identity & Contact Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Store Address Slug (Fixed)</label>
              <input
                type="text"
                disabled
                value={`${vendor.subdomain}.seepay.shop`}
                className="w-full px-4 py-2.5 rounded-xl bg-[#07130F]/60 border border-emerald-900/40 text-slate-500 font-mono text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">WhatsApp Customer Number</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">MoMo Payout Wallet</label>
              <input
                type="text"
                disabled
                value={`${vendor.owner_momo_number} (${vendor.owner_momo_network})`}
                className="w-full px-4 py-2.5 rounded-xl bg-[#07130F]/60 border border-emerald-900/40 text-slate-500 font-mono text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Product Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Products Catalog</h2>
              <p className="text-xs text-slate-400">Manage what items appear on your storefront</p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-[#0B1E17] border border-emerald-900/50 flex flex-col justify-between"
              >
                <div>
                  {p.image_url ? (
                    <div className="h-40 rounded-xl overflow-hidden bg-[#07130F] mb-3">
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-24 rounded-xl bg-[#07130F] border border-emerald-900/30 flex items-center justify-center text-slate-600 mb-3">
                      <ShoppingBag className="w-7 h-7 opacity-40" />
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-sm">{p.name}</h3>
                    <span className="font-black text-white text-base">GH₵ {Number(p.price).toFixed(2)}</span>
                  </div>
                  {p.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>}
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-950/60 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.is_available ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {p.is_available ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      className="p-1.5 rounded-lg bg-[#07130F] text-slate-300 hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 rounded-lg bg-[#07130F] text-slate-300 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Product Add / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0B1E17] border border-emerald-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950/60 mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Product / Dish Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fried Rice with Tilapia"
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
                    placeholder="50.00"
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
                    placeholder="e.g. Specials, Drinks"
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
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Delicious Ghanaian meal..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#07130F] border border-emerald-900/60 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="modalAvail"
                  checked={productForm.isAvailable}
                  onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                  className="rounded accent-emerald-500 w-4 h-4"
                />
                <label htmlFor="modalAvail" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Item is available for order
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
          </div>
        </div>
      )}
    </div>
  );
}
