

## Problem

When clicking "Analizează" on a target in Dream 100 Tracker, the AI analysis runs successfully but the result is barely visible -- just a tiny line saying "✨ Analizat — formal/relaxed". The full analysis data (cultural values, main problem, key insights, hiring signals, approach strategy) is saved but never displayed to the user.

## Plan

**Expand the AI analysis display on target cards** to show the full analysis results in a readable format.

### Changes to `src/pages/dream100/Dream100Tracker.tsx`:

1. **Add an "Analysis Detail Dialog"** -- when the user clicks on the "✨ Analizat" indicator (or a "Vezi analiza" button), open a dialog showing:
   - **Cultural Values** -- list of company values as badges
   - **Main Problem** -- the key pain point identified
   - **Recommended Tone** -- with reasoning
   - **Key Insights** -- bullet list
   - **Hiring Signals** -- text block
   - **Approach Strategy** -- text block

2. **Improve the card indicator** -- replace the current tiny text with a clickable element that says "Vezi analiza" / "View analysis" so it's clear there's more to see.

3. **Keep the card compact** -- the full details go in the dialog, the card just shows a clear clickable badge indicating analysis is available.

### Technical approach:
- Add state for `selectedAnalysis` (the target whose analysis to view)
- Add a `Dialog` that renders all fields from `ai_analysis` object
- Style with cards/sections for readability
- No backend changes needed -- data is already saved correctly

