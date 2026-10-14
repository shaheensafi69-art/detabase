'use client';

import React, { useState, useEffect } from 'react';

export const PLATFORM_DOMAINS: Record<string, string> = {
  tiktok: 'tiktok.com',
  youtube: 'youtube.com',
  paypal: 'paypal.com',
  wise: 'wise.com',
  payoneer: 'payoneer.com',
  crypto: 'binance.com',
  binance: 'binance.com',
  usdt: 'tether.to',
  stripe: 'stripe.com',
  amazon: 'amazon.com',
  shopify: 'shopify.com',
  instagram: 'instagram.com',
  vpn: 'nordvpn.com',
  nordvpn: 'nordvpn.com',
  expressvpn: 'expressvpn.com',
  mercury: 'mercury.com',
  relay: 'relayfi.com',
  revolut: 'revolut.com',
  upwork: 'upwork.com',
  fiverr: 'fiverr.com',
  telegram: 'telegram.org',
  twitter: 'x.com',
  x: 'x.com',
  facebook: 'facebook.com',
  meta: 'meta.com',
  ebay: 'ebay.com',
  etsy: 'etsy.com',
  walmart: 'walmart.com',
  netflix: 'netflix.com',
  apple: 'apple.com',
  google: 'google.com',
  microsoft: 'microsoft.com',
  steam: 'steampowered.com',
  playstation: 'playstation.com',
  xbox: 'xbox.com',
  delaware: 'delaware.gov',
  wyoming: 'wyo.gov',
  irs: 'irs.gov',
};

export const DEFAULT_LOGODEV_PUBLIC_KEY = 'pk_LMJ_gZeWQ2SH1bnRDMeIwg';

export const getPlatformDomain = (platform: string): string => {
  if (!platform) return '';
  let str = platform.toLowerCase().trim();

  // Strip protocol (http://, https://)
  str = str.replace(/^(https?:\/\/)?/, '');

  // Strip path, query, hash
  str = str.split('/')[0].split('?')[0].split('#')[0];

  // Strip www. or www2.
  str = str.replace(/^www\d*\./, '');

  // Strip port
  str = str.split(':')[0];

  // Clean trailing punctuation or spaces
  str = str.replace(/[^a-z0-9.-]/g, '');

  // Check known platform dictionary mapping first
  for (const [key, dom] of Object.entries(PLATFORM_DOMAINS)) {
    if (str === key || str.includes(key)) return dom;
  }

  // If already contains a valid dot (e.g. upwork.com, cash.app, nordvpn.com)
  if (str.includes('.') && str.length > 3) {
    return str;
  }

  // Fallback: if single word like "upwork" -> "upwork.com"
  const slug = str.replace(/[^a-z0-9]/g, '');
  return slug ? `${slug}.com` : '';
};

interface PlatformLogoProps {
  platform: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  token?: string;
}

// Built-in crisp SVG vectors & Logo.dev live fetcher
export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  platform = '',
  size = 28,
  className = '',
  style = {},
  token,
}) => {
  const [logoDevError, setLogoDevError] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [logoDevKey, setLogoDevKey] = useState<string>(
    token || process.env.NEXT_PUBLIC_LOGODEV_PUBLIC_KEY || DEFAULT_LOGODEV_PUBLIC_KEY
  );

  // Reset error states when platform changes
  useEffect(() => {
    setLogoDevError(false);
    setImgError(false);
  }, [platform]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('s4_logodev_key') || '';
      const envKey = process.env.NEXT_PUBLIC_LOGODEV_PUBLIC_KEY || '';
      setLogoDevKey(token || stored || envKey || DEFAULT_LOGODEV_PUBLIC_KEY);
    } catch (e) {}
  }, [token]);

  const clean = (platform || '').toLowerCase().trim();
  const domain = getPlatformDomain(clean);

  // If Logo.dev key is configured and image hasn't errored, stream from Logo.dev!
  if (logoDevKey && domain && !logoDevError) {
    const logoDevUrl = `https://img.logo.dev/${domain}?token=${logoDevKey}&size=${size * 2}&format=png`;
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(6, size * 0.28),
          background: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          padding: Math.max(2, size * 0.08),
          ...style,
        }}
        title={`${platform} (${domain})`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDevUrl}
          alt={platform}
          width={size * 0.84}
          height={size * 0.84}
          onError={() => setLogoDevError(true)}
          style={{ objectFit: 'contain', width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    );
  }

  // 1. TikTok
  if (clean.includes('tiktok')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          ...style,
        }}
        title="TikTok"
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
          <path
            d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.89 2.89 0 1 1-2.049-2.768V9.418a6.335 6.335 0 1 0 5.494 6.254V8.406a8.217 8.217 0 0 0 4.67 1.458V6.419a4.814 4.814 0 0 1-.9-.033v.3z"
            fill="#25F4EE"
          />
          <path
            d="M19.321 6.386a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.89 2.89 0 1 1-2.049-2.768V9.418a6.335 6.335 0 1 0 5.494 6.254V8.406a8.217 8.217 0 0 0 4.67 1.458V6.419a4.814 4.814 0 0 1-.9-.033z"
            fill="#FE2C55"
            style={{ mixBlendMode: 'screen' }}
          />
          <path
            d="M19.455 6.536a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.89 2.89 0 1 1-2.049-2.768V9.418a6.335 6.335 0 1 0 5.494 6.254V8.406a8.217 8.217 0 0 0 4.67 1.458V6.419c-.316 0-.623-.045-.9-.033z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    );
  }

  // 2. YouTube / AdSense
  if (clean.includes('youtube') || clean.includes('adsense')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#FF0000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(255,0,0,0.3)',
          ...style,
        }}
        title="YouTube"
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      </div>
    );
  }

  // 3. PayPal
  if (clean.includes('paypal')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#003087',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,48,135,0.3)',
          ...style,
        }}
        title="PayPal"
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
          <path
            d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.553a.962.962 0 0 1 .95-.8h6.495c3.045 0 5.257.65 6.425 2.102 1.09 1.354 1.258 3.327.487 5.71-.97 3-3.23 4.54-6.536 4.54H9.497l-1.39 6.643a.641.641 0 0 1-.63.541l-.4.048z"
            fill="#0079C1"
          />
          <path
            d="M9.497 14.105h2.768c3.305 0 5.566-1.54 6.536-4.54.77-2.383.603-4.356-.487-5.71-1.168-1.452-3.38-2.102-6.425-2.102H5.894a.962.962 0 0 0-.95.8L1.837 20.597a.641.641 0 0 0 .633.74h4.606l1.03-4.922 1.391-2.31z"
            fill="#00457C"
            opacity="0.3"
          />
          <path
            d="M9.07 18.067h2.246c2.678 0 4.778-1.085 5.394-4.223.49-2.5-1.077-4.1-3.66-4.1H9.986l-1.637 7.785a.534.534 0 0 1-.525.45l1.246.088z"
            fill="#0079C1"
          />
        </svg>
      </div>
    );
  }

  // 4. Wise
  if (clean.includes('wise')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#9FE870',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(159,232,112,0.3)',
          ...style,
        }}
        title="Wise"
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="#163300">
          <path d="M3.54 18.96L8.06 6.32H13.8L9.27 18.96H3.54zM10.2 6.32L14.72 18.96H20.46L15.93 6.32H10.2z" />
          <path d="M15.4 6.32h5.06l-4.52 12.64H10.88L15.4 6.32z" fill="#163300" opacity="0.6" />
        </svg>
      </div>
    );
  }

  // 5. Payoneer
  if (clean.includes('payoneer')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: 'linear-gradient(135deg, #FF4800 0%, #FF0055 50%, #7928CA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(255,72,0,0.35)',
          ...style,
        }}
        title="Payoneer"
      >
        <div
          style={{
            width: size * 0.52,
            height: size * 0.52,
            borderRadius: '50%',
            border: `${Math.max(2, size * 0.1)}px solid #FFFFFF`,
          }}
        />
      </div>
    );
  }

  // 6. Stripe
  if (clean.includes('stripe')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#635BFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(99,91,255,0.35)',
          ...style,
        }}
        title="Stripe"
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.613 15.454 0 12.518 0 7.503 0 3.88 2.673 3.88 7.02c0 5.494 5.378 6.643 8.358 7.734 2.172.806 3.109 1.579 3.109 2.562 0 .977-.852 1.455-2.268 1.455-2.607 0-5.464-1.1-7.398-2.164L4.66 22.25C6.73 23.36 9.54 24 12.793 24c5.297 0 9.066-2.583 9.066-7.147 0-5.742-5.485-6.917-7.883-7.703z" />
        </svg>
      </div>
    );
  }

  // 7. Amazon
  if (clean.includes('amazon')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#232F3E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          ...style,
        }}
        title="Amazon"
      >
        <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
          <path
            d="M13.84 14.86c-2.9 2.14-7.1 3.26-10.7 1.91-.5-.19-.96.28-.62.71 2.37 2.97 6.47 4.18 10.45 2.87 1.05-.34 2.05-.88 2.92-1.57.8-.63.26-1.7-.67-1.42l-1.38-.5z"
            fill="#FF9900"
          />
          <path
            d="M16.5 17.5c1.4.3 2.8-.5 3.3-1.8.1-.3-.2-.6-.5-.5-.8.2-1.7.3-2.5.1-.3-.1-.5.2-.3.5v1.7z"
            fill="#FF9900"
          />
          <path
            d="M9.8 4.2C7.3 4.2 5.5 5.9 5.5 8.2c0 2.2 1.5 3.6 3.7 3.6 1.4 0 2.5-.6 3.2-1.5v1.2h2.5V4.6h-2.5v1c-.7-.9-1.5-1.4-2.6-1.4zm.5 5.5c-1.1 0-1.8-.7-1.8-1.8 0-1.1.7-1.8 1.8-1.8s1.8.7 1.8 1.8c0 1.1-.7 1.8-1.8 1.8z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    );
  }

  // 8. Shopify
  if (clean.includes('shopify')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#96BF48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(150,191,72,0.3)',
          ...style,
        }}
        title="Shopify"
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M19.98 5.62l-3.23-1c-.13-.04-.26.04-.3.17l-1.47 4.93H12.6l-1.34-4.5c-.04-.13-.17-.21-.3-.17L7.73 6.05c-.13.04-.21.17-.17.3l4.3 14.4c.04.13.17.21.3.17l7.65-2.28c.13-.04.21-.17.17-.3l-2.04-12.72zm-7.6 10.3c-.7.2-1.4.1-1.9-.3-.5-.4-.7-1-.6-1.7.2-.9.9-1.5 1.8-1.8.7-.2 1.3-.2 1.8.1v3.7zm1.8-4.9c-.6-.3-1.3-.3-2-.1-.8.2-1.4.7-1.7 1.4v-4l3.7-1.1v3.8z" />
        </svg>
      </div>
    );
  }

  // 9. Instagram
  if (clean.includes('instagram') || clean.includes('insta')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(214,36,159,0.35)',
          ...style,
        }}
        title="Instagram"
      >
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      </div>
    );
  }

  // 10. USDT / Crypto / Tether
  if (clean.includes('crypto') || clean.includes('usdt') || clean.includes('tether') || clean.includes('bitcoin')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#26A17B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(38,161,123,0.35)',
          ...style,
        }}
        title="USDT Crypto"
      >
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M13.2 11.2V9.3h5.6V6.1H5.2v3.2h5.6v1.9c-4.4.2-7.8 1.1-7.8 2.2 0 1.1 3.4 2 7.8 2.2v5.3h2.4v-5.3c4.4-.2 7.8-1.1 7.8-2.2 0-1.1-3.4-2-7.8-2.2zm0 3.3c-3.5 0-6.4-.6-6.4-1.3 0-.7 2.9-1.3 6.4-1.3s6.4.6 6.4 1.3c0 .7-2.9 1.3-6.4 1.3z" />
        </svg>
      </div>
    );
  }

  // 11. US LLC / United States
  if (clean.includes('llc') || clean.includes('usa') || clean.includes('us ')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 2px 8px rgba(10,37,64,0.35)',
          ...style,
        }}
        title="US LLC"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.38, fontWeight: 900, color: '#38BDF8', letterSpacing: '-0.5px', lineHeight: 1 }}>
            US
          </span>
          <span style={{ fontSize: size * 0.24, fontWeight: 800, color: '#F97316', lineHeight: 1, marginTop: 1 }}>
            LLC
          </span>
        </div>
      </div>
    );
  }

  // 12. UK LTD / United Kingdom
  if (clean.includes('ltd') || clean.includes('uk') || clean.includes('companies house')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: 'linear-gradient(135deg, #012169 0%, #C8102E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 2px 8px rgba(1,33,105,0.35)',
          ...style,
        }}
        title="UK LTD"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.38, fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.5px', lineHeight: 1 }}>
            UK
          </span>
          <span style={{ fontSize: size * 0.24, fontWeight: 800, color: '#FDE047', lineHeight: 1, marginTop: 1 }}>
            LTD
          </span>
        </div>
      </div>
    );
  }

  // 13. Mercury US Bank / Bank Wire / Zelle
  if (clean.includes('mercury') || clean.includes('bank') || clean.includes('zelle') || clean.includes('wire')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: '#0F2744',
          border: '1px solid rgba(2, 132, 199, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(2,132,199,0.25)',
          ...style,
        }}
        title="Bank"
      >
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="21" x2="21" y2="21"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <polyline points="5 6 12 3 19 6"></polyline>
          <line x1="4" y1="10" x2="4" y2="21"></line>
          <line x1="20" y1="10" x2="20" y2="21"></line>
          <line x1="8" y1="14" x2="8" y2="17"></line>
          <line x1="12" y1="14" x2="12" y2="17"></line>
          <line x1="16" y1="14" x2="16" y2="17"></line>
        </svg>
      </div>
    );
  }

  // 14. Visa / Card / Payment
  if (clean.includes('card') || clean.includes('visa') || clean.includes('mastercard') || clean.includes('payment')) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: 'linear-gradient(135deg, #1A1F71 0%, #2563EB 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(26,31,113,0.3)',
          ...style,
        }}
        title="Card Payment"
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      </div>
    );
  }

  // 15. AUTOMATIC LOGO FETCHING FOR ANY NEW PLATFORM!
  // Normalizes name: e.g. "Binance" -> "binance", "Revolut" -> "revolut", "Twitter" -> "x", "Etsy" -> "etsy"
  const slug = clean
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (slug && !imgError) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          ...style,
        }}
        title={platform}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://cdn.simpleicons.org/${slug}/ffffff`}
          alt={platform}
          width={size * 0.65}
          height={size * 0.65}
          onError={() => setImgError(true)}
          style={{ objectFit: 'contain' }}
        />
      </div>
    );
  }

  // 16. Fallback: Sleek Glassmorphic Initial Badge
  const initials = (platform || 'S')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'linear-gradient(135deg, #0284C7 0%, #F97316 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontWeight: 800,
        fontSize: size * 0.42,
        color: '#FFFFFF',
        letterSpacing: '-0.5px',
        ...style,
      }}
      title={platform}
    >
      {initials || 'S'}
    </div>
  );
};

export default PlatformLogo;
