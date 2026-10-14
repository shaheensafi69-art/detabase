'use client';

import React from 'react';
import { PlusCircle, Receipt, ArrowRightLeft, ShieldCheck, User, Send, LogOut } from 'lucide-react';
import { DEFAULT_OFFICE_NAME } from '@/lib/constants';

interface NavbarProps {
  officeName: string;
  usdToAfn: number;
  onOpenNewTransaction: () => void;
  onOpenNewExpense: () => void;
  onOpenSettings: () => void;
  currentUser: { name: string; role: string; email?: string };
  onLogout?: () => void;
  onSyncTelegramRate?: () => void;
  isSyncingTelegram?: boolean;
  displayCurrency?: 'USD' | 'AFN';
  onToggleDisplayCurrency?: (currency: 'USD' | 'AFN') => void;
}

export default function Navbar({
  officeName,
  usdToAfn,
  onOpenNewTransaction,
  onOpenNewExpense,
  onOpenSettings,
  currentUser,
  onLogout,
  onSyncTelegramRate,
  isSyncingTelegram = false,
  displayCurrency = 'USD',
  onToggleDisplayCurrency,
}: NavbarProps) {
  const [currentDate, setCurrentDate] = React.useState('');

  React.useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  return (
    <header
      className="no-print"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 28px',
        borderBottom: '1px solid rgba(2, 132, 199, 0.25)',
        background: 'linear-gradient(90deg, rgba(7, 17, 30, 0.96) 0%, rgba(10, 27, 48, 0.96) 100%)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '74px',
      }}
    >
      {/* Office Branding with Official Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(2, 132, 199, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '3px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="S4 HEL Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontSize: '17px',
                fontWeight: 900,
                color: 'var(--text-main)',
                margin: 0,
                letterSpacing: '-0.2px',
              }}
            >
              {officeName || DEFAULT_OFFICE_NAME}
            </h1>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '5px',
                background: 'rgba(249, 115, 22, 0.15)',
                color: '#fb923c',
                fontWeight: 800,
                letterSpacing: '0.5px',
              }}
            >
              PRO
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
              {currentDate}
            </span>
            <span style={{ color: 'var(--border-subtle)' }}>•</span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={12} />
              Cloud Database Connected
            </div>
          </div>
        </div>
      </div>

      {/* Center Currency Ticker with Live Telegram Sync */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          padding: '6px 14px',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
          title="Click to manually edit exchange rate & fees"
        >
          <ArrowRightLeft size={16} color="#0284c7" />
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Kabul Rate:</span>
          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#38bdf8' }}>
            1 USD = {usdToAfn.toFixed(2)} AFN
          </span>
        </div>

        {onSyncTelegramRate && (
          <button
            onClick={onSyncTelegramRate}
            disabled={isSyncingTelegram}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              background: isSyncingTelegram
                ? 'rgba(2, 132, 199, 0.3)'
                : 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%)',
              color: '#38bdf8',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: isSyncingTelegram ? 'wait' : 'pointer',
              opacity: isSyncingTelegram ? 0.7 : 1,
              transition: 'all 0.2s',
            }}
            title="Fetch live Kabul dollar rate from @kabul_dollar Telegram channel"
          >
            <Send size={12} style={{ transform: 'rotate(-10deg)' }} />
            <span>{isSyncingTelegram ? 'Fetching...' : 'Live Telegram Rate'}</span>
          </button>
        )}

        {/* Currency Switcher (USD vs AFN) */}
        {onToggleDisplayCurrency && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(8, 20, 36, 0.9)',
              borderRadius: '9px',
              padding: '2px',
              border: '1px solid rgba(2, 132, 199, 0.4)',
              marginLeft: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => onToggleDisplayCurrency('USD')}
              style={{
                padding: '4px 10px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: displayCurrency === 'USD' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                color: displayCurrency === 'USD' ? '#ffffff' : '#94a3b8',
                boxShadow: displayCurrency === 'USD' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
                transition: 'all 0.15s',
              }}
              title="Display all financial figures primarily in US Dollars ($)"
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => onToggleDisplayCurrency('AFN')}
              style={{
                padding: '4px 10px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: displayCurrency === 'AFN' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: displayCurrency === 'AFN' ? '#ffffff' : '#94a3b8',
                boxShadow: displayCurrency === 'AFN' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none',
                transition: 'all 0.15s',
              }}
              title="Display all financial figures primarily in Afghan Afghanis (AFN)"
            >
              ؋ AFN
            </button>
          </div>
        )}
      </div>

      {/* Right Action Buttons & Staff Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenNewExpense}
          className="btn btn-secondary"
          style={{ fontSize: '12.5px', padding: '8px 14px' }}
        >
          <Receipt size={15} color="#fb7185" />
          + New Expense
        </button>

        <button
          onClick={onOpenNewTransaction}
          className="btn btn-emerald"
          style={{ fontSize: '13px', padding: '9px 18px' }}
        >
          <PlusCircle size={16} />
          + New Transaction
        </button>

        {/* User Profile Badge */}
        <div
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '5px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
          title="Click to open Settings"
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
            }}
          >
            <User size={15} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              {currentUser.role}
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              color: '#fb7185',
              padding: '7px 11px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
            title="خروج از حساب کاربری (Sign Out)"
          >
            <LogOut size={14} />
            <span>خروج</span>
          </button>
        )}
      </div>
    </header>
  );
}
