# IMD 2026 at ITB IMD 2026 at ITB - System Diagrams

**Generated:** January 27, 2026  
**Based on:** Actual codebase implementation (IMD 2026 at ITB 2.0)

---

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ TicketCompetition : "purchases"
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ ActivateToken : "has"
    User ||--o{ ResetToken : "has"
    User ||--o| TicketExhibition : "has"
    User ||--o| RegisExhiData : "has"
    User ||--o{ TransactionDetail : "makes"
    User }o--o{ Karya : "votes_for"

    TicketCompetition ||--|| Team : "creates"
    TicketCompetition }o--|| User : "belongs_to"

    Team ||--|| TicketCompetition : "linked_to"
    Team ||--o{ ParticipantCompetition : "has_members"
    Team ||--o| Abstract : "submits"
    Team ||--o| Regist3Data : "submits"
    Team ||--o| Karya : "creates"
    Team ||--o| PTCSubmissions : "submits"
    Team ||--o| H4HSubmissions : "submits"

    RefferalCode ||--o| Team : "used_by"

    RegisExhiData ||--o{ TicketGS : "contains"
    RegisExhiData ||--|| User : "belongs_to"

    TransactionDetail ||--o{ TicketGS : "includes"
    TransactionDetail ||--|| User : "belongs_to"

    TicketExhibition ||--|| User : "belongs_to"

    GrandSeminar ||--|| TicketGS : "references"

    User {
        string id PK
        string username UK
        string email UK
        string password
        boolean active
        boolean credential
        datetime emailVerified
        string name
        string image
    }

    Account {
        string id PK
        string userId FK
        string provider
        string providerAccountId
        string type
        string access_token
        string refresh_token
        bigint expires_at
    }

    Session {
        string id PK
        string sessionToken UK
        string userId FK
        datetime expires
    }

    ActivateToken {
        string id PK
        string userId FK
        string token UK
        datetime activatedAt
        datetime createdAt
    }

    ResetToken {
        string id PK
        string userId FK
        string token UK
        datetime activatedAt
        datetime createdAt
    }

    TicketCompetition {
        string id PK
        string userId FK
        string competitionType
        string verified
        float stage
    }

    Team {
        string id PK
        string ticketId FK, UK
        string teamName UK
        string chairmanName
        string chairmanEmail
    }

    ParticipantCompetition {
        string id PK
        string teamId FK
        string name
        string email
        string institution
        string phoneNumber
        string age
        string studentProof
        string twibbonProof
    }

    Abstract {
        string id PK
        string teamId FK, UK
        string teamName
        string letterPlagiarism
        string abstract
        string status
    }

    Regist3Data {
        string id PK
        string teamId FK, UK
        string teamName
        string statusPayment
        string billName
        string paymentProof
        string paymentMethod
    }

    Karya {
        string id PK
        string teamId FK, UK
        bigint countVote
        string linkFullPaper
        string linkVideo
        string linkVideo2
    }

    PTCSubmissions {
        string id PK
        string teamId FK, UK
        string fileUrl
        string paymentProofUrl
        string paperUrl
        string pitchingVideoUrl
        string pptFileUrl
    }

    H4HSubmissions {
        string id PK
        string teamId FK, UK
        string githubUrl
        string youtubeUrl
    }

    RefferalCode {
        string id PK
        string refferalCode UK
        boolean isUsed
        string teamId FK, UK
        string teamName
    }

    RegisExhiData {
        string id PK
        string userId FK, UK
        string collectiveType
        string registrationType
        boolean verified
        string paymentMethod
        string paymentProof
        string statusData
    }

    TicketGS {
        string id PK
        string name
        string email
        string phone
        string idLine
        boolean active
        string regisId FK
        string transactionDetailId FK
    }

    TicketExhibition {
        string id PK
        string userId FK, UK
        boolean verified
        boolean active
        string nameCustomer
        string paymentMethod
        string proof
        string names
        string email
        string phone
        string address
        string institution
        string phoneNumber
        string ages
        string amountPrice
        string ticketType
    }

    TransactionDetail {
        string id PK
        string userId FK
        bigint total
        string status
        string statusData
        string customerName
        string customerEmail
        string registrationType
        string paymentType
        string snapToken
        string snapRedirectURL
        json metadata
        json deletedData
    }

    GrandSeminar {
        string id PK
        string name
        string email
        string ticketId UK
        boolean validated
    }
```

---

## Sequence Diagram 1: User Registration & Team Creation

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Database
    participant Email
    participant FileStorage as UploadThing

    Note over User,FileStorage: Phase 1: User Registration

    User->>+Frontend: Navigate to /register
    Frontend-->>-User: Show registration form
    User->>+Frontend: Submit (username, email, password)
    Frontend->>+API: POST /api/auth/register
    API->>API: Validate input (Zod)
    API->>API: Hash password (bcrypt)
    API->>+Database: Create User (active: false)
    Database-->>-API: User created
    API->>+Database: Create ActivateToken
    Database-->>-API: Token created
    API->>+Email: Send activation email
    Email-->>-API: Email sent
    API-->>-Frontend: Success response
    Frontend-->>-User: Show "Check your email"

    Note over User,Email: User clicks activation link in email

    User->>+Frontend: GET /api/auth/activate?token=xxx
    Frontend->>+API: Verify token
    API->>+Database: Find & validate token
    Database-->>-API: Token valid
    API->>+Database: Update User (active: true, emailVerified: now)
    Database-->>-API: User activated
    API-->>-Frontend: Redirect to /login
    Frontend-->>-User: Show login page

    Note over User,FileStorage: Phase 2: Login

    User->>+Frontend: Submit login (username, password)
    Frontend->>+API: POST /api/auth/signin
    API->>+Database: Find user by username
    Database-->>-API: User data
    API->>API: Compare password (bcrypt)
    API->>API: Generate JWT token
    API->>API: Enrich session with ticket/team data
    API-->>-Frontend: Session token
    Frontend-->>-User: Redirect to /dashboard

    Note over User,FileStorage: Phase 3: Team Registration (PTC Example)

    User->>+Frontend: Navigate to /events/ptc/registration
    Frontend-->>-User: Show multi-step form

    Note over User,FileStorage: Step 1: Team & Members Info
    User->>+Frontend: Fill team name, member count (3-5)
    User->>Frontend: Fill member 1 details (Chairman)
    User->>Frontend: Fill member 2-5 details

    Note over User,FileStorage: Step 2: Upload Documents
    loop For each member
        User->>+Frontend: Select student proof file
        Frontend->>+API: POST /api/uploads (FormData)
        API->>API: Validate size (max 10MB)
        API->>+FileStorage: Upload file
        FileStorage-->>-API: CDN URL
        API-->>-Frontend: { secure_url }
        Frontend->>Frontend: Store URL in state
        Frontend-->>-User: Show uploaded file
    end

    Note over User,FileStorage: Step 3: Submit Registration
    User->>+Frontend: Click "Register Team"
    Frontend->>Frontend: Validate all fields filled
    Frontend->>+API: POST /api/ticket/competition
    Note right of API: Payload: competitionType,<br/>teamName, members[]

    API->>+Database: Check session auth
    Database-->>-API: User authenticated
    API->>+Database: Check duplicate ticket
    Database-->>-API: No duplicate

    Note over API,Database: Atomic Transaction
    API->>+Database: BEGIN TRANSACTION
    Database->>Database: Create TicketCompetition
    Database->>Database: Create Team (linked to ticket)
    Database->>Database: Create ParticipantCompetition (all members)
    Database-->>-API: COMMIT (all records created)

    API->>API: Prepare webhook payload
    API->>+API: POST to Google Sheets API
    API-->>-API: Sheet updated

    loop For each team member
        API->>+Email: Send verification pending email
        Email-->>-API: Email sent
    end

    API-->>-Frontend: Success response
    Frontend-->>-User: Show success + redirect

    Note over User,Frontend: Team created!<br/>Status: verified='pending'<br/>Admin review required
```

---

## Sequence Diagram 2: Multi-Stage Submission Flow

```mermaid
sequenceDiagram
    actor Admin
    actor User
    participant Dashboard
    participant API
    participant Database
    participant FileStorage as UploadThing
    participant Email

    Note over User,Email: Stage 1 Verification (Manual by Admin)

    Admin->>+Database: Review team registration
    Admin->>Database: UPDATE TicketCompetition<br/>SET verified='verified'
    Database-->>-Admin: Updated

    Note over User,Email: Stage 2: Abstract Submission

    User->>+Dashboard: Navigate to /dashboard
    Dashboard->>+API: GET /api/team/[teamId]
    API->>+Database: Fetch team + abstract + stage
    Database-->>-API: Team data
    API-->>-Dashboard: Team info
    Dashboard->>Dashboard: Check deadline (2025-02-13)
    Dashboard->>Dashboard: Check if Stage 1 verified
    Dashboard-->>-User: Show abstract submission form

    User->>+Dashboard: Upload letter of plagiarism
    Dashboard->>+API: POST /api/uploads
    API->>+FileStorage: Upload PDF
    FileStorage-->>-API: URL
    API-->>-Dashboard: { secure_url }
    Dashboard-->>-User: File uploaded

    User->>+Dashboard: Upload abstract PDF
    Dashboard->>+API: POST /api/uploads
    API->>+FileStorage: Upload PDF
    FileStorage-->>-API: URL
    API-->>-Dashboard: { secure_url }
    Dashboard-->>-User: File uploaded

    User->>+Dashboard: Click "Submit Abstract"
    Dashboard->>+API: POST /api/regist2
    Note right of API: Payload: teamName,<br/>letterPlagiarism URL,<br/>abstract URL, type

    API->>+Database: Find team by name
    Database-->>-API: Team found
    API->>API: Check Stage 1 verified
    API->>API: Check competition type matches

    API->>+Database: Create/Update Abstract
    Note right of Database: status: 'waiting'
    Database-->>-API: Abstract saved

    loop For each team member
        API->>+Email: Send submission confirmation
        Email-->>-API: Email sent
    end

    API-->>-Dashboard: Success
    Dashboard-->>-User: "Abstract submitted!"

    Note over User,Email: Admin Reviews Abstract

    Admin->>+Database: Review abstract content
    Admin->>Database: UPDATE Abstract<br/>SET status='qualified'
    Database-->>-Admin: Qualified

    Note over User,Email: Stage 3: Payment & Final Work

    User->>+Dashboard: Refresh dashboard
    Dashboard->>+API: GET /api/team/[teamId]
    API->>+Database: Fetch team data
    Database-->>-API: Abstract.status='qualified'
    API-->>-Dashboard: Unlocked Stage 3
    Dashboard->>Dashboard: Check payment deadline (2025-02-24)
    Dashboard-->>-User: Show payment form

    User->>+Dashboard: Upload payment proof
    Dashboard->>+API: POST /api/uploads
    API->>+FileStorage: Upload image
    FileStorage-->>-API: URL
    API-->>-Dashboard: { secure_url }
    Dashboard-->>-User: Proof uploaded

    alt PTC Competition
        User->>+Dashboard: Upload full paper PDF
        Dashboard->>+API: POST /api/uploads
        API->>+FileStorage: Upload PDF
        FileStorage-->>-API: URL
        API-->>-Dashboard: { secure_url }
        Dashboard-->>-User: Paper uploaded

        User->>+Dashboard: Enter video links (YouTube)
        Dashboard-->>-User: Links saved
    end

    User->>+Dashboard: Fill bill name, payment method
    User->>Dashboard: Click "Submit Payment"
    Dashboard->>+API: POST /api/regist3
    Note right of API: Payload: teamName, paymentProof,<br/>billName, paymentMethod,<br/>karya links (PTC only)

    API->>+Database: Validate abstract qualified
    Database-->>-API: Qualified
    API->>API: Check deadline

    API->>+Database: BEGIN TRANSACTION
    Database->>Database: Create/Update Regist3Data<br/>(statusPayment: 'waiting')
    Database->>Database: Create/Update Karya<br/>(linkFullPaper, linkVideo)
    Database->>Database: Update TicketCompetition.stage
    Database-->>-API: COMMIT

    loop For each team member
        API->>+Email: Send payment confirmation
        Email-->>-API: Email sent
    end

    API-->>-Dashboard: Success
    Dashboard-->>-User: "Payment submitted!"

    Note over User,Email: Admin Verifies Payment

    Admin->>+Database: Review payment proof
    Admin->>Database: UPDATE Regist3Data<br/>SET statusPayment='verified'
    Database-->>-Admin: Payment verified

    Note over User,Database: Competition Complete!
```

---

## Sequence Diagram 3: File Upload Flow

```mermaid
sequenceDiagram
    actor User
    participant Form
    participant UploadAPI as /api/uploads
    participant UploadThing
    participant CDN

    User->>+Form: Select file (PDF/Image)
    Form->>Form: Validate file type
    Form->>Form: Check size ≤ 10MB

    alt File valid
        Form->>+UploadAPI: POST with FormData
        Note right of Form: Content-Type:<br/>multipart/form-data

        UploadAPI->>UploadAPI: Extract file from FormData
        UploadAPI->>UploadAPI: Validate size again

        UploadAPI->>+UploadThing: utapi.uploadFiles([file])
        UploadThing->>UploadThing: Generate unique filename
        UploadThing->>+CDN: Store file
        CDN-->>-UploadThing: File stored
        UploadThing-->>-UploadAPI: { data: { appUrl } }

        UploadAPI-->>-Form: { secure_url: "https://utfs.io/f/xxx" }
        Form->>Form: Store URL in state
        Form-->>-User: "File uploaded successfully"

    else File invalid
        Form-->>User: "Error: File too large or invalid type"
    end

    Note over User,CDN: URL stored in database<br/>when form submitted
```

---

## Sequence Diagram 4: Payment Flow (Exhibition/Midtrans)

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API as /api/ticket/exhibition
    participant Tokenizer as /midtrans-tokenizer
    participant Database
    participant Midtrans
    participant Callback as /callback
    participant Email

    User->>+Frontend: Fill exhibition ticket form
    User->>Frontend: Select ticket type & quantity
    User->>Frontend: Enter personal details
    User->>Frontend: Click "Proceed to Payment"

    Frontend->>+Tokenizer: POST create transaction
    Note right of Tokenizer: customer_details,<br/>item_details, total

    Tokenizer->>Tokenizer: Generate order_id (UUID)
    Tokenizer->>Tokenizer: Calculate total price

    Tokenizer->>+Database: Create TransactionDetail
    Note right of Database: status: 'no-status'<br/>statusData: 'waiting'
    Database-->>-Tokenizer: Transaction saved

    Tokenizer->>+Midtrans: snap.createTransaction()
    Note right of Midtrans: Mode: IMD 2026 at ITB<br/>Server Key
    Midtrans->>Midtrans: Generate payment page
    Midtrans-->>-Tokenizer: { token, redirect_url }

    Tokenizer-->>-Frontend: { snapToken }

    Frontend->>Frontend: Load snap.js script
    Frontend->>+Midtrans: window.snap.pay(snapToken)
    Midtrans-->>-User: Open payment popup

    Note over User,Midtrans: User selects payment method<br/>(Bank Transfer, E-wallet, CC, etc.)

    User->>+Midtrans: Complete payment
    Midtrans->>Midtrans: Process payment

    alt Payment Success
        Midtrans->>+Callback: POST webhook notification
        Note right of Callback: transaction_status,<br/>order_id, gross_amount

        Callback->>+Database: Find TransactionDetail by order_id
        Database-->>-Callback: Transaction found

        Callback->>+Database: UPDATE status='settlement'
        Database-->>-Callback: Updated

        Callback->>+Email: Send ticket confirmation
        Email-->>-Callback: Email sent

        Callback-->>-Midtrans: 200 OK

        Midtrans-->>-User: Payment success page

    else Payment Failed/Pending
        Midtrans->>+Callback: POST webhook notification
        Callback->>+Database: UPDATE status='pending'/'failed'
        Database-->>-Callback: Updated
        Callback-->>-Midtrans: 200 OK
        Midtrans-->>User: Payment failed/pending page
    end

    User->>+Frontend: Close popup
    Frontend->>Frontend: Poll transaction status
    Frontend->>+API: GET /api/ticket/exhibition/[id]
    API->>+Database: Fetch transaction
    Database-->>-API: Transaction data
    API-->>-Frontend: { status }
    Frontend-->>-User: Show final status
```

---

## Activity Diagram: Complete User Journey

```mermaid
flowchart TD
    Start([User Lands on Website]) --> CheckAuth{Authenticated?}

    CheckAuth -->|No| Register[Navigate to /register]
    Register --> FillRegForm[Fill Registration Form]
    FillRegForm --> SubmitReg[Submit Registration]
    SubmitReg --> EmailSent[Activation Email Sent]
    EmailSent --> ClickLink[User Clicks Activation Link]
    ClickLink --> Activated[Account Activated]
    Activated --> Login[Navigate to /login]

    CheckAuth -->|Yes| Dashboard
    Login --> EnterCreds[Enter Username & Password]
    EnterCreds --> AuthCheck{Valid Credentials?}
    AuthCheck -->|No| LoginError[Show Error: Invalid credentials]
    LoginError --> Login
    AuthCheck -->|Yes| ActiveCheck{Account Active?}
    ActiveCheck -->|No| ActivateError[Show Error: Activate account first]
    ActivateError --> Login
    ActiveCheck -->|Yes| Dashboard[Redirect to /dashboard]

    Dashboard --> HasTicket{Has Competition<br/>Ticket?}

    HasTicket -->|No| Events[Browse /events]
    Events --> SelectComp{Select Competition}
    SelectComp -->|PTC| PTCReg[Navigate to /events/ptc/registration]
    SelectComp -->|H4H| H4HReg[Navigate to /events/h4h/registration]
    SelectComp -->|Exhibition| ExhibitionReg[Navigate to /events/exhibition]

    PTCReg --> TeamForm[Fill Team Registration Form]
    H4HReg --> TeamForm
    TeamForm --> Step1[Step 1: Team Name & Member Count]
    Step1 --> Step2[Step 2: Member Details]
    Step2 --> UploadDocs[Upload Student Proofs for All Members]
    UploadDocs --> H4HPayment{H4H Competition?}
    H4HPayment -->|Yes| UploadPayment[Upload Payment Proof]
    UploadPayment --> SubmitTeam
    H4HPayment -->|No| SubmitTeam[Submit Team Registration]
    SubmitTeam --> TeamCreated[Team Created: Status='pending']
    TeamCreated --> WaitVerif1[Wait for Admin Verification]

    ExhibitionReg --> ExhiForm[Fill Exhibition Form]
    ExhiForm --> SelectPayment[Select Payment Method]
    SelectPayment --> MidtransPay[Open Midtrans Payment Popup]
    MidtransPay --> CompletePayment[Complete Payment]
    CompletePayment --> ExhiDone[Exhibition Ticket Purchased]
    ExhiDone --> End

    HasTicket -->|Yes| CheckStage{Check Stage}
    WaitVerif1 --> AdminVerif1[Admin Verifies Team]
    AdminVerif1 --> Stage1Complete[Stage 1 Complete: verified='verified']
    Stage1Complete --> Dashboard

    CheckStage -->|Stage 1 Pending| WaitMsg[Show: Waiting for verification]
    WaitMsg --> End

    CheckStage -->|Stage 1 Verified| AbstractForm[Show Abstract Submission Form]
    AbstractForm --> CheckDeadline1{Before Abstract<br/>Deadline?}
    CheckDeadline1 -->|No| Deadline1Passed[Show: Deadline passed]
    Deadline1Passed --> End
    CheckDeadline1 -->|Yes| UploadAbstract[Upload Letter & Abstract PDF]
    UploadAbstract --> SubmitAbstract[Submit Abstract]
    SubmitAbstract --> AbstractSubmitted[Abstract: status='waiting']
    AbstractSubmitted --> WaitVerif2[Wait for Admin Review]

    WaitVerif2 --> AdminReview[Admin Reviews Abstract]
    AdminReview --> ReviewDecision{Qualified?}
    ReviewDecision -->|No| Rejected[status='rejected']
    Rejected --> End
    ReviewDecision -->|Yes| Qualified[status='qualified']
    Qualified --> Dashboard

    CheckStage -->|Abstract Qualified| PaymentForm[Show Payment Submission Form]
    PaymentForm --> CheckDeadline2{Before Payment<br/>Deadline?}
    CheckDeadline2 -->|No| Deadline2Passed[Show: Deadline passed]
    Deadline2Passed --> End
    CheckDeadline2 -->|Yes| UploadPaymentProof[Upload Payment Proof]
    UploadPaymentProof --> FillPaymentDetails[Fill Bill Name & Payment Method]
    FillPaymentDetails --> CheckCompType{Competition Type?}
    CheckCompType -->|PTC| UploadFinalWork[Upload Full Paper & Video Links]
    CheckCompType -->|H4H| SkipFinalWork[Skip Final Work]
    UploadFinalWork --> SubmitPayment
    SkipFinalWork --> SubmitPayment[Submit Payment & Final Work]
    SubmitPayment --> PaymentSubmitted[Payment: statusPayment='waiting']
    PaymentSubmitted --> WaitVerif3[Wait for Payment Verification]

    WaitVerif3 --> AdminVerifPayment[Admin Verifies Payment]
    AdminVerifPayment --> PaymentVerified[statusPayment='verified']
    PaymentVerified --> CompetitionComplete[Competition Registration Complete!]
    CompetitionComplete --> CheckMoreStages{More Stages?}

    CheckMoreStages -->|PTC: Yes| Stage2Form[Show Stage 2 Submission Form]
    Stage2Form --> UploadStage2[Upload Stage 2 Documents]
    UploadStage2 --> SubmitStage2[Submit Stage 2]
    SubmitStage2 --> Stage3Form[Show Stage 3 Submission Form]
    Stage3Form --> UploadStage3[Upload Stage 3 Final Work]
    UploadStage3 --> SubmitStage3[Submit Stage 3]
    SubmitStage3 --> AllComplete

    CheckMoreStages -->|H4H: No| AllComplete[All Stages Complete]

    AllComplete --> ViewDashboard[View Final Dashboard]
    ViewDashboard --> VotingOption{Voting Open?}
    VotingOption -->|Yes| VoteKarya[Vote on Competition Entries]
    VoteKarya --> End
    VotingOption -->|No| End

    End([End])

    style Start fill:#90EE90
    style End fill:#FFB6C1
    style Dashboard fill:#87CEEB
    style TeamCreated fill:#FFD700
    style Qualified fill:#98FB98
    style CompetitionComplete fill:#98FB98
    style AllComplete fill:#32CD32
    style Rejected fill:#FF6347
    style LoginError fill:#FF6347
    style ActivateError fill:#FF6347
    style Deadline1Passed fill:#FFA500
    style Deadline2Passed fill:#FFA500
```

---

## Architecture Diagram: System Components

```mermaid
flowchart TB
    subgraph Client["Client Layer (Browser)"]
        UI[React UI Components]
        Forms[Form Components]
        Auth[NextAuth Client]
        FileUpload[File Upload Widget]
    end

    subgraph NextJS["Next.js Application Server"]
        AppRouter[App Router]
        API[API Routes]
        SSR[Server Components]
        Middleware[Middleware]

        AppRouter --> SSR
        AppRouter --> API
    end

    subgraph Backend["Backend Services"]
        AuthService[NextAuth.js]
        PrismaORM[Prisma ORM]
        EmailService[Nodemailer]
        FileService[UploadThing Client]
        PaymentService[Midtrans Client]
    end

    subgraph External["External Services"]
        CockroachDB[(CockroachDB<br/>PostgreSQL)]
        UploadThingCDN[UploadThing CDN<br/>File Storage]
        GoogleOAuth[Google OAuth 2.0]
        MidtransAPI[Midtrans Payment<br/>Gateway API]
        SMTP[SMTP Server<br/>Email Delivery]
        GoogleSheets[Google Sheets<br/>Webhook]
        DatoCMS[DatoCMS<br/>Headless CMS]
    end

    UI --> AppRouter
    Forms --> API
    Auth --> AuthService
    FileUpload --> API

    API --> AuthService
    API --> PrismaORM
    API --> EmailService
    API --> FileService
    API --> PaymentService

    AuthService --> GoogleOAuth
    AuthService --> PrismaORM

    PrismaORM --> CockroachDB

    EmailService --> SMTP

    FileService --> UploadThingCDN

    PaymentService --> MidtransAPI

    API --> GoogleSheets

    SSR --> DatoCMS

    style Client fill:#E6F3FF
    style NextJS fill:#FFE6E6
    style Backend fill:#E6FFE6
    style External fill:#FFF9E6
```

---

## Data Flow Diagram: Team Registration Process

```mermaid
flowchart LR
    User([User]) -->|1. Fill Form| Frontend
    Frontend -->|2. Upload Files| UploadAPI[/api/uploads]
    UploadAPI -->|3. Store Files| UploadThing[(UploadThing CDN)]
    UploadThing -->|4. Return URLs| UploadAPI
    UploadAPI -->|5. URLs| Frontend
    Frontend -->|6. Submit Registration<br/>with URLs| TicketAPI[/api/ticket/competition]
    TicketAPI -->|7. Validate Session| NextAuth[NextAuth]
    NextAuth -->|8. Session Valid| TicketAPI
    TicketAPI -->|9. Create Team<br/>& Members| Database[(Database)]
    Database -->|10. Records Created| TicketAPI
    TicketAPI -->|11. Log to Sheet| GoogleSheets[Google Sheets]
    GoogleSheets -->|12. Logged| TicketAPI
    TicketAPI -->|13. Send Emails| Nodemailer[Email Service]
    Nodemailer -->|14. Emails Sent| TicketAPI
    TicketAPI -->|15. Success Response| Frontend
    Frontend -->|16. Show Success| User

    style User fill:#90EE90
    style Frontend fill:#87CEEB
    style Database fill:#FFD700
    style UploadThing fill:#DDA0DD
    style GoogleSheets fill:#98FB98
    style Nodemailer fill:#FFA07A
```

---

## State Diagram: Competition Ticket Lifecycle

```mermaid
stateDiagram-v2
    [*] --> NotPurchased: User Registered

    NotPurchased --> Pending: Submit Team Registration
    note right of Pending
        TicketCompetition.verified = 'pending'
        Stage = 1.0
    end note

    Pending --> Rejected: Admin Rejects
    Rejected --> [*]

    Pending --> Verified: Admin Approves Stage 1
    note right of Verified
        TicketCompetition.verified = 'verified'
        Can access dashboard
    end note

    Verified --> AbstractSubmitted: Submit Abstract
    note right of AbstractSubmitted
        Abstract.status = 'waiting'
    end note

    AbstractSubmitted --> AbstractRejected: Admin Rejects Abstract
    AbstractRejected --> [*]

    AbstractSubmitted --> AbstractQualified: Admin Approves Abstract
    note right of AbstractQualified
        Abstract.status = 'qualified'
        Unlock payment stage
    end note

    AbstractQualified --> PaymentSubmitted: Submit Payment & Final Work
    note right of PaymentSubmitted
        Regist3Data.statusPayment = 'waiting'
        Karya created (PTC only)
    end note

    PaymentSubmitted --> PaymentRejected: Admin Rejects Payment
    PaymentRejected --> AbstractQualified: Resubmit

    PaymentSubmitted --> PaymentVerified: Admin Verifies Payment
    note right of PaymentVerified
        Regist3Data.statusPayment = 'verified'
        Stage updated
    end note

    PaymentVerified --> Stage2: PTC Stage 2 Submission
    Stage2 --> Stage3: PTC Stage 3 Submission
    Stage3 --> Complete: All Stages Done

    PaymentVerified --> Complete: H4H Complete

    Complete --> [*]
```

---

## Deployment Architecture

```mermaid
flowchart TB
    subgraph Internet
        Users[Users/Browsers]
    end

    subgraph Vercel["Vercel (Hosting)"]
        NextApp[Next.js Application]
        EdgeFunc[Edge Functions]
        StaticAssets[Static Assets CDN]
    end

    subgraph CockroachCloud["CockroachDB Cloud (GCP)"]
        PrimaryDB[(Primary Database)]
        Replica1[(Replica 1)]
        Replica2[(Replica 2)]

        PrimaryDB -.->|Replicate| Replica1
        PrimaryDB -.->|Replicate| Replica2
    end

    subgraph ExternalAPIs["External APIs"]
        UploadThingAPI[UploadThing API]
        MidtransAPI[Midtrans API]
        GoogleAPIs[Google APIs]
        DatoCMSAPI[DatoCMS API]
    end

    subgraph EmailInfra["Email Infrastructure"]
        SMTP[SMTP Server]
    end

    Users -->|HTTPS| NextApp
    Users -->|Assets| StaticAssets

    NextApp -->|SQL Queries| PrimaryDB
    NextApp -->|File Uploads| UploadThingAPI
    NextApp -->|Payments| MidtransAPI
    NextApp -->|OAuth| GoogleAPIs
    NextApp -->|Content| DatoCMSAPI
    NextApp -->|Send Email| SMTP

    EdgeFunc -->|API Routes| NextApp

    style Vercel fill:#E6F3FF
    style CockroachCloud fill:#FFE6E6
    style ExternalAPIs fill:#E6FFE6
    style EmailInfra fill:#FFF9E6
```

---

## Notes on Diagrams

**Data Accuracy:**
All diagrams are generated based on actual code implementation as of IMD 2026 at ITB 2.0. No assumed or planned features are included.

**Key Observations:**

1. **No Team Join System:** Despite common assumptions, there is no team code or join mechanism. All team members are registered simultaneously.
2. **Multi-Stage Verification:** Admin verification is required at multiple stages (Stage 1, Abstract, Payment).
3. **File Upload Pattern:** All files go through `/api/uploads` → UploadThing → CDN URL → stored in database.
4. **Payment Timing:** Payment is NOT required upfront for competitions (except H4H). It comes after abstract qualification.
5. **Session Data:** NextAuth JWT contains extensive team and ticket data to reduce database queries.

**Diagram Usage:**

- **ERD:** Reference for database schema and relationships
- **Sequence Diagrams:** Understand API call flows and timing
- **Activity Diagram:** Overall user journey and decision points
- **Architecture Diagram:** System component dependencies
- **State Diagram:** Ticket status transitions throughout competition lifecycle
