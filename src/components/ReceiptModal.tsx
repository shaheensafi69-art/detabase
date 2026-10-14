'use client';

import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Phone,
  MapPin,
  Calendar,
  Hash,
  User,
  Sparkles,
  Award,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Transaction, OfficeSettings } from '@/types';
import { SERVICE_CONFIG } from '@/lib/constants';
import { PlatformLogo } from '@/components/PlatformLogo';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  settings: OfficeSettings;
}

// Convert amount numbers to simple English & Dari word representation
function amountInWords(num: number): string {
  if (num <= 0) return 'Zero USD';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  const convertLessThanOneThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanOneThousand(n % 100) : '');
  };

  const integerPart = Math.floor(num);
  const cents = Math.round((num - integerPart) * 100);

  let word = '';
  if (integerPart >= 1000) {
    const thousands = Math.floor(integerPart / 1000);
    const remainder = integerPart % 1000;
    word = convertLessThanOneThousand(thousands) + ' Thousand ' + convertLessThanOneThousand(remainder);
  } else {
    word = convertLessThanOneThousand(integerPart);
  }

  word = word.trim() + ' US Dollars';
  if (cents > 0) {
    word += ` & ${cents}/100 Cents`;
  }
  return word + ' Only';
}

export default function ReceiptModal({
  isOpen,
  onClose,
  transaction,
  settings,
}: ReceiptModalProps) {
  const [advancePayment, setAdvancePayment] = React.useState<number>(0);
  const [remainingBalance, setRemainingBalance] = React.useState<number>(0);
  const [isCustomCalculation, setIsCustomCalculation] = React.useState<boolean>(false);
  const [previewScale, setPreviewScale] = React.useState<number>(0.88);

  React.useEffect(() => {
    if (transaction) {
      setAdvancePayment(0);
      setRemainingBalance(0);
      setIsCustomCalculation(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const officeName = settings?.office_name || 'E-Commerce With S4 HEL';
  const officePhone1 = settings?.phone ? settings.phone.split(/[,/]/)[0]?.trim() : '+93 70 058 2033';
  const officePhone2 = settings?.phone && settings.phone.includes(',') ? settings.phone.split(/[,/]/)[1]?.trim() : '+44 7740 589731';
  const officeAddress = settings?.address || 'کابل کوته سنگی آخر پل هوایی مارکیت یاسینی سنتر منزل (4) دفتر نمبر (5)';

  // Invoice calculations
  const totalAmount = Number(transaction.amount_received || 0);
  const commission = Number(transaction.commission_amount || 0);
  const payout = Number(transaction.payout_amount || 0);

  const isCashout = ['tiktok_cashout', 'youtube_cashout', 'bank_cashout', 'paypal_cashout', 'wise_cashout', 'payoneer_cashout', 'crypto_cashout'].includes(transaction.service_type);
  const finalTotal = isCashout && payout > 0 ? payout : totalAmount;
  const displayRemaining = isCustomCalculation ? remainingBalance : (advancePayment > 0 ? Math.max(0, finalTotal - advancePayment) : 0);

  const items = transaction.items || transaction.service_details?.items;
  const hasMultipleItems = Array.isArray(items) && items.length > 0;
  const splitDetails = transaction.payout_split || transaction.service_details?.payout_split;

  const service = SERVICE_CONFIG[transaction.service_type] || {
    title: transaction.service_type,
    englishTitle: 'Financial / E-Commerce Service',
    platform: 'Office Service',
  };

  const txDate = transaction.created_at ? new Date(transaction.created_at) : new Date();
  const day = String(txDate.getDate()).padStart(2, '0');
  const month = String(txDate.getMonth() + 1).padStart(2, '0');
  const year = txDate.getFullYear();
  const dateFormatted = `${day} / ${month} / ${year}`;

  const isPaidInFull = advancePayment <= 0 && displayRemaining <= 0;
  const isPartiallyPaid = advancePayment > 0 && displayRemaining > 0;

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-print-area');
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="fa" dir="ltr">
      <head>
        <meta charset="utf-8" />
        <title>Official Invoice - ${transaction.tracking_code}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Vazirmatn:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          *, *::before, *::after {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            font-family: 'Plus Jakarta Sans', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #0f172a;
            width: 100%;
            height: 100%;
          }
          .receipt-printable-canvas {
            width: 100% !important;
            max-width: 190mm !important;
            height: 278mm !important;
            min-height: 278mm !important;
            max-height: 280mm !important;
            margin: 0 auto !important;
            padding: 16px 20px !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            border: 2px solid #0284c7 !important;
            border-radius: 8px !important;
            background: #ffffff !important;
            position: relative !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .number-ltr {
            direction: ltr;
            display: inline-block;
            font-variant-numeric: tabular-nums;
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; max-width: 190mm; margin: 0 auto; padding: 0;">
          ${printContent.outerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 2500);
    };

    const images = doc.images;
    if (images && images.length > 0) {
      let loaded = 0;
      const total = images.length;
      const fallbackTimer = setTimeout(triggerPrint, 900);

      for (let i = 0; i < total; i++) {
        if (images[i].complete) {
          loaded++;
          if (loaded === total) {
            clearTimeout(fallbackTimer);
            setTimeout(triggerPrint, 150);
          }
        } else {
          images[i].onload = images[i].onerror = () => {
            loaded++;
            if (loaded === total) {
              clearTimeout(fallbackTimer);
              setTimeout(triggerPrint, 150);
            }
          };
        }
      }
    } else {
      setTimeout(triggerPrint, 350);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal-content receipt-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          width: '96%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          color: '#1e293b',
          padding: '20px',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '14px',
            borderBottom: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f2b48' }}>
                پیش‌نمایش فاکتور رسمی S4 HEL (فول پیج استندرد A4)
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                چاپ تمام صفحه هماهنگ با کاغذ A4 با هدر، مهر و امضای رسمی
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Quick Advance / Remaining inputs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                background: '#f8fafc',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ color: '#475569', fontWeight: 600 }}>پیش‌پرداخت ($):</span>
              <input
                type="number"
                min="0"
                value={advancePayment || ''}
                placeholder="0"
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setAdvancePayment(val);
                  setIsCustomCalculation(false);
                }}
                style={{
                  width: '65px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                background: '#f8fafc',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <span style={{ color: '#475569', fontWeight: 600 }}>باقی‌مانده ($):</span>
              <input
                type="number"
                min="0"
                value={displayRemaining || ''}
                placeholder="0"
                onChange={(e) => {
                  setRemainingBalance(parseFloat(e.target.value) || 0);
                  setIsCustomCalculation(true);
                }}
                style={{
                  width: '65px',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#0f172a',
                }}
              />
            </div>

            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0284c7 0%, #ea580c 100%)',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '8px',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <Printer size={16} />
              چاپ فاکتور (Full A4 Print)
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="بستن"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Print Tip & Scale Controls */}
        <div
          className="no-print"
          style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '11.5px',
            color: '#0369a1',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💡</span>
            <span>
              <strong>نکته کیفیت چاپ:</strong> در پنجره پرینت مرورگر، تیک گزینه <strong>Background graphics</strong> را فعال نمایید تا رنگ‌ها و پس‌زمینه‌ها با کیفیت عالی چاپ شوند.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>پیش‌نمایش:</span>
            {[
              { label: '100% (اصلی)', scale: 1 },
              { label: '88% (مناسب)', scale: 0.88 },
              { label: '75% (کل صفحه)', scale: 0.75 },
            ].map((opt) => (
              <button
                key={opt.scale}
                onClick={() => setPreviewScale(opt.scale)}
                style={{
                  background: previewScale === opt.scale ? '#0284c7' : '#ffffff',
                  color: previewScale === opt.scale ? '#ffffff' : '#475569',
                  border: previewScale === opt.scale ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '10.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Container for Preview */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px', display: 'flex', justifyContent: 'center' }}>
          {/* Scale wrapper for on-screen preview */}
          <div
            style={{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              width: '100%',
              maxWidth: '190mm',
              marginBottom: previewScale < 1 ? `-${Math.round((1 - previewScale) * 1050)}px` : '0px',
            }}
          >
            {/* =============================================================== */}
            {/* ================= Printable A4 Canvas ========================= */}
            {/* =============================================================== */}
            <div
              id="receipt-print-area"
              className="receipt-printable-canvas"
              style={{
                background: '#ffffff',
                color: '#0f172a',
                padding: '16px 20px',
                border: '2px solid #0284c7',
                borderRadius: '8px',
                position: 'relative',
                fontFamily: "'Plus Jakarta Sans', 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif",
                direction: 'ltr',
                width: '100%',
                maxWidth: '190mm',
                height: '278mm',
                minHeight: '278mm',
                maxHeight: '280mm',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                margin: '0 auto',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              }}
            >
            {/* Watermark in Center */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.04,
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <img src="/logo.png" alt="Watermark" style={{ width: '320px', height: '320px' }} />
            </div>

            {/* TOP BLOCK: Header + Metadata */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Header Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                }}
              >
                {/* Left: Office Brand & Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img
                    src="/logo.png"
                    alt="S4 HEL Logo"
                    style={{
                      width: '84px',
                      height: '84px',
                      objectFit: 'contain',
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 900,
                        color: '#0a3d62',
                        letterSpacing: '-0.3px',
                        lineHeight: 1.2,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {officeName}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#0284c7',
                        fontWeight: 800,
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        marginTop: '2px',
                      }}
                    >
                      GLOBAL E-COMMERCE & FINANCIAL SOLUTIONS
                    </div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        color: '#64748b',
                        fontWeight: 600,
                        direction: 'rtl',
                        textAlign: 'left',
                        marginTop: '1px',
                      }}
                    >
                      مرکز تخصصی حواله‌جات، اکانت‌های تجاری و خدمات ارزی بین‌المللی
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '4px',
                        padding: '2px 8px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        color: '#0369a1',
                        fontWeight: 700,
                      }}
                    >
                      <span>✓ Official Licensed Provider</span>
                      <span>•</span>
                      <span>Ref: S4-OFFICIAL</span>
                    </div>
                  </div>
                </div>

                {/* Right: Modern INVOICE Typography & Status Pill */}
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '36px',
                      fontWeight: 900,
                      color: '#d9531e',
                      letterSpacing: '2px',
                      margin: 0,
                      lineHeight: 1,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    INVOICE
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#475569',
                      letterSpacing: '1px',
                      marginTop: '3px',
                      direction: 'rtl',
                    }}
                  >
                    صورتحساب رسمی خدمات
                  </div>

                  {/* Payment Status Pill */}
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    {isPaidInFull ? (
                      <span
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #6ee7b7',
                          color: '#047857',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <CheckCircle2 size={12} />
                        PAID IN FULL • تصفیه کامل
                      </span>
                    ) : isPartiallyPaid ? (
                      <span
                        style={{
                          background: '#fffbeb',
                          border: '1px solid #fcd34d',
                          color: '#b45309',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        PARTIAL • پیش‌پرداخت شده
                      </span>
                    ) : (
                      <span
                        style={{
                          background: '#f0f9ff',
                          border: '1px solid #7dd3fc',
                          color: '#0369a1',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        OFFICIAL VOUCHER
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dual-Color Accent Strip */}
              <div
                style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, #0284c7 0%, #0077c8 50%, #d9531e 100%)',
                  borderRadius: '2px',
                  marginBottom: '14px',
                }}
              />

              {/* Client & Invoice Information 3-Column Card */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.1fr 1.3fr 1fr',
                  gap: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '12.5px',
                }}
              >
                {/* Column 1: Invoice Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    INVOICE DETAILS / مشخصات
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#ea580c', fontWeight: 800, width: '42px' }}>No:</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '13.5px',
                        color: '#0284c7',
                        background: '#ffffff',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    >
                      {transaction.tracking_code}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#ea580c', fontWeight: 800, width: '42px' }}>Date:</span>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{dateFormatted}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                    <span style={{ width: '42px' }}>Branch:</span>
                    <span>Kabul Main Office</span>
                  </div>
                </div>

                {/* Column 2: Billed To / Client */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', paddingLeft: '12px', paddingRight: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    BILLED TO / مشخصات مشتری
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#ea580c', fontWeight: 800, width: '48px' }}>Name:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>
                      {transaction.customer_name || 'Walk-in Client'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#ea580c', fontWeight: 800, width: '48px' }}>Phone:</span>
                    <span className="number-ltr" style={{ fontWeight: 700, color: '#334155' }}>
                      {transaction.customer_phone || '---'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                    <span style={{ width: '48px' }}>Tracking:</span>
                    <span style={{ fontFamily: 'monospace' }}>TRX-{transaction.id ? transaction.id.slice(0, 8).toUpperCase() : '0000'}</span>
                  </div>
                </div>

                {/* Column 3: Category & Payment Type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingLeft: '4px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    SERVICE TYPE / نوعیت خدمت
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PlatformLogo platform={service.platform || service.title} size={18} />
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>
                      {service.englishTitle || service.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: '#64748b' }}>Currency:</span>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>USD ($) / AFN (؋)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                    <span>● Verified S4 HEL Record</span>
                  </div>
                </div>
              </div>

              {/* =============================================================== */}
              {/* ================= SERVICES & ITEMS TABLE ===================== */}
              {/* =============================================================== */}
              <div style={{ border: '1.5px solid #0077c8', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: 'linear-gradient(90deg, #0a3d62 0%, #0077c8 100%)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '12px',
                        letterSpacing: '0.3px',
                      }}
                    >
                      <th style={{ padding: '8px 10px', width: '6%', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                        #
                      </th>
                      <th style={{ padding: '8px 14px', width: '54%', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                        Description of Service & Deliverables / شرح خدمات
                      </th>
                      <th style={{ padding: '8px 10px', width: '10%', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                        QTY
                      </th>
                      <th style={{ padding: '8px 12px', width: '15%', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
                        Unit Price
                      </th>
                      <th style={{ padding: '8px 12px', width: '15%', textAlign: 'right' }}>
                        Total Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '12.5px', color: '#0f172a' }}>
                    {hasMultipleItems ? (
                      items.map((it: any, idx: number) => {
                        const itemSvc = SERVICE_CONFIG[it.service_type] || {
                          title: it.title || it.service_type,
                          englishTitle: it.englishTitle || it.title,
                          platform: it.platform || 'Service',
                        };
                        const itemPrice = Number(it.amount_received || 0);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid #bfdbfe', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700, color: '#64748b' }}>
                              0{idx + 1}
                            </td>
                            <td style={{ padding: '10px 14px', borderRight: '1px solid #bfdbfe' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <PlatformLogo platform={it.platform || itemSvc.platform || it.title} size={22} />
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                                    {it.englishTitle || it.title || itemSvc.englishTitle}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#475569', direction: 'rtl', textAlign: 'left', marginTop: '1px' }}>
                                    {it.notes || itemSvc.title || 'ارائه خدمات با تاییدیه رسمی'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700 }}>
                              1
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700 }}>
                              ${itemPrice.toFixed(2)}
                            </td>
                            <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                              ${itemPrice.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      /* Primary Service Row */
                      <tr style={{ borderBottom: '1px solid #bfdbfe', background: '#ffffff' }}>
                        <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700, color: '#64748b' }}>
                          01
                        </td>
                        <td style={{ padding: '10px 14px', borderRight: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <PlatformLogo platform={service.platform || service.title} size={24} />
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a' }}>
                                {service.englishTitle || service.title}
                              </div>
                              <div style={{ fontSize: '11px', color: '#475569', direction: 'rtl', textAlign: 'left', marginTop: '1px' }}>
                                {service.title}
                              </div>
                              {transaction.notes && (
                                <div style={{ fontSize: '10.5px', color: '#d9531e', fontWeight: 600, marginTop: '2px', direction: 'rtl', textAlign: 'left' }}>
                                  نوت: {transaction.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700 }}>
                          1
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700 }}>
                          ${totalAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                          ${totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Additional Sub-Service 2: Credentials & Verification */}
                    <tr style={{ borderBottom: '1px solid #bfdbfe', background: '#f8fafc' }}>
                      <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700, color: '#94a3b8' }}>
                        02
                      </td>
                      <td style={{ padding: '8px 14px', borderRight: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                          Official Verification & Security Guarantee
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', direction: 'rtl', textAlign: 'left' }}>
                          تأییدیه اصالت اکانت و تحویل امن مشخصات ورود توسط تیم فنی
                        </div>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 600, color: '#64748b' }}>
                        1
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe', color: '#16a34a', fontWeight: 700 }}>
                        Included
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>
                        $0.00
                      </td>
                    </tr>

                    {/* Commission Row if cashout */}
                    {isCashout && commission > 0 && (
                      <tr style={{ borderBottom: '1px solid #bfdbfe', background: 'rgba(217, 83, 30, 0.04)' }}>
                        <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700, color: '#d9531e' }}>
                          -
                        </td>
                        <td style={{ padding: '8px 14px', borderRight: '1px solid #bfdbfe', color: '#475569', fontSize: '12px' }}>
                          Office Commission / Processing Fee ({transaction.commission_percentage > 0 ? `${transaction.commission_percentage}%` : 'Fixed'})
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe' }}>-</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe', color: '#d9531e', fontWeight: 700 }}>
                          -${commission.toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', color: '#d9531e', fontWeight: 700 }}>
                          -${commission.toFixed(2)}
                        </td>
                      </tr>
                    )}

                    {/* Split Payout Breakdown if applied */}
                    {splitDetails?.isSplit && (
                      <>
                        <tr style={{ borderBottom: '1px solid #bfdbfe', background: 'rgba(16, 185, 129, 0.05)' }}>
                          <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700, color: '#047857' }}>
                            💵
                          </td>
                          <td style={{ padding: '8px 14px', borderRight: '1px solid #bfdbfe', color: '#047857', fontSize: '12px', fontWeight: 700 }}>
                            Client Settlement: USD Physical Notes (دالر نقد فیزیکی)
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 600 }}>-</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe', color: '#047857', fontWeight: 700 }}>
                            ${splitDetails.usdAmount.toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#047857', fontWeight: 800 }}>
                            ${splitDetails.usdAmount.toFixed(2)}
                          </td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #bfdbfe', background: 'rgba(2, 132, 199, 0.05)' }}>
                          <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 700, color: '#0284c7' }}>
                            ؋
                          </td>
                          <td style={{ padding: '8px 14px', borderRight: '1px solid #bfdbfe', color: '#0284c7', fontSize: '12px', fontWeight: 700 }}>
                            Client Settlement: AFN Cash Remainder (Rate: 1$ = {splitDetails.exchangeRate.toFixed(2)} AFN)
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #bfdbfe', fontWeight: 600 }}>-</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #bfdbfe', color: '#0284c7', fontWeight: 700 }}>
                            {splitDetails.afnAmount.toLocaleString()} AFN
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#0284c7', fontWeight: 800 }}>
                            {splitDetails.afnAmount.toLocaleString()} ؋
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MIDDLE BLOCK: Financial Calculations & Settlement Details */}
            <div style={{ position: 'relative', zIndex: 1, margin: '8px 0' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '14px',
                  alignItems: 'stretch',
                }}
              >
                {/* Left: Settlement Notes & Words */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#0a3d62', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Payment Method & Amount in Words / مبلغ به حروف
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                      {amountInWords(finalTotal)}
                    </div>
                    {splitDetails?.isSplit && (
                      <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700, background: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                        تسویه مرکب: ${splitDetails.usdAmount.toFixed(2)} نقد دالر + {splitDetails.afnAmount.toLocaleString()} افغانی (نرخ {splitDetails.exchangeRate.toFixed(2)})
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                    <ShieldCheck size={16} color="#0284c7" />
                    <span>تأییدیه رسمی تسویه حساب نقدی و دیجیتال دفتر مرکزی S4 HEL</span>
                  </div>
                </div>

                {/* Right: Modern Financial Totals Card */}
                <div
                  style={{
                    border: '1.5px solid #0077c8',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '12.5px',
                      color: '#475569',
                    }}
                  >
                    <span>Subtotal / مجموعه خدمات:</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>${finalTotal.toFixed(2)}</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '12.5px',
                    }}
                  >
                    <span style={{ color: '#d9531e', fontWeight: 700 }}>Advance Payment / پیش‌پرداخت:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      {advancePayment > 0 ? `$${advancePayment.toFixed(2)}` : '_______'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '7px 12px',
                      borderBottom: '1.5px solid #0077c8',
                      fontSize: '12.5px',
                    }}
                  >
                    <span style={{ color: '#d9531e', fontWeight: 700 }}>Remaining Balance / باقی‌مانده:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                      {displayRemaining > 0 ? `$${displayRemaining.toFixed(2)}` : (advancePayment > 0 ? '$0.00' : '_______')}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'linear-gradient(90deg, #d9531e 0%, #ea580c 100%)',
                      color: '#ffffff',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.5px' }}>
                        TOTAL AMOUNT
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.9 }}>
                        مجموع قابل تادیه
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', fontWeight: 900, fontFamily: 'monospace' }}>
                      ${finalTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM BLOCK: Terms + Signatures + Footer Ribbon */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* Terms & Guarantees */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginBottom: '14px',
                  fontSize: '10.5px',
                  color: '#475569',
                  lineHeight: '1.5',
                  direction: 'rtl',
                  textAlign: 'right',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0a3d62', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>شرایط، ضمانت و اعتبار فاکتور:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                  <div>• تمامی اکانت‌ها و خدمات ارزی با ضمانت کارکرد و تاییدیه رسمی دفتر S4 HEL تحویل می‌گردد.</div>
                  <div>• این برگه فاکتور سند رسمی تصفیه حساب بوده و با مهر و امضای دفتر دارای اعتبار می‌باشد.</div>
                  <div>• جهت پیگیری‌های بعدی، ارائه کد رهگیری فاکتور ({transaction.tracking_code}) الزامی است.</div>
                  <div>• پشتیبانی و پاسخگویی ۲۴ ساعته از طریق شماره‌های تماس و دفتر مرکزی فعال می‌باشد.</div>
                </div>
              </div>

              {/* Signatures & Official Stamp Area */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1.1fr 1fr',
                  gap: '12px',
                  alignItems: 'center',
                  marginBottom: '14px',
                  padding: '0 4px',
                }}
              >
                {/* Client Signature */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '44px', borderBottom: '1.5px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>
                    امضای مشتری (Customer Signature)
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                    تایید دریافت و رضایت از خدمات
                  </div>
                </div>

                {/* Center: Official Seal Emblem */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      border: '2px dashed #0077c8',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(2, 132, 199, 0.03)',
                      color: '#0077c8',
                      position: 'relative',
                    }}
                  >
                    <div style={{ fontSize: '7.5px', fontWeight: 900, letterSpacing: '0.5px' }}>OFFICIAL SEAL</div>
                    <Award size={18} color="#d9531e" style={{ margin: '2px 0' }} />
                    <div style={{ fontSize: '6.5px', fontWeight: 800 }}>S4 HEL • KABUL</div>
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#0a3d62', marginTop: '3px' }}>
                    محل مهر رسمی دفتر S4 HEL
                  </div>
                </div>

                {/* Manager Signature */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '44px', borderBottom: '1.5px dashed #94a3b8', marginBottom: '6px' }} />
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>
                    امضای مسئول مالی (Authorized Signatory)
                  </div>
                  <div style={{ fontSize: '9.5px', color: '#64748b' }}>
                    مدیریت مالی و امور اجرایی دفتر
                  </div>
                </div>
              </div>

              {/* Bottom Full-Width Ribbon Footer */}
              <div
                style={{
                  display: 'flex',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {/* Left Orange Ribbon with Phone Numbers */}
                <div
                  style={{
                    background: '#ea580c',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '42%',
                  }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      color: '#ea580c',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '12px',
                    }}
                  >
                    <Phone size={12} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', opacity: 0.9 }}>AF:</span>
                      <span className="number-ltr" style={{ fontWeight: 800 }}>{officePhone1}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', opacity: 0.9 }}>UK:</span>
                      <span className="number-ltr" style={{ fontWeight: 800 }}>{officePhone2}</span>
                    </div>
                  </div>
                </div>

                {/* Right Navy Ribbon with Address */}
                <div
                  style={{
                    background: '#0a3d62',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '58%',
                    direction: 'rtl',
                    textAlign: 'right',
                  }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      color: '#0a3d62',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={12} />
                  </div>
                  <div style={{ fontSize: '10.5px', lineHeight: '1.4' }}>
                    {officeAddress}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
