'use client';

import React, { useMemo } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  DollarSign,
  TrendingUp,
  Wallet,
  Printer,
  PlusCircle,
  ExternalLink,
  Eye,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Customer, Transaction, OfficeSettings } from '@/types';
import { BASE_SERVICES } from '@/lib/constants';
import { PlatformLogo } from '@/components/PlatformLogo';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  transactions: Transaction[];
  settings: OfficeSettings;
  onNewTransactionForCustomer: (customer: Customer) => void;
  onPrintTransaction: (transaction: Transaction) => void;
  onViewTransaction?: (transaction: Transaction) => void;
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  transactions,
  settings,
  onNewTransactionForCustomer,
  onPrintTransaction,
  onViewTransaction,
}: CustomerDetailModalProps) {
  if (!isOpen || !customer) return null;

  // Filter all transactions related to this customer
  const customerTransactions = useMemo(() => {
    return transactions.filter(
      (tx) =>
        (tx.customer_id && tx.customer_id === customer.id) ||
        (tx.customer_name &&
          tx.customer_name.trim().toLowerCase() === customer.full_name.trim().toLowerCase()) ||
        (customer.phone && tx.customer_phone && tx.customer_phone.includes(customer.phone.trim()))
    );
  }, [transactions, customer]);

  // Financial stats for this customer
  const stats = useMemo(() => {
    let totalVolume = 0;
    let totalPayout = 0;
    let totalCommission = 0;
    let completedCount = 0;

    customerTransactions.forEach((tx) => {
      if (tx.status !== 'cancelled') {
        totalVolume += Number(tx.amount_received || 0);
        totalPayout += Number(tx.payout_amount || 0);
        totalCommission += Number(tx.commission_amount || 0);
        if (tx.status === 'completed') completedCount += 1;
      }
    });

    return {
      totalTransactions: customerTransactions.length,
      completedCount,
      totalVolume,
      totalPayout,
      totalCommission,
    };
  }, [customerTransactions]);

  const cleanPhone = (customer.whatsapp || customer.phone || '').replace(/[^0-9]/g, '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '940px',
          width: '95%',
          background: 'linear-gradient(180deg, #0b1f36 0%, #06111f 100%)',
          border: '1px solid rgba(2, 132, 199, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(2, 132, 199, 0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18) 0%, rgba(249, 115, 22, 0.1) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0284c7 0%, #f97316 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                boxShadow: '0 4px 16px rgba(2, 132, 199, 0.4)',
              }}
            >
              {customer.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  {customer.full_name}
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(2, 132, 199, 0.2)',
                    color: '#38bdf8',
                    fontWeight: 700,
                  }}
                >
                  Client Dossier
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Member Since:{' '}
                {customer.created_at
                  ? new Date(customer.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })
                  : 'Active'}
                {customer.national_id && ` • ID/Passport: ${customer.national_id}`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => onNewTransactionForCustomer(customer)}
              className="btn btn-emerald"
              style={{ fontSize: '13px', padding: '9px 16px' }}
            >
              <PlusCircle size={16} />
              + New Transaction for Client
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '10px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Customer Contact & Notes Strip */}
        <div
          style={{
            padding: '16px 28px',
            background: 'rgba(6, 14, 24, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '13px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {customer.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <Phone size={15} color="#0284c7" />
                <span style={{ color: 'var(--text-dim)' }}>Phone:</span>
                <span style={{ fontWeight: 600 }}>{customer.phone}</span>
              </div>
            )}

            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#22c55e',
                  textDecoration: 'none',
                  fontWeight: 600,
                  background: 'rgba(34, 197, 94, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                }}
              >
                <MessageCircle size={15} />
                <span>Chat on WhatsApp</span>
                <ExternalLink size={12} />
              </a>
            )}

            {customer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                <Mail size={15} color="#f97316" />
                <span>{customer.email}</span>
              </div>
            )}
          </div>

          {customer.notes && (
            <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.04)', padding: '4px 10px', borderRadius: '6px' }}>
              📝 <strong>Notes:</strong> {customer.notes}
            </div>
          )}
        </div>

        {/* 4 Financial Highlight Stats for this Customer */}
        <div style={{ padding: '24px 28px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginBottom: '26px',
            }}
          >
            {/* Stat 1: Total Volume */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Total Client Volume
                </span>
                <DollarSign size={16} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px' }}>
                ${stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Total funds processed
              </div>
            </div>

            {/* Stat 2: Total Cashout Payout */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a78bfa' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Total Payout to Client
                </span>
                <Wallet size={16} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px', color: '#c4b5fd' }}>
                ${stats.totalPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                Settled in Cash or Wire
              </div>
            </div>

            {/* Stat 3: Office Profit from this Customer */}
            <div className="glass-panel glass-panel-glow" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#34d399' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>
                  Office Net Profit
                </span>
                <TrendingUp size={16} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, marginTop: '8px', color: '#34d399' }}>
                ${stats.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '2px' }}>
                ≈ {(stats.totalCommission * (settings.usd_to_afn || 64.86)).toLocaleString(undefined, { maximumFractionDigits: 0 })} AFN
              </div>
            </div>

            {/* Stat 4: Transaction Count */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f97316' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Transactions Count
                </span>
                <FileText size={16} />
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px', color: '#fb923c' }}>
                {stats.totalTransactions} Orders
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                {stats.completedCount} Completed
              </div>
            </div>
          </div>

          {/* Customer Transactions History Table */}
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#f8fafc' }}>
                Complete Transaction History for this Client ({customerTransactions.length})
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                All cash-outs, accounts created & corporate services
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '12px 14px' }}>Tracking</th>
                    <th style={{ padding: '12px 14px' }}>Date</th>
                    <th style={{ padding: '12px 14px' }}>Platform Service</th>
                    <th style={{ padding: '12px 14px' }}>Amount</th>
                    <th style={{ padding: '12px 14px' }}>Profit</th>
                    <th style={{ padding: '12px 14px' }}>Payout</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                        No transactions found for this client. Click &quot;+ New Transaction for Client&quot; above.
                      </td>
                    </tr>
                  ) : (
                    customerTransactions.map((tx) => {
                      const service = (BASE_SERVICES as any)[tx.service_type] || {
                        title: tx.service_type,
                        platform: tx.service_type,
                        color: '#94a3b8',
                        bgColor: 'rgba(255, 255, 255, 0.05)',
                      };

                      return (
                        <tr
                          key={tx.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                color: '#38bdf8',
                                background: 'rgba(2, 132, 199, 0.15)',
                                padding: '2px 7px',
                                borderRadius: '5px',
                                fontSize: '11.5px',
                              }}
                            >
                              {tx.tracking_code}
                            </span>
                          </td>

                          <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                            {tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-US', { dateStyle: 'short' }) : '-'}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <PlatformLogo platform={service.platform || service.title} size={24} />
                              <div>
                                <span
                                  style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#f8fafc',
                                  }}
                                >
                                  {service.title}
                                </span>
                                {tx.notes && (
                                  <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '2px' }}>
                                    {tx.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#f8fafc' }}>
                            ${Number(tx.amount_received).toFixed(2)}
                          </td>

                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#34d399' }}>
                            +${Number(tx.commission_amount).toFixed(2)}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            {(() => {
                              const split = tx.payout_split || tx.service_details?.payout_split;
                              if (split?.isSplit) {
                                return (
                                  <div>
                                    <div style={{ fontWeight: 800, color: '#34d399', fontSize: '11.5px' }}>
                                      💵 ${Number(split.usdAmount).toFixed(2)} + {Number(split.afnAmount).toLocaleString()} ؋
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#fb923c' }}>
                                      Split Payout
                                    </div>
                                  </div>
                                );
                              }
                              if (tx.payout_amount > 0) {
                                return (
                                  <span style={{ fontWeight: 800, color: '#c4b5fd' }}>
                                    ${Number(tx.payout_amount).toFixed(2)}
                                  </span>
                                );
                              }
                              return (
                                <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>Service Fee</span>
                              );
                            })()}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span
                              className={`badge ${
                                tx.status === 'completed'
                                  ? 'badge-completed'
                                  : tx.status === 'pending'
                                  ? 'badge-pending'
                                  : 'badge-cancelled'
                              }`}
                              style={{ fontSize: '11px' }}
                            >
                              {tx.status}
                            </span>
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => onPrintTransaction(tx)}
                                style={{
                                  background: 'rgba(2, 132, 199, 0.15)',
                                  border: '1px solid rgba(2, 132, 199, 0.35)',
                                  color: '#38bdf8',
                                  borderRadius: '6px',
                                  padding: '5px 8px',
                                  cursor: 'pointer',
                                }}
                                title="چاپ فاکتور رسمی (Print Invoice)"
                              >
                                <Printer size={14} />
                              </button>

                                {onViewTransaction && (
                                  <button
                                    onClick={() => onViewTransaction(tx)}
                                    style={{
                                      background: 'rgba(16, 185, 129, 0.1)',
                                      border: '1px solid rgba(16, 185, 129, 0.25)',
                                      color: '#34d399',
                                      borderRadius: '6px',
                                      padding: '5px 8px',
                                      cursor: 'pointer',
                                    }}
                                    title="مشاهده جزئیات سند مالی (قفل‌شده)"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
