# 🎯 SANDBOX 3.0 - CURRENT STATUS

**Last Updated:** January 31, 2026  
**Migration Status:** ✅ Phase 1 Complete

---

## ✅ Completed Tasks

### Database Migration (Phase 1)

- ✅ **Schema v3.0 Deployed** - 15 models created in CockroachDB
- ✅ **v2.0 Data Dropped** - All legacy tables removed:
  - 263 users
  - 93 teams
  - 400 participants
  - 41 PTC submissions
  - 26 grand seminar tickets
  - All v2.0 competition/exhibition data
- ✅ **Seed Data Inserted**:
  - 3 competitions (PTC, TPC, BCC) with deadlines and fees
  - 1 Super Admin account
- ✅ **Prisma Client Generated** - TypeScript types ready
- ✅ **Database Verified** - Prisma Studio running on http://localhost:5555

### Admin System (Phase 1)

- ✅ **Admin Registration Endpoint** - `/api/admin/register`
  - Requires super_admin authentication
  - Zod validation for username, email, password, role
  - Bcrypt password hashing
  - Duplicate checking
- ✅ **Admin Model** - 3 roles implemented:
  - `super_admin` - Full access, can create admins
  - `moderator` - Review submissions, approve registrations
  - `finance` - Verify payments
- ✅ **Super Admin Created**:
  - Username: `superadmin`
  - Email: `admin@imd 2026 at itb.ieee-itb.org`
  - Password: `SuperAdmin2026!` ⚠️ **CHANGE IMMEDIATELY**

### Infrastructure (Phase 1)

- ✅ **Environment Template** - `.env.example` with comprehensive variables
- ✅ **Migration Guide** - `MIGRATION_GUIDE.md` documentation
- ✅ **Seed Scripts** - Automated database initialization
- ✅ **NPM Scripts** - `db:seed`, `db:reset`, `db:push`
- ✅ **Dependencies** - tsx installed for TypeScript execution

---

## ✅ Phase 2 Complete - Admin Authentication System

### Authentication System ✅

- ✅ **NextAuth Configuration** - Admin + User dual authentication
  - File: `src/lib/authOptions-v3.ts`
  - Admin CredentialsProvider implemented
  - User CredentialsProvider + Google OAuth
  - Role-based session handling
  - API Route: `/api/auth-v3/[...nextauth]/route.ts`

### Admin Pages ✅

- ✅ **Login Page** - `/admin/login`
- ✅ **Dashboard** - `/admin/dashboard` with statistics
- ✅ **Settings** - `/admin/settings` with account info
- ✅ **Change Password** - `/admin/settings/change-password`
- ✅ **Staff Management** - `/admin/staff` (super_admin only)
- ✅ **Create Admin** - `/admin/staff/create` (super_admin only)

### Admin Components ✅

- ✅ **AdminSidebar** - Role-based navigation menu
- ✅ **AdminHeader** - Notifications, settings, logout
- ✅ **Admin Layout** - Dedicated layout with sidebar

---

## 🔄 In Progress

### Phase 3: User System (Next Priority)

- ⚠️ **User Registration** - Team formation flow
- ⚠️ **Competition Pages** - Browse PTC/TPC/BCC
- ⚠️ **Email Verification** - Account activation
- [ ] User registration API with team creation
- [ ] Email verification system
- [ ] User dashboard (view registration status)
- [ ] Competition browsing pages

### Phase 4: Submission System

- [ ] Preliminary submission API (abstract/proposal upload)
- [ ] Payment verification API
- [ ] Semifinal submission API
- [ ] Final submission API (BCC only)
- [ ] UploadThing file handling

### Phase 5: Admin Workflows

- [ ] Registration approval interface (moderators)
- [ ] Preliminary submission review (moderators)
- [ ] Payment verification interface (finance)
- [ ] Semifinal evaluation interface (moderators)
- [ ] Finalist selection (admins)

### Phase 6: Notifications

- [ ] Email templates (activation, approval, rejection)
- [ ] Nodemailer integration with SMTP
- [ ] Google Sheets webhook integration
- [ ] Real-time notification system

### Phase 7: UI Redesign

- [ ] Remove old v2.0 components
- [ ] Design new component library
- [ ] Implement responsive layouts
- [ ] Accessibility improvements

---

## 🗃️ Database Schema Overview

### Authentication Models (5)

- **User** - Participants (email/Google OAuth)
- **Account** - NextAuth OAuth accounts
- **Session** - Active sessions
- **VerificationToken** - Email verification
- **ActivateToken** - Account activation
- **ResetToken** - Password reset

### Competition Models (9)

- **Competition** - PTC, TPC, BCC configurations
- **CompetitionRegistration** - User → Competition mapping (one-to-one)
- **Team** - Team details (unique names, leader)
- **TeamMember** - Individual members (unique emails)
- **PreliminarySubmission** - Abstract/proposal files
- **Payment** - Proof of payment verification
- **SemifinalSubmission** - Semifinal work files
- **FinalSubmission** - Final deliverables (BCC)

### Admin Model (1)

- **Admin** - Staff accounts with role-based access

---

## 🔐 Security Notes

### Super Admin Access

- **Username:** `superadmin`
- **Email:** `admin@imd 2026 at itb.ieee-itb.org`
- **Password:** `SuperAdmin2026!`
- ⚠️ **ACTION REQUIRED:** Change password on first login!

### Database Credentials

- **Provider:** CockroachDB (PostgreSQL-compatible)
- **Cluster:** spiny-efreet-6138
- **Region:** Asia Southeast 1 (GCP)
- **Connection:** Verified working ✅

### Email Service

- **Provider:** Sendinblue (now Brevo)
- **SMTP:** smtp-relay.sendinblue.com:587
- **Account:** imd 2026 at itbieeewebsite@gmail.com
- **Status:** Credentials in .env ✅

### File Storage

- **Provider:** UploadThing
- **App ID:** n3rliw6aod
- **Status:** Configured ✅

---

## 📊 Current Competition Configurations

### PTC (ProtoTech Contest)

- **Code:** `PTC`
- **Team Size:** 3-5 members
- **Fee:** IDR 150,000
- **Deadlines:**
  - Registration: August 1, 2026, 23:59 WIB
  - Preliminary: August 15, 2026, 23:59 WIB
  - Semifinal: September 1, 2026, 23:59 WIB

### TPC (Technovate Paper Competition)

- **Code:** `TPC`
- **Team Size:** 1-3 members
- **Fee:** IDR 100,000
- **Deadlines:**
  - Registration: August 1, 2026, 23:59 WIB
  - Preliminary: August 15, 2026, 23:59 WIB
  - Semifinal: September 1, 2026, 23:59 WIB

### BCC (Business Case Competition)

- **Code:** `BCC`
- **Team Size:** 3 members (fixed)
- **Fee:** IDR 125,000
- **Deadlines:**
  - Registration: August 1, 2026, 23:59 WIB
  - Preliminary: August 15, 2026, 23:59 WIB
  - Semifinal: September 1, 2026, 23:59 WIB
  - Final: September 10, 2026, 23:59 WIB

---

## 🚀 Next Immediate Steps

### Priority 1: Admin Authentication (Today)

1. Open `src/lib/authOptions.ts`
2. Add Admin CredentialsProvider
3. Update session callback to handle Admin
4. Create separate admin login route

### Priority 2: Admin Login Page (Today)

1. Create `/src/app/(admin)/admin/login/page.tsx`
2. Simple form: username + password
3. POST to NextAuth with admin provider
4. Redirect to `/admin/dashboard`

### Priority 3: Admin Dashboard (Today)

1. Create `/src/app/(admin)/admin/dashboard/page.tsx`
2. Protected route: verify admin session
3. Display admin role and navigation
4. Links to: Staff Management, Registrations, Submissions, Payments

### Priority 4: Test Super Admin (Today)

1. Start dev server: `npm run dev`
2. Navigate to `/admin/login`
3. Login with `superadmin` / `SuperAdmin2026!`
4. Verify dashboard access
5. **Change password immediately**

---

## 📝 Important Notes

### Data Loss Acknowledgment

- ✅ All v2.0 data has been permanently deleted
- ✅ Fresh start confirmed by user
- ✅ No rollback available (v2.0 tables dropped)

### Breaking Changes

- ❌ Old v2.0 routes will break (expected)
- ❌ User sessions invalidated (need re-login)
- ❌ API endpoints need recreation

### Backward Compatibility

- ⚠️ Keep old routes temporarily during migration
- ⚠️ Gradual refactor approach (don't break everything at once)
- ⚠️ UI redesign comes after functional implementation

### Schema Constraints (Enforced)

- 🔒 One user = one competition (UNIQUE userId)
- 🔒 One email = one team globally (UNIQUE email)
- 🔒 One team leader = one team ever (UNIQUE leaderUserId)
- 🔒 Global unique team names

---

## 🛠️ Development Commands

```bash
# Database
npm run db:push      # Deploy schema + seed
npm run db:seed      # Run seed only
npm run db:reset     # Reset + seed
npx prisma studio    # Open database GUI

# Development
npm run dev          # Start Next.js server
npm run build        # Production build
npm run start        # Production server

# Prisma
npx prisma generate  # Generate client
npx prisma migrate dev # Create migration
npx prisma db pull   # Pull schema from DB
```

---

## 📚 Documentation References

- **Migration Guide:** `MIGRATION_GUIDE.md`
- **Prisma Schema:** `prisma/schema.prisma`
- **Seed Script:** `prisma/seed.ts`
- **Admin Register API:** `src/app/api/admin/register/route.ts`
- **Environment Template:** `.env.example`

---

## 🎯 Success Criteria

### Phase 1 (✅ Complete)

- [x] Database migrated to v3.0
- [x] Admin model created
- [x] Super Admin seeded
- [x] Admin registration endpoint functional

### Phase 2 (🔄 In Progress)

- [ ] Admin authentication working
- [ ] Admin dashboard accessible
- [ ] Can create additional admin accounts
- [ ] Super Admin password changed

### Phase 3 (❌ Not Started)

- [ ] Users can register for competitions
- [ ] Team formation working
- [ ] Email verification functional
- [ ] User dashboard shows status

### Phase 4 (❌ Not Started)

- [ ] Preliminary submissions accepted
- [ ] Payment verification operational
- [ ] Semifinal submissions accepted
- [ ] Complete competition flow tested

---

**Status Summary:** ✅ Foundation established. Ready for admin authentication implementation.

**Blockers:** None  
**Risks:** None identified  
**Timeline:** Phase 1 complete ahead of schedule
