'use client';

import React, { useState } from 'react';
import { X, Settings, CheckCircle2, DollarSign, Send } from 'lucide-react';
import { OfficeSettings } from '@/types';
import { DEFAULT_OFFICE_NAME, DEFAULT_OFFICE_PHONE, DEFAULT_OFFICE_ADDRESS } from '@/lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OfficeSettings;
  onSave: (newSettings: Partial<OfficeSettings>) => Promise<void>;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [officeName, setOfficeName] = useState(settings.office_name || DEFAULT_OFFICE_NAME);
  const [usdToAfn, setUsdToAfn] = useState<number>(settings.usd_to_afn || 64.86);
  const [defaultTiktok, setDefaultTiktok] = useState<number>(settings.default_tiktok_commission || 8);
  const [defaultYoutube, setDefaultYoutube] = useState<number>(settings.default_youtube_commission || 7);
  const [defaultPaypal, setDefaultPaypal] = useState<number>(settings.default_paypal_commission || 6);
  const [defaultWise, setDefaultWise] = useState<number>(settings.default_wise_commission || 5);
  const [phone, setPhone] = useState(settings.phone || DEFAULT_OFFICE_PHONE);
  const [address, setAddress] = useState(settings.address || DEFAULT_OFFICE_ADDRESS);
  const [logoDevKey, setLogoDevKey] = useState(settings.logodev_public_key || '');
  const [loading, setLoading] = useState(false);
  const [fetchingTelegram, setFetchingTelegram] = useState(false);
  const [telegramFeedback, setTelegramFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    setOfficeName(settings.office_name || DEFAULT_OFFICE_NAME);
    setUsdToAfn(settings.usd_to_afn || 64.86);
    setDefaultTiktok(settings.default_tiktok_commission || 8);
    setDefaultYoutube(settings.default_youtube_commission || 7);
    setDefaultPaypal(settings.default_paypal_commission || 6);
    setDefaultWise(settings.default_wise_commission || 5);
    setPhone(settings.phone || DEFAULT_OFFICE_PHONE);
    setAddress(settings.address || DEFAULT_OFFICE_ADDRESS);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('s4_logodev_key') || '' : '';
    setLogoDevKey(settings.logodev_public_key || stored || 'pk_LMJ_gZeWQ2SH1bnRDMeIwg');
    setTelegramFeedback(null);
  }, [settings, isOpen]);

  const handleFetchFromTelegram = async () => {
    try {
      setFetchingTelegram(true);
      setTelegramFeedback(null);
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (data.success && data.rate) {
        setUsdToAfn(data.rate);
        setTelegramFeedback(`✅ Live Kabul rate ${data.rate} AFN retrieved from @kabul_dollar.`);
      } else {
        setTelegramFeedback('❌ Rate fetch error: ' + (data.error || 'Invalid response'));
      }
    } catch (err: any) {
      setTelegramFeedback('❌ Connection error: ' + err.message);
    } finally {
      setFetchingTelegram(false);
    }
  };

  if (!isOpen) return null;

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
      onClose();
    } catch (err: any) {
      alert('Error saving settings: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          background: 'linear-gradient(180deg, #0b1f36 0%, #06111f 100%)',
          border: '1px solid rgba(2, 132, 199, 0.4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(2, 132, 199, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                System Settings & Exchange Rate
              </h2>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                Office branding, invoice contacts, and currency exchange parameters
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <div className="form-group">
            <label className="form-label">Official Office Brand Name *</label>
            <input
              type="text"
              required
              value={officeName}
              onChange={(e) => setOfficeName(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Exchange Rate Highlight */}
          <div
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(249, 115, 22, 0.08) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              borderRadius: '14px',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: 700 }}>
                <DollarSign size={16} />
                Live Currency Rate (USD to AFN):
              </div>
              <button
                type="button"
                onClick={handleFetchFromTelegram}
                disabled={fetchingTelegram}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(2, 132, 199, 0.4)',
                  background: fetchingTelegram ? 'rgba(2, 132, 199, 0.3)' : 'rgba(2, 132, 199, 0.18)',
                  color: '#38bdf8',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: fetchingTelegram ? 'wait' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Send size={12} style={{ transform: 'rotate(-10deg)' }} />
                <span>{fetchingTelegram ? 'Querying...' : 'Fetch from Telegram'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>1 USD =</span>
              <input
                type="number"
                step="0.01"
                required
                value={usdToAfn}
                onChange={(e) => setUsdToAfn(parseFloat(e.target.value) || 0)}
                className="form-input"
                style={{ width: '130px', fontSize: '17px', fontWeight: 800, color: '#38bdf8' }}
              />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>AFN</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                Channel: @kabul_dollar
              </span>
            </div>

            {telegramFeedback && (
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  color: telegramFeedback.startsWith('✅') ? '#34d399' : '#fb7185',
                  fontWeight: 600,
                }}
              >
                {telegramFeedback}
              </div>
            )}
          </div>

          <div
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#38bdf8',
              marginBottom: '12px',
            }}
          >
            Default Cash-Out Commission Rates (%):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">TikTok Commission (%)</label>
              <input
                type="number"
                step="0.1"
                value={defaultTiktok}
                onChange={(e) => setDefaultTiktok(parseFloat(e.target.value) || 0)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">YouTube Commission (%)</label>
              <input
                type="number"
                step="0.1"
                value={defaultYoutube}
                onChange={(e) => setDefaultYoutube(parseFloat(e.target.value) || 0)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">PayPal Commission (%)</label>
              <input
                type="number"
                step="0.1"
                value={defaultPaypal}
                onChange={(e) => setDefaultPaypal(parseFloat(e.target.value) || 0)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Wise & Wire Commission (%)</label>
              <input
                type="number"
                step="0.1"
                value={defaultWise}
                onChange={(e) => setDefaultWise(parseFloat(e.target.value) || 0)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Office Phone Numbers (for Invoices)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Office Physical Address (for Invoices)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          {/* Logo.dev API Key Integration */}
          <div className="form-group" style={{ marginTop: '4px' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Logo.dev MCP API Key / Token</span>
              <span style={{ fontSize: '11px', color: '#38bdf8' }}>Official High-Resolution Brandmarks</span>
            </label>
            <input
              type="text"
              placeholder="e.g. pk_live_... or pk_..."
              value={logoDevKey}
              onChange={(e) => setLogoDevKey(e.target.value)}
              className="form-input"
              style={{ fontFamily: 'monospace', fontSize: '12.5px' }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              Connected to Logo.dev MCP (https://mcp.logo.dev/mcp). Automatically pulls official brand logos and icons for all platforms and invoice vouchers.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-emerald">
              <CheckCircle2 size={16} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
