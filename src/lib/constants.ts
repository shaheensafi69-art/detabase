import { ServiceCategory, ExpenseCategory } from '@/types';

export const DEFAULT_OFFICE_NAME = 'E-Commerce With S4 HEL';
export const DEFAULT_OFFICE_PHONE = '+93 70 058 2033 / +44 7740 589731';
export const DEFAULT_OFFICE_ADDRESS = 'Kabul, Kote Sangi, End of Flyover, Yasini Center, 4th Floor, Office #5';

export interface ServiceDefinition {
  id: string;
  category: ServiceCategory;
  platform: string;
  title: string;
  englishTitle: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
  defaultPrice?: number;
  defaultCommission?: number;
  defaultCost?: number;
  isPercentage?: boolean;
}

export const CATEGORIES_CONFIG: Record<
  ServiceCategory,
  {
    title: string;
    englishTitle: string;
    color: string;
    bgColor: string;
    icon: string;
    description: string;
  }
> = {
  cashout: {
    title: 'Cash-Out Services',
    englishTitle: 'Cash-Out Services',
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.12)',
    icon: 'Wallet',
    description: 'Instant payouts for TikTok, YouTube, PayPal, Wise & wire earnings',
  },
  account: {
    title: 'Account Creation',
    englishTitle: 'Account Creation',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    icon: 'Sparkles',
    description: 'Monetized creator & seller accounts across global platforms',
  },
  company_bank: {
    title: 'Company & Banking',
    englishTitle: 'Company & Banking',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    icon: 'Briefcase',
    description: 'US LLC, UK LTD registration and international business bank accounts',
  },
  card_other: {
    title: 'Card & Payments',
    englishTitle: 'Card & Payments',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    icon: 'CreditCard',
    description: 'International card payments, visa fees & custom client services',
  },
};

export const BASE_SERVICES: Record<string, ServiceDefinition> = {
  // --- 1. CASHOUT SERVICES (Individual Platforms Only) ---
  tiktok_cashout: {
    id: 'tiktok_cashout',
    category: 'cashout',
    platform: 'TikTok',
    title: 'TikTok Cash-Out',
    englishTitle: 'TikTok Creator Rewards & Live Cash-Out',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    icon: 'Music2',
    description: 'Withdraw and cash out TikTok Creator Rewards & Live Diamonds',
    defaultCommission: 8.0,
    isPercentage: true,
  },
  youtube_cashout: {
    id: 'youtube_cashout',
    category: 'cashout',
    platform: 'YouTube',
    title: 'YouTube Cash-Out',
    englishTitle: 'YouTube AdSense Monetization Cash-Out',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    icon: 'Video',
    description: 'Receive Google AdSense & YouTube channel earnings in USD or AFN',
    defaultCommission: 7.0,
    isPercentage: true,
  },
  paypal_cashout: {
    id: 'paypal_cashout',
    category: 'cashout',
    platform: 'PayPal',
    title: 'PayPal Cash-Out',
    englishTitle: 'PayPal Balance Cash-Out',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    icon: 'DollarSign',
    description: 'Fast payout for personal and business PayPal transfers',
    defaultCommission: 6.0,
    isPercentage: true,
  },
  wise_cashout: {
    id: 'wise_cashout',
    category: 'cashout',
    platform: 'Wise',
    title: 'Wise Cash-Out',
    englishTitle: 'Wise Bank Transfer Cash-Out',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    icon: 'ArrowDownLeft',
    description: 'Receive international payments from European & US Wise accounts',
    defaultCommission: 5.0,
    isPercentage: true,
  },
  payoneer_cashout: {
    id: 'payoneer_cashout',
    category: 'cashout',
    platform: 'Payoneer',
    title: 'Payoneer Cash-Out',
    englishTitle: 'Payoneer Balance Cash-Out',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    icon: 'Wallet',
    description: 'Cash out freelance earnings and merchant funds from Payoneer',
    defaultCommission: 6.0,
    isPercentage: true,
  },
  bank_cashout: {
    id: 'bank_cashout',
    category: 'cashout',
    platform: 'Bank Wire / Zelle',
    title: 'Bank Wire Cash-Out',
    englishTitle: 'International SWIFT & Zelle Cash-Out',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
    icon: 'Building2',
    description: 'Receive US Zelle, Cash App and international SWIFT wire transfers',
    defaultCommission: 6.0,
    isPercentage: true,
  },
  crypto_cashout: {
    id: 'crypto_cashout',
    category: 'cashout',
    platform: 'USDT Crypto',
    title: 'USDT Crypto Cash-Out',
    englishTitle: 'USDT Tether Crypto Cash-Out',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.12)',
    icon: 'Coins',
    description: 'Exchange Tether (USDT) to cash USD or AFN with live market rates',
    defaultCommission: 3.0,
    isPercentage: true,
  },

  // --- 2. ACCOUNT CREATION (Individual Platforms Only) ---
  tiktok_usa_pro: {
    id: 'tiktok_usa_pro',
    category: 'account',
    platform: 'TikTok USA',
    title: 'TikTok USA Creator Account',
    englishTitle: 'TikTok USA Creator Rewards Account',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    icon: 'Music2',
    description: 'Verified USA region account with instant Creator Rewards Program access',
    defaultPrice: 65,
    defaultCost: 15,
  },
  tiktok_uk_eu: {
    id: 'tiktok_uk_eu',
    category: 'account',
    platform: 'TikTok UK',
    title: 'TikTok UK Creator Account',
    englishTitle: 'TikTok United Kingdom Creator Account',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    icon: 'Globe',
    description: 'United Kingdom monetization-ready account with Creator Rewards',
    defaultPrice: 60,
    defaultCost: 15,
  },
  tiktok_france: {
    id: 'tiktok_france',
    category: 'account',
    platform: 'TikTok France',
    title: 'TikTok France Creator Account',
    englishTitle: 'TikTok France Creator Account',
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.12)',
    icon: 'Globe',
    description: 'France / EU region account with active beta creator rewards',
    defaultPrice: 60,
    defaultCost: 15,
  },
  instagram_pro: {
    id: 'instagram_pro',
    category: 'account',
    platform: 'Instagram',
    title: 'Instagram Creator Account',
    englishTitle: 'Instagram Professional Creator Account',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    icon: 'Instagram',
    description: 'Verified international Instagram account ready for creator monetization',
    defaultPrice: 50,
    defaultCost: 12,
  },
  youtube_monetized: {
    id: 'youtube_monetized',
    category: 'account',
    platform: 'YouTube',
    title: 'Monetized YouTube Channel',
    englishTitle: 'Monetized YouTube Channel (1K/4K Hours)',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    icon: 'Video',
    description: 'Fully approved YouTube channel with 1K subscribers & 4K watch hours',
    defaultPrice: 190,
    defaultCost: 50,
  },
  amazon_seller: {
    id: 'amazon_seller',
    category: 'account',
    platform: 'Amazon',
    title: 'Amazon Seller Central',
    englishTitle: 'Amazon Professional Seller Central',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    icon: 'ShoppingBag',
    description: 'Verified Amazon Professional Seller account setup with full documentation',
    defaultPrice: 220,
    defaultCost: 50,
  },
  tiktok_shop_seller: {
    id: 'tiktok_shop_seller',
    category: 'account',
    platform: 'TikTok Shop',
    title: 'TikTok Shop Seller',
    englishTitle: 'TikTok Shop USA Seller Account',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    icon: 'ShoppingBag',
    description: 'Verified TikTok Shop seller account for e-commerce and dropshipping',
    defaultPrice: 180,
    defaultCost: 40,
  },
  shopify_store: {
    id: 'shopify_store',
    category: 'account',
    platform: 'Shopify',
    title: 'Shopify Store Account',
    englishTitle: 'Shopify E-Commerce Store Setup',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    icon: 'Store',
    description: 'Complete Shopify store setup integrated with international payments',
    defaultPrice: 120,
    defaultCost: 25,
  },

  // Legacy aliases for backward compatibility with database records
  pro_account_creation: {
    id: 'pro_account_creation',
    category: 'account',
    platform: 'TikTok USA',
    title: 'TikTok USA Creator Account',
    englishTitle: 'TikTok USA Creator Account',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    icon: 'Music2',
    description: 'Verified USA creator account',
    defaultPrice: 65,
    defaultCost: 15,
  },
  seller_account: {
    id: 'seller_account',
    category: 'account',
    platform: 'Amazon',
    title: 'Amazon Seller Central',
    englishTitle: 'Amazon Seller Account',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    icon: 'ShoppingBag',
    description: 'Professional seller account',
    defaultPrice: 180,
    defaultCost: 40,
  },

  // --- 3. COMPANY & BANKING (Individual Platforms Only) ---
  llc_formation: {
    id: 'llc_formation',
    category: 'company_bank',
    platform: 'US LLC',
    title: 'US LLC Formation',
    englishTitle: 'United States LLC Formation + EIN',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    icon: 'Briefcase',
    description: 'Official registration in Wyoming/New Mexico, Articles of Org & IRS EIN',
    defaultPrice: 350,
    defaultCost: 102,
  },
  ltd_formation: {
    id: 'ltd_formation',
    category: 'company_bank',
    platform: 'UK LTD',
    title: 'UK LTD Formation',
    englishTitle: 'United Kingdom LTD + Companies House',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    icon: 'Building',
    description: 'Official London Companies House registration with virtual UK business address',
    defaultPrice: 180,
    defaultCost: 45,
  },
  llc_ltd_formation: {
    // Legacy alias
    id: 'llc_ltd_formation',
    category: 'company_bank',
    platform: 'US LLC',
    title: 'US LLC Formation',
    englishTitle: 'US LLC Formation',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    icon: 'Briefcase',
    description: 'US LLC Formation',
    defaultPrice: 350,
    defaultCost: 102,
  },
  us_bank_account: {
    id: 'us_bank_account',
    category: 'company_bank',
    platform: 'Mercury Bank',
    title: 'Mercury US Business Bank',
    englishTitle: 'Mercury Bank US Business Account',
    color: '#0284c7',
    bgColor: 'rgba(2, 132, 199, 0.12)',
    icon: 'Building2',
    description: 'US corporate checking & savings account with international debit cards',
    defaultPrice: 200,
    defaultCost: 40,
  },
  stripe_account: {
    id: 'stripe_account',
    category: 'company_bank',
    platform: 'Stripe',
    title: 'Stripe Merchant Account',
    englishTitle: 'Stripe Verified Merchant Account',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
    icon: 'CreditCard',
    description: 'Global payment gateway accepting Visa & MasterCard for e-commerce',
    defaultPrice: 150,
    defaultCost: 30,
  },

  // --- 4. CARD & OTHER (Individual Platform Only) ---
  online_card_payment: {
    id: 'online_card_payment',
    category: 'card_other',
    platform: 'Visa / MasterCard',
    title: 'Office Card Online Payment',
    englishTitle: 'International Card Payment for Clients',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    icon: 'CreditCard',
    description: 'Payment of university fees, visa applications, AI tools & client orders',
    defaultPrice: 100,
    defaultCost: 90,
  },
  dedicated_vpn: {
    id: 'dedicated_vpn',
    category: 'card_other',
    platform: 'NordVPN / Dedicated IP',
    title: 'Dedicated Static IP & VPN',
    englishTitle: 'Dedicated Residential IP & VPN',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    icon: 'Shield',
    description: 'Clean residential US/UK dedicated IP & VPN for TikTok & Amazon',
    defaultPrice: 25,
    defaultCost: 10,
  },
  multi_service: {
    id: 'multi_service',
    category: 'card_other',
    platform: 'Multi-Service Order',
    title: 'Multi-Service Bundle',
    englishTitle: 'Multi-Service Package Order',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    icon: 'Package',
    description: 'Combined client order containing multiple services (e.g. TikTok + Amazon + VPN)',
    defaultPrice: 0,
    defaultCost: 0,
  },
};

export const SERVICE_CONFIG = BASE_SERVICES;

export const EXPENSE_CATEGORIES: Record<
  ExpenseCategory,
  {
    title: string;
    icon: string;
    color: string;
  }
> = {
  rent: { title: 'Office Rent', icon: 'Home', color: '#6366f1' },
  electricity: { title: 'Electricity & Generator', icon: 'Zap', color: '#f59e0b' },
  internet: { title: 'Office Internet', icon: 'Wifi', color: '#06b6d4' },
  salaries: { title: 'Staff Salaries', icon: 'Users', color: '#10b981' },
  food_tea: { title: 'Food, Tea & Hospitality', icon: 'Coffee', color: '#ec4899' },
  office_supplies: { title: 'Office Supplies & Paper', icon: 'Package', color: '#8b5cf6' },
  software: { title: 'Software & Server Subscriptions', icon: 'Cpu', color: '#3b82f6' },
  transport: { title: 'Transportation & Travel', icon: 'Car', color: '#14b8a6' },
  miscellaneous: { title: 'Miscellaneous Spends', icon: 'MoreHorizontal', color: '#94a3b8' },
};

export const PAYOUT_METHODS = [
  { id: 'cash_usd', title: 'Cash USD ($)' },
  { id: 'cash_afn', title: 'Cash AFN (؋)' },
  { id: 'bank_transfer', title: 'Bank Wire (SWIFT / ACH)' },
  { id: 'sarafi', title: 'Sarafi Hawala Transfer' },
  { id: 'card', title: 'Office Visa Card' },
];
