'use client';
import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Copy, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const demoCredentials = {
  email: 'emmanuel.okafor@agrigrant.ng',
  password: 'Farmer@AgriGrant2026',
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { rememberMe: false } });

  const handleCopy = (field: 'email' | 'password') => {
    navigator.clipboard.writeText(demoCredentials[field]);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const autofill = () => {
    setValue('email', demoCredentials.email);
    setValue('password', demoCredentials.password);
    toast.success('Demo credentials filled in');
  };

  // Backend integration point: replace with real auth API call
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);

    if (
      data.email === demoCredentials.email &&
      data.password === demoCredentials.password
    ) {
      login(data.email, 'Emmanuel Okafor', 'free');
      toast.success('Welcome back, Emmanuel!');
      window.location.href = '/dashboard';
    } else {
      // For any other credentials in the demo, log them in as a free user
      login(data.email, data.email.split('@')[0], 'free');
      toast.success('Welcome to AgriGrant AI!');
      window.location.href = '/dashboard';
    }
  };

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

      {/* Demo credentials box */}
      <div
        className="rounded-2xl p-4 flex flex-col gap-3"
        style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
            Demo Account
          </p>
          <button
            onClick={autofill}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
            style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
          >
            Use Demo
          </button>
        </div>
        {(['email', 'password'] as const).map((field) => (
          <div key={`cred-${field}`} className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium capitalize" style={{ color: 'var(--muted-foreground)' }}>
                {field}
              </p>
              <p className="text-xs font-mono truncate mt-0.5" style={{ color: 'var(--foreground)' }}>
                {demoCredentials[field]}
              </p>
            </div>
            <button
              onClick={() => handleCopy(field)}
              className="p-1.5 rounded-lg transition-colors flex-shrink-0"
              style={{ backgroundColor: 'var(--card)', color: 'var(--muted-foreground)' }}
              aria-label={`Copy ${field}`}
            >
              {copiedField === field ? (
                <CheckCheck size={13} style={{ color: 'var(--primary)' }} />
              ) : (
                <Copy size={13} />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}