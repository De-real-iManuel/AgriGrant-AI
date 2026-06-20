'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface SignUpFormData {
  fullName: string;
  phone: string;
  email: string;
  state: string;
  lga: string;
  farmType: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

const nigerianStates = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

const farmTypes = [
  'Smallholder Farmer',
  'Cooperative Society',
  'Agribusiness SME',
  'Commercial Farm',
  'Youth Agripreneur',
  'Women Farmer Group',
  'Irrigation Farm',
  'Livestock Farmer',
];

interface SignUpFormProps {
  onSuccess: (phone: string, name: string, email: string) => void;
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { refreshUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();

  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setServerError(null);

    // 1. Register with Supabase — triggers a 6-digit OTP confirmation email
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        // Store profile data in user_metadata (accessible as supabaseUser.user_metadata)
        data: {
          full_name: data.fullName,
          phone: data.phone,
          state: data.state,
          lga: data.lga,
          farm_type: data.farmType,
          plan: 'free',
        },
        // Supabase sends a 6-digit OTP when emailConfirmations uses OTP mode
        // Configure in Supabase Dashboard → Auth → Email → "Use OTP" = ON
        emailRedirectTo: undefined,
      },
    });

    setIsLoading(false);

    if (error) {
      // Surface meaningful errors
      if (error.message.toLowerCase().includes('already registered')) {
        setServerError('This email is already registered. Please log in instead.');
      } else {
        setServerError(error.message);
      }
      toast.error(error.message);
      return;
    }

    // Always go to OTP verification — even if Supabase returns a session,
    // we require the user to confirm their email before entering the dashboard.
    toast.success(`A 6-digit confirmation code has been sent to ${data.email}`);
    onSuccess(data.phone, data.fullName, data.email);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Create your account
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          Start your AI-powered grant journey today — free to join
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
        {/* Full Name */}
        <div>
          <label className="label-base" htmlFor="su-fullname">
            Full Name
          </label>
          <input
            id="su-fullname"
            type="text"
            className="input-base"
            placeholder="e.g. Emmanuel Okafor"
            autoComplete="name"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 3, message: 'Name must be at least 3 characters' },
            })}
            style={{ borderColor: errors.fullName ? 'var(--destructive)' : undefined }}
          />
          {errors.fullName && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="label-base" htmlFor="su-phone">
            Phone Number
          </label>
          <p className="text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            We&apos;ll use this to contact you about your grants
          </p>
          <div className="flex gap-2">
            <div
              className="flex items-center gap-1.5 px-3 rounded-xl border text-sm font-semibold flex-shrink-0"
              style={{
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            >
              🇳🇬 +234
            </div>
            <input
              id="su-phone"
              type="tel"
              className="input-base flex-1"
              placeholder="803 XXX XXXX"
              autoComplete="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Enter a valid Nigerian phone number',
                },
              })}
              style={{ borderColor: errors.phone ? 'var(--destructive)' : undefined }}
            />
          </div>
          {errors.phone && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="label-base" htmlFor="su-email">
            Email Address
          </label>
          <p className="text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            A 6-digit confirmation code will be sent here
          </p>
          <input
            id="su-email"
            type="email"
            className="input-base"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
            style={{ borderColor: errors.email ? 'var(--destructive)' : undefined }}
          />
          {errors.email && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* State + LGA */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-base" htmlFor="su-state">
              Farm State
            </label>
            <div className="relative">
              <select
                id="su-state"
                className="input-base appearance-none pr-8"
                {...register('state', { required: 'State is required' })}
                style={{ borderColor: errors.state ? 'var(--destructive)' : undefined }}
              >
                <option value="">Select State</option>
                {nigerianStates.map((s) => (
                  <option key={`state-${s}`} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--muted-foreground)' }}
              />
            </div>
            {errors.state && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
                {errors.state.message}
              </p>
            )}
          </div>
          <div>
            <label className="label-base" htmlFor="su-lga">
              LGA
            </label>
            <input
              id="su-lga"
              type="text"
              className="input-base"
              placeholder="e.g. Warri"
              {...register('lga', { required: 'LGA is required' })}
              style={{ borderColor: errors.lga ? 'var(--destructive)' : undefined }}
            />
            {errors.lga && (
              <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
                {errors.lga.message}
              </p>
            )}
          </div>
        </div>

        {/* Farm Type */}
        <div>
          <label className="label-base" htmlFor="su-farmtype">
            Farm Type
          </label>
          <p className="text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            This helps us match you with the most relevant grants
          </p>
          <div className="relative">
            <select
              id="su-farmtype"
              className="input-base appearance-none pr-8"
              {...register('farmType', { required: 'Farm type is required' })}
              style={{ borderColor: errors.farmType ? 'var(--destructive)' : undefined }}
            >
              <option value="">Select Farm Type</option>
              {farmTypes.map((t) => (
                <option key={`farmtype-${t}`} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--muted-foreground)' }}
            />
          </div>
          {errors.farmType && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.farmType.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="label-base" htmlFor="su-password">
            Password
          </label>
          <div className="relative">
            <input
              id="su-password"
              type={showPassword ? 'text' : 'password'}
              className="input-base pr-11"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must include uppercase, lowercase, and a number',
                },
              })}
              style={{ borderColor: errors.password ? 'var(--destructive)' : undefined }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md"
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

        {/* Confirm Password */}
        <div>
          <label className="label-base" htmlFor="su-confirm">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="su-confirm"
              type={showConfirm ? 'text' : 'password'}
              className="input-base pr-11"
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              style={{ borderColor: errors.confirmPassword ? 'var(--destructive)' : undefined }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md"
              style={{ color: 'var(--muted-foreground)' }}
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded mt-0.5 accent-primary flex-shrink-0"
              {...register('terms', { required: 'You must agree to the terms to continue' })}
            />
            <span className="text-sm" style={{ color: 'var(--foreground)' }}>
              I agree to AgriGrant AI&apos;s{' '}
              <Link
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
                style={{ color: 'var(--primary)' }}
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline underline-offset-2"
                style={{ color: 'var(--primary)' }}
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--destructive)' }}>
              {errors.terms.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          id="signup-submit-btn"
          className="btn-primary w-full justify-center py-3.5 mt-1"
          style={{ opacity: isLoading ? 0.8 : 1 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating your account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
