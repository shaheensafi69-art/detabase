'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  Sparkles,
  KeyRound,
  Briefcase,
} from 'lucide-react';
import { DEFAULT_OFFICE_NAME } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

interface LoginScreenProps {
  onLogin: (user: { name: string; role: string; email?: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('Head of Operations & Lead Accountant');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Status & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const emailInput = loginEmail.trim();
      const passwordInput = loginPassword.trim();

      // Quick admin bypass if office offline password or username is used
      if (
        (emailInput.toLowerCase() === 'admin' || emailInput.toLowerCase() === 'safi' || emailInput.toLowerCase() === 'safi@s4hel.com') &&
        (passwordInput === 'admin' || passwordInput === '123456' || passwordInput === 's4hel2026')
      ) {
        onLogin({
          name: 'Safi Sahib',
          role: 'Head of Operations & Lead Accountant',
          email: 'safi@s4hel.com',
        });
        setLoading(false);
        return;
      }

      // Supabase Authentication
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: emailInput.includes('@') ? emailInput : `${emailInput}@s4hel.com`,
        password: passwordInput,
      });

      if (authError) {
        // If Supabase user not found but has entered non-empty credentials, check if they want demo access or invalid credentials
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('ایمیل یا رمز عبور وارد شده نادرست است. اگر حساب کاربری ندارید، لطفاً از بخش «ثبت نام» اقدام کنید.');
        }
        throw authError;
      }

      if (data.user) {
        const userName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          'Office Staff';
        const userRole = data.user.user_metadata?.role || 'Lead Accountant & Manager';

        onLogin({
          name: userName,
          role: userRole,
          email: data.user.email,
        });
      }
    } catch (err: any) {
      setError(err.message || 'خطایی در ورود به سیستم رخ داد. لطفاً مجدداً تلاش نمایید.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Sign Up
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (signupPassword.length < 6) {
      setError('رمز عبور باید حداقل شامل ۶ نویسه (کاراکتر) باشد.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('رمز عبور با تکرار آن همخوانی ندارد.');
      return;
    }

    setLoading(true);

    try {
      const email = signupEmail.trim();
      const fullName = signupName.trim();

      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.includes('@') ? email : `${email}@s4hel.com`,
        password: signupPassword,
        options: {
          data: {
            full_name: fullName,
            role: signupRole,
          },
        },
      });

      if (signupError) throw signupError;

      if (data.user) {
        setSuccessMessage('حساب کاربری شما با موفقیت ایجاد شد! در حال انتقال به داشبورد...');
        setTimeout(() => {
          onLogin({
            name: fullName || 'New User',
            role: signupRole,
            email: data.user?.email,
          });
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت نام حساب جدید. لطفاً ورودی‌ها را بررسی نمایید.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Quick Staff Login
  const handleQuickStaffLogin = () => {
    onLogin({
      name: 'Safi Sahib',
      role: 'Head of Operations & Lead Accountant',
      email: 'safi@s4hel.com',
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'radial-gradient(circle at 50% 25%, rgba(2, 132, 199, 0.2) 0%, rgba(10, 25, 47, 0.8) 50%, #060e18 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Rings */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          border: '1px solid rgba(2, 132, 199, 0.08)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '900px',
          height: '900px',
          borderRadius: '50%',
          border: '1px solid rgba(234, 88, 12, 0.05)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px 32px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(2, 132, 199, 0.15)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1.5px solid rgba(2, 132, 199, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px rgba(2, 132, 199, 0.35)',
              marginBottom: '14px',
              overflow: 'hidden',
              padding: '6px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="S4 HEL Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h1 style={{ fontSize: '21px', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.3px' }}>
            {DEFAULT_OFFICE_NAME}
          </h1>
          <p style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '4px' }}>
            پرتال رسمی مدیریت دیتابیس مالی، حواله‌جات و خدمات الکترونیک
          </p>

          {/* Immutable Accounting Ledger Badge */}
          <div
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              color: '#34d399',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={13} color="#10b981" />
            <span>سیستم دفتر کل مالی غیرقابل تغییر (Immutable Ledger)</span>
          </div>
        </div>

        {/* Tab Switcher: Login vs Sign Up */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '22px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setSuccessMessage('');
            }}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: mode === 'login' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : '#94a3b8',
              boxShadow: mode === 'login' ? '0 4px 14px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <LogIn size={15} />
            <span>ورود به سیستم (Sign In)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
              setSuccessMessage('');
            }}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: mode === 'signup' ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)' : 'transparent',
              color: mode === 'signup' ? '#ffffff' : '#94a3b8',
              boxShadow: mode === 'signup' ? '0 4px 14px rgba(234, 88, 12, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={15} />
            <span>ثبت نام حساب جدید (Sign Up)</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fda4af',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              marginBottom: '18px',
              textAlign: 'right',
              direction: 'rtl',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6ee7b7',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '12.5px',
              marginBottom: '18px',
              textAlign: 'right',
              direction: 'rtl',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} color="#10b981" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= MODE: LOGIN ================= */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>ایمیل یا نام کاربری (Email / Username)</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>safi@s4hel.com</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ایمیل خود را وارد نمایید..."
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Mail
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">رمز عبور (Password)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="رمز عبور حساب..."
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <Lock
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14.5px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
              }}
            >
              <span>{loading ? 'در حال بررسی اطلاعات...' : 'ورود به داشبورد مالی'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* ================= MODE: SIGN UP ================= */
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group">
              <label className="form-label">نام و تخلص کامل (Full Name)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="مثال: صفی الله صاحب"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <User
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">ایمیل آدرس رسمی (Official Email)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="user@s4hel.com"
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <Mail
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">سمت / مسئولیت کاری (Role & Department)</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="form-select"
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="Head of Operations & Lead Accountant">مدیر مالی و امور اجرایی (Head Accountant)</option>
                  <option value="Exchange & Cashout Officer">مسئول کش‌اوت، صرافی و تیک‌تاک (Cashout Officer)</option>
                  <option value="Account Creation & Banking Specialist">متخصص افتتاح حساب و شرکت (Banking Specialist)</option>
                  <option value="Financial Auditor & Compliance">حسابرس و نظارت دفتر (Auditor)</option>
                </select>
                <Briefcase
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">رمز عبور (Password - حداقل ۶ کاراکتر)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="تعیین رمز عبور قوی..."
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
                />
                <Lock
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label">تکرار رمز عبور (Confirm Password)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز عبور..."
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
                <KeyRound
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14.5px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)',
              }}
            >
              <span>{loading ? 'در حال ثبت اطلاعات...' : 'ثبت نام و ایجاد حساب کاربری'}</span>
              <CheckCircle2 size={18} />
            </button>
          </form>
        )}

        {/* Quick Staff Access Button */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleQuickStaffLogin}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed rgba(2, 132, 199, 0.4)',
              color: '#38bdf8',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>ورود سریع مدیریت (Safi Sahib - Quick Access)</span>
          </button>
        </div>

        {/* Footer Security Note */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} color="#10b981" />
            <span>پایگاه داده متصل به Supabase Cloud PostgreSQL • امنیت رمزنگاری ۲۵۶ بیتی</span>
          </div>
        </div>
      </div>
    </div>
  );
}
