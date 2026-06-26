/**
 * ============================================================================
 * SENTRY CONFIGURATION GUIDE
 * ============================================================================
 *
 * To enable Sentry error tracking:
 *
 * 1. Install the SDK:
 *    npm install @sentry/nextjs
 *
 * 2. Run the Sentry wizard:
 *    npx @sentry/wizard@latest -i nextjs
 *
 * 3. Add these environment variables to .env and Vercel:
 *    SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
 *    SENTRY_AUTH_TOKEN=sntrys_xxx (for source maps)
 *    SENTRY_ORG=your-org
 *    SENTRY_PROJECT=imd 2026 at itb-IMD 2026 at ITB
 *
 * 4. The wizard will create:
 *    - sentry.client.config.ts
 *    - sentry.server.config.ts
 *    - sentry.edge.config.ts
 *    - next.config.js wrapped with withSentryConfig
 *
 * 5. Verify by throwing a test error:
 *    throw new Error('Sentry test from IMD 2026 at ITBIEEE');
 *
 * IMPORTANT: Do NOT commit SENTRY_AUTH_TOKEN to git.
 * Add it only to Vercel environment variables.
 * ============================================================================
 */

// Placeholder: Sentry will be initialized by the wizard-generated files.
// This file documents the integration steps for the team.

export {};
