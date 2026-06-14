/**
 * AgriGrant AI — Internal Logger
 * Logs errors/warnings to the console in development.
 * In production, this is where you'd wire up Sentry, Datadog, or any log drain.
 * Users never see these messages — they get friendly UI copy instead.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

function formatEntry(entry: LogEntry): string {
  const ts = new Date().toISOString();
  return `[AgriGrant][${ts}][${entry.level.toUpperCase()}][${entry.context}] ${entry.message}`;
}

export const logger = {
  info(context: string, message: string, data?: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(formatEntry({ level: 'info', context, message }), data ?? '');
    }
  },

  warn(context: string, message: string, data?: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(formatEntry({ level: 'warn', context, message }), data ?? '');
    }
    // TODO: send to Sentry / Datadog in production
  },

  error(context: string, message: string, error?: unknown) {
    // Always log errors — in prod swap console for your log drain
    console.error(formatEntry({ level: 'error', context, message }), error ?? '');
    // Example: Sentry.captureException(error, { extra: { context, message } });
  },
};
