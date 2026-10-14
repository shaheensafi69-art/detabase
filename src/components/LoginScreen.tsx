'use client';

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  Sparkles,
  Briefcase,
  KeyRound,
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
        (emailInput.toLowerCase() === 'admin' ||
          emailInput.toLowerCase() === 'safi' ||
          emailInput.toLowerCase() === 'safi@s4hel.com') &&
        (passwordInput === 'admin' || passwordInput === '123456' || passwordInput === 's4hel2026')
      ) {
        onLogin({
          name: 'Shaheen Safi',
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
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. If you do not have an account, please switch to the Sign Up tab.');
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
      setError(err.message || 'An error occurred while signing in. Please check your credentials.');
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
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
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
        setSuccessMessage('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          onLogin({
            name: fullName || 'New User',
            role: signupRole,
            email: data.user?.email,
          });
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Quick Staff Login Bypass
  const handleQuickDemoLogin = () => {
    onLogin({
      name: 'Shaheen Safi',
      role: 'Head of Operations & Lead Accountant',
      email: 'safi@s4hel.com',
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 30%, #0c213b 0%, #06111f 65%, #030811 100%)',
        position: 'relative',
        padding: '24px',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        direction: 'ltr',
      }}
    >
      {/* Decorative ambient background rings */}
      <div
        style={{
          position: 'absolute',
          width: '750px',
          height: '750px',
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
          width: '1050px',
          height: '1050px',
          borderRadius: '50%',
          border: '1px solid rgba(2, 132, 199, 0.04)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
        }}
      />

      {/* Main Glassmorphic Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(10, 25, 47, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(2, 132, 199, 0.35)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(2, 132, 199, 0.18)',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.25) 0%, rgba(249, 115, 22, 0.2) 100%)',
              border: '1px solid rgba(2, 132, 199, 0.45)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              marginBottom: '14px',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="S4 HEL Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#f8fafc',
              margin: '0 0 6px 0',
              letterSpacing: '-0.3px',
            }}
          >
            {DEFAULT_OFFICE_NAME}
          </h1>

          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 14px 0', lineHeight: 1.5 }}>
            Enterprise Accounting & Financial Operations Portal
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '4px 12px',
              color: '#34d399',
              fontSize: '11.5px',
              fontWeight: 700,
            }}
          >
            <ShieldCheck size={14} color="#10b981" />
            <span>Immutable Ledger Policy Active</span>
          </div>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
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
            <span>Sign In</span>
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
            <span>Sign Up</span>
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
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Email or Username</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>safi@s4hel.com</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter email or username..."
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
              <label className="form-label" style={{ color: '#cbd5e1' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter account password..."
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
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: 800,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.45)',
              }}
            >
              <span>{loading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          /* ================= MODE: SIGN UP ================= */
          <form onSubmit={handleSignupSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Shaheen Safi"
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

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Official Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="staff@s4hel.com"
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

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Department & Role</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  className="form-select"
                  style={{ paddingLeft: '40px' }}
                >
                  <option value="Head of Operations & Lead Accountant">Head of Operations & Lead Accountant</option>
                  <option value="Exchange & Cashout Officer">Exchange & Cash-Out Officer (TikTok / Wise)</option>
                  <option value="Account Creation & Banking Specialist">Account Creation & Banking Specialist</option>
                  <option value="Financial Auditor & Compliance">Financial Auditor & Compliance Officer</option>
                </select>
                <Briefcase
                  size={18}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ color: '#cbd5e1' }}>Password (Min. 6 characters)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Set strong password..."
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
              <label className="form-label" style={{ color: '#cbd5e1' }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  placeholder="Repeat your password..."
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
                padding: '13px',
                fontSize: '14.5px',
                fontWeight: 800,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                boxShadow: '0 6px 20px rgba(234, 88, 12, 0.45)',
              }}
            >
              <span>{loading ? 'Creating Staff Account...' : 'Register New Account'}</span>
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Quick Staff Access Bypass */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            style={{
              background: 'transparent',
              border: '1px dashed rgba(2, 132, 199, 0.4)',
              color: '#38bdf8',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Sparkles size={14} color="#f59e0b" />
            <span>Direct Access (Shaheen Safi - Quick Access)</span>
          </button>
        </div>

        {/* Footer Security Badge */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <ShieldCheck size={14} color="#0284c7" />
          <span>256-Bit SSL Encryption • Supabase Cloud PostgreSQL</span>
        </div>
      </div>
    </div>
  );
}
