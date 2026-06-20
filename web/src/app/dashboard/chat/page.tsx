'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  Loader2,
  Sparkles,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Wallet,
  ClipboardCheck,
  Sprout,
  FileEdit,
  Landmark,
  Users,
  Edit2,
  History,
  PlusCircle,
} from 'lucide-react';
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
  { text: 'What is the BOA MSME grant?', icon: Landmark },
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
            <span
              className="inline-block w-1.5 h-4 ml-0.5 rounded-sm animate-pulse"
              style={{ backgroundColor: 'var(--primary)' }}
            />
          </span>
        ) : (
          <>
            <div className="text-sm leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }: any) => (
                    <p className="m-0 mb-1 whitespace-pre-wrap" {...props} />
                  ),
                  ul: ({ node, ...props }: any) => (
                    <ul className="my-1 ml-4 list-disc" {...props} />
                  ),
                  ol: ({ node, ...props }: any) => (
                    <ol className="my-1 ml-4 list-decimal" {...props} />
                  ),
                  li: ({ node, ...props }: any) => <li className="my-0.5" {...props} />,
                  strong: ({ node, ...props }: any) => <strong className="font-bold" {...props} />,
                  em: ({ node, ...props }: any) => <em className="italic" {...props} />,
                  h1: ({ node, ...props }: any) => (
                    <h3 className="font-bold text-base mt-2 mb-1" {...props} />
                  ),
                  h2: ({ node, ...props }: any) => (
                    <h3 className="font-bold text-base mt-2 mb-1" {...props} />
                  ),
                  h3: ({ node, ...props }: any) => (
                    <h4 className="font-bold text-sm mt-2 mb-1" {...props} />
                  ),
                  code: ({ node, inline, ...props }: any) =>
                    inline ? (
                      <code
                        className="px-1 py-0.5 rounded text-xs font-mono"
                        style={{ backgroundColor: 'var(--muted)' }}
                        {...props}
                      />
                    ) : (
                      <code
                        className="block p-2 my-1 rounded text-xs font-mono overflow-x-auto"
                        style={{ backgroundColor: 'var(--muted)' }}
                        {...props}
                      />
                    ),
                  a: ({ node, ...props }: any) => (
                    <a
                      className="underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)' }}
                      {...props}
                    />
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
            {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div
                className="flex flex-wrap gap-2 mt-3 pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
              >
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
        <p className="text-xs font-bold" style={{ color: '#92400E' }}>
          AI Advisor is temporarily unavailable
        </p>
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
  const [pipelineActive, setPipelineActive] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineStages, setPipelineStages] = useState<
    Array<{
      stage: string;
      icon: string;
      label: string;
      detail?: string;
      timestamp: number;
      data?: any;
    }>
  >([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [pipelinePanelCollapsed, setPipelinePanelCollapsed] = useState(false);

  // History sidebar state
  const [historyOpen, setHistoryOpen] = useState(true);
  const [sessionHistory, setSessionHistory] = useState<
    Array<{ sessionId: string; title: string; timestamp: string }>
  >([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load profile and history from backend/localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('agrigrant_farmer_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && user?.id) {
          parsed.userId = user.id;
        }
        setFarmerProfile(parsed);
      }
    } catch (e) {}

    if (user?.id) {
      fetch(`${BACKEND_URL}/api/pipeline/full-history/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load history');
          return res.json();
        })
        .then((data) => {
          if (data.sessions) {
            const mapped = data.sessions.map((s: any) => {
              const firstUserMsg = s.messages?.find((m: any) => m.role === 'user');
              const title = firstUserMsg?.content
                ? firstUserMsg.content.length > 30
                  ? firstUserMsg.content.substring(0, 27) + '...'
                  : firstUserMsg.content
                : `Advisory Session (${new Date(s.created_at || s.last_active).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`;
              return {
                sessionId: s.session_id,
                title,
                timestamp: s.created_at || s.last_active,
              };
            });
            setSessionHistory(mapped);
            localStorage.setItem('agrigrant_chat_sessions', JSON.stringify(mapped));
          }
        })
        .catch((err) => {
          logger.error('ChatHistory', 'Failed to fetch full-history from backend', err);
          try {
            const storedSessions = localStorage.getItem('agrigrant_chat_sessions');
            if (storedSessions) {
              setSessionHistory(JSON.parse(storedSessions));
            }
          } catch (e) {}
        });
    }

    if (window.innerWidth < 1024) {
      setHistoryOpen(false);
    }
  }, [user?.id]);

  // ── Start session ────────────────────────────────────────────────────────
  const startSession = useCallback(
    async (silent = false, specificSessionId?: string | null) => {
      if (!user) return;
      if (!silent) setIsConnecting(true);
      setIsOffline(false);

      // Read stored profile directly from localStorage
      let profilePayload = null;
      try {
        const stored = localStorage.getItem('agrigrant_farmer_profile');
        if (stored) {
          profilePayload = JSON.parse(stored);
          if (profilePayload && user.id) {
            profilePayload.userId = user.id;
          }
          setFarmerProfile(profilePayload);
        }
      } catch (e) {}

      let savedSessionId = specificSessionId;
      if (savedSessionId === undefined) {
        try {
          savedSessionId = localStorage.getItem('agrigrant_chat_session_id');
        } catch (e) {}
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/chat/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerName: user.name,
            farmerProfile: profilePayload,
            sessionId: savedSessionId,
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

          // Update session list in localStorage
          const storedSessions = localStorage.getItem('agrigrant_chat_sessions');
          let sessionsList = storedSessions ? JSON.parse(storedSessions) : [];
          const exists = sessionsList.some((s: any) => s.sessionId === data.sessionId);
          if (!exists) {
            sessionsList.unshift({
              sessionId: data.sessionId,
              title: `Advisory Session (${new Date().toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`,
              timestamp: new Date().toISOString(),
            });
            localStorage.setItem('agrigrant_chat_sessions', JSON.stringify(sessionsList));
            setSessionHistory(sessionsList);
          }
        } catch (e) {}

        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: any) => ({
              ...m,
              id: m.id || `msg-${Math.random()}`,
              timestamp: new Date(m.timestamp),
            }))
          );
        } else {
          setMessages([
            {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: data.greeting,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        logger.error('ChatPage', 'Failed to start chat session', err);
        setIsOffline(true);
        // Show a warm local greeting so the user isn't left with a blank screen
        setMessages([
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: `Hello${user.name ? `, ${user.name.split(' ')[0]}` : ''}.\n\nI am your AgriGrant AI Advisor. I can assist you in finding grants, verifying your eligibility, and preparing professional applications.\n\nI am currently experiencing connection issues. Please try again in a moment.`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsConnecting(false);
      }
    },
    [user]
  );

  const startNewSession = useCallback(() => {
    try {
      localStorage.removeItem('agrigrant_chat_session_id');
    } catch (e) {}
    setMessages([]);
    setSession(null);
    startSession(true, null);
  }, [startSession]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setIsConnecting(true);
      startSession(true, sessionId);
    },
    [startSession]
  );

  useEffect(() => {
    startSession();
  }, [startSession]);

  // ── Live pipeline stages (SSE) ───────────────────────────────────────────
  // Persistent: stages accumulate in `pipelineStages` and stay visible even
  // after the run finishes (until farmer dismisses the panel manually).
  // Interactive: for grant_selection_required and proposal_review_required
  // we render rich interactive cards as assistant messages.
  useEffect(() => {
    let jobId: string | null = null;
    try {
      jobId = localStorage.getItem('agrigrant_active_pipeline_job');
    } catch (e) {}
    if (!jobId) return;
    setActiveJobId(jobId);
    setPipelineActive(true);
    setPipelineError(null);

    const es = new EventSource(`${BACKEND_URL}/api/pipeline/events/${jobId}`);
    const seen = new Set<string>();

    es.onmessage = (ev) => {
      try {
        const stage = JSON.parse(ev.data);
        const key = `${stage.stage}:${stage.timestamp}`;
        if (seen.has(key)) return;
        seen.add(key);

        // 1) Persistent timeline panel
        setPipelineStages((prev) => [...prev, stage]);

        // 2) Interactive cards for HITL stages
        if (stage.stage === 'grant_selection_required') {
          const grants: any[] = stage.data?.matchedGrants || [];
          setMessages((prev) => [
            ...prev,
            {
              id: `grant-pick-${key}`,
              role: 'assistant',
              content:
                `**Choose a grant to apply to** — we found ${grants.length} matches. Pick the one you'd like our agents to prepare:\n\n` +
                grants
                  .map(
                    (g, i) =>
                      `**${i + 1}. ${g.grantName}** _(${g.matchScore || '--'}%)_\n_${g.grantingOrganization || ''}_\n${g.matchReason || ''}`
                  )
                  .join('\n\n'),
              timestamp: new Date(stage.timestamp * 1000),
              suggestedActions: grants.map((g) => ({
                label: `Apply to ${g.grantName}`,
                action: 'SELECT_GRANT',
                data: g,
              })),
            },
          ]);
        } else if (stage.stage === 'proposal_review_required') {
          const proposalText = stage.data?.applicationLetterText || stage.data?.proposalText || '';
          const grant = stage.data?.selectedGrant?.grantName || 'your selected grant';
          setMessages((prev) => [
            ...prev,
            {
              id: `proposal-${key}`,
              role: 'assistant',
              content: `**Review your proposal for ${grant}**\n\n---\n\n${proposalText}\n\n---\n\nAre you happy with this proposal? Approve to send it to the portal, or request edits.`,
              timestamp: new Date(stage.timestamp * 1000),
              suggestedActions: [
                {
                  label: '✓ Approve & Submit',
                  action: 'APPROVE_PROPOSAL',
                  data: { approved: true },
                },
                { label: '✎ Request edits', action: 'APPROVE_PROPOSAL', data: { approved: false } },
              ],
            },
          ]);
        } else {
          // Regular stage → also drop a small chat bubble so it scrolls into context
          setMessages((prev) => [
            ...prev,
            {
              id: `stage-${key}`,
              role: 'assistant',
              content: `${stage.icon}  **${stage.label}**${stage.detail ? `\n${stage.detail}` : ''}`,
              timestamp: new Date(stage.timestamp * 1000),
            },
          ]);
        }

        if (stage.stage === 'pipeline_complete' || stage.stage === 'pipeline_failed') {
          setPipelineActive(false);
          try {
            localStorage.removeItem('agrigrant_active_pipeline_job');
          } catch (e) {}
          es.close();
        }
      } catch (e) {
        /* ignore malformed SSE frames */
      }
    };
    es.addEventListener('end', () => es.close());
    es.onerror = () => {
      setPipelineActive(false);
      setPipelineError('Connection to pipeline stream lost. Please refresh the page.');
      es.close();
    };

    return () => es.close();
  }, [session]);

  // ── Farmer choices: POST back to backend ─────────────────────────────────
  const submitGrantChoice = useCallback(
    async (grant: any) => {
      if (!activeJobId) return;
      try {
        await fetch(`${BACKEND_URL}/api/pipeline/select-grant/${activeJobId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grantName: grant.grantName,
            grantingOrganization: grant.grantingOrganization,
            extras: grant,
          }),
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `you-pick-${Date.now()}`,
            role: 'user',
            content: `I want to apply for: **${grant.grantName}**`,
            timestamp: new Date(),
          },
        ]);
      } catch (e) {
        logger.error('ChatPage', 'Failed to submit grant choice', e);
        toast.error('Could not save your choice — please try again.');
      }
    },
    [activeJobId]
  );

  const submitProposalDecision = useCallback(
    async (approved: boolean) => {
      if (!activeJobId) return;
      try {
        await fetch(`${BACKEND_URL}/api/pipeline/approve-proposal/${activeJobId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved }),
        });
        setMessages((prev) => [
          ...prev,
          {
            id: `you-prop-${Date.now()}`,
            role: 'user',
            content: approved
              ? 'I approve the proposal — please submit it.'
              : 'Please revise the proposal.',
            timestamp: new Date(),
          },
        ]);
      } catch (e) {
        logger.error('ChatPage', 'Failed to submit proposal decision', e);
        toast.error('Could not save your decision — please try again.');
      }
    },
    [activeJobId]
  );

  // ── Send message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
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
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: data.message?.content ?? "I didn't quite catch that. Could you rephrase?",
            timestamp: new Date(data.message?.timestamp ?? Date.now()),
            suggestedActions: data.message?.suggestedActions ?? [],
          },
        ]);
      } catch (err) {
        logger.error('ChatPage', 'Failed to send chat message', err);
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content:
              "Sorry, I couldn't process that right now. Please try again — I'm standing by.",
            timestamp: new Date(),
          },
        ]);
        // Don't toast backend errors to the user — the in-chat message is enough
      } finally {
        setIsLoading(false);
      }
    },
    [session, isLoading]
  );

  const editLastMessage = useCallback(async () => {
    if (!session || isLoading) return;

    // Find the last user message text
    const lastUserMsgIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserMsgIndex === -1) return;

    const realIndex = messages.length - 1 - lastUserMsgIndex;
    const textToEdit = messages[realIndex].content;

    // Put it back in the input box
    setInput(textToEdit);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }

    // Remove the last user message and the subsequent assistant response from UI
    setMessages((prev) => prev.slice(0, realIndex));

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
    } catch (e) {
      console.error('Failed to edit in backend', e);
    }
  }, [session, messages, isLoading]);

  const handleSend = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim();
      if (!message || isLoading || isConnecting) return;

      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      // Update session title in history list based on first user message
      try {
        const storedSessions = localStorage.getItem('agrigrant_chat_sessions');
        if (storedSessions && session) {
          let sessionsList = JSON.parse(storedSessions);
          const idx = sessionsList.findIndex((s: any) => s.sessionId === session.sessionId);
          if (
            idx !== -1 &&
            (sessionsList[idx].title.startsWith('Advisory Session') ||
              sessionsList[idx].title.length > 25)
          ) {
            // Update title to a preview of the user message
            sessionsList[idx].title =
              message.length > 30 ? message.substring(0, 27) + '...' : message;
            localStorage.setItem('agrigrant_chat_sessions', JSON.stringify(sessionsList));
            setSessionHistory(sessionsList);
          }
        }
      } catch (e) {}

      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date(),
        },
      ]);

      await sendMessage(message);
    },
    [input, isLoading, isConnecting, sendMessage, session]
  );

  const handleActionClick = useCallback(
    (label: string, action: string, data?: any) => {
      if (action === 'GO_TO_PORTAL') {
        router.push('/farmer-portal');
      } else if (action === 'SELECT_GRANT') {
        submitGrantChoice(data);
      } else if (action === 'APPROVE_PROPOSAL') {
        submitProposalDecision(!!data?.approved);
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
    },
    [router, handleSend, editLastMessage]
  );

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
          className="lg:col-span-3 flex rounded-2xl overflow-hidden"
          style={{
            height: 'calc(100vh - 200px)',
            minHeight: '550px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
          }}
        >
          {/* History Sidebar */}
          {historyOpen && (
            <div
              className="w-60 flex-shrink-0 flex flex-col border-r"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div
                className="p-3 border-b flex items-center justify-between flex-shrink-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <History size={15} style={{ color: 'var(--muted-foreground)' }} />
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    History
                  </span>
                </div>
                <button
                  onClick={startNewSession}
                  className="p-1 rounded-lg transition-colors hover:bg-muted"
                  style={{ color: 'var(--primary)' }}
                  title="New Advisory Session"
                >
                  <PlusCircle size={15} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 select-none">
                {sessionHistory.length === 0 ? (
                  <div
                    className="text-center py-8 text-xs"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    No past sessions
                  </div>
                ) : (
                  sessionHistory.map((s) => (
                    <button
                      key={s.sessionId}
                      onClick={() => handleSelectSession(s.sessionId)}
                      className={`text-left px-3 py-2.5 rounded-xl text-xs font-semibold truncate transition-all ${
                        session?.sessionId === s.sessionId
                          ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Main Chat Panel */}
          <div className="flex-1 flex flex-col min-w-0">
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
                        backgroundColor: isConnecting
                          ? '#F59E0B'
                          : isOffline
                            ? '#EF4444'
                            : session
                              ? '#22C55E'
                              : '#94A3B8',
                      }}
                    />
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {isConnecting
                        ? 'Connecting...'
                        : isOffline
                          ? 'Temporarily unavailable'
                          : session
                            ? 'Online'
                            : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Toggle History Sidebar */}
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border hover:bg-muted transition-colors"
                  style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                  title="Toggle History"
                >
                  <History size={14} />
                  <span className="hidden sm:inline">History</span>
                </button>

                {/* Toggle Sidebar Info */}
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-muted transition-colors"
                  style={{ color: 'var(--foreground)', borderColor: 'var(--border)' }}
                >
                  <HelpCircle size={14} />
                  {showSidebar ? 'Hide Profile' : 'Show Profile'}
                </button>

                <button
                  onClick={() => {
                    try {
                      localStorage.removeItem('agrigrant_chat_session_id');
                    } catch (e) {}
                    setMessages([]);
                    setSession(null);
                    startSession(true);
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
                      The AI is running in general Q&A mode. Complete the intake form to unlock
                      personalized grant discovery, custom eligibility scoring, and tailored
                      proposal generation.
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

            {/* Pipeline in-progress banner */}
            {pipelineActive && (
              <div
                className="mx-5 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 flex-shrink-0"
                style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
              >
                <Loader2 size={16} className="animate-spin text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-800">Grant Pipeline Running</p>
                  <p className="text-xs text-blue-700/90 mt-0.5">
                    Your application is being processed by our AI agents and submission robot. Watch
                    the stages unfold below.
                  </p>
                </div>
              </div>
            )}

            {/* Pipeline error banner */}
            {pipelineError && (
              <div
                className="mx-5 mt-4 px-4 py-3 rounded-xl flex items-center gap-3 flex-shrink-0"
                style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}
              >
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-800">
                    Application Could Not Be Processed
                  </p>
                  <p className="text-xs text-red-700/90 mt-0.5">{pipelineError}</p>
                </div>
                <button
                  onClick={() => setPipelineError(null)}
                  className="text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Offline banner */}
            {isOffline && <OfflineBanner />}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {isConnecting && messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2
                      size={28}
                      className="animate-spin"
                      style={{ color: 'var(--primary)' }}
                    />
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
                    <p
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
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
                <ChatBubble
                  key={msg.id}
                  msg={msg}
                  userName={user?.name ?? 'You'}
                  onActionClick={handleActionClick}
                />
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
                          style={{
                            backgroundColor: 'var(--primary)',
                            animationDelay: `${i * 0.15}s`,
                          }}
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
                    isConnecting
                      ? 'Starting session...'
                      : isOffline
                        ? 'Temporarily unavailable — try again soon'
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
                <kbd
                  className="px-1 py-0.5 rounded text-xs font-mono"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  Enter
                </kbd>{' '}
                to send ·{' '}
                <kbd
                  className="px-1 py-0.5 rounded text-xs font-mono"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  Shift+Enter
                </kbd>{' '}
                for new line
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Context */}
        {showSidebar && (
          <div
            className="flex flex-col rounded-2xl p-5 border flex-shrink-0 overflow-y-auto h-auto lg:h-[calc(100vh-200px)]"
            style={{
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
                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Farm Name
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {farmerProfile.farmerName}
                      </span>
                    </div>

                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        State
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {farmerProfile.stateOfResidence}
                      </span>
                    </div>

                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Farm Type
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {farmerProfile.farmType}
                      </span>
                    </div>

                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Size (Hectares)
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {farmerProfile.farmSizeHectares
                          ? `${farmerProfile.farmSizeHectares} ha`
                          : 'Not specified'}
                      </span>
                    </div>

                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        BVN Status
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{
                          color: farmerProfile.hasBVN ? 'var(--primary)' : 'var(--destructive)',
                        }}
                      >
                        {farmerProfile.hasBVN ? 'Connected' : 'Missing'}
                      </span>
                    </div>

                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        CAC Registered
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{
                          color: farmerProfile.hasCACRegistration
                            ? 'var(--primary)'
                            : 'var(--muted-foreground)',
                        }}
                      >
                        {farmerProfile.hasCACRegistration ? 'Yes' : 'No'}
                      </span>
                    </div>

                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        Cooperative
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{
                          color: farmerProfile.isMemberOfCooperative
                            ? 'var(--primary)'
                            : 'var(--muted-foreground)',
                        }}
                      >
                        {farmerProfile.isMemberOfCooperative ? 'Member' : 'Not Member'}
                      </span>
                    </div>

                    <div
                      className="flex justify-between py-1 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>
                        CRMS Credit History
                      </span>
                      <span
                        className="font-semibold text-right"
                        style={{
                          color: farmerProfile.hasNoLoanDefault
                            ? 'var(--primary)'
                            : 'var(--destructive)',
                        }}
                      >
                        {farmerProfile.hasNoLoanDefault ? 'Clear' : 'Needs Clearance'}
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
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    No farmer profile was detected in local storage. The AI will respond with
                    general information.
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
