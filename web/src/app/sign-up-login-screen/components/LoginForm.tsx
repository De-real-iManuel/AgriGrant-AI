'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { rememberMe: false } });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);

    const { error } = await login(data.email, data.password);

    setIsLoading(false);

    if (error) {
      const userMsg =
        error.toLowerCase().includes('invalid login') ||
        error.toLowerCase().includes('invalid credentials') ||
        error.toLowerCase().includes('email not confirmed')
          ? 'Incorrect email or password. Please check your credentials.'
          : error.toLowerCase().includes('email not confirmed')
          ? 'Please verify your email before logging in.'
          : error;
      setServerError(userMsg);
      toast.error(userMsg);
      return;
    }

    toast.success('Welcome back! Redirecting...');
    window.location.href = '/dashboard';
  };

  const handleForgotPassword = async () => {
    const email = resetEmail || getValues('email');
    if (!email) {
      toast.error('Enter your email address first.');
      return;
    }
    setIsSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSendingReset(false);
    if (error) {
      toast.error('Could not send reset email: ' + error.message);
    } else {
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgot(false);
    }
  };

  if (showForgot) {
    return (
      <div className="flex flex-col gap-5">
        <button
          onClick={() => setShowForgot(false)}
          className="flex items-center gap-1.5 text-sm font-medium self-start"
          style={{ color: 'var(--muted-foreground)' }}
        >
          ← Back to login
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
            Reset your password
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            We&apos;ll send a secure link to your email
          </p>
        </div>
        <div>
          <label className="label-base" htmlFor="reset-email">Email Address</label>
          <input
            id="reset-email"
            type="email"
            className="input-base"
            placeholder="you@example.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            autoFocus
          />
        </div>
        <button
          onClick={handleForgotPassword}
          disabled={isSendingReset || !resetEmail}
          className="btn-primary w-full justify-center py-3.5"
        >
          {isSendingReset ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Welcome back
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Sign in to your AgriGrant AI account
        </p>
      </div>

      {serverError && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Email */}
        <div>
          <label className="label-base" htmlFor="login-email">Email Address</label>
          <input
            id="login-email"
            type="email"
            className="input-base"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email address is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            style={{ borderColor: errors.email ? 'var(--destructive)' : undefined }}
          />
          {errors.email && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-base mb-0" htmlFor="login-password">Password</label>
            <button
              type="button"
              onClick={() => {
                setResetEmail(getValues('email') || '');
                setShowForgot(true);
              }}
              className="text-xs font-semibold"
              style={{ color: 'var(--primary)' }}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className="input-base pr-11"
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              style={{ borderColor: errors.password ? 'var(--destructive)' : undefined }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-primary"
            {...register('rememberMe')}
          />
          <span className="text-sm" style={{ color: 'var(--foreground)' }}>
            Remember me for 30 days
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          id="login-submit-btn"
          disabled={isLoading}
          className="btn-primary w-full justify-center py-3.5 mt-1"
          style={{ opacity: isLoading ? 0.8 : 1 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In to AgriGrant'
          )}
        </button>
      </form>

      {/* Info note */}
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--primary)' }}>
          First time here?
        </p>
        <p className="text-sm" style={{ color: '#166534' }}>
          Switch to <strong>Create Account</strong> above to register. After sign-up, you&apos;ll receive a{' '}
          <strong>6-digit code</strong> in your email to verify your account.
        </p>
      </div>
    </div>
  );
}