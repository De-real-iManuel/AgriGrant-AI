'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface OTPVerificationProps {
  phone: string;
  userName?: string;
  userEmail?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function OTPVerification({
  phone,
  userName = '',
  userEmail = '',
  onBack,
  onSuccess,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { refreshUser } = useAuth();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (idx: number, val: string) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (newOtp.every((d) => d !== '') && val) {
      handleVerify(newOtp);
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      handleVerify(pasted.split(''));
    }
  };

  /**
   * Verify the 6-digit OTP code with Supabase.
   * Supabase supports email OTP via: verifyOtp({ email, token, type: 'signup' })
   */
  const handleVerify = async (otpValue: string[]) => {
    if (!userEmail) {
      toast.error('Email address is missing. Please go back and try again.');
      return;
    }
    setIsLoading(true);
    setVerifyError(null);

    const tokenCode = otpValue.join('');

    const { error } = await supabase.auth.verifyOtp({
      email: userEmail,
      token: tokenCode,
      type: 'signup',
    });

    setIsLoading(false);

    if (error) {
      const msg =
        error.message.includes('expired') || error.message.includes('invalid')
          ? 'Invalid or expired code. Please try again or request a new code.'
          : error.message;
      setVerifyError(msg);
      toast.error(msg);
      // Reset inputs for retry
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    // OTP verified — refresh the AuthContext session
    await refreshUser();
    setIsVerified(true);
    toast.success('Email verified! Welcome to AgriGrant AI!');
    setTimeout(() => onSuccess(), 1200);
  };

  /**
   * Resend a new OTP by triggering signUp again with same email.
   * Supabase resends a fresh OTP to the existing unconfirmed user.
   */
  const handleResend = async () => {
    if (!userEmail) return;
    setIsResending(true);
    setVerifyError(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: userEmail,
    });

    setIsResending(false);

    if (error) {
      toast.error('Could not resend code: ' + error.message);
      return;
    }

    setCountdown(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    toast.success('New 6-digit code sent to ' + userEmail);
  };

  if (isVerified) {
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#DCFCE7' }}
        >
          <CheckCircle size={40} style={{ color: 'var(--primary)' }} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
            Email Verified!
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Redirecting you to your dashboard...
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium self-start transition-colors"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Verify your email
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          We sent a{' '}
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            6-digit confirmation code
          </span>{' '}
          to{' '}
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {userEmail}
          </span>
          . Check your inbox (and spam folder).
        </p>
      </div>

      {/* Error display */}
      {verifyError && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          {verifyError}
        </div>
      )}

      {/* OTP inputs */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={`otp-${idx}`}
            ref={(el) => {
              inputRefs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            className="otp-input"
            aria-label={`OTP digit ${idx + 1}`}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2" style={{ color: 'var(--primary)' }}>
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm font-medium">Verifying code...</span>
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Resend code in{' '}
            <span className="font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
              {countdown}s
            </span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="text-sm font-semibold flex items-center gap-1.5 mx-auto transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            {isResending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw size={13} />
                Resend confirmation code
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
        Didn&apos;t receive it? Check your spam folder or try a different email.
      </p>
    </div>
  );
}
