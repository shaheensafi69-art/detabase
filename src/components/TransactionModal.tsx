'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  Wallet,
  Briefcase,
  CreditCard,
  Layers,
  ChevronDown,
  Lock,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import {
  Transaction,
  TransactionItem,
  ServiceCategory,
  CustomService,
  OfficeSettings,
  Customer,
} from '@/types';
import { BASE_SERVICES, PAYOUT_METHODS } from '@/lib/constants';
import { PlatformLogo } from '@/components/PlatformLogo';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Partial<Transaction>) => Promise<void>;
  settings: OfficeSettings;
  editingTransaction?: Transaction | null;
  customServices?: CustomService[];
  customers?: Customer[];
  initialCustomer?: Customer | null;
  initialServiceType?: string | null;
  onOpenServiceManager?: () => void;
  onPrintInvoice?: (tx: Transaction) => void;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  settings,
  editingTransaction,
  customServices = [],
  customers = [],
  initialCustomer = null,
  initialServiceType = null,
  onOpenServiceManager,
  onPrintInvoice,
}: TransactionModalProps) {
  // Category tab state
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('account');

  // Customer state
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Financials & Global Split State
  const [currency, setCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(settings.usd_to_afn || 68.5);
  const [payoutCurrency, setPayoutCurrency] = useState('USD');
  const [payoutMethod, setPayoutMethod] = useState('cash_usd');

  // Split Payout state (Pay portion in USD notes, remainder in AFN)
  const [isSplitPayout, setIsSplitPayout] = useState(false);
  const [splitUsdAmount, setSplitUsdAmount] = useState<number>(0);
  const [splitAfnAmount, setSplitAfnAmount] = useState<number>(0);

  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('completed');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Multi-service items array
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<string>('tiktok_shop_seller');

  // All merged services map
  const allServicesMap = {
    ...BASE_SERVICES,
    ...Object.fromEntries(customServices.map((s) => [s.id, s])),
  };

  // Helper to create a single TransactionItem from service definition
  const createItemFromService = (svcKey: string, customId?: string): TransactionItem => {
    const svc: any = (allServicesMap as any)[svcKey];
    const isCash = svc?.category === 'cashout';
    const defaultComm =
      svcKey === 'tiktok_cashout'
        ? settings.default_tiktok_commission || 8
        : svcKey === 'youtube_cashout'
        ? settings.default_youtube_commission || 7
        : svcKey === 'paypal_cashout'
        ? settings.default_paypal_commission || 6
        : svcKey === 'wise_cashout'
        ? settings.default_wise_commission || 5
        : svc?.defaultCommission || 6;

    const amt = isCash ? 1000 : (svc?.defaultPrice || 100);
    const commPct = isCash ? defaultComm : 0;
    const commAmt = isCash
      ? Number(((amt * commPct) / 100).toFixed(2))
      : Number((amt - (svc?.defaultCost || svc?.defaultOfficeCost || 0)).toFixed(2));
    const payAmt = isCash ? Number((amt - commAmt).toFixed(2)) : 0;

    return {
      id: customId || `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      service_type: svcKey,
      title: svc?.title || svcKey,
      englishTitle: svc?.englishTitle || svc?.title || svcKey,
      platform: svc?.platform || svc?.title || 'Platform',
      category: svc?.category || 'account',
      amount_received: amt,
      commission_percentage: commPct,
      commission_amount: commAmt,
      payout_amount: payAmt,
      notes: '',
    };
  };

  // Populate or Reset on Open
  useEffect(() => {
    setErrorMessage(null);
    const liveRate = settings.usd_to_afn || 68.5;

    if (editingTransaction) {
      setCustomerId(editingTransaction.customer_id || null);
      setCustomerName(editingTransaction.customer_name);
      setCustomerPhone(editingTransaction.customer_phone || '');
      setCurrency(editingTransaction.currency || 'USD');
      setExchangeRate(Number(editingTransaction.exchange_rate || liveRate));
      setPayoutCurrency(editingTransaction.payout_currency || 'USD');
      setPayoutMethod(editingTransaction.payout_method || 'cash_usd');
      setStatus(editingTransaction.status);
      setNotes(editingTransaction.notes || '');

      // Load Items
      const rawItems = editingTransaction.items || editingTransaction.service_details?.items;
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        setItems(rawItems);
        const firstCategory = (rawItems[0] as any)?.category;
        if (firstCategory && ['cashout', 'account', 'company_bank', 'card_other'].includes(firstCategory)) {
          setActiveCategory(firstCategory);
        }
      } else {
        // Fallback: 1 item from single transaction fields
        const svc = (allServicesMap as any)[editingTransaction.service_type];
        if (svc?.category) setActiveCategory(svc.category);

        const singleItem: TransactionItem = {
          id: `item-${Date.now()}`,
          service_type: editingTransaction.service_type,
          title: svc?.title || editingTransaction.service_type,
          englishTitle: svc?.englishTitle || svc?.title,
          platform: svc?.platform || svc?.title || 'Platform',
          category: svc?.category || 'other',
          amount_received: Number(editingTransaction.amount_received || 0),
          commission_percentage: Number(editingTransaction.commission_percentage || 0),
          commission_amount: Number(editingTransaction.commission_amount || 0),
          payout_amount: Number(editingTransaction.payout_amount || 0),
          notes: editingTransaction.notes || '',
        };
        setItems([singleItem]);
      }

      // Populate Split details if exists
      const split = editingTransaction.payout_split || editingTransaction.service_details?.payout_split;
      if (split && split.isSplit) {
        setIsSplitPayout(true);
        setSplitUsdAmount(Number(split.usdAmount || 0));
        setSplitAfnAmount(Number(split.afnAmount || 0));
      } else {
        setIsSplitPayout(false);
        setSplitUsdAmount(0);
        setSplitAfnAmount(0);
      }
    } else {
      // New Transaction
      setIsSplitPayout(false);
      setSplitUsdAmount(0);
      setSplitAfnAmount(0);

      if (initialCustomer) {
        setCustomerId(initialCustomer.id);
        setCustomerName(initialCustomer.full_name);
        setCustomerPhone(initialCustomer.phone || initialCustomer.whatsapp || '');
      } else {
        setCustomerId(null);
        setCustomerName('');
        setCustomerPhone('');
      }

      const targetSvc =
        initialServiceType && (allServicesMap as any)[initialServiceType]
          ? initialServiceType
          : 'tiktok_shop_seller';

      const initialItem = createItemFromService(targetSvc);
      setItems([initialItem]);
      const targetCategory = (allServicesMap as any)[targetSvc]?.category || 'account';
      setActiveCategory(targetCategory);
    }
  }, [editingTransaction, isOpen, initialCustomer, initialServiceType]);

  // Handle switching single service when only 1 item exists
  const handleSelectServiceForSingle = (svcKey: string) => {
    const newItem = createItemFromService(svcKey, items[0]?.id || `item-${Date.now()}`);
    setItems([newItem]);
    const cat = (allServicesMap as any)[svcKey]?.category;
    if (cat) setActiveCategory(cat);
  };

  // Add a new service item to the list
  const handleAddNewServiceItem = (svcKey: string) => {
    const newItem = createItemFromService(svcKey);
    setItems((prev) => [...prev, newItem]);
  };

  // Remove an item from the list
  const handleRemoveItem = (itemId: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  // Update specific item fields
  const handleUpdateItem = (itemId: string, patch: Partial<TransactionItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;

        const updated = { ...it, ...patch };

        // Auto-recalculate if service_type changed
        if (patch.service_type && patch.service_type !== it.service_type) {
          const fresh = createItemFromService(patch.service_type, it.id);
          return { ...fresh, notes: it.notes };
        }

        // Auto-recalculate cashout commission if price or pct changed
        const isCash = updated.category === 'cashout';
        if (isCash) {
          if ('amount_received' in patch || 'commission_percentage' in patch) {
            const amt = Number(updated.amount_received || 0);
            const pct = Number(updated.commission_percentage || 0);
            const comm = Number(((amt * pct) / 100).toFixed(2));
            const pay = Number((amt - comm).toFixed(2));
            updated.commission_amount = comm;
            updated.payout_amount = pay;
          }
        }

        return updated;
      })
    );
  };

  // Aggregate financial totals
  const totalAmountReceived = items.reduce((sum, it) => sum + (Number(it.amount_received) || 0), 0);
  const totalCommissionAmount = items.reduce((sum, it) => sum + (Number(it.commission_amount) || 0), 0);
  const totalPayoutAmount = items.reduce((sum, it) => sum + (Number(it.payout_amount) || 0), 0);
  const totalOfficeCost = Math.max(0, totalAmountReceived - totalCommissionAmount);

  const hasCashoutItem = items.some((it) => it.category === 'cashout' || (it.payout_amount || 0) > 0);

  const handleSelectExistingCustomer = (custName: string) => {
    const found = customers.find((c) => c.full_name === custName);
    if (found) {
      setCustomerId(found.id);
      setCustomerName(found.full_name);
      setCustomerPhone(found.phone || found.whatsapp || '');
    } else {
      setCustomerName(custName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (editingTransaction) {
      alert('خطای امنیتی: بر اساس سیستم حسابداری و دفتر کل S4 HEL، معاملات ثبت‌شده غیرقابل تغییر و ویرایش می‌باشند.');
      onClose();
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter the customer name');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Please add at least one service to the transaction');
      return;
    }

    try {
      setLoading(true);
      const tracking = `TX-${Math.floor(1000 + Math.random() * 9000)}`;

      const splitPayload = isSplitPayout
        ? {
            isSplit: true,
            usdAmount: Number(splitUsdAmount),
            afnAmount: Number(splitAfnAmount),
            exchangeRate: Number(exchangeRate),
            originalTotalUsd: Number(totalPayoutAmount),
          }
        : undefined;

      const primaryServiceType = items.length === 1 ? items[0].service_type : 'multi_service';

      await onSave({
        tracking_code: tracking,
        customer_id: customerId,
        customer_name: customerName,
        customer_phone: customerPhone,
        service_type: primaryServiceType,
        currency,
        amount_received: Number(totalAmountReceived),
        commission_percentage: items.length === 1 ? Number(items[0].commission_percentage || 0) : 0,
        commission_amount: Number(totalCommissionAmount),
        office_cost: Number(totalOfficeCost),
        payout_amount: Number(totalPayoutAmount),
        payout_currency: isSplitPayout ? 'USD & AFN' : payoutCurrency,
        payout_method: isSplitPayout ? 'Split (USD + AFN)' : payoutMethod,
        payout_split: splitPayload,
        exchange_rate: Number(exchangeRate),
        status,
        items: items,
        service_details: {
          items: items, // Guarantees JSON persistence in Supabase
          payout_split: splitPayload,
          is_multi_service: items.length > 1,
        },
        notes,
        created_by: 'Office Admin',
      });
      onClose();
    } catch (err: any) {
      setErrorMessage('Save Error: ' + (err.message || 'Database connection error'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter services by active tab for the top quick launcher
  const currentCategoryServices = Object.values(allServicesMap).filter(
    (svc: any) => svc.category === activeCategory
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '890px',
          width: '95%',
          background: 'linear-gradient(180deg, #0b1f36 0%, #06111f 100%)',
          border: '1px solid rgba(2, 132, 199, 0.4)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.2) 0%, rgba(249, 115, 22, 0.1) 100%)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              }}
            >
              <Calculator size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {editingTransaction ? (
                    <>
                      <Lock size={18} color="#10b981" />
                      <span>مشاهده سند معامله (سند قفل‌شده مالی)</span>
                    </>
                  ) : (
                    <span>ثبت معامله جدید (Record Client Transaction)</span>
                  )}
                </h2>
                {items.length > 1 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: '10px',
                    }}
                  >
                    Multi-Service ({items.length} Services)
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {editingTransaction
                  ? 'این معامله در دفتر کل مالی به ثبت قطعی رسیده و غیرقابل ویرایش یا حذف است.'
                  : 'Record single service or multiple bundled services (TikTok, Amazon, VPN, LLC) in one transaction'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onOpenServiceManager && (
              <button
                type="button"
                onClick={onOpenServiceManager}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                title="Add or manage custom services"
              >
                <Plus size={14} />
                + Add Custom Service
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '7px',
                borderRadius: '8px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
          {editingTransaction && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#34d399',
                fontSize: '12.5px',
                direction: 'rtl',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#10b981" />
                <span>
                  <strong>سند رسمی قفل‌شده:</strong> این تراکنش به ثبت نهایی رسیده است. بر اساس استندرد حسابداری دفتر S4 HEL، معاملات پس از ثبت غیرقابل ویرایش یا حذف می‌باشند.
                </span>
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.25)', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                کد رهگیری: {editingTransaction.tracking_code}
              </span>
            </div>
          )}
          {errorMessage && (
            <div
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#fb7185',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Customer Selection */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>
              Client Information:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => handleSelectExistingCustomer(e.target.value)}
                  placeholder="e.g. Ahmad Khan / John Doe"
                  className="form-input"
                  list="customers-datalist"
                />
                <datalist id="customers-datalist">
                  {customers.map((c) => (
                    <option key={c.id} value={c.full_name}>
                      {c.phone || c.whatsapp || ''}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+93 788 000 000"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* 2. SERVICES IN THIS TRANSACTION (Multi-Item Cart) */}
          <div
            style={{
              background: 'rgba(2, 132, 199, 0.05)',
              border: '1.5px solid rgba(2, 132, 199, 0.35)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={17} />
                  <span>Services & Platforms in this Transaction ({items.length}):</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  Add multiple client requests (e.g. TikTok Shop + Amazon Seller + VPN) into this single transaction
                </div>
              </div>

              {/* Quick Add Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={selectedServiceToAdd}
                  onChange={(e) => setSelectedServiceToAdd(e.target.value)}
                  className="form-select"
                  style={{ fontSize: '12px', padding: '6px 10px', height: '34px', minWidth: '180px' }}
                >
                  {Object.keys(allServicesMap).map((k) => (
                    <option key={k} value={k}>
                      {(allServicesMap as any)[k]?.title || k}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleAddNewServiceItem(selectedServiceToAdd)}
                  className="btn btn-primary"
                  style={{
                    fontSize: '12px',
                    padding: '6px 14px',
                    height: '34px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
                  }}
                >
                  <Plus size={14} />
                  + Add Service
                </button>
              </div>
            </div>

            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map((it, idx) => {
                const svc = (allServicesMap as any)[it.service_type] || {};
                const isCash = it.category === 'cashout';

                return (
                  <div
                    key={it.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(210px, 1.5fr) 1fr 1fr 1fr auto',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Platform & Service Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#38bdf8',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        #{idx + 1}
                      </div>
                      <PlatformLogo platform={it.platform || svc.platform || it.title} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <select
                          value={it.service_type}
                          onChange={(e) => handleUpdateItem(it.id, { service_type: e.target.value })}
                          className="form-select"
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 700,
                            padding: '4px 8px',
                            height: '32px',
                            width: '100%',
                          }}
                        >
                          {Object.keys(allServicesMap).map((k) => (
                            <option key={k} value={k}>
                              {(allServicesMap as any)[k]?.title || k}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price / Gross Received */}
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                        {isCash ? 'Gross Inflow ($)' : 'Service Price ($)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={it.amount_received}
                        onChange={(e) =>
                          handleUpdateItem(it.id, { amount_received: parseFloat(e.target.value) || 0 })
                        }
                        className="form-input"
                        style={{ fontSize: '13px', fontWeight: 700, height: '32px', color: '#38bdf8' }}
                      />
                    </div>

                    {/* Office Profit / Fee */}
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                        Office Profit ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={it.commission_amount}
                        onChange={(e) =>
                          handleUpdateItem(it.id, { commission_amount: parseFloat(e.target.value) || 0 })
                        }
                        className="form-input"
                        style={{ fontSize: '13px', fontWeight: 700, height: '32px', color: '#34d399' }}
                      />
                    </div>

                    {/* Details / Item Notes (e.g. handle or IP) */}
                    <div>
                      <label style={{ fontSize: '10px', color: '#94a3b8', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
                        Item Note / Detail
                      </label>
                      <input
                        type="text"
                        value={it.notes || ''}
                        onChange={(e) => handleUpdateItem(it.id, { notes: e.target.value })}
                        placeholder="e.g. @username / IP"
                        className="form-input"
                        style={{ fontSize: '11.5px', height: '32px' }}
                      />
                    </div>

                    {/* Delete Item Button */}
                    <div>
                      <button
                        type="button"
                        disabled={items.length <= 1}
                        onClick={() => handleRemoveItem(it.id)}
                        style={{
                          background: items.length <= 1 ? 'rgba(255, 255, 255, 0.04)' : 'rgba(244, 63, 94, 0.15)',
                          border: 'none',
                          color: items.length <= 1 ? '#64748b' : '#fb7185',
                          borderRadius: '8px',
                          padding: '7px',
                          cursor: items.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={items.length <= 1 ? 'At least one service is required' : 'Remove service'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick-Pick Platform Bar (Clicking appends service or updates if only 1 item) */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>
                  Quick Add Platform to this Order:
                </span>
                <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                  Clicking any button immediately adds it to the list above
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { id: 'tiktok_shop_seller', title: 'TikTok Shop', platform: 'TikTok Shop' },
                  { id: 'amazon_seller', title: 'Amazon Seller', platform: 'Amazon' },
                  { id: 'dedicated_vpn', title: 'Dedicated VPN', platform: 'NordVPN / Dedicated IP' },
                  { id: 'llc_formation', title: 'US LLC', platform: 'US LLC' },
                  { id: 'us_bank_account', title: 'Mercury Bank', platform: 'Mercury Bank' },
                  { id: 'tiktok_cashout', title: 'TikTok Cashout', platform: 'TikTok' },
                  { id: 'youtube_cashout', title: 'YouTube Cashout', platform: 'YouTube' },
                  { id: 'paypal_cashout', title: 'PayPal Cashout', platform: 'PayPal' },
                  { id: 'wise_cashout', title: 'Wise Cashout', platform: 'Wise' },
                  { id: 'online_card_payment', title: 'Card Payment', platform: 'Visa / MasterCard' },
                ].map((qp) => (
                  <button
                    key={qp.id}
                    type="button"
                    onClick={() => handleAddNewServiceItem(qp.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(2, 132, 199, 0.2)';
                      e.currentTarget.style.borderColor = '#0284c7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <PlatformLogo platform={qp.platform} size={16} />
                    <span>+ {qp.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. COMBINED FINANCIAL SETTLEMENT SUMMARY */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginBottom: '14px' }}>
              Combined Financial Settlement & Net Office Profit:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
              {/* Gross Inflow */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Total Amount ($ USD) *</label>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(2, 132, 199, 0.12)',
                    border: '1px solid rgba(2, 132, 199, 0.3)',
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#38bdf8',
                  }}
                >
                  ${totalAmountReceived.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  ≈ {(totalAmountReceived * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} AFN
                </div>
              </div>

              {/* Total Office Profit */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Office Net Profit ($ USD)</label>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontSize: '17px',
                    fontWeight: 900,
                    color: '#34d399',
                  }}
                >
                  +${totalCommissionAmount.toFixed(2)}
                </div>
                <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>
                  ≈ {(totalCommissionAmount * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} AFN
                </div>
              </div>

              {/* Client Payout if cashout */}
              {hasCashoutItem && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Net Client Payout ($ USD)</label>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: '17px',
                      fontWeight: 900,
                      color: '#f8fafc',
                    }}
                  >
                    ${totalPayoutAmount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    Cashout settlement
                  </div>
                </div>
              )}

              {/* Kabul Exchange Rate */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Exchange Rate (AFN per $)</label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  className="form-input"
                  style={{ fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Split Payout Option if Cashout exists */}
            {hasCashoutItem && totalPayoutAmount > 0 && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '14px 18px',
                  background: isSplitPayout ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSplitPayout ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: isSplitPayout ? '#34d399' : '#f8fafc' }}>
                      Split Payout (USD Notes + AFN Cash)
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Example: Pay $100 in physical USD bills and give the remaining in AFN cash
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isSplitPayout;
                      setIsSplitPayout(next);
                      if (next) {
                        const usdPart = Math.floor(totalPayoutAmount / 100) * 100 || Math.floor(totalPayoutAmount);
                        setSplitUsdAmount(usdPart);
                        const remUsd = Math.max(0, totalPayoutAmount - usdPart);
                        setSplitAfnAmount(Math.round(remUsd * exchangeRate));
                      }
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: isSplitPayout ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isSplitPayout ? '✓ Split Enabled' : '+ Enable Split'}
                  </button>
                </div>

                {isSplitPayout && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ color: '#38bdf8', fontWeight: 700 }}>
                          1. Paid in USD Cash ($)
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={splitUsdAmount}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setSplitUsdAmount(val);
                            const rem = Math.max(0, totalPayoutAmount - val);
                            setSplitAfnAmount(Math.round(rem * exchangeRate));
                          }}
                          className="form-input"
                          style={{ fontWeight: 800, color: '#38bdf8' }}
                        />
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                          Remaining USD: ${(totalPayoutAmount - splitUsdAmount).toFixed(2)}
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ color: '#34d399', fontWeight: 700 }}>
                          2. Paid in AFN Cash (؋)
                        </label>
                        <input
                          type="number"
                          step="10"
                          value={splitAfnAmount}
                          onChange={(e) => setSplitAfnAmount(parseFloat(e.target.value) || 0)}
                          className="form-input"
                          style={{ fontWeight: 800, color: '#34d399' }}
                        />
                        <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>
                          ≈ {Math.round(Math.max(0, totalPayoutAmount - splitUsdAmount) * exchangeRate).toLocaleString()} AFN @ {exchangeRate}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#f8fafc', background: 'rgba(0, 0, 0, 0.3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      Settlement: Client receives <strong style={{ color: '#38bdf8' }}>${splitUsdAmount.toFixed(2)} USD</strong> in cash + <strong style={{ color: '#34d399' }}>{splitAfnAmount.toLocaleString()} AFN</strong> in cash (Total Payout: <strong style={{ color: '#f8fafc' }}>${totalPayoutAmount.toFixed(2)} USD</strong>).
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Notes & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Order Notes / Terms</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes, delivery credentials, terms..."
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="form-select"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: editingTransaction ? 'space-between' : 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {editingTransaction ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10b981', fontWeight: 700 }}>
                  <Lock size={15} />
                  <span>تراکنش قفل‌شده در دفتر کل مالی (غیرقابل تغییر یا حذف)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {onPrintInvoice && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onPrintInvoice(editingTransaction);
                      }}
                      className="btn btn-primary"
                      style={{
                        background: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
                        padding: '9px 18px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 800,
                      }}
                    >
                      <Printer size={15} />
                      <span>چاپ فاکتور رسمی (A4)</span>
                    </button>
                  )}
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    بستن (Close)
                  </button>
                </div>
              </>
            ) : (
              <>
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-emerald"
                  style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 800 }}
                >
                  <CheckCircle2 size={16} />
                  {loading ? 'در حال ثبت...' : `ثبت نهایی معامله ($${totalAmountReceived.toFixed(2)})`}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
