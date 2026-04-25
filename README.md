# FNB CRM — Implementation Plan

---

## Phase 1 — Complete Lead Management
**Scope:** Additive changes to existing files only. No rewrites.

### 1.1 Lead Form Fields
- [ ] Add `weddingDate` (date picker) to `LeadRegistrationForm.jsx`
- [ ] Add `birthdayDate` (date picker) to `LeadRegistrationForm.jsx`
- [ ] Update `leadFields.js` constants

### 1.2 Discussion Modal
- [ ] Add `type` field (Call / Email / Message) to `LeadDiscussionModal.jsx`
- [ ] Add `followUpDate` (date picker) to `LeadDiscussionModal.jsx`
- [ ] On save: create a Task record in Firestore `tasks` collection with `linkedTo: leadId`

### 1.3 Dormant Flow
- [ ] Add "Mark Dormant" action to `LeadPool.jsx` kanban cards
- [ ] Dormant modal: reason dropdown (Ghosted / Dropped Us) + comment textarea
- [ ] Save `dormantReason`, `dormantComment`, `dormantAt` to lead document
- [ ] Add Dormant status to `leadStatuses.js` constants

### 1.4 Filter Views
- [ ] Add Dormant filter toggle to `LeadManagementPage.jsx`
- [ ] Add Dead Pool segment view (leads with no activity > threshold)
- [ ] Update filter UI to include dormant/dead pool

### 1.5 Sales Role
- [ ] Add `sales` role to `AuthContext`
- [ ] Gate: Sales cannot delete leads, manage badges, export/import, or view analytics
- [ ] Update permission checks across `LeadManagementPage`, `BadgeManagementPage`, `DBExportImport`

---

## Phase 2 — Clients Module
**Scope:** All new files. New Firestore `orders` sub-collection per client.

### 2.1 Client List Page
- [ ] `ClientsPage.jsx` — Active / Legacy tabs
- [ ] Client card/row component with client code, type, repeat flag
- [ ] Search + filter (type, source, repeat)

### 2.2 Client Detail Page
- [ ] `ClientDetailPage.jsx` — contact info, wedding/anniversary dates
- [ ] Discussion history (reuse `DiscussionHistory.jsx`)
- [ ] Outreach reminder display (upcoming birthdays/anniversaries)

### 2.3 Job Tickets
- [ ] `JobTicketForm.jsx` — new/edit ticket
- [ ] `JobTicketList.jsx` — list of tickets per client
- [ ] Fields: Job Type, Deadline, Final Billed, Advance Paid, Pending Balance (auto), Payment Status, Courier Charges
- [ ] Order status pipeline: Design → Production → Dispatched → Completed
- [ ] File attachments (invoices, estimates, tracking slips) via Firebase Storage

### 2.4 Legacy Client Logic
- [ ] Auto-promote client to Legacy when: deadline passed AND order = Completed
- [ ] Manual promote by admin
- [ ] Legacy tab shows full history (tickets, discussions, orders)

### 2.5 Repeat Client Logic
- [ ] Flag client as Repeat when completed orders > 1
- [ ] Show repeat badge on client card and detail page

---

## Phase 3 — Tasks & Calendar
**Scope:** New Firestore `tasks` collection. Extends Phase 1 follow-up dates.

### 3.1 Task Model (Firestore)
```
tasks/
  title: string
  linkedTo: leadId | clientId
  linkedType: 'lead' | 'client'
  dueDate: timestamp
  type: 'followUp' | 'deadline' | 'birthday' | 'anniversary' | 'tempExpiry' | 'custom'
  assignedTo: userId
  status: 'pending' | 'done'
  createdAt: timestamp
```

### 3.2 Task Creation Triggers
- [ ] Follow-up date on discussion → creates followUp task (Phase 1)
- [ ] Job ticket deadline → creates deadline task
- [ ] Client birthday/anniversary → creates outreach task
- [ ] Temp client expiry warning (7 days before) → creates tempExpiry task

### 3.3 Task UI
- [ ] `TasksPage.jsx` — list view with filters (Today / Upcoming / Overdue)
- [ ] Mark task as done
- [ ] Assign task to Employee / Sales user

### 3.4 Google Calendar Sync
- [ ] Push new tasks to Google Calendar via API
- [ ] Mark done in CRM → mark done in Calendar
- [ ] OAuth setup for Calendar API

---

## Phase 4 — Dashboard
**Scope:** New components. All data available from previous phases.

- [ ] Pipeline summary bar: Total / Qualified / Active / Dormant / Converted / Lost
- [ ] Lead pool breakdown widget (dead 900 / qualified 100 / dormant 60 / active 40 / convert 20)
- [ ] Recent activity feed (last 5 discussions, conversions, order updates)
- [ ] Today's tasks widget (from Phase 3)
- [ ] Quick stats cards: Conversion Rate / Avg Order Value / Revenue this month / Repeat Client Rate

---

## Phase 5 — Analytics & Reports
**Scope:** New pages. Aggregation queries on existing data.

| Report | Source |
|---|---|
| Total Revenue | `orders` — sum of finalBilledAmount |
| Average Order Value | Revenue / order count |
| Conversion Rate | Converted leads / total leads |
| Repeat Client Rate | Repeat clients / total clients |
| Seasonal Trends | Orders grouped by month |
| Geographic Breakdown | Client address → domestic vs international |
| Sample Kit Conversions | Leads from `website` source → converted |
| Reasons Not Converting | `dormantReason` + lost leads breakdown |
| Revenue Forecast | Trend from past 6/12 months |
| High-Performing Categories | Orders grouped by job type |
| Client Lifetime Value | Total spend per client across all orders |
| Lead Source Performance | Conversion rate per source channel |

- [ ] Chart components: bar, line, pie (recharts)
- [ ] Date range filter per report
- [ ] Export to CSV/Excel per report

---

## Phase 6 — AI Order Form
**Scope:** AI-assisted form generation using Anthropic API (Claude in artifact pattern).

- [ ] Pre-fill order form from lead data (name, job type, wedding date, etc.)
- [ ] AI suggests missing fields based on job type
- [ ] Admin review before sending to client
- [ ] Integrates with job ticket creation (Phase 2)

---

## Current Status

| Feature | Status |
|---|---|
| Lead registration form | ✅ Done |
| Kanban board | ✅ Done |
| List table view | ✅ Done |
| Qualification badges | ✅ Done |
| Discussion history | ✅ Done |
| Lead → Permanent client conversion | ✅ Done |
| Temp client | ✅ Done |
| Export / Import | ✅ Done |
| Wedding / Birthday date fields | 🔲 Phase 1 |
| Discussion type + follow-up date | 🔲 Phase 1 |
| Dormant reason + comment | 🔲 Phase 1 |
| Dormant / dead pool filters | 🔲 Phase 1 |
| Sales role | 🔲 Phase 1 |
| Clients module | 🔲 Phase 2 |
| Job tickets + order pipeline | 🔲 Phase 2 |
| File attachments | 🔲 Phase 2 |
| Legacy client auto-promotion | 🔲 Phase 2 |
| Tasks (Firestore) | 🔲 Phase 3 |
| Google Calendar sync | 🔲 Phase 3 |
| Dashboard | 🔲 Phase 4 |
| Analytics & Reports | 🔲 Phase 5 |
| AI order form | 🔲 Phase 6 |

# FNB CRM — File Structure

```
src/
├── App.jsx                                         ✅ Updated (Phase 1–4 routes)
├── firebaseConfig.js
├── styles/
│   └── tailwind.css
│
├── constants/
│   ├── leadFields.js                               ✅ Updated (Phase 1 — dates, comm type, follow-up, dormant reasons)
│   ├── leadStatuses.js                             ✅ Updated (Phase 1 — dormant status)
│   ├── leadSources.js
│   ├── dieContants.js
│   ├── entityFields.js
│   ├── materialConstants.js
│   └── paperContants.js
│
├── context/
│   └── CRMContext.jsx
│
├── services/
│   ├── index.js                                    ✅ Updated (Phase 1–2 exports)
│   ├── leadService.js
│   ├── leadConversionService.js                    ✅ Updated (Phase 2 — carries weddingDate/birthdayDate)
│   ├── discussionService.js
│   ├── badgeService.js
│   ├── clientService.js
│   ├── clientCodeService.js
│   ├── clientDatesService.js
│   ├── clientValidationService.js
│   ├── userService.js
│   ├── userManagementService.js
│   ├── vendorValidationService.js
│   ├── taskService.js                              ✅ New (Phase 1 + expanded Phase 3)
│   └── jobTicketService.js                         ✅ New (Phase 2)
│
└── components/
    │
    ├── Login/
    │   ├── AuthContext.jsx                         ✅ Updated (Phase 1 — ROLES, CRM_PERMISSIONS, can())
    │   ├── ProtectedRoute.jsx
    │   ├── login.jsx
    │   ├── AdminUser.jsx
    │   ├── ChangePassword.jsx
    │   ├── UserManagement.jsx
    │   ├── UserCreatedSuccess.jsx
    │   └── Unauthorized.jsx
    │
    ├── CRM/
    │   │
    │   ├── Dashboard/                              ✅ New (Phase 4)
    │   │   ├── CRMDashboard.jsx
    │   │   ├── PipelineSummaryBar.jsx
    │   │   └── RecentActivityFeed.jsx
    │   │
    │   ├── LeadRegistration/
    │   │   ├── LeadRegistrationPage.jsx
    │   │   ├── LeadRegistrationForm.jsx            ✅ Updated (Phase 1 — wedding/birthday date pickers)
    │   │   ├── LeadDetailsModal.jsx
    │   │   ├── DisplayLeadsTable.jsx
    │   │   └── PublicLeadForm.jsx
    │   │
    │   ├── LeadManagement/
    │   │   ├── LeadManagementPage.jsx              ✅ Updated (Phase 1 — dormant/dead pool filters)
    │   │   ├── LeadPool.jsx                        ✅ Updated (Phase 1 — DormantModal wiring)
    │   │   ├── LeadDiscussionModal.jsx             ✅ Updated (Phase 1 — comm type, follow-up date, task creation)
    │   │   ├── LeadConversionModal.jsx
    │   │   ├── TempClientModal.jsx
    │   │   └── DormantModal.jsx                    ✅ New (Phase 1)
    │   │
    │   ├── BadgeManagement/
    │   │   ├── BadgeManagementPage.jsx             ✅ Updated (Phase 1 — can("manageBadges") gate)
    │   │   ├── BadgeForm.jsx
    │   │   └── BadgeList.jsx
    │   │
    │   ├── Clients/                                ✅ New (Phase 2)
    │   │   ├── ClientsPage.jsx
    │   │   ├── ClientCard.jsx
    │   │   ├── ClientDetailPage.jsx
    │   │   ├── JobTicketForm.jsx
    │   │   ├── JobTicketList.jsx
    │   │   ├── OrderStatusPipeline.jsx
    │   │   └── PaymentTracker.jsx
    │   │
    │   └── Tasks/                                  ✅ New (Phase 3)
    │       ├── TasksPage.jsx
    │       ├── TaskCard.jsx
    │       └── TaskForm.jsx
    │
    ├── Shared/
    │   ├── CRMActionButton.jsx
    │   ├── Modal.jsx
    │   ├── DiscussionHistory.jsx
    │   ├── LeadStatusBadge.jsx
    │   ├── LeadSourceSelector.jsx
    │   ├── QualificationBadge.jsx
    │   ├── DBExportImport.jsx
    │   ├── ConfirmationModal.jsx
    │   ├── DeleteConfirmationModal.jsx
    │   ├── SuccessNotification.jsx
    │   ├── CostDisplaySection.jsx
    │   ├── SectionDetailsPanel.jsx
    │   └── UnifiedDetailsModal.jsx
    │
    ├── Billing/
    ├── Clients/
    ├── Escrow/
    ├── Estimates/
    ├── Header/
    ├── Management/
    ├── Orders/
    ├── Transactions/
    └── Vendors/
```

## Routes

| Path | Component | Phase |
|---|---|---|
| `/request-kit` | `PublicLeadForm` | Pre-existing |
| `/crm/lead-registration` | `LeadRegistrationPage` | Pre-existing |
| `/crm/lead-management` | `LeadManagementPage` | Pre-existing |
| `/crm/badges` | `BadgeManagementPage` | Pre-existing |
| `/crm/clients` | `ClientsPage` | Phase 2 ✅ |
| `/crm/tasks` | `TasksPage` | Phase 3 ✅ |
| `/crm/dashboard` | `CRMDashboard` | Phase 4 ✅ |
| `/crm/analytics` | `AnalyticsPage` | Phase 5 🔲 |

## Firestore Collections

| Collection | Used by | Status |
|---|---|---|
| `leads` | Lead Management | ✅ |
| `clients` | Clients Module | ✅ |
| `discussions` | Leads + Clients | ✅ |
| `qualificationBadges` | Badge Management | ✅ |
| `tasks` | Tasks Module | ✅ Phase 1/3 |
| `orders` | Job Tickets | ✅ Phase 2 |
| `users` | Auth | ✅ |
```