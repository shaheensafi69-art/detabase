-- Seed initial demo customers and transactions for realistic accounting preview

-- 1. Insert Customers
INSERT INTO public.customers (id, full_name, phone, whatsapp, email, notes)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'احمد صبور', '+93 788 123 456', '+93 788 123 456', 'saboor@gmail.com', 'تیک‌تاکر فعال - ماهانه نقد کردن درآمد'),
  ('c2222222-2222-2222-2222-222222222222', 'جاوید افغان', '+93 799 456 789', '+93 799 456 789', 'jawed.tech@gmail.com', 'یوتیوبر - کانال کابل تک'),
  ('c3333333-3333-3333-3333-333333333333', 'فرشته مرادی', '+93 777 987 654', '+93 777 987 654', 'moradi.f@yahoo.com', 'فریلانسر دیزاین - نقد پی‌پال و وایز'),
  ('c4444444-4444-4444-4444-444444444444', 'رامین همدرد', '+93 700 334 455', '+93 700 334 455', 'ramin.biz@outlook.com', 'مشتری ثبت شرکت در آمریکا'),
  ('c5555555-5555-5555-5555-555555555555', 'مصطفی نوری', '+93 744 556 677', '+93 744 556 677', 'noori.shop@gmail.com', 'فروشنده آنلاین - اکانت آمازون و تیک‌تاک شاپ')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Transactions
INSERT INTO public.transactions (
  tracking_code, customer_id, customer_name, customer_phone, service_type,
  currency, amount_received, commission_percentage, commission_amount, office_cost,
  payout_amount, payout_currency, payout_method, exchange_rate, status, service_details, notes, created_by
)
VALUES
  (
    'TX-1001', 'c1111111-1111-1111-1111-111111111111', 'احمد صبور', '+93 788 123 456', 'tiktok_cashout',
    'USD', 1250.00, 8.00, 100.00, 0.00, 1150.00, 'USD', 'cash_usd', 1.0000, 'completed',
    '{"tiktok_username": "@saboor_vibes", "creator_fund_month": "October", "payout_date": "2026-10-12"}'::jsonb,
    'نقد کردن عواید تیک‌تاک با کمیشن ۸ فیصدی و پرداخت دالر نقد', 'حسابدار صفی'
  ),
  (
    'TX-1002', 'c2222222-2222-2222-2222-222222222222', 'جاوید افغان', '+93 799 456 789', 'youtube_cashout',
    'USD', 3400.00, 7.00, 238.00, 0.00, 3162.00, 'USD', 'cash_usd', 1.0000, 'completed',
    '{"channel_name": "Kabul Tech Review", "adsense_pub_id": "pub-9283749283", "month": "September"}'::jsonb,
    'واریز ادسنس یوتیوب به حساب بانکی دفتر و تحویل کش به مشتری', 'حسابدار صفی'
  ),
  (
    'TX-1003', 'c3333333-3333-3333-3333-333333333333', 'فرشته مرادی', '+93 777 987 654', 'bank_cashout',
    'USD', 2100.00, 6.00, 126.00, 0.00, 1974.00, 'USD', 'cash_usd', 1.0000, 'completed',
    '{"platform": "PayPal", "sender_name": "Digital Nomad GmbH", "transaction_id": "PP-84930219"}'::jsonb,
    'دریافت حواله پی‌پال اروپا و تحویل کش در کابل', 'حسابدار صفی'
  ),
  (
    'TX-1004', 'c4444444-4444-4444-4444-444444444444', 'رامین همدرد', '+93 700 334 455', 'llc_ltd_formation',
    'USD', 350.00, 0.00, 248.00, 102.00, 0.00, 'USD', 'card', 1.0000, 'completed',
    '{"company_name": "Pamir Logistics LLC", "state": "Wyoming", "service_tier": "Full Package (LLC + EIN + Registered Agent)", "ein_status": "Approved"}'::jsonb,
    'ثبت شرکت وایومینگ و دریافت موفقیت‌آمیز EIN', 'حسابدار صفی'
  ),
  (
    'TX-1005', 'c5555555-5555-5555-5555-555555555555', 'مصطفی نوری', '+93 744 556 677', 'seller_account',
    'USD', 180.00, 0.00, 140.00, 40.00, 0.00, 'USD', 'cash_usd', 1.0000, 'completed',
    '{"platform": "TikTok Shop Seller", "country": "United Kingdom", "verification_status": "Verified", "documents": "UK Passport & Utility"}'::jsonb,
    'ساخت اکانت تیک‌تاک شاپ یوکی و تحویل دسترسی‌ها', 'حسابدار صفی'
  ),
  (
    'TX-1006', NULL, 'علی احمد رضایی', '+93 789 990 011', 'pro_account_creation',
    'USD', 65.00, 0.00, 50.00, 15.00, 0.00, 'USD', 'cash_usd', 1.0000, 'completed',
    '{"platform": "TikTok Monetized USA", "country": "USA", "email": "ali.creator.usa@gmail.com", "followers": "Fresh Monetized"}'::jsonb,
    'تحویل اکانت تیک‌تاک مانیتایز شده ریجن آمریکا', 'حسابدار صفی'
  ),
  (
    'TX-1007', NULL, 'شفیق رحیمی', '+93 700 887 766', 'online_card_payment',
    'USD', 95.00, 0.00, 10.00, 85.00, 0.00, 'USD', 'card', 1.0000, 'completed',
    '{"service_paid": "Google Cloud & Coursera Certification", "card_used": "Visa Business *4910", "exact_cost": 85.00}'::jsonb,
    'پرداخت امتحان بین‌المللی با کارت ویزای دفتر و اخذ کمیشن', 'حسابدار صفی'
  )
ON CONFLICT (tracking_code) DO NOTHING;

-- 3. Insert Daily Expenses
INSERT INTO public.daily_expenses (category, title, amount, currency, expense_date, paid_by, payment_method, notes)
VALUES
  ('rent', 'کرایه ماهوار دفتر (سهم ماهانه)', 250.00, 'USD', CURRENT_DATE - INTERVAL '2 days', 'صفی صاحب', 'cash', 'کرایه دفتر مرکزی'),
  ('electricity', 'تیل جنراتور و صرفیه برق دفتر', 3500.00, 'AFN', CURRENT_DATE - INTERVAL '1 day', 'حسابدار', 'cash', 'خرید تیل دیزل برای جنراتور'),
  ('internet', 'انترنت فایبر نوری نامحدود ماهوار', 2000.00, 'AFN', CURRENT_DATE - INTERVAL '1 day', 'حسابدار', 'cash', 'پرداخت بل انترنت افغان بیسیما'),
  ('food_tea', 'مصرف چای، بوره و نان چاشت پرسونل', 1200.00, 'AFN', CURRENT_DATE, 'مدیر اداری', 'cash', 'نان چاشت و میوه و چای مهمانان'),
  ('software', 'اشتراک ماهانه سرور و VPN اختصاصی برای اکانت‌ها', 45.00, 'USD', CURRENT_DATE, 'صفی صاحب', 'card', 'خرید VPS آمریکا و انگلستان برای ساخت اکانت‌ها')
ON CONFLICT DO NOTHING;
