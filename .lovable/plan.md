

# Plan: Integrate Previous Platform Features into U -- UNLOCK

## Understanding

The original platform was a complete freelancing/skill monetization toolkit. When we rebranded to E.D.U Method, these features lost their home in the sidebar. You want ALL of them to remain accessible under **U -- UNLOCK**, grouped under a meaningful name -- because they are part of the value students unlock after enrollment (learning to freelance, monetize skills, earn income).

## What Exists But Is Currently Hidden

These features are fully functional but no longer accessible from the sidebar:

| Feature | Route | What It Does |
|---------|-------|--------------|
| Define Your Path | `/wizard/path` | Step-by-step freelancing journey overview |
| Skill Scanner | `/wizard/skill-scanner` | AI-powered skill discovery |
| Ikigai Builder | `/wizard/ikigai` | Find your sweet spot (passion + skills + market) |
| Offer Builder | `/wizard/offer` | Create freelance service packages |
| Profile Builder | `/wizard/profile` | Generate social media bios for freelancing |
| Outreach Generator | `/wizard/outreach` | AI outreach messages for clients |
| Gig Job Builder | `/wizard/gig-job-builder` | Create gig listings for platforms |
| Freedom Plan Export | `/wizard/export` | Export your complete plan as PDF |
| Income Tracker | `/income-tracker` | Track freelance earnings |
| Client CRM | `/client-crm` | Manage clients and projects |
| Life OS | `/life-os` | Goal setting and weekly sprints |
| Learning Hub | `/learning-hub` | Courses, ebooks, resources |
| Tools Hub | `/tools` | Central hub for all business tools |

## Proposed Structure

The **U -- UNLOCK** section in the sidebar will be reorganized into sub-groups. The entire freelancing platform will be named **"Freedom Launchpad"** (or you can suggest another name).

### New Sidebar Layout

```text
Dashboard (E.D.U Journey)
---
E -- EVALUATE
  Eligibility Check
  Course Matching
  Test Preparation
---
D -- DELIVER
  Documents
  CV Builder
---
U -- UNLOCK
  Student Finance
  Bonuses (10)              --> Links to Learning Hub
  Freedom Circle            --> Community page

  FREEDOM LAUNCHPAD (sub-label)
  Skill Scanner
  Ikigai Builder
  Offer Builder
  Profile Builder
  Outreach Generator
  Gig Job Builder
  Freedom Plan Export

  BUSINESS TOOLS (sub-label)
  Income Tracker
  Client CRM
  Life OS
---
Resources
  Learning Hub
```

## Implementation Steps

### 1. Update Sidebar (AppSidebar.tsx)

- Add two new nav item arrays under U -- UNLOCK:
  - **Freedom Launchpad** items: Skill Scanner, Ikigai Builder, Offer Builder, Profile Builder, Outreach Generator, Gig Job Builder, Freedom Plan Export
  - **Business Tools** items: Income Tracker, Client CRM, Life OS
- Add sub-group labels "Freedom Launchpad" and "Business Tools" under the U -- UNLOCK section
- Keep the existing Student Finance, Bonuses, and Freedom Circle items
- Remove the standalone "Resources" section (Learning Hub will be accessible via Bonuses)

### 2. Update Freedom Circle Page (FreedomCircle.tsx)

- Transform from a "Coming Soon" placeholder into a real hub page
- Add cards/links to all the Freedom Launchpad tools and Business Tools
- Show it as the central entry point for all UNLOCK features
- Include SwipeHire link for career opportunities

### 3. Keep All Routes Intact

- No route changes needed -- all `/wizard/*`, `/income-tracker`, `/client-crm`, `/life-os/*`, `/tools` routes remain as they are
- All existing functionality is preserved exactly as-is

## Technical Details

### Files to Modify

1. **`src/components/layout/AppSidebar.tsx`**
   - Add `freedomLaunchpadItems` array with 7 wizard tools
   - Add `businessToolsItems` array with 3 business tools
   - Render them under U -- UNLOCK with sub-labels
   - Remove standalone "Resources" section

2. **`src/pages/edu/FreedomCircle.tsx`**
   - Replace "Coming Soon" with a dashboard of cards linking to all tools
   - Organized into sections: Freedom Launchpad, Business Tools, Community

### Icons Mapping

- Skill Scanner: Sparkles
- Ikigai Builder: Target
- Offer Builder: Package
- Profile Builder: User
- Outreach Generator: MessageSquare
- Gig Job Builder: Briefcase
- Freedom Plan Export: FileDown
- Income Tracker: Wallet
- Client CRM: Users
- Life OS: Target/Calendar

### No Database Changes Required

All tables and data remain untouched. This is purely a navigation and UI reorganization.

