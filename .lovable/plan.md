
# Plan: E.D.U Method Platform -- Eduforyou Student Application Portal

## Overview

Transform the current "Student Freedom Path Planner" into the **E.D.U Method** platform for **Eduforyou**, a UK university recruitment agency. The platform will guide students through three phases: **E**valuate, **D**eliver, **U**nlock -- tracking their entire journey from first contact to enrollment and beyond.

## Current State

The platform already has:
- Authentication system with profiles (name, date of birth, study field, interests)
- Onboarding flow with UK university courses already listed (Eduforyou courses)
- Ikigai Builder (can become AI Course Matching)
- Learning Hub with courses, ebooks, funnels
- Quiz system for course verification
- SwipeHire integration for job/gig matching
- Life OS for goal tracking
- Stripe payments integration

## E.D.U Method Architecture

```text
+-----------------------------------------------------------+
|                    E.D.U Method Platform                   |
+-----------------------------------------------------------+
|                                                           |
|  E - EVALUATE          D - DELIVER         U - UNLOCK     |
|  +--------------+   +--------------+   +--------------+   |
|  | Eligibility  |   | Document     |   | Student      |   |
|  | Check (AI)   |   | Collection   |   | Finance App  |   |
|  +--------------+   +--------------+   +--------------+   |
|  | AI Course    |   | CV / Personal|   | 10 Bonuses   |   |
|  | Matching     |   | Statement    |   | (courses)    |   |
|  +--------------+   +--------------+   +--------------+   |
|  | E.D.U Plan   |   | University   |   | Enrollment   |   |
|  | Roadmap      |   | Response     |   | Confirmed    |   |
|  +--------------+   +--------------+   +--------------+   |
|  | Test Prep    |   | Offer Accept |   | Freedom      |   |
|  | Platform     |   |              |   | Circle       |   |
|  +--------------+   +--------------+   +--------------+   |
|                                                           |
+-----------------------------------------------------------+
```

## Implementation Phases

---

### PHASE 1: Foundation and Rebranding

**1.1 Rebrand to E.D.U Method**
- Update sidebar logo from "Student Freedom" to "E.D.U Method" with Eduforyou branding
- Update Landing page with E.D.U Method messaging
- Update platform colors/theme if needed

**1.2 Create Application Tracker Database**
- New `student_applications` table to track each student's journey through E-D-U phases
- Fields: user_id, current_phase (evaluate/deliver/unlock), current_step, assigned_consultant, university_choice, course_choice, application_status, documents_status, finance_status, etc.
- New `application_steps` table for granular step tracking with timestamps
- New `application_documents` table for document management (CV, personal statement, ID, etc.)
- New `application_notes` table for consultant notes per student

**1.3 Student Dashboard Redesign**
- Replace current dashboard with an **E.D.U Journey Tracker**
- Visual pipeline showing E > D > U progress with the current step highlighted
- Cards for each active step with status, next actions, and deadlines
- Quick stats: days since application, next milestone, assigned consultant

---

### PHASE 2: E - EVALUATE Module

**2.1 Eligibility Check (AI-Powered)**
- New page `/edu/eligibility` -- a 2-minute AI-powered assessment
- Collects: nationality, age, education level, English proficiency, financial situation
- AI evaluates eligibility for UK university study and returns result
- Uses Lovable AI (Gemini) for intelligent assessment
- Auto-updates application status

**2.2 AI Course Matching (Ikigai Adaptation)**
- Adapt existing Ikigai Builder into a university course matcher
- New page `/edu/course-match` -- quiz about interests, skills, career goals
- AI recommends top 3-5 courses from the Eduforyou portfolio (already listed in OnboardingStep1)
- Results saved and linked to application

**2.3 E.D.U Plan / Roadmap**
- New page `/edu/my-plan` -- personalized roadmap generated after eligibility + course match
- Shows the full E-D-U timeline with estimated dates
- PDF export of the personalized E.D.U plan

**2.4 Test Preparation Platform (AI Practice)**
- New page `/edu/test-prep` -- AI-powered practice for oral and written interview
- Categories: English proficiency, subject knowledge, personal statement prep
- AI generates practice questions and provides feedback
- Tracks scores and readiness level
- Uses Lovable AI for generating questions and evaluating answers

---

### PHASE 3: D - DELIVER Module

**3.1 Document Collection System**
- New page `/edu/documents` -- guided form for collecting personal details
- Sections: Personal info, Education history, Work experience, References
- File upload for supporting documents (passport, certificates)
- Progress tracker showing what's been submitted vs what's needed

**3.2 CV and Personal Statement Builder**
- New page `/edu/cv-builder` -- AI-assisted CV builder
- Collects structured info and generates a formatted CV
- Personal statement generator with AI guidance
- Both exportable as PDF

**3.3 Application Status Tracking**
- Real-time status updates on the dashboard:
  - "Documents Submitted" 
  - "Under Review by University"
  - "University Response Received"
  - "Offer Received"
  - "Offer Accepted"
- Admin panel for consultants to update each student's status
- Email/in-app notifications for status changes

---

### PHASE 4: U - UNLOCK Module

**4.1 Student Finance Application Tracker**
- New page `/edu/finance` -- guided Student Finance application info
- Checklist of requirements
- Status tracking (applied, processing, approved)
- Info about maximum amounts (up to 18k/year)

**4.2 Bonuses Hub (10 Bonuses / 9k value)**
- Leverage existing Learning Hub and funnel system
- Create a dedicated `/edu/bonuses` page
- Show 10 locked/unlocked bonuses based on enrollment status
- Links to existing courses, ebooks, and resources

**4.3 Freedom Circle Community**
- New page `/edu/community` -- the community access portal
- Links to courses, networking, jobs/gigs
- Integration with existing SwipeHire for career opportunities
- Lifetime access tracking

**4.4 Ongoing Support Dashboard**
- Contact info for assigned consultant
- Calendly integration link for booking calls
- Support ticket/message system
- Year tracking (Year 1-4 of university)

---

### PHASE 5: Admin Panel for Consultants

**5.1 Student Pipeline View**
- New admin page `/admin/applications` -- Kanban-style board
- Columns: New Leads, Eligibility Check, Course Matched, Test Prep, Documents, University Review, Offer, Enrolled
- Click on a student to see full details and update status

**5.2 Consultant Tools**
- Add notes to student applications
- Upload documents on behalf of students
- Send notifications to students
- Track conversion rates per phase

---

## Technical Details

### New Database Tables

1. **student_applications** -- Main application tracking
2. **application_steps** -- Step-by-step progress log
3. **application_documents** -- Uploaded documents metadata
4. **application_notes** -- Consultant notes per student
5. **eligibility_results** -- AI eligibility check results
6. **course_match_results** -- AI course matching results
7. **test_prep_sessions** -- Test practice sessions and scores
8. **student_finance** -- Finance application tracking

### New Edge Functions

1. **eligibility-check** -- AI-powered eligibility assessment
2. **course-matcher** -- AI course recommendation engine
3. **test-prep-generator** -- AI practice question generation
4. **cv-generator** -- AI-assisted CV/personal statement creation

### New Pages (approx. 12)

- `/edu/eligibility`
- `/edu/course-match`
- `/edu/my-plan`
- `/edu/test-prep`
- `/edu/documents`
- `/edu/cv-builder`
- `/edu/finance`
- `/edu/bonuses`
- `/edu/community`
- `/admin/applications`
- E.D.U Dashboard (replaces current dashboard)

### Sidebar Restructure

```text
Dashboard (E.D.U Journey)
---
E - EVALUATE
  Eligibility Check
  Course Matching  
  Test Preparation
---
D - DELIVER
  Documents
  CV Builder
  Application Status
---
U - UNLOCK
  Student Finance
  Bonuses (10)
  Freedom Circle
  Support
---
Admin (consultants only)
```

### Existing Features Mapping

| Current Feature | Maps To | Phase |
|---|---|---|
| Onboarding | E - Student intake form | E |
| Ikigai Builder | E - AI Course Matching | E |
| Learning Hub | U - Bonuses Hub | U |
| Quizzes | E - Test Preparation | E |
| SwipeHire | U - Career Platform | U |
| Life OS | Can remain as optional tool | -- |
| Skill Scanner | E - Eligibility inputs | E |
| Courses/Funnels | U - Bonus courses delivery | U |

## Recommended Build Order

1. **Phase 1** -- Rebrand + Database setup + New dashboard (foundation)
2. **Phase 2** -- Evaluate module (first student touchpoint)
3. **Phase 3** -- Deliver module (core application flow)
4. **Phase 5** -- Admin panel (consultants need this early)
5. **Phase 4** -- Unlock module (post-enrollment features)

Each phase can be broken into smaller tasks and built incrementally. I recommend starting with Phase 1 to establish the foundation, then moving through the phases in order.
