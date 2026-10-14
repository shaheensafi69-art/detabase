export type ServiceCategory = 'cashout' | 'account' | 'company_bank' | 'card_other';

export type ServiceType =
  | 'tiktok_cashout'
  | 'youtube_cashout'
  | 'bank_cashout'
  | 'paypal_cashout'
  | 'wise_cashout'
  | 'payoneer_cashout'
  | 'crypto_cashout'
  | 'llc_ltd_formation'
  | 'llc_formation'
  | 'ltd_formation'
  | 'us_bank_account'
  | 'stripe_account'
  | 'pro_account_creation'
  | 'tiktok_usa_pro'
  | 'tiktok_uk_eu'
  | 'instagram_pro'
  | 'youtube_monetized'
  | 'seller_account'
  | 'amazon_seller'
  | 'tiktok_shop_seller'
  | 'shopify_store'
  | 'online_card_payment'
  | string;

export type DatePeriod = 'today' | 'week' | 'month' | 'year' | 'all';
export type DisplayCurrency = 'USD' | 'AFN';

export interface SplitPayoutDetails {
  isSplit: boolean;
  usdAmount: number;
  afnAmount: number;
  exchangeRate: number;
  originalTotalUsd: number;
}

export interface CustomService {
  id: string;
  category: ServiceCategory;
  title: string;
  englishTitle: string;
  platform?: string;
  defaultCommission: number;
  defaultOfficeCost: number;
  defaultPrice: number;
  color?: string;
  bgColor?: string;
  icon?: string;
  description?: string;
  isCustom?: boolean;
}

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'internet'
  | 'salaries'
  | 'food_tea'
  | 'office_supplies'
  | 'software'
  | 'transport'
  | 'miscellaneous';

export interface Customer {
  id: string;
  full_name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  national_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionItem {
  id: string;
  service_type: string;
  title: string;
  englishTitle?: string;
  platform?: string;
  category?: ServiceCategory | string;
  amount_received: number; // Price of this specific service
  commission_percentage?: number;
  commission_amount: number; // Office fee/profit for this service
  payout_amount?: number; // Client payout if cashout
  notes?: string;
}

export interface Transaction {
  id: string;
  tracking_code: string;
  customer_id?: string | null;
  customer_name: string;
  customer_phone?: string;
  service_type: ServiceType;
  currency: string; // 'USD' | 'AFN' | 'EUR'
  amount_received: number;
  commission_percentage: number;
  commission_amount: number;
  office_cost: number;
  payout_amount: number;
  payout_currency: string;
  payout_method: string;
  exchange_rate: number;
  status: 'pending' | 'completed' | 'cancelled';
  service_details: Record<string, any>;
  payout_split?: SplitPayoutDetails;
  items?: TransactionItem[]; // Multiple services support!
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyExpense {
  id: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  currency: string;
  expense_date: string;
  paid_by?: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OfficeSettings {
  id: string;
  office_name: string;
  usd_to_afn: number;
  default_tiktok_commission: number;
  default_youtube_commission: number;
  default_paypal_commission: number;
  default_wise_commission: number;
  phone?: string;
  address?: string;
  custom_services?: CustomService[];
  logodev_public_key?: string;
  updated_at?: string;
}
