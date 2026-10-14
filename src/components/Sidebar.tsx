'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Wallet,
  Briefcase,
  Sparkles,
  CreditCard,
  Receipt,
  Users,
  Settings,
  ArrowUpRight,
  Calculator,
  Layers,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'cashout'
  | 'accounts'
  | 'company_bank'
  | 'payments'
  | 'expenses'
  | 'customers'
  | 'services'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  stats: {
    totalProfit: number;
    totalExpenses: number;
    netProfit: number;
  };
  onOpenServiceManager?: () => void;
  displayCurrency?: 'USD' | 'AFN';
  usdToAfn?: number;
}

export default function Sidebar({
  currentTab,
  onSelectTab,
  stats,
  onOpenServiceManager,
  displayCurrency = 'USD',
  usdToAfn = 68.5,
}: SidebarProps) {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'cashout',
      label: 'Cash-Out Services',
      icon: <Wallet size={18} />,
      badge: 'Payouts',
      badgeColor: '#0284c7',
    },
    {
      id: 'accounts',
      label: 'Account Creation',
      icon: <Sparkles size={18} />,
      badge: 'Popular',
      badgeColor: '#f97316',
    },
    {
      id: 'company_bank',
      label: 'Company & Banking',
      icon: <Briefcase size={18} />,
    },
    {
      id: 'payments',
      label: 'Card Payments',
      icon: <CreditCard size={18} />,
    },
    {
      id: 'expenses',
      label: 'Daily Expenses',
      icon: <Receipt size={18} />,
    },
    {
      id: 'customers',
      label: 'Customers (CRM)',
      icon: <Users size={18} />,
    },
    {
      id: 'services',
      label: 'Service Manager',
      icon: <Layers size={18} />,
      badge: 'Custom',
      badgeColor: '#10b981',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <aside
      className="no-print"
      style={{
        width: '270px',
        minWidth: '270px',
        maxWidth: '270px',
        borderRight: '1px solid rgba(2, 132, 199, 0.2)',
        background: 'linear-gradient(180deg, rgba(8, 19, 34, 0.98) 0%, rgba(5, 12, 22, 0.99) 100%)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 14px',
        position: 'sticky',
        top: 0,
        height: '100%',
        overflowY: 'auto',
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Navigation List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748b',
            padding: '0 12px 8px 12px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Main Navigation</span>
          <span style={{ fontSize: '10px', color: '#0284c7', fontWeight: 800 }}>S4 HEL</span>
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const commonStyles: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 12px',
            borderRadius: '12px',
            border: isActive
              ? '1px solid rgba(2, 132, 199, 0.5)'
              : '1px solid transparent',
            background: isActive
              ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.22) 0%, rgba(249, 115, 22, 0.1) 100%)'
              : 'transparent',
            color: isActive ? '#ffffff' : '#94a3b8',
            fontWeight: isActive ? 800 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            textAlign: 'left',
            width: '100%',
            boxShadow: isActive ? '0 2px 12px rgba(2, 132, 199, 0.2)' : 'none',
            textDecoration: 'none',
            boxSizing: 'border-box',
          };

          const content = (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: isActive ? '#38bdf8' : '#64748b' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    background: item.badgeColor
                      ? `${item.badgeColor}25`
                      : 'rgba(2, 132, 199, 0.15)',
                    color: item.badgeColor || '#38bdf8',
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </>
          );

          if (item.id === 'settings') {
            return (
              <Link
                key={item.id}
                href="/settings"
                style={commonStyles}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#f8fafc';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'services' && onOpenServiceManager) {
                  onOpenServiceManager();
                } else {
                  onSelectTab(item.id);
                }
              }}
              style={commonStyles}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.color = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Bottom Mini Balance Card */}
      <div
        className="glass-panel"
        style={{
          marginTop: '16px',
          padding: '16px',
          background: 'linear-gradient(180deg, rgba(11, 26, 46, 0.85) 0%, rgba(6, 15, 28, 0.95) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.3)',
          borderRadius: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#94a3b8' }}>
            <Calculator size={13} color="#0284c7" />
            <span>Net Office Profit</span>
          </div>
          <ArrowUpRight size={14} color="#10b981" />
        </div>

        <div style={{ fontSize: '20px', fontWeight: 900, color: '#34d399' }}>
          {displayCurrency === 'AFN'
            ? `${(stats.netProfit * usdToAfn).toLocaleString(undefined, { maximumFractionDigits: 0 })} ؋`
            : `$${stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </div>
        <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '2px' }}>
          {displayCurrency === 'AFN'
            ? `≈ $${stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`
            : `≈ ${(stats.netProfit * usdToAfn).toLocaleString(undefined, { maximumFractionDigits: 0 })} AFN`}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-dim)',
            marginTop: '10px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <span>
            Fees: {displayCurrency === 'AFN' ? `${(stats.totalProfit * usdToAfn).toFixed(0)} ؋` : `$${stats.totalProfit.toFixed(0)}`}
          </span>
          <span style={{ color: '#fb7185' }}>
            Exp: {displayCurrency === 'AFN' ? `${(stats.totalExpenses * usdToAfn).toFixed(0)} ؋` : `$${stats.totalExpenses.toFixed(0)}`}
          </span>
        </div>
      </div>
    </aside>
  );
}
