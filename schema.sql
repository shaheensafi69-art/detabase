-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'accountant', -- 'admin', 'accountant', 'manager'
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers Table (مدیریت مشتریان)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  national_id TEXT, -- تذکره یا پاسپورت
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Unified Transactions Table (جدول تراکنش‌ها و خدمات)
-- Includes:
-- - tiktok_cashout (نقد کردن تیک تاک)
-- - youtube_cashout (نقد کردن یوتوب)
-- - bank_cashout (نقد کردن پی پال، وایز، پایونیر، زیلا، بانک)
-- - llc_ltd_formation (ثبت و تشکیل شرکت)
-- - pro_account_creation (اکانت تیک تاک، اینستاگرام، یوتوب)
-- - seller_account (اکانت فروشنده آمازون، تیک تاک شاپ، شاپیفای)
-- - online_card_payment (پرداخت با کارت برای مشتری)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code TEXT UNIQUE NOT NULL, -- کد رهگیری مثل TX-1001
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL, -- cache in case customer not linked
  customer_phone TEXT,
  service_type TEXT NOT NULL, 
  -- Allowed types:
  -- 'tiktok_cashout', 'youtube_cashout', 'bank_cashout', 
  -- 'llc_ltd_formation', 'pro_account_creation', 'seller_account', 'online_card_payment'

  -- Financial Calculations (محاسبات مالی و کمیشن)
  currency TEXT NOT NULL DEFAULT 'USD', -- 'USD', 'AFN', 'EUR', etc.
  amount_received NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- مقدار پول دریافت شده از مشتری یا منبع
  commission_percentage NUMERIC(5, 2) DEFAULT 0.00, -- فیصدی کمیشن
  commission_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- سود / کمیشن دفتر
  office_cost NUMERIC(15, 2) DEFAULT 0.00, -- مصرف یا هزینه انجام خدمت (برای تشکیل شرکت، اکانت و غیره)
  payout_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00, -- پولی که به مشتری کش داده شد یا مصرف شد
  payout_currency TEXT NOT NULL DEFAULT 'USD',
  payout_method TEXT DEFAULT 'cash_usd', -- 'cash_usd', 'cash_afn', 'bank_transfer', 'sarafi', 'card'
  exchange_rate NUMERIC(10, 4) DEFAULT 1.0000, -- نرخ تبدیل در صورت تفاوت اسعار

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'

  -- Details Specific to Services (جزییات تخصصی هر سرویس به صورت JSON)
  -- Examples:
  -- For bank cashout: { "platform": "PayPal", "sender_name": "John Doe", "tx_ref": "PP-9923" }
  -- For LLC: { "company_name": "Apex Global LLC", "state": "Wyoming", "ein_status": "Pending" }
  -- For Accounts: { "platform": "TikTok USA", "account_username": "@user_pro", "country": "USA" }
  -- For Online Payment: { "website": "Coursera", "card_used": "Visa 4242", "invoice_url": "..." }
  service_details JSONB DEFAULT '{}'::jsonb,

  notes TEXT,
  created_by TEXT, -- name or email of accountant
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Daily Expenses Table (مصارف روزانه دفتر)
CREATE TABLE IF NOT EXISTS public.daily_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, 
  -- 'rent' (کرایه), 'electricity' (برق/تیل), 'internet' (انترنت), 
  -- 'salaries' (معاشات), 'food_tea' (نان و چای), 'office_supplies' (قرطاسیه و لوازم),
  -- 'software' (نرم‌افزار و ابزارها), 'transport' (ترانسپورت), 'miscellaneous' (متفرقه)
  title TEXT NOT NULL, -- عنوان مصرف
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD', -- 'USD', 'AFN'
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  paid_by TEXT, -- پرداخت کننده
  payment_method TEXT DEFAULT 'cash', -- 'cash', 'bank', 'sarafi'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Exchange Rates & Office Settings (تنظیمات دفتر و نرخ اسعار)
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'office_config',
  office_name TEXT NOT NULL DEFAULT 'دفتر خدمات مالی و تکنالوژی صفی',
  usd_to_afn NUMERIC(10, 4) DEFAULT 68.50,
  default_tiktok_commission NUMERIC(5, 2) DEFAULT 8.00,
  default_youtube_commission NUMERIC(5, 2) DEFAULT 7.00,
  default_paypal_commission NUMERIC(5, 2) DEFAULT 6.00,
  default_wise_commission NUMERIC(5, 2) DEFAULT 5.00,
  phone TEXT DEFAULT '+93 700 000 000',
  address TEXT DEFAULT 'کابل، افغانستان',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO public.settings (id, office_name, usd_to_afn, default_tiktok_commission, default_youtube_commission, default_paypal_commission, default_wise_commission)
VALUES ('office_config', 'دفتر خدمات مالی و تکنالوژی صفی', 68.50, 8.00, 7.00, 6.00, 5.00)
ON CONFLICT (id) DO NOTHING;

-- Create Indexes for super fast searching
CREATE INDEX IF NOT EXISTS idx_transactions_customer_name ON public.transactions(customer_name);
CREATE INDEX IF NOT EXISTS idx_transactions_service_type ON public.transactions(service_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_expenses_date ON public.daily_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_expenses_category ON public.daily_expenses(category);

-- Enable RLS and add public permissive policies for demo/admin access
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anon & service_role full access (for internal office usage)
DROP POLICY IF EXISTS "Public access to customers" ON public.customers;
CREATE POLICY "Public access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to transactions" ON public.transactions;
CREATE POLICY "Public access to transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to daily_expenses" ON public.daily_expenses;
CREATE POLICY "Public access to daily_expenses" ON public.daily_expenses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to settings" ON public.settings;
CREATE POLICY "Public access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to profiles" ON public.profiles;
CREATE POLICY "Public access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
