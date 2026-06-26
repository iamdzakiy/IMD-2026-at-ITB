# IMD 2026 at ITB IEEE - Complete Codebase Analysis & System Documentation

**Analysis Date:** January 27, 2026  
**Codebase Version:** IMD 2026 at ITB 2.0 (Tag: v.2.0)  
**Analyzed by:** Senior Software Engineer

---

## PART 1 — CODEBASE EXPLANATION

### 1. Project Overview & Purpose

**IMD 2026 at ITB IEEE** is a **multi-event competition website** developed by IMD 2026 at ITB (Institut Teknologi Bandung). The platform manages team-based technical competitions with a structured workflow from registration through multiple submission stages.

**Main Features:**

- User authentication (credentials + Google OAuth)
- Multi-competition registration (PTC, H4H, Exhibition, Grand Seminar)
- Team-based participation with team creation
- Multi-stage competition submissions (Abstract → Payment → Final Work)
- File upload system for documents and proof of payments
- Admin verification workflow
- Referral code system
- Payment integration (Midtrans for Exhibition tickets)
- Email notifications
- Voting system for competition entries

---

### 2. Full Tech Stack

#### **Programming Languages**

- **TypeScript** (5.2.2) - Primary language
- **JavaScript** - Supporting scripts
- **SQL** - Database queries via Prisma

#### **Framework & Core Libraries**

- **Next.js** (13.5.6) - React framework with App Router
- **React** (18.2.0) - UI library
- **Prisma** (6.2.1) - ORM and database toolkit
- **NextAuth.js** (4.24.5) - Authentication

#### **Database**

- **CockroachDB** (PostgreSQL-compatible) - Cloud database
- Hosted on: CockroachDB Cloud (GCP Asia Southeast 1)

#### **File Storage**

- **UploadThing** (7.3.0) - File upload service with CDN
- Max file size: 10MB per upload

#### **Authentication Methods**

- Credentials (username/password with bcrypt hashing)
- Google OAuth 2.0
- Email verification with activation tokens
- Password reset tokens

#### **Payment Gateway**

- **Midtrans Client** (1.3.1) - Indonesian payment gateway
- Mode: IMD 2026 at ITB/Testing
- Integration: Snap API (popup payment)

#### **Email Service**

- **Nodemailer** (6.9.5) - Email delivery
- **React Email** (1.9.0) - Email template components
- **Resend** (3.0.0) - Alternative email service

#### **Content Management**

- **DatoCMS** - Headless CMS for dynamic content
- Used for: homepage content, mentors, events, sponsors

#### **Styling & UI**

- **Tailwind CSS** (3.3.3) - Utility-first CSS
- **Framer Motion** (11.11.11) - Animations
- **AOS** (3.0.0-beta.6) - Scroll animations
- **Swiper** (11.0.7) - Carousel/slider

#### **Form Handling & Validation**

- **Zod** (3.22.4) - Schema validation
- **React Hot Toast** (2.4.1) - Toast notifications

#### **Development Tools**

- **ESLint** + **TypeScript ESLint** - Code linting
- **Prettier** (3.0.3) - Code formatting
- **Husky** (8.0.3) - Git hooks
- **Commitlint** - Commit message validation

---

### 3. Project Structure

```
IMD 2026 at ITBIEEE/
├── prisma/                          # Database schema & migrations
│   ├── schema.prisma               # Prisma schema (15+ models)
│   └── migrations/                 # Database migration files
│
├── public/                          # Static assets
│   ├── assets/                     # Images, icons
│   ├── dashboard/                  # Dashboard-specific assets
│   └── home/                       # Homepage assets
│
├── src/
│   ├── app/                        # Next.js 13 App Router
│   │   ├── (auth)/                # Authentication pages (ungrouped route)
│   │   │   ├── login/             # Login page
│   │   │   └── register/          # Registration page
│   │   │
│   │   ├── (protected)/           # Protected routes (require auth)
│   │   │
│   │   ├── (site)/                # Public site pages
│   │   │   ├── dashboard/         # User dashboard (post-login)
│   │   │   ├── events/            # Competition pages
│   │   │   │   ├── ptc/           # PTC competition
│   │   │   │   ├── h4h/           # H4H competition
│   │   │   │   ├── exhibition/    # Exhibition event
│   │   │   │   └── grand-seminar/ # Grand Seminar event
│   │   │   └── page.tsx           # Homepage
│   │   │
│   │   ├── api/                   # API routes (backend)
│   │   │   ├── auth/              # NextAuth endpoints
│   │   │   ├── ticket/            # Ticket purchase endpoints
│   │   │   ├── team/              # Team management
│   │   │   ├── regist2/           # Abstract submission
│   │   │   ├── regist3/           # Payment & final work
│   │   │   ├── uploads/           # File upload handler
│   │   │   ├── user/              # User management
│   │   │   ├── refferal-code/     # Referral code system
│   │   │   └── voting/            # Voting system
│   │   │
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── loading.tsx            # Loading component
│   │
│   ├── components/                # Reusable React components
│   │   ├── Forms/                 # Form components
│   │   ├── FileInput/             # File upload components
│   │   ├── Modal/                 # Modal dialogs
│   │   ├── emails/                # Email templates
│   │   └── [various UI components]
│   │
│   ├── lib/                       # Utility functions & configs
│   │   ├── authOptions.ts         # NextAuth configuration
│   │   ├── db.ts                  # Prisma client instance
│   │   ├── uploadthing.ts         # UploadThing config
│   │   ├── midtrans.ts            # Midtrans payment config
│   │   └── mailTransporter.ts     # Nodemailer config
│   │
│   ├── provider/                  # React Context Providers
│   │   ├── AuthProvider.tsx       # NextAuth session provider
│   │   └── ToasterProvider.tsx    # Toast notifications provider
│   │
│   └── types/                     # TypeScript type definitions
│       ├── next-auth.d.ts         # NextAuth type extensions
│       ├── registration.ts        # Registration types
│       ├── ptc-type.ts            # PTC competition types
│       └── h4h-type.ts            # H4H competition types
│
├── .env                           # Environment variables
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies & scripts
```

**Folder Responsibilities:**

- **`prisma/`**: Database schema definition and migration history. Single source of truth for data models.
- **`src/app/api/`**: Backend API routes. Each folder represents an endpoint (`/api/ticket`, `/api/team`, etc.).
- **`src/app/(auth)/`**: Authentication-related pages outside main site navigation.
- **`src/app/(site)/`**: Public-facing pages with shared layout.
- **`src/components/`**: Reusable UI components shared across pages.
- **`src/lib/`**: Business logic, configurations, and utility functions.
- **`src/types/`**: TypeScript interfaces and type definitions.

**Important Files:**

| File                                      | Purpose                                       | Why It Matters                                          |
| ----------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| `prisma/schema.prisma`                    | Defines all database models and relationships | Central data structure for entire application           |
| `src/lib/authOptions.ts`                  | NextAuth configuration with session callbacks | Manages authentication flow and user session data       |
| `src/lib/db.ts`                           | Prisma client singleton                       | Database connection used by all API routes              |
| `src/app/api/ticket/competition/route.ts` | Team registration endpoint                    | Creates teams and tickets for competitions              |
| `src/app/(site)/dashboard/page.tsx`       | Main user dashboard                           | Central hub for all user interactions post-registration |
| `.env`                                    | Environment variables                         | Contains all API keys and database credentials          |

---

### 4. Core System Flows

#### **4.1 Authentication & Authorization**

**Files Involved:**

- `src/app/(auth)/register/page.tsx` - Registration UI
- `src/app/(auth)/login/page.tsx` - Login UI
- `src/app/api/auth/register/route.ts` - Registration endpoint
- `src/lib/authOptions.ts` - NextAuth configuration
- `prisma/schema.prisma` - User, Account, Session models

**Flow:**

**Registration:**

1. User submits form with username, email, password
2. `POST /api/auth/register` validates input (Zod schema)
3. Password is hashed using bcrypt (10 salt rounds)
4. User record created in database with `active: false`
5. Activation token generated and stored in `ActivateToken` table
6. Email sent with activation link
7. User clicks link → `GET /api/auth/activate?token=xxx`
8. Token verified, `User.active` set to `true`, `emailVerified` set to current timestamp
9. User can now login

**Login (Credentials):**

1. User submits username + password
2. NextAuth CredentialsProvider calls `authorize()` function (`src/lib/authOptions.ts:25`)
3. User lookup by username in database
4. Password compared using bcrypt.compare()
5. Checks: `user.credential === true`, `user.active === true`
6. On success: JWT token generated with session data
7. Session callback enriches JWT with:
   - Ticket information (PTC/H4H purchase status)
   - Team data (teamId, teamName, stage)
   - Voting data (karya/works voted on)
8. User redirected to dashboard

**Login (Google OAuth):**

1. User clicks "Login with Google"
2. NextAuth GoogleProvider handles OAuth flow
3. On success, checks if user exists by email
4. If new: creates User + Account records
5. If existing: updates session
6. Auto-activated (`active: true`, `credential: false`)

**Authorization Mechanism:**

- Session stored as JWT (strategy: 'jwt' in authOptions)
- Protected routes check `useSession()` hook
- API routes use `getServerSession(authOptions)`
- Dashboard checks for valid ticket before rendering

**Key Code Reference:**

```typescript
// src/lib/authOptions.ts:73-78
if (!existingUser.active) {
  throw new Error('User is not active, please activated your account first');
}
```

---

#### **4.2 Team Creation (Competition Registration)**

**Files Involved:**

- `src/app/(site)/events/ptc/registration/page.tsx` - PTC registration form
- `src/app/(site)/events/h4h/registration/page.tsx` - H4H registration form
- `src/app/api/ticket/competition/route.ts` - Team creation endpoint
- `prisma/schema.prisma` - TicketCompetition, Team, ParticipantCompetition models

**Flow:**

1. **Pre-requisites:** User must be logged in
2. User navigates to `/events/ptc/registration` or `/events/h4h/registration`
3. Fills multi-step form:
   - **Step 1:** Team name, member count (PTC: 3-5, H4H: 2-5)
   - **Step 2:** Member details for each member:
     - Name
     - Email
     - Institution
     - Phone number
     - Age
     - Student proof document (uploaded via UploadThing)
   - **Step 3 (H4H only):** Payment method, payment proof, referral code
4. Form validates:
   - Team name uniqueness
   - Email format validation
   - All required fields filled
   - Files uploaded successfully
5. Client sends `POST /api/ticket/competition` with payload:

```typescript
{
  competitionType: 'PTC' | 'H4H',
  teamName: string,
  chairmanName: string,  // First member is chairman
  chairmanEmail: string,
  members: Array<{
    name, email, institution, phoneNumber, age, studentProof
  }>,
  refferalCode?: string,  // H4H only
  paymentProofUrl?: Array  // H4H only
}
```

6. Server validates session and checks for duplicate tickets
7. **Transaction:** Creates in single atomic operation:
   - `TicketCompetition` record (verified: 'pending', stage: 1.0)
   - `Team` record (linked to ticket)
   - Multiple `ParticipantCompetition` records (all team members)
8. If referral code provided: Updates `RefferalCode` table (sets `isUsed: true`, links teamId)
9. Sends registration data to Google Sheets (external webhook for admin tracking)
10. Sends verification email to ALL team members:
    - Subject: "[SANDBOX] Verification Process for Your {PTC/H4H} Ticket"
    - Content: Team registration pending admin review
11. Returns success response
12. Client redirects to event page with success toast

**Key Business Logic:**

```typescript
// src/app/api/ticket/competition/route.ts:47-72
// Prevents duplicate ticket purchase
if (existingUser?.ticketsCompetition.length != 0) {
  if (competitionType === 'PTC') {
    const existingTicketPTC = existingUser?.ticketsCompetition.filter(
      (ticket) => ticket.competitionType === 'PTC',
    );
    if (existingTicketPTC && existingTicketPTC.length > 0) {
      return NextResponse.json(
        { message: 'You have purchased PTC tickets before' },
        { status: 400 },
      );
    }
  }
}
```

**Important Note:** There is **NO** team code or join functionality in this codebase. All team members are created together during initial registration. The logged-in user becomes the team chairman.

---

#### **4.3 Multi-Stage Submission System**

The competition progresses through **3 registration stages**:

##### **Stage 1: Team Registration**

- Handled by ticket creation (described above)
- Status: `verified: 'pending'`
- Admin manually verifies via database
- Once verified: `ticketCompetition.verified = 'verified'`
- Unlocks access to dashboard and Stage 2

##### **Stage 2: Abstract Submission**

**Files:**

- `src/app/(site)/dashboard/page.tsx` (lines 200-300) - Abstract upload UI
- `src/app/api/regist2/route.ts` - Abstract submission endpoint
- `prisma/schema.prisma` - Abstract model

**Flow:**

1. User accesses dashboard after Stage 1 verification
2. Checks deadline: `deadlineDate = new Date('2025-02-13')` (dashboard page.tsx:88)
3. Fills abstract submission form:
   - Letter of plagiarism (PDF upload)
   - Abstract document (PDF upload)
4. Client sends `POST /api/regist2`:

```typescript
{
  teamName: string,
  letterPlagiarism: string,  // URL from UploadThing
  abstract: string,          // URL from UploadThing
  type: 'PTC' | 'H4H'
}
```

5. Server validates:
   - Team exists
   - Stage 1 is verified (`ticketCompetition.verified === 'verified'`)
   - Competition type matches
6. Creates/updates `Abstract` record (status: 'waiting')
7. Sends email to all team members confirming submission
8. Admin reviews abstract
9. On approval: `Abstract.status = 'qualified'`
10. Unlocks Stage 3 (Payment)

**Key Code:**

```typescript
// src/app/api/regist2/route.ts:56-61
if (existingTeam.ticketCompetition.verified !== 'verified') {
  return NextResponse.json(
    { message: 'Registration 1 is still not verified' },
    { status: 401 },
  );
}
```

##### **Stage 3: Payment & Final Work Submission**

**Files:**

- `src/app/(site)/dashboard/page.tsx` (lines 300-500) - Final submission UI
- `src/app/api/regist3/route.ts` - Final submission endpoint
- `prisma/schema.prisma` - Regist3Data, Karya models

**Flow:**

1. Unlocked only if `Abstract.status === 'qualified'`
2. Payment deadline check: `deadlineDate = new Date('2025-02-24')` (dashboard page.tsx:115)
3. User uploads:
   - **Payment proof** (screenshot/photo)
   - **Bill name** (payer's name)
   - **Payment method** (Bank Transfer, E-wallet, etc.)
   - **Final work** (for PTC):
     - Full paper PDF
     - Video presentation link
     - PPT file
4. Client sends `POST /api/regist3`:

```typescript
{
  teamName: string,
  paymentProof: string,  // URL
  billName: string,
  paymentMethod: string,
  karya: {              // PTC only
    linkFullPaper: string,
    linkVideo: string,
    linkVideo2?: string
  },
  type: 'PTC' | 'H4H'
}
```

5. Server validates:
   - Abstract is qualified
   - Within deadline
6. Creates/updates:
   - `Regist3Data` (statusPayment: 'waiting')
   - `Karya` (final work links)
7. Updates `ticketCompetition.stage` to next value
8. Sends confirmation email
9. Admin verifies payment
10. On verification: `Regist3Data.statusPayment = 'verified'`
11. Competition complete

**Additional Stage 2 & 3 Submissions (PTC Only):**

- Dashboard shows different submission forms based on `ticketCompetition.stage`
- Stage 2 deadline: `new Date('2025-03-6')` (dashboard page.tsx:106)
- Stage 3 deadline: `new Date('2025-04-09T18:00:00+07:00')` (dashboard page.tsx:97)
- Handled by `POST /api/ticket/competition/submission1`, `submission12`, `submission2`
- Stores file URLs and additional GitHub/YouTube links
- Models: `PTCSubmissions`, `H4HSubmissions`

---

#### **4.4 Personal Document Upload Handling**

**Files:**

- `src/app/api/uploads/route.ts` - File upload endpoint
- `src/lib/uploadthing.ts` - UploadThing configuration
- `src/components/FileInput/SingleFileInput.tsx` - Upload UI component

**Flow:**

1. User clicks file input in any form
2. `SingleFileInput` component handles file selection
3. Validates file size: Max 10MB (`uploads/route.ts:6`)
4. Client sends `POST /api/uploads` with FormData:

```typescript
formData.append('file', selectedFile);
```

5. Server extracts file from FormData
6. Uploads to UploadThing service:

```typescript
const response = await utapi.uploadFiles([fileUploaded]);
```

7. Returns secure CDN URL:

```typescript
{
  message: 'File uploaded successfully',
  secure_url: 'https://utfs.io/f/xxx...'
}
```

8. Client stores URL in form state
9. URL submitted with form data to respective endpoints

**File Types Accepted:**

- PDFs: Abstracts, letters, papers
- Images: Payment proofs, student IDs
- Documents: PPT files

**Storage:**

- All files stored on UploadThing CDN
- URLs stored in database (not actual files)
- Permanent storage (not automatically deleted)

---

#### **4.5 Payment & Qualification Logic**

**Payment is NOT required for PTC registration.** Payment only appears in two contexts:

**1. H4H Competition Registration (Immediate Payment):**

- During registration (Stage 1), user uploads payment proof
- Stored in registration data
- No separate payment verification model
- Admin verifies payment when verifying team registration

**2. Exhibition & Grand Seminar Tickets (Midtrans Integration):**

**Files:**

- `src/app/(site)/events/exhibition/registration-midtrans/page.tsx`
- `src/app/api/ticket/exhibition/midtrans-tokenizer/route.ts`
- `src/lib/midtrans.ts`

**Flow:**

1. User fills ticket form (name, email, quantity, type)
2. Selects payment method
3. Client requests `POST /api/ticket/exhibition/midtrans-tokenizer`
4. Server creates Midtrans transaction:

```typescript
const transaction = await snap.createTransaction({
  transaction_details: {
    order_id: uuid(),
    gross_amount: totalPrice
  },
  customer_details: { ... },
  item_details: [ ... ]
});
```

5. Receives `snapToken` and `redirect_url`
6. Client loads Midtrans Snap.js script
7. Opens Midtrans payment popup:

```typescript
window.snap.pay(snapToken);
```

8. User completes payment via Midtrans
9. Midtrans sends webhook to `/api/ticket/exhibition/callback`
10. Server updates `TransactionDetail.status` based on payment status
11. Sends ticket confirmation email

**Qualification Logic (Abstract Review):**

- No automated scoring
- Admin manually reviews abstracts
- Sets `Abstract.status = 'qualified'` in database
- Unlocks payment stage for qualified teams
- No API endpoint for this; done via Prisma Studio or direct SQL

---

### 5. Code Organization

#### **Where Business Logic Lives:**

| Type                     | Location                                      | Example                                                 |
| ------------------------ | --------------------------------------------- | ------------------------------------------------------- |
| **Database queries**     | `src/app/api/*/route.ts` files                | `await prisma.team.findUnique({ where: { teamName } })` |
| **Validation logic**     | API route files + Zod schemas                 | `regist2/route.ts:18-24` - Missing data checks          |
| **Authentication logic** | `src/lib/authOptions.ts`                      | Credential verification, session callbacks              |
| **Business rules**       | API route files                               | `regist2/route.ts:56-61` - Stage verification checks    |
| **Email templates**      | `src/components/emails/`                      | React components rendered to HTML                       |
| **File upload logic**    | `src/app/api/uploads/route.ts`                | Size validation, UploadThing integration                |
| **Payment logic**        | `src/lib/midtrans.ts` + Exhibition API routes | Midtrans transaction creation                           |

#### **API Routes/Controllers:**

All API routes use Next.js 13 App Router convention: `/src/app/api/[endpoint]/route.ts`

| Endpoint                  | HTTP Method | Purpose                                    |
| ------------------------- | ----------- | ------------------------------------------ |
| `/api/auth/[...nextauth]` | GET, POST   | NextAuth handlers (login, logout, session) |
| `/api/auth/register`      | POST        | User registration                          |
| `/api/auth/activate`      | GET         | Email verification                         |
| `/api/ticket/competition` | POST        | Create team & ticket                       |
| `/api/team/[teamId]`      | GET         | Fetch team details                         |
| `/api/regist2`            | POST        | Submit abstract (Stage 2)                  |
| `/api/regist3`            | POST        | Submit payment & final work (Stage 3)      |
| `/api/uploads`            | POST        | File upload to UploadThing                 |
| `/api/refferal-code`      | GET, PUT    | Check/redeem referral codes                |
| `/api/voting`             | POST        | Vote on competition entries                |
| `/api/user`               | GET, PATCH  | User profile management                    |

#### **Database Models/Schemas:**

Defined in `prisma/schema.prisma`. Key models:

**Authentication:**

- `User` - User accounts (id, username, email, password, active)
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `ActivateToken` - Email verification tokens
- `ResetToken` - Password reset tokens

**Competition System:**

- `TicketCompetition` - Competition registration tickets
- `Team` - Competition teams
- `ParticipantCompetition` - Team members
- `Abstract` - Abstract submissions (Stage 2)
- `Regist3Data` - Payment data (Stage 3)
- `Karya` - Final work submissions
- `PTCSubmissions` - PTC-specific submissions
- `H4HSubmissions` - H4H-specific submissions

**Events:**

- `TicketExhibition` - Exhibition tickets
- `TicketGS` - Grand Seminar tickets
- `RegisExhiData` - Exhibition registration data
- `TransactionDetail` - Payment transactions (Midtrans)

**Other:**

- `RefferalCode` - Referral codes for discounts
- `GrandSeminar` - Grand Seminar attendees
- `VerificationToken` - NextAuth verification

**Key Relationships:**

```
User 1:N TicketCompetition
TicketCompetition 1:1 Team
Team 1:N ParticipantCompetition
Team 1:1 Abstract
Team 1:1 Regist3Data
Team 1:1 Karya
User N:M Karya (voting relationship)
```

---

### 6. Important Implementation Details & Patterns

#### **Patterns Used:**

1. **API Route Pattern:**

```typescript
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validation
    // Business logic
    // Database operations
    return NextResponse.json({ data, message }, { status: 200 });
  } catch (error) {
    console.log('ERROR_PREFIX:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
```

2. **Session Enrichment Pattern:**
   - NextAuth callbacks enrich JWT with team data
   - Reduces database queries on every request
   - Session contains: ticket status, team IDs, competition type

3. **Deadline Check Pattern:**

```typescript
useEffect(() => {
  const currentDate = new Date();
  const deadlineDate = new Date('2025-02-13');
  if (currentDate >= deadlineDate) {
    setIsDeadlinePassed(true);
  }
}, []);
```

4. **File Upload Pattern:**
   - Client uploads to API route first
   - API route uploads to UploadThing
   - Returns CDN URL
   - URL saved with form data in main submission

5. **Email Notification Pattern:**
   - React Email components (`src/components/emails/Emails.tsx`)
   - Rendered to HTML using `@react-email/render`
   - Sent via Nodemailer to all team members

6. **Form State Management:**
   - LocalStorage for form persistence (draft saving)
   - Keys: `ptc-regist-history`, `h4h-regist-history`
   - Cleared on successful submission

7. **Team Name Sanitization:**

```typescript
// Handles special characters like apostrophes
const sanitizedTeamName = teamName.replace(/['`']/g, '');
const filterTeam = allTeams.find(
  (team) => team.team Name.replace(/['`']/g, '') === sanitizedTeamName,
);
```

#### **Configuration Details:**

- **Environment:** Production uses Vercel environment variables
- **Database:** Connection pooling handled by Prisma
- **File Storage:** UploadThing auto-generates unique filenames
- **Email:** SMTP via Nodemailer (Gmail SMTP)
- **Payment:** Midtrans imd 2026 at itb mode (not production)

#### **Important Constants:**

```typescript
// File size limit
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Member count validation
PTC: 3-5 members
H4H: 2-5 members

// Deadlines (hardcoded - should be env vars)
Abstract: '2025-02-13'
Payment: '2025-02-24'
Stage 2: '2025-03-6'
Stage 3: '2025-04-09T18:00:00+07:00'
```

---

### 7. Risks, Pitfalls & Gotchas

⚠️ **Critical Issues:**

1. **Hardcoded Deadlines:**
   - Deadlines are hardcoded in multiple files
   - Risk: Forgot to update for new event year
   - Location: `dashboard/page.tsx`, registration pages
   - **Fix:** Move to environment variables or database config

2. **Team Name Sanitization Fragility:**
   - Special character handling is inconsistent
   - Team lookup can fail if names have apostrophes/quotes
   - Located in: `regist2/route.ts:35`, `regist3/route.ts:46`

3. **No Team Code/Join System:**
   - **Misconception:** This codebase does NOT support joining teams via code
   - All members registered simultaneously
   - Chairman is always the logged-in user during registration

4. **Session Token Size:**
   - Session JWT contains large amounts of data (team, tickets, karya)
   - Risk: JWT size limits (~4KB for cookies)
   - May cause issues with many submissions

5. **Error Handling Inconsistency:**
   - Some API routes return different error formats
   - Some use `{ message: string }`, others use `{ error: string }`
   - Client-side error handling must account for both

6. **Race Conditions:**
   - No optimistic locking on team creation
   - Two users could theoretically create team with same name simultaneously
   - Prisma unique constraint will catch it, but one transaction fails

7. **Email Delivery Not Guaranteed:**
   - No retry logic for failed email sends
   - SMTP errors are logged but not handled
   - Users may not receive activation/confirmation emails

8. **File Orphaning:**
   - UploadThing files uploaded but form submission fails = orphaned files
   - No cleanup mechanism
   - Can accumulate storage costs

9. **Stage Progression Logic:**
   - `ticketCompetition.stage` is a Float (1.0, 2.0, 3.0)
   - Inconsistent usage across codebase
   - Some checks use `stage >= 2.0`, others check verification status

10. **Google Sheets Integration:**
    - External webhook to Google Sheets App Script
    - If webhook fails, registration succeeds but data not in sheet
    - No rollback mechanism

**Security Considerations:**

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens have expiration
- ✅ File size limits enforced
- ⚠️ No rate limiting on API routes
- ⚠️ No CSRF protection (Next.js default)
- ⚠️ Midtrans in imd 2026 at itb mode (not production-ready)

**Performance Concerns:**

- Dashboard makes multiple sequential API calls (not parallelized)
- Session callback fetches large nested data (includes, relations)
- No pagination on team listings
- No caching strategy for static content

**Type Safety:**

- ✅ TypeScript used throughout
- ⚠️ Many `any` types in form handling
- ⚠️ Type assertions used liberally (`as Type`)
- ⚠️ API response types not always defined

**New Developer Onboarding Issues:**

1. **Environment Setup:**
   - Requires 10+ environment variables
   - No `.env.example` with all required vars
   - Database connection requires CockroachDB account

2. **External Service Dependencies:**
   - UploadThing account needed
   - Google OAuth credentials
   - Midtrans account
   - DatoCMS account
   - Email SMTP credentials

3. **Database Seeding:**
   - No seed script provided
   - Referral codes must be manually inserted
   - No test user creation script

4. **Documentation:**
   - Minimal inline comments
   - No API documentation
   - No database schema documentation

5. **Testing:**
   - No unit tests
   - No integration tests
   - No E2E tests
   - Manual testing required

---
