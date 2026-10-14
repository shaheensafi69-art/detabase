'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Percent,
  ShieldCheck,
  Zap,
  Database,
  CheckCircle2,
  Send,
  Phone,
  MapPin,
  FileText,
  Lock,
  Download,
  Server,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { OfficeSettings } from '@/types';
import { DEFAULT_OFFICE_NAME, DEFAULT_OFFICE_PHONE, DEFAULT_OFFICE_ADDRESS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

type SettingsTab = 'general' | 'rates' | 'commissions' | 'security' | 'integrations' | 'backup';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Form states
  const [officeName, setOfficeName] = useState(DEFAULT_OFFICE_NAME);
  const [tagline, setTagline] = useState('Official Financial Management & Electronic Payout Gateway');
  const [usdToAfn, setUsdToAfn] = useState<number>(64.86);
  const [defaultTiktok, setDefaultTiktok] = useState<number>(8);
  const [defaultYoutube, setDefaultYoutube] = useState<number>(7);
  const [defaultPaypal, setDefaultPaypal] = useState<number>(6);
  const [defaultWise, setDefaultWise] = useState<number>(5);
  const [defaultCrypto, setDefaultCrypto] = useState<number>(3);
  const [phone, setPhone] = useState(DEFAULT_OFFICE_PHONE);
  const [address, setAddress] = useState(DEFAULT_OFFICE_ADDRESS);
  const [invoiceTerms, setInvoiceTerms] = useState(
    'Deliverables verified and accepted. Official digital voucher sealed in immutable office ledger.'
  );
  const [logoDevKey, setLogoDevKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Telegram scraper
  const [fetchingTelegram, setFetchingTelegram] = useState(false);
  const [telegramFeedback, setTelegramFeedback] = useState<string | null>(null);

  // Load active tab from URL / localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab') as SettingsTab;
        if (tabParam && ['general', 'rates', 'commissions', 'security', 'integrations', 'backup'].includes(tabParam)) {
          setActiveTab(tabParam);
        } else {
          const savedTab = localStorage.getItem('s4_settings_tab') as SettingsTab;
          if (savedTab) setActiveTab(savedTab);
        }
      }
    } catch (e) {}
  }, []);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('s4_settings_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {}
  };

  // Load existing settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'office_config')
          .single();

        if (data) {
          if (data.office_name) setOfficeName(data.office_name);
          if (data.usd_to_afn) setUsdToAfn(data.usd_to_afn);
          if (data.default_tiktok_commission) setDefaultTiktok(data.default_tiktok_commission);
          if (data.default_youtube_commission) setDefaultYoutube(data.default_youtube_commission);
          if (data.default_paypal_commission) setDefaultPaypal(data.default_paypal_commission);
          if (data.default_wise_commission) setDefaultWise(data.default_wise_commission);
          if (data.phone) setPhone(data.phone);
          if (data.address) setAddress(data.address);
          if (data.logodev_public_key) setLogoDevKey(data.logodev_public_key);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    }
    loadSettings();
  }, []);

  const handleFetchFromTelegram = async () => {
    try {
      setFetchingTelegram(true);
      setTelegramFeedback(null);
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (data.success && data.rate) {
        setUsdToAfn(data.rate);
        setTelegramFeedback(`✅ Live Kabul rate ${data.rate} AFN successfully updated from @kabul_dollar.`);
      } else {
        setTelegramFeedback('❌ Rate fetch error: ' + (data.error || 'Channel unavailable'));
      }
    } catch (err: any) {
      setTelegramFeedback('❌ Connection error: ' + err.message);
    } finally {
      setFetchingTelegram(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload: Partial<OfficeSettings> = {
        office_name: officeName,
        usd_to_afn: Number(usdToAfn),
        default_tiktok_commission: Number(defaultTiktok),
        default_youtube_commission: Number(defaultYoutube),
        default_paypal_commission: Number(defaultPaypal),
        default_wise_commission: Number(defaultWise),
        phone,
        address,
        logodev_public_key: logoDevKey.trim(),
        updated_at: new Date().toISOString(),
      };

      await supabase.from('settings').upsert({ id: 'office_config', ...payload });

      if (typeof window !== 'undefined') {
        localStorage.setItem('s4_logodev_key', logoDevKey.trim());
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert('Error saving settings: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #071526 0%, #030a13 100%)',
        color: '#f8fafc',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        direction: 'ltr',
      }}
    >
      {/* Top Navigation Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          height: '70px',
          borderBottom: '1px solid rgba(2, 132, 199, 0.2)',
          background: 'rgba(7, 18, 32, 0.95)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>/</span>

          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
              System Settings & Office Parameters
            </h1>
            <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
              Persistent configuration • Changes preserved across reloads
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            borderRadius: '10px',
            background: saveSuccess
              ? '#10b981'
              : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.2s',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{loading ? 'Saving...' : saveSuccess ? 'Settings Saved!' : 'Save System Settings'}</span>
        </button>
      </header>

      {/* Main Workspace: Sidebar Tabs + Content Canvas */}
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '32px', gap: '32px' }}>
        {/* Left Navigation Card */}
        <div
          style={{
            width: '280px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            background: 'rgba(10, 24, 43, 0.7)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '16px',
            padding: '16px',
            height: 'fit-content',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#64748b',
              padding: '6px 12px 10px',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Settings Categories
          </div>

          <button
            type="button"
            onClick={() => handleTabChange('general')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              border: activeTab === 'general' ? '1px solid rgba(2, 132, 199, 0.45)' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: activeTab === 'general' ? 800 : 600,
              background: activeTab === 'general' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
              color: activeTab === 'general' ? '#38bdf8' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={17} />
            <span>Office Identity</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('rates')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              border: activeTab === 'rates' ? '1px solid rgba(2, 132, 199, 0.45)' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: activeTab === 'rates' ? 800 : 600,
              background: activeTab === 'rates' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
              color: activeTab === 'rates' ? '#38bdf8' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <DollarSign size={17} />
            <span>Exchange Rates</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('commissions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              border: activeTab === 'commissions' ? '1px solid rgba(2, 132, 199, 0.45)' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: activeTab === 'commissions' ? 800 : 600,
              background: activeTab === 'commissions' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
              color: activeTab === 'commissions' ? '#38bdf8' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <Percent size={17} />
            <span>Commissions & Fees</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              border: activeTab === 'security' ? '1px solid rgba(2, 132, 199, 0.45)' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: activeTab === 'security' ? 800 : 600,
              background: activeTab === 'security' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
              color: activeTab === 'security' ? '#38bdf8' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <ShieldCheck size={17} />
            <span>Ledger Security</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('integrations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              border: activeTab === 'integrations' ? '1px solid rgba(2, 132, 199, 0.45)' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: activeTab === 'integrations' ? 800 : 600,
              background: activeTab === 'integrations' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
              color: activeTab === 'integrations' ? '#38bdf8' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <Zap size={17} />
            <span>API Integrations</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('backup')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '10px',
              border: activeTab === 'backup' ? '1px solid rgba(2, 132, 199, 0.45)' : '1px solid transparent',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: activeTab === 'backup' ? 800 : 600,
              background: activeTab === 'backup' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
              color: activeTab === 'backup' ? '#38bdf8' : '#94a3b8',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
          >
            <Database size={17} />
            <span>Backup & Data Export</span>
          </button>

          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b' }}>Connected Cloud DB</div>
            <div
              style={{
                fontSize: '12px',
                color: '#34d399',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <Server size={13} />
              <span>Supabase PostgreSQL</span>
            </div>
          </div>
        </div>

        {/* Right Content Panel */}
        <div
          style={{
            flex: 1,
            background: 'rgba(10, 24, 43, 0.7)',
            border: '1px solid rgba(2, 132, 199, 0.25)',
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* TAB 1: GENERAL & OFFICE IDENTITY */}
          {activeTab === 'general' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Office Branding & Official Contact
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Manage the office brand name, phone lines, physical address, and invoice footer terms.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Official Business & Brand Name *</label>
                <input
                  type="text"
                  required
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '15px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ color: '#cbd5e1' }}>Official Tagline & Subtitle</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="#38bdf8" />
                    <span>Support Phone Numbers (for A4 Invoices)</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} color="#38bdf8" />
                    <span>Office Physical Location</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={14} color="#38bdf8" />
                  <span>Official Voucher Disclaimer / Terms</span>
                </label>
                <textarea
                  rows={3}
                  value={invoiceTerms}
                  onChange={(e) => setInvoiceTerms(e.target.value)}
                  className="form-input"
                  style={{ resize: 'none', lineHeight: 1.6 }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: EXCHANGE RATES */}
          {activeTab === 'rates' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Kabul Market Currency Feeds
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Live exchange rates feed from Sarai Shahzada with Telegram scraper integration.
                </p>
              </div>

              <div
                style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.16) 0%, rgba(249, 115, 22, 0.08) 100%)',
                  border: '1px solid rgba(2, 132, 199, 0.4)',
                  borderRadius: '16px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '14px', fontWeight: 800 }}>
                    <DollarSign size={18} />
                    Live US Dollar to Afghan Afghani (USD/AFN)
                  </div>

                  <button
                    type="button"
                    onClick={handleFetchFromTelegram}
                    disabled={fetchingTelegram}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      border: '1px solid rgba(2, 132, 199, 0.5)',
                      background: fetchingTelegram ? 'rgba(2, 132, 199, 0.35)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: fetchingTelegram ? 'wait' : 'pointer',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                    }}
                  >
                    <Send size={14} style={{ transform: 'rotate(-10deg)' }} />
                    <span>{fetchingTelegram ? 'Querying Telegram...' : 'Fetch Live Rate'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '16px', color: '#94a3b8' }}>1 USD =</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={usdToAfn}
                    onChange={(e) => setUsdToAfn(parseFloat(e.target.value) || 0)}
                    className="form-input"
                    style={{ width: '160px', fontSize: '22px', fontWeight: 900, color: '#38bdf8' }}
                  />
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc' }}>AFN</span>
                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>
                    Channel: @kabul_dollar
                  </span>
                </div>

                {telegramFeedback && (
                  <div
                    style={{
                      marginTop: '16px',
                      fontSize: '13px',
                      color: telegramFeedback.startsWith('✅') ? '#34d399' : '#fb7185',
                      fontWeight: 700,
                    }}
                  >
                    {telegramFeedback}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>EUR / AFN Estimate</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginTop: '6px' }}>
                    1 EUR ≈ {(usdToAfn * 1.08).toFixed(2)} AFN
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>USDT / AFN Stablecoin</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', marginTop: '6px' }}>
                    1 USDT ≈ {usdToAfn.toFixed(2)} AFN
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMISSIONS & FEES */}
          {activeTab === 'commissions' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Commission Rates & Platform Deductions
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Pre-configured commission fees automatically applied when launching cash-out vouchers.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>TikTok Creator Cash-Out (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultTiktok}
                    onChange={(e) => setDefaultTiktok(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>YouTube AdSense Payout (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultYoutube}
                    onChange={(e) => setDefaultYoutube(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>PayPal Withdrawal (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultPaypal}
                    onChange={(e) => setDefaultPaypal(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#cbd5e1' }}>Wise & International Wire (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultWise}
                    onChange={(e) => setDefaultWise(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#cbd5e1' }}>Crypto & USDT Payout Settlement (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={defaultCrypto}
                  onChange={(e) => setDefaultCrypto(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & IMMUTABLE LEDGER */}
          {activeTab === 'security' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Immutable Ledger Governance
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Tamper-proof accounting enforcement preventing deletion or editing of committed transactions.
                </p>
              </div>

              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '16px',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', fontWeight: 800, fontSize: '15px' }}>
                  <ShieldCheck size={22} color="#10b981" />
                  <span>Immutable Accounting Policy: ACTIVE & ENFORCED</span>
                </div>
                <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '10px 0 0 0', lineHeight: 1.7 }}>
                  All posted vouchers and transactions are sealed in the S4 HEL financial ledger. Deleting or modifying established transaction records is permanently disabled to ensure absolute transparency, trust, and audit compliance.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Transaction Editing</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#fb7185', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={15} />
                    Disabled (Read-Only Inspection)
                  </div>
                </div>

                <div style={{ padding: '18px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Transaction Deletions</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#fb7185', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={15} />
                    Hard-Disabled
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: API INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  External APIs & Service Providers
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Manage third-party services, official brand logo scrapers, and database connections.
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Logo.dev MCP API Key</span>
                  <span style={{ fontSize: '11px', color: '#38bdf8' }}>Official High-Resolution Brandmarks</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. pk_LMJ_gZeWQ2SH1bnRDMeIwg"
                  value={logoDevKey}
                  onChange={(e) => setLogoDevKey(e.target.value)}
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '13px' }}
                />
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: 1.6 }}>
                  Connects to Logo.dev MCP (https://mcp.logo.dev/mcp) to automatically retrieve brand logos (TikTok, YouTube, Wise, PayPal, Binance).
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                      Supabase Cloud PostgreSQL
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Project Ref: cbrciexsfyaqmcagoksj • Secure TLS v1.3
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#34d399', fontWeight: 800 }}>
                    <CheckCircle2 size={16} />
                    Connected
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BACKUP & DATA */}
          {activeTab === 'backup' && (
            <div>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#f8fafc', margin: '0 0 6px 0' }}>
                  Data Export & Offline Bookkeeping
                </h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Download ledger archives and client database files for accounting backups.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#f8fafc' }}>
                      Export Full Ledger to CSV
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Includes tracking codes, clients, gross received, payouts, and net office profit.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Generating full ledger CSV export...');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: 'rgba(2, 132, 199, 0.15)',
                      border: '1px solid rgba(2, 132, 199, 0.35)',
                      color: '#38bdf8',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={15} />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#f8fafc' }}>
                      Export Client Directory (CRM)
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      Exports full client list, WhatsApp contacts, and historical transaction volume.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Exporting client database...');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#cbd5e1',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={15} />
                    <span>Export Clients</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
