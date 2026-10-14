'use client';

import React from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Receipt,
  ArrowRightLeft,
  ShieldCheck,
  User,
  RefreshCw,
  LogOut,
  Settings,
} from 'lucide-react';
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
        padding: '0 28px',
        borderBottom: '1px solid rgba(2, 132, 199, 0.18)',
        background: 'linear-gradient(180deg, rgba(8, 20, 36, 0.98) 0%, rgba(5, 14, 26, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '72px',
        boxShadow: '0 4px 24px -2px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* 1. Left Branding Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%)',
            border: '1px solid rgba(2, 132, 199, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: '3px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.2)',
            flexShrink: 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontSize: '16.5px',
                fontWeight: 900,
                color: '#f8fafc',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              {officeName || DEFAULT_OFFICE_NAME}
            </h1>
            <span
              style={{
                fontSize: '9.5px',
                padding: '2px 6px',
                borderRadius: '5px',
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(249, 115, 22, 0.25) 100%)',
                color: '#38bdf8',
                border: '1px solid rgba(2, 132, 199, 0.35)',
                fontWeight: 800,
                letterSpacing: '0.4px',
              }}
            >
              PRO
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{currentDate}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                color: '#34d399',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                  display: 'inline-block',
                }}
              />
              <span>Live Cloud DB</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Center Live Market & Currency Controller */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(2, 132, 199, 0.2)',
          padding: '5px 14px',
          borderRadius: '14px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Exchange Rate Badge */}
        <div
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            paddingRight: '6px',
          }}
          title="Click to view & adjust exchange rate"
        >
          <ArrowRightLeft size={14} color="#0284c7" />
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Kabul Rate:</span>
          <span style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8', letterSpacing: '-0.2px' }}>
            1 USD = {usdToAfn.toFixed(2)} AFN
          </span>
        </div>

        {/* Sync Rate Icon Button */}
        {onSyncTelegramRate && (
          <button
            onClick={onSyncTelegramRate}
            disabled={isSyncingTelegram}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              border: '1px solid rgba(2, 132, 199, 0.35)',
              background: isSyncingTelegram ? 'rgba(2, 132, 199, 0.3)' : 'rgba(2, 132, 199, 0.12)',
              color: '#38bdf8',
              cursor: isSyncingTelegram ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            title="Sync live rate from @kabul_dollar Telegram channel"
          >
            <RefreshCw
              size={13}
              style={{
                animation: isSyncingTelegram ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        )}

        {/* Currency Switcher Pill */}
        {onToggleDisplayCurrency && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(3, 10, 20, 0.8)',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={() => onToggleDisplayCurrency('USD')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: displayCurrency === 'USD' ? '#0284c7' : 'transparent',
                color: displayCurrency === 'USD' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease',
              }}
            >
              $ USD
            </button>
            <button
              type="button"
              onClick={() => onToggleDisplayCurrency('AFN')}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                background: displayCurrency === 'AFN' ? '#10b981' : 'transparent',
                color: displayCurrency === 'AFN' ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease',
              }}
            >
              ؋ AFN
            </button>
          </div>
        )}
      </div>

      {/* 3. Right Actions & User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* New Expense Button */}
        <button
          onClick={onOpenNewExpense}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 13px',
            borderRadius: '10px',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: '#fb7185',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Add office expense record"
        >
          <Receipt size={14} />
          <span>+ Expense</span>
        </button>

        {/* Primary New Transaction CTA */}
        <button
          onClick={onOpenNewTransaction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 16px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            color: '#ffffff',
            fontSize: '12.5px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.15s ease',
          }}
          title="Create a new financial transaction or cash-out voucher"
        >
          <PlusCircle size={15} />
          <span>+ New Transaction</span>
        </button>

        {/* Settings Shortcut Button */}
        <Link
          href="/settings"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            textDecoration: 'none',
          }}
          title="System Settings & Office Parameters"
        >
          <Settings size={16} />
        </Link>

        {/* User Profile Card */}
        <Link
          href="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '5px 10px',
            borderRadius: '10px',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
          title="User profile • Click to open settings"
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            {currentUser.name
              ? currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              : 'SS'}
          </div>

          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {currentUser.role?.split('&')[0] || 'Staff'}
            </div>
          </div>
        </Link>

        {/* Logout Button (English) */}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: '#fb7185',
              padding: '7px 11px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
            title="Sign out of your session"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
}
