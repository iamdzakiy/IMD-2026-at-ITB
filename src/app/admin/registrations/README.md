# Admin Registrations Management

## 📋 Overview

Admin interface for reviewing and managing competition registrations. Provides a user-friendly UI for approving or rejecting team registrations with automatic email notifications.

## 🎯 Features

### 1. Statistics Dashboard

- **Total Registrations**: All registrations across all competitions
- **Pending**: Registrations awaiting admin review
- **Approved**: Verified and approved teams
- **Rejected**: Declined registrations

### 2. Filter Tabs

- **All**: View all registrations
- **Pending**: Focus on registrations needing review
- **Approved**: See approved teams
- **Rejected**: View declined registrations

### 3. Registration Details

- Team name and competition
- Team leader information (name, email)
- Institution/University
- Registration date and time
- Verification status badge

### 4. Expandable Team Details

Click the eye icon (👁️) to view:

- All team members with contact information
- Member emails and phone numbers
- Proof of registration links (Google Drive)
- Registration and user IDs
- Current competition phase
- User account creation date

### 5. Action Buttons

#### ✅ Approve Button

- Click the green "Approve" button
- Confirmation dialog appears
- On approval:
  - Updates `verificationStatus` to `approved`
  - Updates `currentPhase` to `preliminary`
  - Sends approval email to team leader
  - Shows success toast notification
  - Automatically refreshes page

#### ❌ Reject Button

- Click the red "Reject" button
- Enter rejection reason in prompt
- On rejection:
  - Updates `verificationStatus` to `rejected`
  - Sends rejection email with reason to team leader
  - Shows success toast notification
  - Automatically refreshes page

## 🚀 Usage

### Access the Page

**Route:** `/admin/registrations`

**Required Role:** `super_admin` or `moderator`

### Navigation Options

1. **From Sidebar:**
   - Click "Registrations" in the admin sidebar

2. **From Dashboard:**
   - Click "View Registrations" card in Quick Actions
   - Click "Pending Registrations" in actionable stats

### Workflow

```
1. Login to Admin Panel
   ↓
2. Navigate to Registrations
   ↓
3. Filter by "Pending" (recommended)
   ↓
4. Click eye icon to view team details
   ↓
5. Review team information
   ↓
6. Click "Approve" or "Reject"
   ↓
7. Confirm action / Enter reason
   ↓
8. Email sent automatically ✅
   ↓
9. Page refreshes with updated status
```

## 📁 File Structure

```
src/app/admin/registrations/
├── page.tsx                    # Server component - fetches data
└── RegistrationsTable.tsx      # Client component - interactive UI

src/app/api/admin/registrations/[id]/
├── approve/
│   └── route.ts               # POST endpoint for approval
└── reject/
    └── route.ts               # POST endpoint for rejection
```

## 🔌 API Endpoints

### Approve Registration

```typescript
POST /api/admin/registrations/[id]/approve

Headers:
  - Cookie: session-cookie (automatic via NextAuth)

Response:
{
  success: true,
  message: "Registration approved successfully",
  data: {
    registrationId: string,
    verificationStatus: "approved",
    currentPhase: "preliminary",
    teamName: string,
    userEmail: string
  }
}
```

### Reject Registration

```typescript
POST /api/admin/registrations/[id]/reject

Headers:
  - Content-Type: application/json
  - Cookie: session-cookie (automatic via NextAuth)

Body:
{
  reason: string  // Required - sent to user in email
}

Response:
{
  success: true,
  message: "Registration rejected successfully",
  data: {
    registrationId: string,
    verificationStatus: "rejected",
    teamName: string,
    userEmail: string,
    reason: string
  }
}
```

## 📧 Email Notifications

### Approval Email

- **Function:** `sendRegistrationApprovedEmail()`
- **Subject:** "🎉 Your Registration Has Been Approved!"
- **Content:**
  - Success badge
  - Team name and competition
  - Next steps (preliminary submission, payment)
  - Dashboard button link

### Rejection Email

- **Function:** `sendRegistrationRejectedEmail()`
- **Subject:** "Registration Update"
- **Content:**
  - Team name
  - Rejection reason provided by admin
  - Contact information for inquiries

## 🎨 UI Components

### Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Date Formatting:** date-fns

### Design Features

- Responsive grid layout
- Hover effects and transitions
- Color-coded status badges
- Loading states with spinners
- Toast notifications for feedback
- Expandable/collapsible rows
- Clean, modern interface

## 🔐 Security

### Authentication

- Requires valid admin session (NextAuth)
- Session verified on every API call

### Authorization

- Only `super_admin` and `moderator` roles can access
- Finance admins are redirected to dashboard
- Unauthorized users redirected to login

### Data Protection

- Registration IDs validated
- Prevent duplicate approvals/rejections
- Cannot reject already approved registrations
- Rejection reason is required and validated

## ⚠️ Error Handling

### Client-Side

- Invalid actions show toast error messages
- Empty rejection reason prevented
- Network errors caught and displayed
- Loading states prevent double-clicks

### Server-Side

- Authentication checks return 401
- Authorization checks return 403
- Invalid IDs return 404
- Missing data returns 400
- Server errors return 500 with details

## 🧪 Testing

### Manual Testing Checklist

- [ ] Access page as super_admin
- [ ] Access page as moderator
- [ ] Verify finance admin is redirected
- [ ] Filter by all statuses
- [ ] Expand/collapse team details
- [ ] Approve a pending registration
- [ ] Verify approval email received
- [ ] Check database status updated
- [ ] Reject a pending registration with reason
- [ ] Verify rejection email received
- [ ] Try to approve already approved registration
- [ ] Try to reject already approved registration
- [ ] Test with missing session/cookie

## 📝 Database Schema

```prisma
model CompetitionRegistration {
  id                 String             @id @default(uuid())
  userId             String             @unique
  competitionId      String
  verificationStatus VerificationStatus @default(pending)
  currentPhase       CompetitionPhase   @default(registration)
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  user        User        @relation(...)
  competition Competition @relation(...)
  team        Team?
}

enum VerificationStatus {
  pending
  approved
  rejected
}

enum CompetitionPhase {
  registration
  preliminary
  payment
  semifinal
  final
}
```

## 🚀 Future Enhancements

### Planned Features

- [ ] Bulk approve/reject multiple registrations
- [ ] Export registrations to CSV/Excel
- [ ] Search and filter by team name, email, competition
- [ ] Pagination for large datasets
- [ ] Sorting by date, status, competition
- [ ] Inline editing of team details
- [ ] Activity log for admin actions
- [ ] Email preview before sending
- [ ] Draft rejection reasons (templates)
- [ ] Undo action within time window

### Potential Improvements

- [ ] Add notes field for internal admin comments
- [ ] Attach files/documents to registrations
- [ ] Real-time updates using WebSockets
- [ ] Mobile-optimized responsive design
- [ ] Dark mode support
- [ ] Keyboard shortcuts for power users
- [ ] Print-friendly view for reports

## 📚 Related Documentation

- [Admin Guide](../../docs/ADMIN_GUIDE.md) - Complete admin workflow
- [Sequence Diagrams](../../docs/Sequence%20Diagram/) - Registration flow
- [Email Service](../../../src/lib/email.ts) - Email templates
- [API Routes](../../../src/app/api/admin/) - All admin APIs

## 🤝 Contributing

When modifying this feature:

1. **Test thoroughly** with different roles
2. **Update documentation** if API changes
3. **Maintain error handling** patterns
4. **Follow TypeScript** best practices
5. **Keep UI consistent** with design system

## 📞 Support

For issues or questions:

- Check server logs: `npm run dev` output
- Verify database: `npx prisma studio`
- Test emails: Check SMTP configuration in `.env`
- Review admin guide: `docs/ADMIN_GUIDE.md`

---

**Version:** 1.0.0  
**Last Updated:** February 16, 2026  
**Developed for:** The IMD 2026 at ITB 3.0 - IMD 2026 at ITB Student Branch
