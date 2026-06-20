'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import OTPVerification from './OTPVerification';
import { useAuth } from '@/context/AuthContext';

type AuthStep = 'login' | 'signup' | 'otp';

interface SignupPayload {
  phone: string;
  name: string;
  email: string;
}

export default function AuthScreen() {
  const [step, setStep] = useState<AuthStep>('login');
  const [signupPayload, setSignupPayload] = useState<SignupPayload>({
    phone: '',
    name: '',
    email: '',
  });
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect already-authenticated users straight to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSignupSuccess = (phone: string, name: string, email: string) => {
    setSignupPayload({ phone, name, email });
    setStep('otp');
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-2/5 flex-col justify-between p-10 xl:p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #14532D 0%, #166534 40%, #15803D 100%)' }}
      >
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--accent)' }}
        />
        <div
          className="absolute bottom-20 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: 'var(--secondary)' }}
        />

        <div className="flex items-center gap-2.5 relative z-10">
          <AppLogo size={40} />
          <span className="font-bold text-xl text-white">
            AgriGrant <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Funding Intelligence for Modern Agriculture
            </h2>
            <p className="mt-4 text-base leading-relaxed" style={{ color: '#BBF7D0' }}>
              Join 2,400+ Nigerian farmers using AI to discover grants, build proposals, and secure
              funding.
            </p>
          </div>

          <div
            className="p-5 rounded-2xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <p className="text-sm leading-relaxed text-white italic">
              "AgriGrant AI helped me secure CBN Anchor Borrowers funding in 3 days. The AI wrote my
              proposal and the agents handled everything — I just reviewed and approved."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                E
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Emmanuel Okafor</p>
                <p className="text-xs" style={{ color: '#86EFAC' }}>
                  Cassava Farmer, Delta State
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'as-match', value: '92%', label: 'Match Accuracy' },
              { id: 'as-agents', value: '5', label: 'AI Agents' },
              { id: 'as-grants', value: '200+', label: 'Grants Tracked' },
            ].map((s) => (
              <div
                key={s.id}
                className="flex flex-col items-center p-3 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <p className="text-xl font-extrabold text-white tabular-nums">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#86EFAC' }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs relative z-10" style={{ color: '#86EFAC' }}>
          © 2026 AgriGrant AI · Simple · Secure · Built for Real Impact
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-10 xl:p-16 overflow-y-auto">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <AppLogo size={36} />
          <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>
            AgriGrant <span style={{ color: 'var(--accent)' }}>AI</span>
          </span>
        </div>

        <div className="w-full max-w-md">
          {step === 'otp' ? (
            <OTPVerification
              phone={signupPayload.phone}
              userName={signupPayload.name}
              userEmail={signupPayload.email}
              onBack={() => setStep('signup')}
              onSuccess={() => router.replace('/dashboard')}
            />
          ) : (
            <>
              <div className="flex p-1 rounded-xl mb-8" style={{ backgroundColor: 'var(--muted)' }}>
                {(['login', 'signup'] as const).map((tab) => (
                  <button
                    key={`tab-${tab}`}
                    onClick={() => setStep(tab)}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: step === tab ? 'var(--card)' : 'transparent',
                      color: step === tab ? 'var(--primary)' : 'var(--muted-foreground)',
                      boxShadow: step === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {tab === 'login' ? 'Login' : 'Create Account'}
                  </button>
                ))}
              </div>

              {step === 'login' ? <LoginForm /> : <SignUpForm onSuccess={handleSignupSuccess} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
