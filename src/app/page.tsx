'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Transaction, DailyExpense, Customer, OfficeSettings, ServiceType, DatePeriod, CustomService } from '@/types';
import {
  EXPENSE_CATEGORIES,
  BASE_SERVICES,
  DEFAULT_OFFICE_NAME,
  CATEGORIES_CONFIG,
} from '@/lib/constants';

import Navbar from '@/components/Navbar';
import Sidebar, { NavTab } from '@/components/Sidebar';
import PlatformLogo from '@/components/PlatformLogo';
import TransactionModal from '@/components/TransactionModal';
import ExpenseModal from '@/components/ExpenseModal';
import CustomerModal from '@/components/CustomerModal';
import CustomerDetailModal from '@/components/CustomerDetailModal';
import ReceiptModal from '@/components/ReceiptModal';
import SettingsModal from '@/components/SettingsModal';
import TelegramSyncModal from '@/components/TelegramSyncModal';
import ServiceManagerModal from '@/components/ServiceManagerModal';
import LoginScreen from '@/components/LoginScreen';

import {
  Search,
  Plus,
  Printer,
  Trash2,
  Edit3,
  TrendingUp,
  DollarSign,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Users,
  RefreshCw,
  Calendar,
  Lock,
  Eye,
  ShieldCheck,
  Shield,
} from 'lucide-react';

export default function Home() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email?: string } | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('s4hel_current_user') : null;
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const user = {
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Staff User',
              role: session.user.user_metadata?.role || 'Head of Operations & Lead Accountant',
              email: session.user.email,
            };
            setCurrentUser(user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('s4hel_current_user', JSON.stringify(user));
            }
          }
        }
      } catch (e) {
        console.error('Auth init error', e);
      } finally {
        setAuthInitialized(true);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user = {
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Staff User',
          role: session.user.user_metadata?.role || 'Lead Accountant',
          email: session.user.email,
        };
        setCurrentUser(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('s4hel_current_user', JSON.stringify(user));
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (user: { name: string; role: string; email?: string }) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('s4hel_current_user', JSON.stringify(user));
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    if (typeof window !== 'undefined') {
      localStorage.removeItem('s4hel_current_user');
    }
    setCurrentUser(null);
  };

  // Navigation & Data States
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<DatePeriod>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customServices, setCustomServices] = useState<CustomService[]>([]);
  const [settings, setSettings] = useState<OfficeSettings>({
    id: 'office_config',
    office_name: DEFAULT_OFFICE_NAME,
    usd_to_afn: 68.5,
    default_tiktok_commission: 8.0,
    default_youtube_commission: 7.0,
    default_paypal_commission: 6.0,
    default_wise_commission: 5.0,
    logodev_public_key: 'pk_LMJ_gZeWQ2SH1bnRDMeIwg',
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [initialCustomerForTx, setInitialCustomerForTx] = useState<Customer | null>(null);
  const [initialServiceTypeForTx, setInitialServiceTypeForTx] = useState<string | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  const [isServiceManagerOpen, setIsServiceManagerOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramSyncData, setTelegramSyncData] = useState<{
    rate: number;
    city?: string;
    rawMessage?: string;
    channel?: string;
    timestamp?: string;
  } | null>(null);

  // All merged services map (Base + Custom)
  const allServicesMap = useMemo(() => {
    return {
      ...BASE_SERVICES,
      ...Object.fromEntries(customServices.map((s) => [s.id, s])),
    };
  }, [customServices]);

  // Load custom services from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('office_custom_services');
      if (stored) {
        setCustomServices(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading custom services:', e);
    }
  }, []);

  // Fetch all data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch Settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 'office_config')
        .single();
      if (settingsData) {
        setSettings(settingsData);
        if (settingsData.custom_services && Array.isArray(settingsData.custom_services)) {
          setCustomServices(settingsData.custom_services);
        }
      }

      // Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (txData) setTransactions(txData);

      // Fetch Expenses
      const { data: expData } = await supabase
        .from('daily_expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (expData) setExpenses(expData);

      // Fetch Customers
      const { data: custData } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      if (custData) setCustomers(custData);
    } catch (err) {
      console.error('Error fetching data from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'AFN'>('USD');

  // Load display currency preference and initial data from Supabase
  useEffect(() => {
    fetchData();
    try {
      const stored = localStorage.getItem('s4_display_currency') as 'USD' | 'AFN';
      if (stored === 'USD' || stored === 'AFN') {
        setDisplayCurrency(stored);
      }
    } catch (e) {}
  }, []);

  const handleToggleDisplayCurrency = (newCur: 'USD' | 'AFN') => {
    setDisplayCurrency(newCur);
    try {
      localStorage.setItem('s4_display_currency', newCur);
    } catch (e) {}
  };

  // Auto-poll live Kabul Telegram exchange rate silently every 60 seconds
  useEffect(() => {
    const fetchLiveTelegramRateSilently = async () => {
      try {
        const res = await fetch('/api/exchange-rate');
        const data = await res.json();
        if (data.success && data.rate) {
          const newRate = Number(data.rate);
          setSettings((prev) => {
            if (prev.usd_to_afn !== newRate) {
              return { ...prev, usd_to_afn: newRate };
            }
            return prev;
          });
          await supabase
            .from('settings')
            .update({ usd_to_afn: newRate, updated_at: new Date().toISOString() })
            .eq('id', 'office_config');
        }
      } catch (err) {
        // silent background sync
      }
    };

    fetchLiveTelegramRateSilently();
    const interval = setInterval(fetchLiveTelegramRateSilently, 60000);
    return () => clearInterval(interval);
  }, []);

  const activeRate = settings.usd_to_afn || 68.5;

  const formatPrimaryCurrency = (usdVal: number) => {
    if (displayCurrency === 'AFN') {
      const afn = usdVal * activeRate;
      return `${afn.toLocaleString(undefined, { maximumFractionDigits: 0 })} ؋`;
    }
    return `$${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatSecondaryCurrency = (usdVal: number) => {
    if (displayCurrency === 'AFN') {
      return `≈ $${usdVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
    }
    const afn = usdVal * activeRate;
    return `≈ ${afn.toLocaleString(undefined, { maximumFractionDigits: 0 })} AFN`;
  };

  // Helper: Period Check (Today, Week, Month, Year, All)
  const isWithinPeriod = (dateString?: string, period: DatePeriod = selectedPeriod): boolean => {
    if (period === 'all') return true;
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();

    if (period === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo && d <= now;
    }
    if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return d >= monthAgo && d <= now;
    }
    if (period === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Financial Calculations based on selectedPeriod
  const stats = useMemo(() => {
    let totalReceived = 0;
    let totalPayouts = 0;
    let totalProfit = 0;
    let cashoutProfit = 0;
    let accountsProfit = 0;
    let companyProfit = 0;
    let cardProfit = 0;
    let periodTxCount = 0;

    transactions.forEach((tx) => {
      if (tx.status !== 'cancelled' && isWithinPeriod(tx.created_at, selectedPeriod)) {
        periodTxCount++;
        const rec = Number(tx.amount_received || 0);
        const pay = Number(tx.payout_amount || 0);
        const comm = Number(tx.commission_amount || 0);

        totalReceived += rec;
        totalPayouts += pay;
        totalProfit += comm;

        const svc = (allServicesMap as any)[tx.service_type];
        const cat = svc?.category || 'other';
        if (cat === 'cashout') cashoutProfit += comm;
        else if (cat === 'account') accountsProfit += comm;
        else if (cat === 'company_bank') companyProfit += comm;
        else if (cat === 'card_other') cardProfit += comm;
      }
    });

    let totalExpensesUSD = 0;
    let totalExpensesAFN = 0;

    expenses.forEach((exp) => {
      if (isWithinPeriod(exp.expense_date, selectedPeriod)) {
        const amt = Number(exp.amount || 0);
        if (exp.currency === 'USD') {
          totalExpensesUSD += amt;
        } else {
          totalExpensesAFN += amt;
          totalExpensesUSD += amt / (settings.usd_to_afn || 68.5);
        }
      }
    });

    const netProfit = totalProfit - totalExpensesUSD;

    return {
      totalReceived,
      totalPayouts,
      totalProfit,
      totalExpenses: totalExpensesUSD,
      totalExpensesAFN,
      netProfit,
      cashoutProfit,
      accountsProfit,
      companyProfit,
      cardProfit,
      periodTxCount,
    };
  }, [transactions, expenses, settings, selectedPeriod, allServicesMap]);

  // Transaction CRUD (Immutable Financial Ledger)
  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    if (editingTransaction?.id) {
      alert('خطای امنیتی: بر اساس سیستم حسابداری و دفتر کل S4 HEL، معاملات پس از ثبت در دیتابیس قفل شده و غیرقابل تغییر یا ویرایش هستند.');
      setIsTransactionModalOpen(false);
      setEditingTransaction(null);
      return;
    }
    const { error } = await supabase.from('transactions').insert([data]);
    if (error) throw error;
    await fetchData();
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
    setInitialCustomerForTx(null);
    setInitialServiceTypeForTx(null);
  };

  const handleDeleteTransaction = async (_id: string) => {
    alert('عملیات غیرمجاز: طبق استندرد سیستم مالی دفتر کل S4 HEL، هیچ معامله‌ای پس از ثبت قابل حذف نمی‌باشد.');
  };

  // Expense CRUD
  const handleSaveExpense = async (data: Partial<DailyExpense>) => {
    const { error } = await supabase.from('daily_expenses').insert([data]);
    if (error) throw error;
    await fetchData();
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense entry?')) return;
    const { error } = await supabase.from('daily_expenses').delete().eq('id', id);
    if (error) alert('Error deleting expense: ' + error.message);
    else await fetchData();
  };

  // Customer CRUD
  const handleSaveCustomer = async (data: Partial<Customer>) => {
    const { error } = await supabase.from('customers').insert([data]);
    if (error) throw error;
    await fetchData();
  };

  // Custom Service Add & Delete
  const handleAddCustomService = async (newSvc: CustomService) => {
    const updated = [newSvc, ...customServices];
    setCustomServices(updated);
    try {
      localStorage.setItem('office_custom_services', JSON.stringify(updated));
      await supabase
        .from('settings')
        .update({ custom_services: updated, updated_at: new Date().toISOString() })
        .eq('id', 'office_config');
    } catch (e) {
      console.error('Error saving custom service:', e);
    }
  };

  const handleDeleteCustomService = async (id: string) => {
    const updated = customServices.filter((s) => s.id !== id);
    setCustomServices(updated);
    try {
      localStorage.setItem('office_custom_services', JSON.stringify(updated));
      await supabase
        .from('settings')
        .update({ custom_services: updated, updated_at: new Date().toISOString() })
        .eq('id', 'office_config');
    } catch (e) {
      console.error('Error deleting custom service:', e);
    }
  };

  // Settings Save
  const handleSaveSettings = async (newSettings: Partial<OfficeSettings>) => {
    const { error } = await supabase
      .from('settings')
      .upsert({ id: 'office_config', ...newSettings });
    if (error) throw error;
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const [isSyncingTelegram, setIsSyncingTelegram] = useState(false);

  // Sync Live Kabul Exchange Rate from Telegram (@kabul_dollar)
  const handleSyncTelegramRate = async () => {
    try {
      setIsSyncingTelegram(true);
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (data.success && data.rate) {
        const newRate = Number(data.rate);
        setSettings((prev) => ({ ...prev, usd_to_afn: newRate }));
        await supabase
          .from('settings')
          .update({ usd_to_afn: newRate, updated_at: new Date().toISOString() })
          .eq('id', 'office_config');

        setTelegramSyncData({
          rate: newRate,
          city: data.city || 'Kabul',
          rawMessage: data.rawMessage,
          channel: data.channel || '@kabul_dollar',
          timestamp: data.timestamp,
        });
        setIsTelegramModalOpen(true);
      } else {
        setTelegramSyncData({
          rate: 0,
          city: 'Kabul',
          rawMessage: data.error || 'Failed to fetch live rate from Telegram',
          channel: '@kabul_dollar',
          timestamp: new Date().toISOString(),
        });
        setIsTelegramModalOpen(true);
      }
    } catch (err: any) {
      setTelegramSyncData({
        rate: 0,
        city: 'Kabul',
        rawMessage: 'Network error connecting to exchange service: ' + err.message,
        channel: '@kabul_dollar',
        timestamp: new Date().toISOString(),
      });
      setIsTelegramModalOpen(true);
    } finally {
      setIsSyncingTelegram(false);
    }
  };

  // Filtered Transactions per Section & Period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Period filter
      if (!isWithinPeriod(tx.created_at, selectedPeriod)) {
        return false;
      }

      // Tab specific section filter - strictly separated
      const svc = (allServicesMap as any)[tx.service_type];
      const category = svc?.category || 'other';

      if (currentTab === 'cashout' && category !== 'cashout') {
        return false;
      }
      if (currentTab === 'accounts' && category !== 'account') {
        return false;
      }
      if (currentTab === 'company_bank' && category !== 'company_bank') {
        return false;
      }
      if (currentTab === 'payments' && category !== 'card_other') {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          tx.customer_name?.toLowerCase().includes(q) ||
          tx.tracking_code?.toLowerCase().includes(q) ||
          tx.customer_phone?.includes(q) ||
          tx.notes?.toLowerCase().includes(q) ||
          svc?.title?.toLowerCase().includes(q) ||
          svc?.platform?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Service Filter
      if (serviceFilter !== 'all' && tx.service_type !== serviceFilter) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'all' && tx.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, currentTab, searchQuery, serviceFilter, statusFilter, selectedPeriod, allServicesMap]);

  // Group standalone services by category for quick launcher display
  const platformLaunchers = useMemo(() => {
    const list = Object.values(allServicesMap) as any[];
    return {
      all: list,
      cashout: list.filter((s) => s.category === 'cashout'),
      account: list.filter((s) => s.category === 'account'),
      company_bank: list.filter((s) => s.category === 'company_bank'),
      card_other: list.filter((s) => s.category === 'card_other'),
    };
  }, [allServicesMap]);

  if (authInitialized && !currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Navbar */}
      <Navbar
        officeName={settings.office_name || DEFAULT_OFFICE_NAME}
        usdToAfn={activeRate}
        displayCurrency={displayCurrency}
        onToggleDisplayCurrency={handleToggleDisplayCurrency}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setInitialCustomerForTx(null);
          setInitialServiceTypeForTx(null);
          setIsTransactionModalOpen(true);
        }}
        onOpenNewExpense={() => setIsExpenseModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        currentUser={currentUser || { name: 'Safi Sahib', role: 'Lead Accountant' }}
        onLogout={handleLogout}
        onSyncTelegramRate={handleSyncTelegramRate}
        isSyncingTelegram={isSyncingTelegram}
      />

      <div style={{ display: 'flex', flex: 1, height: 'calc(100vh - 74px)', overflow: 'hidden' }}>
        {/* Sidebar (Fixed & Pinned LTR) */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'services') {
              setIsServiceManagerOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          stats={{
            totalProfit: stats.totalProfit,
            totalExpenses: stats.totalExpenses,
            netProfit: stats.netProfit,
          }}
          onOpenServiceManager={() => setIsServiceManagerOpen(true)}
          displayCurrency={displayCurrency}
          usdToAfn={activeRate}
        />

        {/* Main Workspace Area (Scrollable independently, Hidden on print) */}
        <main className="no-print" style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '24px 32px' }}>
          {/* Date Period Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              padding: '12px 18px',
              background: 'linear-gradient(90deg, rgba(8, 20, 36, 0.85) 0%, rgba(11, 28, 50, 0.85) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              borderRadius: '14px',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={17} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  Accounting Period:
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>
                  ({stats.periodTxCount} transactions recorded in this scope)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week (7 Days)' },
                  { id: 'month', label: 'This Month (30 Days)' },
                  { id: 'year', label: 'This Year' },
                ] as { id: DatePeriod; label: string }[]
              ).map((p) => {
                const isActive = selectedPeriod === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPeriod(p.id)}
                    className={`period-btn ${isActive ? 'active' : ''}`}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Top Key Statistics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Stat 1: Total Volume Received */}
            <div className="glass-panel" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Gross Inflow Volume
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDownLeft size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>
                {formatPrimaryCurrency(stats.totalReceived)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', marginTop: '4px' }}>
                {formatSecondaryCurrency(stats.totalReceived)}
              </div>
            </div>

            {/* Stat 2: Total Payouts to Clients */}
            <div className="glass-panel" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a78bfa' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Client Cash Settlements
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wallet size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#c4b5fd' }}>
                {formatPrimaryCurrency(stats.totalPayouts)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#a78bfa', marginTop: '4px' }}>
                {formatSecondaryCurrency(stats.totalPayouts)}
              </div>
            </div>

            {/* Stat 3: Total Office Commission */}
            <div className="glass-panel" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Gross Revenue (Fees)
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#fbbf24' }}>
                {formatPrimaryCurrency(stats.totalProfit)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', marginTop: '4px' }}>
                {formatSecondaryCurrency(stats.totalProfit)}
              </div>
            </div>

            {/* Stat 4: Total Daily Expenses */}
            <div className="glass-panel" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fb7185' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Office Daily Expenses
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={16} />
                </div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px', color: '#fda4af' }}>
                {formatPrimaryCurrency(stats.totalExpenses)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#fb7185', marginTop: '4px' }}>
                {formatSecondaryCurrency(stats.totalExpenses)}
              </div>
            </div>

            {/* Stat 5: Net Profit */}
            <div
              className="glass-panel glass-panel-glow"
              style={{
                padding: '18px 20px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(2, 132, 199, 0.15) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#10b981' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#34d399' }}>
                  Net Office Take-Home
                </span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={16} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, marginTop: '6px', color: '#34d399' }}>
                {formatPrimaryCurrency(stats.netProfit)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#a7f3d0', marginTop: '4px' }}>
                {formatSecondaryCurrency(stats.netProfit)}
              </div>
            </div>
          </div>

          {/* Department Revenue Breakdown Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '26px',
              padding: '10px 16px',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflowX: 'auto',
            }}
          >
            <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Department Revenues:
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11.5px', background: 'rgba(2, 132, 199, 0.12)', color: '#38bdf8', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(2, 132, 199, 0.25)', whiteSpace: 'nowrap' }}>
                💰 Cash-Out: {formatPrimaryCurrency(stats.cashoutProfit)}
              </span>
              <span style={{ fontSize: '11.5px', background: 'rgba(249, 115, 22, 0.12)', color: '#fb923c', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.25)', whiteSpace: 'nowrap' }}>
                🚀 Account Creation: {formatPrimaryCurrency(stats.accountsProfit)}
              </span>
              <span style={{ fontSize: '11.5px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.25)', whiteSpace: 'nowrap' }}>
                🏛️ Company & Banking: {formatPrimaryCurrency(stats.companyProfit)}
              </span>
              <span style={{ fontSize: '11.5px', background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.25)', whiteSpace: 'nowrap' }}>
                💳 Card & Payments: {formatPrimaryCurrency(stats.cardProfit)}
              </span>
            </div>
          </div>

          {/* Quick Platform Launchers (Displays on Dashboard or relevant tab) */}
          {(currentTab === 'dashboard' ||
            currentTab === 'cashout' ||
            currentTab === 'accounts' ||
            currentTab === 'company_bank' ||
            currentTab === 'payments') && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {currentTab === 'cashout' && 'Cash-Out Platforms (Click to Record Inflow):'}
                    {currentTab === 'accounts' && 'Account Platforms (Click to Issue New Account):'}
                    {currentTab === 'company_bank' && 'Company & Banking Services (Click to Launch):'}
                    {currentTab === 'payments' && 'Payment & Card Services (Click to Process):'}
                    {currentTab === 'dashboard' && 'Supported Platforms & Services (Instant 1-Click Launch):'}
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    Authentic official brand icons & standalone setup for each individual platform
                  </div>
                </div>

                <button
                  onClick={() => setIsServiceManagerOpen(true)}
                  style={{
                    fontSize: '11.5px',
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Manage Services
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '12px',
                }}
              >
                {(
                  currentTab === 'cashout'
                    ? platformLaunchers.cashout
                    : currentTab === 'accounts'
                    ? platformLaunchers.account
                    : currentTab === 'company_bank'
                    ? platformLaunchers.company_bank
                    : currentTab === 'payments'
                    ? platformLaunchers.card_other
                    : platformLaunchers.all.slice(0, 10)
                ).map((conf) => {
                  if (!conf) return null;
                  return (
                    <button
                      key={conf.id}
                      onClick={() => {
                        setEditingTransaction(null);
                        setInitialCustomerForTx(null);
                        setInitialServiceTypeForTx(conf.id);
                        setIsTransactionModalOpen(true);
                      }}
                      className="glass-panel"
                      style={{
                        padding: '14px 16px',
                        textAlign: 'left',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: 'rgba(15, 23, 42, 0.65)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: '100px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = conf.color || '#38bdf8';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <PlatformLogo platform={conf.platform || conf.title} size={28} />
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: conf.color || '#38bdf8',
                            background: conf.bgColor || 'rgba(255, 255, 255, 0.05)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Plus size={12} />
                          New
                        </span>
                      </div>

                      <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                          {conf.title}
                        </div>
                        <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conf.isPercentage ? `${conf.defaultCommission || 5}% Fee` : conf.defaultPrice ? `$${conf.defaultPrice} Fixed` : 'Custom Fee'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Expenses View */}
          {currentTab === 'expenses' ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                    Daily Office Expenses Ledger
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Track office rent, generator fuel, electricity, internet, staff lunch, tea, and salaries
                  </div>
                </div>

                <button onClick={() => setIsExpenseModalOpen(true)} className="btn btn-primary" style={{ background: '#f43f5e' }}>
                  <Plus size={16} />
                  Add New Expense
                </button>
              </div>

              {/* Expenses Table */}
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                      <th style={{ padding: '14px 18px' }}>Date</th>
                      <th style={{ padding: '14px 18px' }}>Category</th>
                      <th style={{ padding: '14px 18px' }}>Description & Purpose</th>
                      <th style={{ padding: '14px 18px' }}>Paid By</th>
                      <th style={{ padding: '14px 18px' }}>Amount</th>
                      <th style={{ padding: '14px 18px', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-dim)' }}>
                          No office expenses recorded in this period yet.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp) => {
                        const cat = EXPENSE_CATEGORIES[exp.category] || { title: exp.category, color: '#94a3b8' };
                        return (
                          <tr
                            key={exp.id}
                            style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                              {exp.expense_date}
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  color: cat.color,
                                  fontSize: '12px',
                                  fontWeight: 600,
                                }}
                              >
                                {cat.title}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                              {exp.title}
                              {exp.notes && (
                                <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                                  ({exp.notes})
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                              {exp.paid_by || '-'}
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ fontWeight: 800, color: '#fb7185' }}>
                                {Number(exp.amount).toLocaleString()} {exp.currency}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                {exp.currency === 'AFN'
                                  ? `≈ $${(Number(exp.amount) / activeRate).toFixed(2)} USD`
                                  : `≈ ${(Number(exp.amount) * activeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })} AFN`}
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#fb7185',
                                  cursor: 'pointer',
                                  padding: '4px',
                                }}
                                title="Delete expense"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : currentTab === 'customers' ? (
            /* Section: Customers CRM View */
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>
                    Client Relationship Management (CRM)
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Client profiles, contact details, transaction histories & dedicated records
                  </div>
                </div>

                <button onClick={() => setIsCustomerModalOpen(true)} className="btn btn-emerald">
                  <Plus size={16} />
                  New Client Profile
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                  gap: '16px',
                }}
              >
                {customers.map((cust) => {
                  const customerTxs = transactions.filter(
                    (t) =>
                      t.customer_id === cust.id ||
                      t.customer_name?.trim().toLowerCase() === cust.full_name?.trim().toLowerCase()
                  );
                  const totalVol = customerTxs.reduce((sum, t) => sum + (Number(t.amount_received) || 0), 0);
                  const accountsCount = customerTxs.filter((t) => {
                    const cat = (allServicesMap as any)[t.service_type]?.category;
                    return cat === 'account';
                  }).length;
                  const cashoutCount = customerTxs.filter((t) => {
                    const cat = (allServicesMap as any)[t.service_type]?.category;
                    return cat === 'cashout';
                  }).length;

                  return (
                    <div
                      key={cust.id}
                      className="glass-panel"
                      style={{
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        setSelectedCustomerForDetail(cust);
                        setIsCustomerDetailOpen(true);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0, 0, 0, 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>
                            {cust.full_name}
                          </div>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              background: 'rgba(56, 189, 248, 0.12)',
                              color: '#38bdf8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Users size={16} />
                          </div>
                        </div>

                        {/* Summary Badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: 'rgba(99, 102, 241, 0.15)',
                              color: '#818cf8',
                              fontWeight: 600,
                            }}
                          >
                            {customerTxs.length} Transactions
                          </span>
                          {accountsCount > 0 && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                color: '#c084fc',
                                fontWeight: 600,
                              }}
                            >
                              {accountsCount} Accounts
                            </span>
                          )}
                          {cashoutCount > 0 && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34d399',
                                fontWeight: 600,
                              }}
                            >
                              {cashoutCount} Cash-Outs
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {cust.phone && (
                            <div>
                              Phone: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cust.phone}</span>
                            </div>
                          )}
                          {cust.whatsapp && (
                            <div>
                              WhatsApp: <span>{cust.whatsapp}</span>
                            </div>
                          )}
                          {cust.notes && (
                            <div style={{ color: 'var(--text-dim)', marginTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px', fontSize: '11px' }}>
                              {cust.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div
                        style={{
                          marginTop: '16px',
                          paddingTop: '12px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          Total Volume:{' '}
                          <span style={{ fontWeight: 800, color: '#38bdf8' }}>
                            ${totalVol.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#38bdf8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          View Dossier
                          <ArrowUpRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Transactions Workspace (Dashboard, Cashout, Accounts, Company Bank, Payments) */
            <div>
              {/* Filter & Search Bar */}
              <div
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Search input */}
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by client name, tracking ID (e.g. TX-1001), phone, or notes..."
                    className="form-input"
                    style={{ paddingLeft: '38px', height: '40px' }}
                  />
                  <Search
                    size={18}
                    color="#64748b"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <select
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                    className="form-select"
                    style={{ height: '40px', minWidth: '180px', padding: '0 12px' }}
                  >
                    <option value="all">All Services / Platforms</option>
                    {Object.keys(allServicesMap).map((key) => (
                      <option key={key} value={key}>
                        {(allServicesMap as any)[key]?.title || key}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select"
                    style={{ height: '40px', minWidth: '140px', padding: '0 12px' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={fetchData}
                    className="btn btn-secondary"
                    style={{ height: '40px', padding: '0 12px' }}
                    title="Reload from Database"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {currentTab === 'cashout' && (
                        <span style={{ color: '#0284c7' }}>💵 Cash-Out Earnings & Withdrawals</span>
                      )}
                      {currentTab === 'accounts' && (
                        <span style={{ color: '#f97316' }}>🌐 Account Creation & Monetization Services</span>
                      )}
                      {currentTab === 'company_bank' && (
                        <span style={{ color: '#3b82f6' }}>🏛️ Business Registration & International Banking</span>
                      )}
                      {currentTab === 'payments' && (
                        <span style={{ color: '#10b981' }}>💳 Card Processing & International Payments</span>
                      )}
                      {currentTab === 'dashboard' && (
                        <span>Recent Transactions & Activity Log</span>
                      )}
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.08)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          color: 'var(--text-dim)',
                        }}
                      >
                        {filteredTransactions.length} records
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {currentTab === 'cashout'
                        ? 'Strictly displaying creator withdrawals & cash-out settlements'
                        : currentTab === 'accounts'
                        ? 'Strictly displaying approved creator and seller accounts'
                        : 'Click client name to inspect dossier | Click printer icon for formal client voucher'}
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                    Active Kabul Dollar Rate: <strong style={{ color: '#38bdf8' }}>{settings.usd_to_afn || 68.5} AFN</strong>
                  </div>
                </div>

                {/* Immutable Financial Ledger Status Notice */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 18px',
                    background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1) 0%, rgba(2, 132, 199, 0.08) 100%)',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '12px',
                    color: '#a7f3d0',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={16} color="#10b981" />
                    <span>
                      <strong>سیستم دفتر کل مالی ضد جعل (Immutable Audit-Proof Ledger):</strong> تمامی معاملات پس از ثبت نهایی قفل شده و طبق استندرد حسابداری دفتر S4 HEL هرگز حذف یا ویرایش نمی‌شوند.
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Lock size={12} />
                    حسابرسی امن فعال
                  </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '14px 16px' }}>Tracking ID</th>
                        <th style={{ padding: '14px 16px' }}>Client</th>
                        <th style={{ padding: '14px 16px' }}>Platform & Service</th>
                        <th style={{ padding: '14px 16px' }}>Gross Received</th>
                        <th style={{ padding: '14px 16px' }}>Office Fee / Profit</th>
                        <th style={{ padding: '14px 16px' }}>Client Payout</th>
                        <th style={{ padding: '14px 16px' }}>Status</th>
                        <th style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Lock size={12} color="#10b981" />
                            <span>سند و فاکتور رسمی</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)' }}>
                            No transactions found for this section or period.
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => {
                          const service = (allServicesMap as any)[tx.service_type] || {
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
                              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              {/* Tracking Code */}
                              <td style={{ padding: '14px 16px' }}>
                                <span
                                  style={{
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    color: '#818cf8',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {tx.tracking_code}
                                </span>
                              </td>

                              {/* Customer Name & Phone */}
                              <td style={{ padding: '14px 16px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const found = customers.find(
                                      (c) =>
                                        c.id === tx.customer_id ||
                                        c.full_name?.trim().toLowerCase() === tx.customer_name?.trim().toLowerCase()
                                    );
                                    setSelectedCustomerForDetail(
                                      found || {
                                        id: tx.customer_id || tx.id,
                                        full_name: tx.customer_name,
                                        phone: tx.customer_phone || '',
                                        created_at: tx.created_at,
                                      }
                                    );
                                    setIsCustomerDetailOpen(true);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    display: 'block',
                                  }}
                                  title="View full client history and dossier"
                                >
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      color: '#38bdf8',
                                      textDecoration: 'underline',
                                      textDecorationColor: 'rgba(56, 189, 248, 0.35)',
                                      textUnderlineOffset: '3px',
                                      transition: 'color 0.15s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = '#7dd3fc')}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = '#38bdf8')}
                                  >
                                    {tx.customer_name}
                                  </div>
                                </button>
                                {tx.customer_phone && (
                                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                    {tx.customer_phone}
                                  </div>
                                )}
                              </td>

                              {/* Service Badge with Authentic Brand Logo(s) */}
                              <td style={{ padding: '14px 16px' }}>
                                {(() => {
                                  const txItems = tx.items || tx.service_details?.items;
                                  const isMulti = Array.isArray(txItems) && txItems.length > 1;

                                  if (isMulti) {
                                    return (
                                      <div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center' }}>
                                            {txItems.slice(0, 3).map((it: any, i: number) => (
                                              <div
                                                key={i}
                                                style={{
                                                  marginLeft: i > 0 ? '-6px' : 0,
                                                  borderRadius: '6px',
                                                  boxShadow: '0 0 0 1.5px #0b1f36',
                                                  zIndex: 3 - i,
                                                }}
                                              >
                                                <PlatformLogo platform={it.platform || it.title} size={20} />
                                              </div>
                                            ))}
                                          </div>
                                          <span
                                            style={{
                                              fontSize: '11px',
                                              fontWeight: 800,
                                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
                                              color: '#c4b5fd',
                                              border: '1px solid rgba(139, 92, 246, 0.4)',
                                              padding: '2px 8px',
                                              borderRadius: '6px',
                                              whiteSpace: 'nowrap',
                                            }}
                                          >
                                            {txItems.length} Services Bundle
                                          </span>
                                        </div>
                                        <div
                                          style={{
                                            fontSize: '11px',
                                            color: '#94a3b8',
                                            marginTop: '3px',
                                            maxWidth: '240px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                          }}
                                          title={txItems.map((it: any) => it.title || it.service_type).join(' + ')}
                                        >
                                          {txItems.map((it: any) => it.title || it.service_type).join(' • ')}
                                        </div>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                      <PlatformLogo platform={service.platform || service.title} size={22} />
                                      <span
                                        style={{
                                          fontSize: '12.5px',
                                          fontWeight: 600,
                                          color: '#f8fafc',
                                        }}
                                      >
                                        {service.title}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* Amount Received */}
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 800, color: '#38bdf8' }}>
                                  {formatPrimaryCurrency(Number(tx.amount_received))}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                  {formatSecondaryCurrency(Number(tx.amount_received))}
                                </div>
                              </td>

                              {/* Commission / Profit */}
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 800, color: '#34d399' }}>
                                  +{formatPrimaryCurrency(Number(tx.commission_amount))}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                  {tx.commission_percentage > 0 ? `${tx.commission_percentage}% • ` : ''}
                                  {formatSecondaryCurrency(Number(tx.commission_amount))}
                                </div>
                              </td>

                              {/* Payout to Client */}
                              <td style={{ padding: '14px 16px' }}>
                                {(() => {
                                  const split = tx.payout_split || tx.service_details?.payout_split;
                                  if (split?.isSplit) {
                                    return (
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: '#34d399', fontSize: '12.5px' }}>
                                          <span>💵 ${Number(split.usdAmount).toFixed(2)}</span>
                                          <span style={{ color: '#94a3b8' }}>+</span>
                                          <span style={{ color: '#38bdf8' }}>{Number(split.afnAmount).toLocaleString()} ؋</span>
                                        </div>
                                        <div style={{ fontSize: '10.5px', color: '#fb923c', fontWeight: 700, marginTop: '2px' }}>
                                          Split (USD + AFN Cash)
                                        </div>
                                      </div>
                                    );
                                  }
                                  if (tx.payout_amount > 0) {
                                    return (
                                      <div>
                                        <span style={{ fontWeight: 800, color: '#f8fafc' }}>
                                          {formatPrimaryCurrency(Number(tx.payout_amount))}
                                        </span>
                                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                                          {tx.payout_method || 'Cash'} • {formatSecondaryCurrency(Number(tx.payout_amount))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Non-cash service</span>
                                  );
                                })()}
                              </td>

                              {/* Status Badge */}
                              <td style={{ padding: '14px 16px' }}>
                                <span
                                  className={`badge ${
                                    tx.status === 'completed'
                                      ? 'badge-completed'
                                      : tx.status === 'pending'
                                      ? 'badge-pending'
                                      : 'badge-cancelled'
                                  }`}
                                >
                                  {tx.status === 'completed'
                                    ? 'Completed'
                                    : tx.status === 'pending'
                                    ? 'Pending'
                                    : 'Cancelled'}
                                </span>
                              </td>

                              {/* Actions (Immutable: Print & View Only) */}
                              <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  {/* Print Official Voucher */}
                                  <button
                                    onClick={() => {
                                      setActiveReceiptTransaction(tx);
                                      setIsReceiptModalOpen(true);
                                    }}
                                    style={{
                                      background: 'rgba(2, 132, 199, 0.15)',
                                      border: '1px solid rgba(2, 132, 199, 0.35)',
                                      color: '#38bdf8',
                                      borderRadius: '6px',
                                      padding: '5px 8px',
                                      cursor: 'pointer',
                                    }}
                                    title="چاپ فاکتور رسمی A4 (Print Official A4 Invoice)"
                                  >
                                    <Printer size={15} />
                                  </button>

                                  {/* View Audit Details (Read Only) */}
                                  <button
                                    onClick={() => {
                                      setEditingTransaction(tx);
                                      setIsTransactionModalOpen(true);
                                    }}
                                    style={{
                                      background: 'rgba(16, 185, 129, 0.12)',
                                      border: '1px solid rgba(16, 185, 129, 0.3)',
                                      color: '#34d399',
                                      borderRadius: '6px',
                                      padding: '5px 8px',
                                      cursor: 'pointer',
                                    }}
                                    title="مشاهده جزئیات سند مالی (قفل‌شده در دفتر کل)"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  {/* Immutable Lock Indicator */}
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      background: 'rgba(255, 255, 255, 0.04)',
                                      border: '1px solid rgba(255, 255, 255, 0.08)',
                                      borderRadius: '6px',
                                      padding: '5px 7px',
                                      color: '#94a3b8',
                                    }}
                                    title="معامله نهایی در دفتر کل مالی • غیرقابل ویرایش یا حذف"
                                  >
                                    <Lock size={13} color="#10b981" />
                                  </div>
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
          )}
        </main>
      </div>

      {/* Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
          setInitialCustomerForTx(null);
          setInitialServiceTypeForTx(null);
        }}
        onSave={handleSaveTransaction}
        settings={settings}
        editingTransaction={editingTransaction}
        customServices={customServices}
        customers={customers}
        initialCustomer={initialCustomerForTx}
        initialServiceType={initialServiceTypeForTx}
        onOpenServiceManager={() => setIsServiceManagerOpen(true)}
        onPrintInvoice={(tx) => {
          setActiveReceiptTransaction(tx);
          setIsReceiptModalOpen(true);
        }}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <CustomerDetailModal
        isOpen={isCustomerDetailOpen}
        onClose={() => {
          setIsCustomerDetailOpen(false);
          setSelectedCustomerForDetail(null);
        }}
        customer={selectedCustomerForDetail}
        transactions={transactions}
        settings={settings}
        onNewTransactionForCustomer={(cust) => {
          setIsCustomerDetailOpen(false);
          setInitialCustomerForTx(cust);
          setEditingTransaction(null);
          setIsTransactionModalOpen(true);
        }}
        onPrintTransaction={(tx) => {
          setActiveReceiptTransaction(tx);
          setIsReceiptModalOpen(true);
        }}
        onViewTransaction={(tx) => {
          setIsCustomerDetailOpen(false);
          setEditingTransaction(tx);
          setIsTransactionModalOpen(true);
        }}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setActiveReceiptTransaction(null);
        }}
        transaction={activeReceiptTransaction}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <TelegramSyncModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        data={telegramSyncData}
        onApplyRate={(newRate) => {
          setSettings((prev) => ({ ...prev, usd_to_afn: newRate }));
          supabase
            .from('settings')
            .update({ usd_to_afn: newRate, updated_at: new Date().toISOString() })
            .eq('id', 'office_config');
        }}
      />

      <ServiceManagerModal
        isOpen={isServiceManagerOpen}
        onClose={() => setIsServiceManagerOpen(false)}
        customServices={customServices}
        onAddService={handleAddCustomService}
        onDeleteService={handleDeleteCustomService}
      />
    </div>
  );
}
