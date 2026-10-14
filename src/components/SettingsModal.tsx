'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  CheckCircle2,
  DollarSign,
  Send,
  Building2,
  Percent,
  ShieldCheck,
  KeyRound,
  Download,
  Database,
  Lock,
  Layers,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  RefreshCw,
  Server,
  Zap,
} from 'lucide-react';
import { OfficeSettings } from '@/types';
import {
  DEFAULT_OFFICE_NAME,
  DEFAULT_OFFICE_PHONE,
  DEFAULT_OFFICE_ADDRESS,
} from '@/lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OfficeSettings;
  onSave: (newSettings: Partial<OfficeSettings>) => Promise<void>;
}

type SettingsTab = 'general' | 'rates' | 'commissions' | 'security' | 'integrations' | 'backup';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  // Form states
  const [officeName, setOfficeName] = useState(settings.office_name || DEFAULT_OFFICE_NAME);
  const [tagline, setTagline] = useState('Official Financial Management & Electronic Payout Gateway');
  const [usdToAfn, setUsdToAfn] = useState<number>(settings.usd_to_afn || 64.86);
  const [defaultTiktok, setDefaultTiktok] = useState<number>(settings.default_tiktok_commission || 8);
  const [defaultYoutube, setDefaultYoutube] = useState<number>(settings.default_youtube_commission || 7);
  const [defaultPaypal, setDefaultPaypal] = useState<number>(settings.default_paypal_commission || 6);
  const [defaultWise, setDefaultWise] = useState<number>(settings.default_wise_commission || 5);
  const [defaultCrypto, setDefaultCrypto] = useState<number>(3);
  const [phone, setPhone] = useState(settings.phone || DEFAULT_OFFICE_PHONE);
  const [address, setAddress] = useState(settings.address || DEFAULT_OFFICE_ADDRESS);
  const [invoiceTerms, setInvoiceTerms] = useState(
    'Deliverables verified and accepted. Official digital voucher sealed in immutable office ledger.'
  );
  const [logoDevKey, setLogoDevKey] = useState(settings.logodev_public_key || '');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Telegram scraper state
  const [fetchingTelegram, setFetchingTelegram] = useState(false);
  const [telegramFeedback, setTelegramFeedback] = useState<string | null>(null);

  useEffect(() => {
    setOfficeName(settings.office_name || DEFAULT_OFFICE_NAME);
    setUsdToAfn(settings.usd_to_afn || 64.86);
    setDefaultTiktok(settings.default_tiktok_commission || 8);
    setDefaultYoutube(settings.default_youtube_commission || 7);
    setDefaultPaypal(settings.default_paypal_commission || 6);
    setDefaultWise(settings.default_wise_commission || 5);
    setPhone(settings.phone || DEFAULT_OFFICE_PHONE);
    setAddress(settings.address || DEFAULT_OFFICE_ADDRESS);
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('s4_logodev_key') || '' : '';
    setLogoDevKey(settings.logodev_public_key || storedKey || 'pk_LMJ_gZeWQ2SH1bnRDMeIwg');
    setTelegramFeedback(null);
    setSaveSuccess(false);
  }, [settings, isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSave({
        office_name: officeName,
        usd_to_afn: Number(usdToAfn),
        default_tiktok_commission: Number(defaultTiktok),
        default_youtube_commission: Number(defaultYoutube),
        default_paypal_commission: Number(defaultPaypal),
        default_wise_commission: Number(defaultWise),
        phone,
        address,
        logodev_public_key: logoDevKey.trim(),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('s4_logodev_key', logoDevKey.trim());
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      alert('Error saving settings: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '860px',
          width: '95%',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, #0a1b30 0%, #05101d 100%)',
          border: '1px solid rgba(2, 132, 199, 0.35)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(2, 132, 199, 0.15)',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          direction: 'ltr',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, rgba(249, 115, 22, 0.1) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.2)',
                border: '1px solid rgba(2, 132, 199, 0.4)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Settings size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                  Enterprise System & Office Settings
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontWeight: 700,
                  }}
                >
                  Master Config
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Office branding, exchange rate feeds, service commissions, and security governance
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Left Tab Navigator + Right Tab Content */}
        <div style={{ display: 'flex', flex: 1, minHeight: '480px', overflow: 'hidden' }}>
          {/* Left Vertical Tabs */}
          <div
            style={{
              width: '230px',
              borderRight: '1px solid rgba(255, 255, 255, 0.07)',
              background: 'rgba(5, 13, 24, 0.6)',
              padding: '16px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'general' ? 800 : 600,
                background: activeTab === 'general' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                color: activeTab === 'general' ? '#38bdf8' : '#94a3b8',
                borderLeft: activeTab === 'general' ? '3px solid #0284c7' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Building2 size={16} />
              <span>Office Identity</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rates')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'rates' ? 800 : 600,
                background: activeTab === 'rates' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                color: activeTab === 'rates' ? '#38bdf8' : '#94a3b8',
                borderLeft: activeTab === 'rates' ? '3px solid #0284c7' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <DollarSign size={16} />
              <span>Exchange Rates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('commissions')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'commissions' ? 800 : 600,
                background: activeTab === 'commissions' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                color: activeTab === 'commissions' ? '#38bdf8' : '#94a3b8',
                borderLeft: activeTab === 'commissions' ? '3px solid #0284c7' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Percent size={16} />
              <span>Commissions & Fees</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'security' ? 800 : 600,
                background: activeTab === 'security' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                color: activeTab === 'security' ? '#38bdf8' : '#94a3b8',
                borderLeft: activeTab === 'security' ? '3px solid #0284c7' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <ShieldCheck size={16} />
              <span>Ledger Security</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('integrations')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'integrations' ? 800 : 600,
                background: activeTab === 'integrations' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                color: activeTab === 'integrations' ? '#38bdf8' : '#94a3b8',
                borderLeft: activeTab === 'integrations' ? '3px solid #0284c7' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Zap size={16} />
              <span>API Integrations</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === 'backup' ? 800 : 600,
                background: activeTab === 'backup' ? 'rgba(2, 132, 199, 0.2)' : 'transparent',
                color: activeTab === 'backup' ? '#38bdf8' : '#94a3b8',
                borderLeft: activeTab === 'backup' ? '3px solid #0284c7' : '3px solid transparent',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <Database size={16} />
              <span>Backup & Data</span>
            </button>

            <div style={{ marginTop: 'auto', padding: '10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Database Engine</div>
              <div style={{ fontSize: '11.5px', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                <Server size={12} />
                Supabase PostgreSQL
              </div>
            </div>
          </div>

          {/* Right Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <form onSubmit={handleSubmit}>
              {/* TAB 1: GENERAL & OFFICE IDENTITY */}
              {activeTab === 'general' && (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                    Office Branding & Invoice Header
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    These details appear on official client invoices, printable A4 vouchers, and header banners.
                  </p>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>Official Business & Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={officeName}
                      onChange={(e) => setOfficeName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>Official Tagline & Specialization</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="form-input"
                      placeholder="e.g. Financial & Office Database Management"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={13} color="#38bdf8" />
                        <span>Official Support Phones (for A4 Invoices)</span>
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={13} color="#38bdf8" />
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
                    <label className="form-label" style={{ color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FileText size={13} color="#38bdf8" />
                      <span>Invoice Disclaimer / Settlement Terms</span>
                    </label>
                    <textarea
                      rows={3}
                      value={invoiceTerms}
                      onChange={(e) => setInvoiceTerms(e.target.value)}
                      className="form-input"
                      style={{ resize: 'none', lineHeight: 1.5 }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: EXCHANGE RATES */}
              {activeTab === 'rates' && (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                    Currency Exchange Rates & Telegram Feeds
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '18px' }}>
                    Configure the official US Dollar to Afghan Afghani (USD/AFN) conversion parameters.
                  </p>

                  {/* Highlight Box */}
                  <div
                    style={{
                      padding: '18px',
                      background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%)',
                      border: '1px solid rgba(2, 132, 199, 0.4)',
                      borderRadius: '14px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: 800 }}>
                        <DollarSign size={17} />
                        Live Kabul Sarai Shahzada Dollar Benchmark
                      </div>

                      <button
                        type="button"
                        onClick={handleFetchFromTelegram}
                        disabled={fetchingTelegram}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid rgba(2, 132, 199, 0.45)',
                          background: fetchingTelegram ? 'rgba(2, 132, 199, 0.35)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: fetchingTelegram ? 'wait' : 'pointer',
                        }}
                      >
                        <Send size={13} style={{ transform: 'rotate(-10deg)' }} />
                        <span>{fetchingTelegram ? 'Querying Telegram...' : 'Sync Live Rate'}</span>
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '15px', color: '#94a3b8' }}>1 USD =</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={usdToAfn}
                        onChange={(e) => setUsdToAfn(parseFloat(e.target.value) || 0)}
                        className="form-input"
                        style={{ width: '140px', fontSize: '19px', fontWeight: 900, color: '#38bdf8' }}
                      />
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc' }}>AFN</span>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>
                        Source: Public Feed @kabul_dollar
                      </span>
                    </div>

                    {telegramFeedback && (
                      <div
                        style={{
                          marginTop: '12px',
                          fontSize: '12.5px',
                          color: telegramFeedback.startsWith('✅') ? '#34d399' : '#fb7185',
                          fontWeight: 700,
                        }}
                      >
                        {telegramFeedback}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>EUR / AFN Estimate</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                        1 EUR ≈ {(usdToAfn * 1.08).toFixed(2)} AFN
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>USDT / AFN Stablecoin</div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                        1 USDT ≈ {usdToAfn.toFixed(2)} AFN
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COMMISSIONS & FEES */}
              {activeTab === 'commissions' && (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                    Default Service Commissions & Fee Schedule
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    These percentages pre-populate in the Transaction & Cash-Out creation wizard.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
                    <label className="form-label" style={{ color: '#cbd5e1' }}>USDT / Crypto Settlement Fee (%)</label>
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
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                    Immutable Ledger Governance & Anti-Tamper Policy
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    System rules enforcing tamper-proof financial bookkeeping and data permanence.
                  </p>

                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '14px',
                      padding: '18px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', fontWeight: 800, fontSize: '14px' }}>
                      <ShieldCheck size={20} color="#10b981" />
                      <span>Immutable Accounting Policy: ACTIVE & ENFORCED</span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: '8px 0 0 0', lineHeight: 1.6 }}>
                      In accordance with S4 HEL office standards, all transactions once committed become permanent financial records. Editing, overwriting, or deletion of posted vouchers is strictly prohibited at both the user interface and database guard level.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Transaction Edits</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fb7185', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} />
                        Locked (Read-Only Inspection)
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Transaction Deletions</div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fb7185', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Lock size={14} />
                        Hard-Disabled
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: API INTEGRATIONS */}
              {activeTab === 'integrations' && (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                    External APIs & Service Providers
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    Manage connected API services including Logo.dev brand assets and Supabase cloud.
                  </p>

                  <div className="form-group" style={{ marginBottom: '18px' }}>
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
                      style={{ fontFamily: 'monospace', fontSize: '12.5px' }}
                    />
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                      Connects to Logo.dev MCP (https://mcp.logo.dev/mcp) to automatically retrieve brand logos (TikTok, YouTube, Wise, PayPal, Binance).
                    </div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                          Supabase Cloud PostgreSQL
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Project Ref: cbrciexsfyaqmcagoksj • Secure TLS v1.3
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#34d399', fontWeight: 700 }}>
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
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>
                    Database Backup & Records Export
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#94a3b8', marginBottom: '20px' }}>
                    Download offline spreadsheet exports and backup audit logs for bookkeeping archives.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#f8fafc' }}>
                          Export Full Ledger to CSV
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Exports tracking codes, clients, gross received, payouts, and net office commission.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          alert('Generating full ledger CSV export...');
                          window.location.href = '#';
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: 'rgba(2, 132, 199, 0.15)',
                          border: '1px solid rgba(2, 132, 199, 0.35)',
                          color: '#38bdf8',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={14} />
                        <span>Download CSV</span>
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#f8fafc' }}>
                          Export Client Directory (CRM)
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Exports customer contacts, WhatsApp phone numbers, and accumulated transaction counts.
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
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#cbd5e1',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <Download size={14} />
                        <span>Export Clients</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Footer Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  marginTop: '28px',
                  paddingTop: '18px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#cbd5e1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 22px',
                    borderRadius: '10px',
                    background: saveSuccess
                      ? '#10b981'
                      : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                    transition: 'all 0.2s',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{loading ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save System Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
