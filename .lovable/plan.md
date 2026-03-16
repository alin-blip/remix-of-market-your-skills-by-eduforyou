

## Plan: Integrate Trustpilot Review Collector Widget

### What Changes

Based on the Trustpilot code you provided, we need to:

1. **Add the Trustpilot bootstrap script** to `index.html` `<head>`
2. **Update `FeedbackDialog.tsx`** to render the official Trustpilot Review Collector widget (with your `data-businessunit-id` and `data-token`) instead of a simple redirect link when rating >= 4

The widget uses:
- `data-businessunit-id="699bfe8fbda6d8a0b0a5321b"`
- `data-token="83ff2916-ac91-476e-96bb-a00662874438"`
- `data-template-id="56278e9abfbbba0bdcd568bc"` (Review Collector template)

The Trustpilot widget will render inline in the dialog after a positive review, allowing users to leave a Trustpilot review directly without being redirected away.

### File Changes

| File | Action |
|------|--------|
| `index.html` | Add Trustpilot bootstrap script to `<head>` |
| `src/components/feedback/FeedbackDialog.tsx` | Replace redirect button with Trustpilot Review Collector widget div; add `useEffect` to call `window.Trustpilot?.loadFromElement()` when rendered |

### Technical Detail

After React renders the Trustpilot widget div, we need to call `window.Trustpilot.loadFromElement()` to initialize it. This is done via a `useEffect` with a ref on the widget container.

```tsx
// After submitted && rating >= 4
const trustpilotRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  if (submitted && rating >= 4 && trustpilotRef.current) {
    window.Trustpilot?.loadFromElement(trustpilotRef.current);
  }
}, [submitted, rating]);
```

No database changes. No new dependencies. 2 files edited.

