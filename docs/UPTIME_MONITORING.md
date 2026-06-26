# Uptime Monitoring Setup

## Recommended: BetterUptime (free tier)

1. Sign up at https://betterstack.com/better-uptime
2. Add these monitors:

### Monitors to Create

| Monitor Name        | URL                                                                    | Check Interval | Alert            |
| ------------------- | ---------------------------------------------------------------------- | -------------- | ---------------- |
| Production Homepage | `https://imd 2026 at itb.IMD 2026 at ITB-itb.org`                      | 1 min          | Immediate        |
| API Health          | `https://imd 2026 at itb.IMD 2026 at ITB-itb.org/api/competitions`     | 3 min          | After 2 failures |
| Competition - PTC   | `https://imd 2026 at itb.IMD 2026 at ITB-itb.org/api/competitions/PTC` | 5 min          | After 2 failures |
| Competition - TPC   | `https://imd 2026 at itb.IMD 2026 at ITB-itb.org/api/competitions/TPC` | 5 min          | After 2 failures |
| Competition - BCC   | `https://imd 2026 at itb.IMD 2026 at ITB-itb.org/api/competitions/BCC` | 5 min          | After 2 failures |

### Alert Channels

- **Slack**: Create a `#imd 2026 at itb-alerts` channel
- **Email**: imd 2026 at itb-ops@IMD 2026 at ITB-itb.org
- **SMS**: Team lead phone number (critical alerts only)

### Status Page

1. Create a status page at BetterUptime
2. Add all monitors
3. Share URL with participants: `https://status.imd 2026 at itb.IMD 2026 at ITB-itb.org`

## Alternative: UptimeRobot (free, 5-minute checks)

1. Sign up at https://uptimerobot.com
2. Add HTTP monitors for each URL above
3. Set up email/Slack alerts

## Vercel Native Monitoring

Vercel provides:

- **Function Logs**: Real-time at `vercel.com/[team]/[project]/logs`
- **Analytics**: Web Vitals at `vercel.com/[team]/[project]/analytics`
- **Speed Insights**: Core Web Vitals tracking

Enable via:

```bash
npm install @vercel/speed-insights @vercel/analytics
```

Add to `src/app/layout.tsx`:

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

// In your layout return:
<SpeedInsights />
<Analytics />
```

## Cron Job Health Check

The `/api/cron/phase-transition` endpoint runs hourly via Vercel Cron.
Monitor it by checking the Vercel Cron dashboard for failures.
