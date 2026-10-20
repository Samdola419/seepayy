'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Load the full landing page
    const iframe = document.createElement('iframe');
    iframe.src = '/landing.html';
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:9999';
    document.body.appendChild(iframe);
    document.body.style.overflow = 'hidden';
  }, []);

  return null;
}
