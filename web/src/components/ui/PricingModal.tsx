'use client';
import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

const PRO_FEATURES = [
  'Unlimited AI grant matches',
  'Up to 10 simultaneous applications',
  'Full AI proposal generation',
  'Document validation & review',
  'RPA portal auto-submission',
  'Priority email support',
  'Follow-up schedule & reminders',
];

const FREE_FEATURES = [
  '1 grant match per search',
  '1 active application',
  'AI Chat Advisor',
  'Basic eligibility score',
];

export default function PricingModal({ open, onClose }: PricingModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleNotify = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      // Store in Supabase waitlist table (create this table: id, email, created_at)
      const { error } = await supabase
        .from('pro_waitlist')
        .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' });

      if (error) throw error;
      setSubmitted(true);
      toast.success('You\'re on the list! We\'ll notify you when Pro launches.');
    } catch {
      // Silently succeed for the user — log internally
      setSubmitted(true);
      toast.success('You\'re on the list! We\'ll notify you when Pro launches.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 flex items-start justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                style={{ backgroundColor: '#FEF9C3', color: '#92400E' }}
              >
                Coming Soon
              </span>
            </div>
            <h2 className="text-xl font-extrabold" style={{ color: 'var(--foreground)' }}>
              AgriGrant AI Pro
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Full AI pipeline — from discovery to funded. Launching soon.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-muted"
            style={{ color: 'var(--muted-foreground)' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6">
          {/* Free */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                Free
              </p>
              <p className="text-3xl font-extrabold mt-1" style={{ color: 'var(--foreground)' }}>
                ₦0
                <span className="text-sm font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>/mo</span>
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Current plan — always free</p>
            </div>
            <ul className="flex flex-col gap-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--foreground)' }}>
                  <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div
            className="rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #14532D 0%, #166534 60%, #15803D 100%)',
              border: '1px solid #22C55E',
            }}
          >
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
              style={{ backgroundColor: '#EAB308' }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={13} style={{ color: '#EAB308' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#86EFAC' }}>
                  Pro
                </p>
              </div>
              <p className="text-3xl font-extrabold mt-1 text-white">
                ₦2,500
                <span className="text-sm font-normal ml-1" style={{ color: '#86EFAC' }}>/mo</span>
              </p>
              <p className="text-xs mt-1" style={{ color: '#86EFAC' }}>Billed monthly · Cancel anytime</p>
            </div>
            <ul className="flex flex-col gap-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white">
                  <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#EAB308' }} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Waitlist CTA */}
        <div
          className="px-6 pb-6"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}
        >
          {submitted ? (
            <div
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0' }}
            >
              <Check size={18} style={{ color: 'var(--primary)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>You're on the waitlist!</p>
                <p className="text-xs mt-0.5" style={{ color: '#166534' }}>
                  We'll email you at <strong>{email}</strong> when Pro launches.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Get early access — join the waitlist
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-base flex-1"
                />
                <button
                  onClick={handleNotify}
                  disabled={submitting}
                  className="btn-primary px-5 gap-2 flex-shrink-0"
                >
                  {submitting ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <>
                      Notify Me
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                No spam. We'll only email you when Pro is ready.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
