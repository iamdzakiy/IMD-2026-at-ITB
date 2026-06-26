/**
 * ============================================================================
 * STRUCTURED SERVER-SIDE LOGGING
 * ============================================================================
 *
 * Production-grade structured logging with JSON output for observability.
 * Compatible with Vercel Logs, Datadog, and any log aggregation service.
 *
 * Log levels: debug < info < warn < error
 * In production, debug logs are suppressed.
 * ============================================================================
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  /** Unique request or operation identifier */
  requestId?: string;
  /** User or admin identifier (never log passwords/tokens) */
  userId?: string;
  /** API route or operation name */
  operation?: string;
  /** Duration in milliseconds */
  durationMs?: number;
  /** HTTP status code */
  statusCode?: number;
  /** Additional structured data */
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[MIN_LEVEL];
}

function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown,
) {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  if (error instanceof Error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack:
        process.env.NODE_ENV === 'production'
          ? undefined
          : error.stack?.split('\n').slice(0, 5).join('\n'),
    };
  } else if (error !== undefined) {
    entry.error = String(error);
  }

  return entry;
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (!shouldLog('debug')) return;
    // eslint-disable-next-line no-console
    console.debug(JSON.stringify(formatLog('debug', message, context)));
  },

  info(message: string, context?: LogContext) {
    if (!shouldLog('info')) return;
    logger.info(JSON.stringify(formatLog('info', message, context)));
  },

  warn(message: string, context?: LogContext, error?: unknown) {
    if (!shouldLog('warn')) return;
    logger.warn(JSON.stringify(formatLog('warn', message, context, error)));
  },

  error(message: string, context?: LogContext, error?: unknown) {
    if (!shouldLog('error')) return;
    logger.error(JSON.stringify(formatLog('error', message, context, error)));
  },

  /**
   * Create a child logger with preset context (e.g., requestId, operation)
   */
  child(baseContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...baseContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...baseContext, ...context }),
      warn: (message: string, context?: LogContext, error?: unknown) =>
        logger.warn(message, { ...baseContext, ...context }, error),
      error: (message: string, context?: LogContext, error?: unknown) =>
        logger.error(message, { ...baseContext, ...context }, error),
    };
  },

  /**
   * Time an async operation and log its duration
   */
  async time<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      logger.info(`${operation} completed`, {
        ...context,
        operation,
        durationMs,
      });
      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      logger.error(
        `${operation} failed`,
        { ...context, operation, durationMs },
        error,
      );
      throw error;
    }
  },
};
