import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#F2F7F3' }}>
      <iframe 
        src="/landing.html" 
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', border: 'none', zIndex: 1 }}
        title="SeePay Landing"
      />
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 100, display: 'flex', gap: '10px' }}>
        <Link href="/register" style={{ background: '#0B2E21', color: 'white', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
          Get my shop
        </Link>
        <a href="/register-agent.html" style={{ background: '#FFC83D', color: '#0B2E21', padding: '12px 20px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
          Become an agent
        </a>
      </div>
    </div>
  );
}
