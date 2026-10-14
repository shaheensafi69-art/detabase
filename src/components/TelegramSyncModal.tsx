'use client';

import React from 'react';
import { X, CheckCircle2, Send, Radio, Clock, ShieldCheck } from 'lucide-react';

interface TelegramSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    rate: number;
    city?: string;
    rawMessage?: string;
    channel?: string;
    timestamp?: string;
  } | null;
  onApplyRate?: (rate: number) => void;
}

export default function TelegramSyncModal({
  isOpen,
  onClose,
  data,
  onApplyRate,
}: TelegramSyncModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          background: 'linear-gradient(180deg, #0d233e 0%, #071322 100%)',
          border: '1px solid rgba(2, 132, 199, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(2, 132, 199, 0.2)',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Top Header with Telegram Brand Accent */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.3) 0%, rgba(14, 165, 233, 0.15) 100%)',
            padding: '22px 24px',
            borderBottom: '1px solid rgba(2, 132, 199, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
              }}
            >
              <Send size={22} style={{ transform: 'translateX(-1px) rotate(-10deg)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Live Kabul Exchange Rate
                </h3>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontWeight: 700,
                  }}
                >
                  LIVE
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                Sarai Shahzada Official Channel ({data.channel || '@kabul_dollar'})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          {/* Main Exchange Rate Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginBottom: '8px',
              }}
            >
              <Radio size={14} />
              <span>Official Kabul Market Dollar Rate ({data.city || 'Kabul'})</span>
            </div>

            <div
              style={{
                fontSize: '36px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.5px',
                fontFamily: 'Plus Jakarta Sans, monospace',
                textShadow: '0 2px 14px rgba(2, 132, 199, 0.5)',
              }}
            >
              1 USD = <span style={{ color: '#38bdf8' }}>{Number(data.rate).toFixed(2)}</span> AFN
            </div>

            <div
              style={{
                fontSize: '12px',
                color: '#a7f3d0',
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={13} />
              Verified live from Sarai Shahzada Kabul
            </div>
          </div>

          {/* Raw Telegram Post Box */}
          {data.rawMessage && (
            <div style={{ marginBottom: '22px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Clock size={13} color="#f97316" />
                Latest Message Extracted from Telegram:
              </div>
              <div
                style={{
                  background: 'rgba(6, 14, 24, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  fontSize: '12.5px',
                  lineHeight: '1.7',
                  color: '#e2e8f0',
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}
              >
                {data.rawMessage}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} color="#0284c7" />
              <span>Applied to all conversions and payouts</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ padding: '9px 18px', fontSize: '13px' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onApplyRate) onApplyRate(data.rate);
                  onClose();
                }}
                className="btn btn-primary"
                style={{ padding: '9px 20px', fontSize: '13px' }}
              >
                <CheckCircle2 size={16} />
                Apply Rate to System
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
