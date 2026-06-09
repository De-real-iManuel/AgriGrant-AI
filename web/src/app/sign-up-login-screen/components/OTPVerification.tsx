'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface OTPVerificationProps {
  phone: string;
  userName?: string;
  userEmail?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function OTPVerification({ phone, userName = '', userEmail = '', onBack, onSuccess }: OTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(47);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

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

  // Backend integration point: replace with real OTP verification API
  const handleVerify = async (otpValue: string[]) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    // Log the user in via AuthContext
    login(userEmail || `user_${Date.now()}@agrigrant.ng`, userName, 'free');
    setIsVerified(true);
    toast.success('Phone number verified! Redirecting to dashboard...');
    setTimeout(() => onSuccess(), 1200);
  };

  const handleResend = () => {
    setCountdown(47);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    toast.success('New verification code sent to ' + phone);
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
          <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Phone Verified!</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Redirecting you to your dashboard...
          </p>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
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
          Verify your phone
        </h1>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
          We sent a 6-digit code to{' '}
          <span className="font-semibold" style={{ color: 'var(--foreground)' }}>
            +234 {phone}
          </span>
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={`otp-${idx}`}
            ref={(el) => { inputRefs.current[idx] = el; }}
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
            className="text-sm font-semibold transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            Resend verification code
          </button>
        )}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
        Didn't receive it? Check your spam folder or try a different number.
      </p>
    </div>
  );
}