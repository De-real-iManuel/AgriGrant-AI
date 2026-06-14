'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Send, Bot, Loader2, Sparkles, RefreshCw, MessageSquare, ChevronRight, WifiOff, CheckCircle, AlertTriangle, HelpCircle, Wallet, ClipboardCheck, Sprout, FileEdit, Landmark, Users, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';
import DashboardShell from '../Components/DashboardShell';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedActions?: Array<{ label: string; action: string; data?: any }>;
  isStreaming?: boolean;
}

interface ChatSession {
  sessionId: string;
  token: string;
  greeting: string;
  messages?: ChatMessage[];
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

const QUICK_PROMPTS = [
  { text: 'What grants can I get for poultry farming?', icon: Wallet },
  { text: 'Am I eligible for CBN Anchor Borrowers?', icon: ClipboardCheck },
  { text: 'Tell me about NIRSAL grants for rice farmers', icon: Sprout },
  { text: 'Help me write a grant proposal', icon: FileEdit },
  { text: 'What is the BOA MSME loan?', icon: Landmark },
  { text: 'Are there grants for women farmers in Lagos?', icon: Users },
];

// ── Chat Bubble ────────────────────────────────────────────────────────────────
function ChatBubble({
  msg,
  userName,
  onActionClick,
}: {
  msg: ChatMessage;
  userName: string;
  onActionClick?: (label: string, action: string, data?: any) => void;
}) {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #166534, #22C55E)'
            : 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        }}
      >
        {isUser ? userName.charAt(0).toUpperCase() : <Bot size={15} />}
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}
        style={{
          backgroundColor: isUser ? 'var(--primary)' : 'var(--card)',
          color: isUser ? 'white' : 'var(--foreground)',
          border: isUser ? 'none' : '1px solid var(--border)',
        }}
      >
        {msg.isStreaming ? (
          <span>
            {msg.content}
            <span className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
          </span>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                {msg.suggestedActions.map((action, i) => (
                  <button
                    key={`act-${msg.id}-${i}`}
                    onClick={() => onActionClick?.(action.label, action.action, action.data)}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:scale-[1.02] active:scale-95"
                    style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
                  >
                    {action.label}
                    <ChevronRight size={11} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <div className="flex items-center gap-2 mt-1">
          <p
            className="text-xs opacity-60"
            style={{ color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--muted-foreground)' }}
          >
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {isUser && onActionClick && (
            <button 
              onClick={() => onActionClick('edit', 'EDIT_MESSAGE')}
              className="text-xs opacity-50 hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.9)' }}
              title="Edit this message"
            >
              <Edit2 size={11} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Offline Banner ─────────────────────────────────────────────────────────────
function OfflineBanner() {
  return (
    <div
      className="mx-5 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 flex-shrink-0"
      style={{ backgroundColor: '#FEF9C3', border: '1px solid #FDE68A' }}
    >
      <WifiOff size={15} style={{ color: '#92400E', flexShrink: 0 }} />
      <div>
        <p className="text-xs font-bold" style={{ color: '#92400E' }}>AI Advisor is temporarily unavailable</p>
        <p className="text-xs" style={{ color: '#78350F' }}>
          Our team has been notified. Please try again in a few minutes.
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<any | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('agrigrant_farmer_profile');
      if (stored) {
        setFarmerProfile(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // ── Start session ────────────────────────────────────────────────────────
  const startSession = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setIsConnecting(true);
    setIsOffline(false);

    // Read stored profile directly from localStorage
    let profilePayload = null;
    try {
      const stored = localStorage.getItem('agrigrant_farmer_profile');
      if (stored) {
        profilePayload = JSON.parse(stored);
        setFarmerProfile(profilePayload);
      }
    } catch (e) {}

    let savedSessionId = null;
    if (!silent) {
      try {
        savedSessionId = localStorage.getItem('agrigrant_chat_session_id');
      } catch(e) {}
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerName: user.name,
          farmerProfile: profilePayload,
          sessionId: savedSessionId
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(err)}`);
      }

      const data: ChatSession = await res.json();
      setSession(data);
      try {
        localStorage.setItem('agrigrant_chat_session_id', data.sessionId);
      } catch (e) {}

      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages.map((m: any) => ({
          ...m,
          id: m.id || `msg-${Math.random()}`,
          timestamp: new Date(m.timestamp)
        })));
      } else {
        setMessages([{
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: data.greeting,
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      logger.error('ChatPage', 'Failed to start chat session', err);
      setIsOffline(true);
      // Show a warm local greeting so the user isn't left with a blank screen
      setMessages([{
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Hello${user.name ? `, ${user.name.split(' ')[0]}` : ''}.\n\nI am your AgriGrant AI Advisor. I can assist you in finding grants, verifying your eligibility, and preparing professional applications.\n\nI am currently experiencing connection issues. Please try again in a moment.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  useEffect(() => {
    startSession();
  }, [startSession]);

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!session || !text.trim() || isLoading) return;

    setIsLoading(true);
    setIsOffline(false);

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ sessionId: session.sessionId, message: text }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(errBody)}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: data.message?.content ?? 'I didn\'t quite catch that. Could you rephrase?',
        timestamp: new Date(data.message?.timestamp ?? Date.now()),
        suggestedActions: data.message?.suggestedActions ?? [],
      }]);
    } catch (err) {
      logger.error('ChatPage', 'Failed to send chat message', err);
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I couldn\'t process that right now. Please try again — I\'m standing by.',
        timestamp: new Date(),
      }]);
      // Don't toast backend errors to the user — the in-chat message is enough
    } finally {
      setIsLoading(false);
    }
  }, [session, isLoading]);

  const editLastMessage = useCallback(async () => {
    if (!session || isLoading) return;
    
    // Find the last user message text
    const lastUserMsgIndex = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return;
    
    const realIndex = messages.length - 1 - lastUserMsgIndex;
    const textToEdit = messages[realIndex].content;
    
    // Put it back in the input box
    setInput(textToEdit);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    // Remove the last user message and the subsequent assistant response from UI
    setMessages(prev => prev.slice(0, realIndex));
    
    // Tell backend to edit/remove
    try {
      await fetch(`${BACKEND_URL}/api/chat/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ sessionId: session.sessionId, message: 'EDIT_DUMMY' }),
      });
    } catch(e) {
      console.error("Failed to edit in backend", e);
    }
  }, [session, messages, isLoading]);

  const handleSend = useCallback(async (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || isLoading || isConnecting) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setMessages((prev) => [...prev, {
      id: `u-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    }]);

    await sendMessage(message);
  }, [input, isLoading, isConnecting, sendMessage]);

  const handleActionClick = useCallback((label: string, action: string, data?: any) => {
    if (action === 'GO_TO_PORTAL') {
      router.push('/farmer-portal');
    } else if (action === 'OPEN_GRANT') {
      toast.info(`Opening grant application portal for ${data?.grantName || 'this grant'}`);
      if (data?.applicationUrl) {
        window.open(data.applicationUrl, '_blank');
      }
    } else if (action === 'EDIT_MESSAGE') {
      editLastMessage();
    } else {
      handleSend(label);
    }
  }, [router, handleSend, editLastMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canType = !!session && !isLoading && !isConnecting;

  return (
    <DashboardShell
      title="AI Grant Advisor"
      subtitle="Ask about grants, eligibility, and applications. I am here to assist."
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Window Container */}
        <div
          className="lg:col-span-3 flex flex-col rounded-2xl overflow-hidden"
          style={{
            height: 'calc(100vh - 200px)',
            minHeight: '550px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)' }}
              >
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                  AgriGrant AI Advisor
                </p>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: isConnecting ? '#F59E0B' : isOffline ? '#EF4444' : session ? '#22C55E' : '#94A3B8',
                    }}
                  />
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {isConnecting ? 'Connecting...' : isOffline ? 'Temporarily unavailable' : session ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Toggle Sidebar Info */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
                style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
              >
                <HelpCircle size={14} />
                {showSidebar ? 'Hide Profile Context' : 'Show Profile Context'}
              </button>

              <button
                onClick={() => {
                  try { localStorage.removeItem('agrigrant_chat_session_id'); } catch(e){}
                  setMessages([]); setSession(null); startSession(true);
                }}
                className="p-2 rounded-lg transition-colors hover:bg-muted"
                style={{ color: 'var(--muted-foreground)' }}
                title="Start new conversation"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Warning Banner if profile not loaded */}
          {!farmerProfile && (
            <div
              className="px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b flex-shrink-0"
              style={{ backgroundColor: 'rgba(234, 179, 8, 0.08)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">No Farm Profile Loaded</p>
                  <p className="text-xs text-amber-700/90 mt-0.5">
                    The AI is running in general Q&A mode. Complete the intake form to unlock personalized grant discovery, custom eligibility scoring, and tailored proposal generation.
                  </p>
                </div>
              </div>
              <Link
                href="/farmer-portal"
                className="btn-primary text-xs px-4 py-2 font-bold whitespace-nowrap self-stretch sm:self-auto text-center justify-center"
                style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}
              >
                Complete Intake Form
              </Link>
            </div>
          )}

          {/* Offline banner */}
          {isOffline && <OfflineBanner />}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {isConnecting && messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Starting your session...
                  </p>
                </div>
              </div>
            )}

            {!isConnecting && messages.length <= 1 && (
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                    Try asking
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map((prompt, i) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={`qp-${i}`}
                        onClick={() => handleSend(prompt.text)}
                        disabled={!canType}
                        className="flex items-center gap-2 text-left px-4 py-3 rounded-xl text-xs sm:text-sm transition-all duration-150 hover:bg-muted hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          color: 'var(--foreground)',
                        }}
                      >
                        <Icon size={16} style={{ color: 'var(--muted-foreground)' }} />
                        <span>{prompt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} userName={user?.name ?? 'You'} onActionClick={handleActionClick} />
            ))}

            {isLoading && (
              <div className="flex gap-3 items-end">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)' }}
                >
                  <Bot size={15} />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-bl-md"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={`dot-${i}`}
                        className="w-1.5 h-1.5 rounded-full animate-bounce"
                        style={{ backgroundColor: 'var(--primary)', animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-4 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
          >
            <div
              className="flex items-end gap-3 rounded-2xl px-4 py-3"
              style={{
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--background)',
              }}
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  isConnecting ? 'Starting session...'
                  : isOffline ? 'Temporarily unavailable — try again soon'
                  : 'Ask about grants, eligibility, or request proposal generation...'
                }
                disabled={!canType}
                className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed disabled:opacity-50"
                style={{ color: 'var(--foreground)', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || !canType}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-40"
                style={{
                  backgroundColor: input.trim() && canType ? 'var(--primary)' : 'var(--muted)',
                  color: input.trim() && canType ? 'white' : 'var(--muted-foreground)',
                }}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted-foreground)' }}>
              <MessageSquare size={10} className="inline mr-1" />
              Press{' '}
              <kbd className="px-1 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: 'var(--muted)' }}>Enter</kbd>{' '}
              to send ·{' '}
              <kbd className="px-1 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: 'var(--muted)' }}>Shift+Enter</kbd>{' '}
              for new line
            </p>
          </div>
        </div>

        {/* Sidebar Context */}
        {showSidebar && (
          <div
            className="flex flex-col rounded-2xl p-5 border flex-shrink-0 overflow-y-auto"
            style={{
              height: 'calc(100vh - 200px)',
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)',
            }}
          >
            <div className="flex flex-col gap-5">
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                  Active AI Context
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  The parameters the AI uses to reason over your grants
                </p>
              </div>

              {farmerProfile ? (
                <>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: '#DCFCE7', color: 'var(--primary)' }}
                  >
                    <CheckCircle size={14} />
                    Intake Profile Loaded
                  </div>

                  <div className="flex flex-col gap-3.5 text-xs">
                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Farm Name</span>
                      <span className="font-semibold text-right" style={{ color: 'var(--foreground)' }}>{farmerProfile.farmerName}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>State</span>
                      <span className="font-semibold text-right" style={{ color: 'var(--foreground)' }}>{farmerProfile.stateOfResidence}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Farm Type</span>
                      <span className="font-semibold text-right" style={{ color: 'var(--foreground)' }}>{farmerProfile.farmType}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Size (Hectares)</span>
                      <span className="font-semibold text-right" style={{ color: 'var(--foreground)' }}>{farmerProfile.farmSizeHectares ? `${farmerProfile.farmSizeHectares} ha` : 'Not specified'}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>BVN Status</span>
                      <span className="font-semibold text-right" style={{ color: farmerProfile.hasBVN ? 'var(--primary)' : 'var(--destructive)' }}>
                        {farmerProfile.hasBVN ? 'Connected' : 'Missing'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>CAC Registered</span>
                      <span className="font-semibold text-right" style={{ color: farmerProfile.hasCACRegistration ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                        {farmerProfile.hasCACRegistration ? 'Yes' : 'No'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Cooperative</span>
                      <span className="font-semibold text-right" style={{ color: farmerProfile.isMemberOfCooperative ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                        {farmerProfile.isMemberOfCooperative ? 'Member' : 'Not Member'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>CRMS Loan Default</span>
                      <span className="font-semibold text-right" style={{ color: farmerProfile.hasExistingLoanDefault ? 'var(--destructive)' : 'var(--primary)' }}>
                        {farmerProfile.hasExistingLoanDefault ? 'Active Default' : 'None'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/farmer-portal"
                    className="btn-secondary text-xs px-4 py-2.5 justify-center mt-2 text-center"
                  >
                    Edit Profile Details
                  </Link>
                </>
              ) : (
                <>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}
                  >
                    <AlertTriangle size={14} />
                    Generic Mode Active
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    No farmer profile was detected in local storage. The AI will respond with general information.
                  </p>
                  <Link
                    href="/farmer-portal"
                    className="btn-primary text-xs px-4 py-2.5 justify-center mt-2 text-center"
                    style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}
                  >
                    Calculate Readiness
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
