'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    businessName: '',
    subdomain: '',
    whatsappNumber: '',
    ownerMomoNumber: '',
    ownerMomoNetwork: 'MTN',
    referralCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      router.push('/shop-dashboard.html');
    } catch (err) {
      setError('Network error. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F2F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(11,46,33,0.1)', padding: '2rem', width: '100%', maxWidth: '420px', border: '1px solid #d5e2da' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0B2E21', margin: 0 }}>Register your shop</h1>
          <p style={{ color: '#4b5f55', marginTop: '0.5rem' }}>Get your shop online by lunchtime</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0B2E21', marginBottom: '0.25rem' }}>Business name</label>
            <input name="businessName" value={form.businessName} onChange={handleChange} required style={{ width: '100%', border: '1px solid #d5e2da', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '1rem' }} placeholder="Mama Jollof" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0B2E21', marginBottom: '0.25rem' }}>Shop link</label>
            <div style={{ display: 'flex' }}>
              <input name="subdomain" value={form.subdomain} onChange={handleChange} required style={{ flex: 1, border: '1px solid #d5e2da', borderRadius: '12px 0 0 12px', padding: '0.75rem 1rem', fontSize: '1rem' }} placeholder="mamajollof" />
              <span style={{ background: '#F2F7F3', border: '1px solid #d5e2da', borderLeft: 'none', borderRadius: '0 12px 12px 0', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#4b5f55', display: 'flex', alignItems: 'center' }}>.seepay.shop</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0B2E21', marginBottom: '0.25rem' }}>WhatsApp number</label>
            <input name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} required style={{ width: '100%', border: '1px solid #d5e2da', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '1rem' }} placeholder="0241234567" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0B2E21', marginBottom: '0.25rem' }}>MoMo number</label>
            <input name="ownerMomoNumber" value={form.ownerMomoNumber} onChange={handleChange} required style={{ width: '100%', border: '1px solid #d5e2da', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '1rem' }} placeholder="0241234567" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0B2E21', marginBottom: '0.25rem' }}>MoMo network</label>
            <select name="ownerMomoNetwork" value={form.ownerMomoNetwork} onChange={handleChange} style={{ width: '100%', border: '1px solid #d5e2da', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '1rem' }}>
              <option>MTN</option>
              <option>VODAFONE</option>
              <option>AIRTELTIGO</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0B2E21', marginBottom: '0.25rem' }}>Referral code (optional)</label>
            <input name="referralCode" value={form.referralCode} onChange={handleChange} style={{ width: '100%', border: '1px solid #d5e2da', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '1rem' }} placeholder="AGENT01" />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', background: '#0B2E21', color: 'white', padding: '0.875rem', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Creating your shop...' : 'Create my shop'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#4b5f55', marginTop: '1.5rem' }}>
          <a href="/landing.html" style={{ color: '#0B2E21', fontWeight: 600, textDecoration: 'underline' }}>Back to home</a>
        </p>
      </div>
    </div>
  );
}
