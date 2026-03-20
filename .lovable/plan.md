

## Plan: Fix Register Page + Pass Quiz DNA Result

### Problem 1: White Page on /auth/register
The register page uses custom CSS classes (`gradient-mesh`, `gradient-glow`, `glass`) that depend on theme CSS variables. The page has no explicit `bg-background` on the outer container — it relies on `gradient-mesh` and `gradient-glow` overlays which are semi-transparent. If the theme isn't applied or the body background doesn't reach through, the page appears white.

**Fix**: Add `bg-background` to the outer `div` in `Register.tsx` so it always has a proper dark background regardless of overlay rendering.

### Problem 2: Pass Quiz DNA Result to Register → Profile
Currently the quiz result CTA navigates to `/auth/register` with no state. The `execution_dna` result is lost.

**Fix**:
1. In `DnaQuizResult.tsx`, change the CTA `onCta('/auth/register')` to pass the result type as a query param: `onCta('/auth/register?dna=freelancer')`
2. In `DnaQuizContainer.tsx`, update `onNavigate` to include the result: pass `result.primary` in the URL
3. In `Register.tsx`:
   - Read `dna` from URL search params (`useSearchParams` or `useLocation`)
   - After successful registration + profile population, update `profiles.execution_dna` with the quiz result
   - Then navigate to `/dashboard` (or `/wizard/path`) so the user lands in the platform with their DNA already set

### Files Modified

| File | Change |
|------|--------|
| `src/pages/auth/Register.tsx` | Add `bg-background`, read `?dna=` param, save `execution_dna` after register |
| `src/components/dna-quiz/DnaQuizResult.tsx` | Pass `result_type` in CTA URL as query param |

### Technical Detail

```tsx
// DnaQuizResult.tsx — CTA change
onClick={() => onCta(`/auth/register?dna=${primary}`)}

// Register.tsx — read & save DNA
const searchParams = new URLSearchParams(location.search);
const dnaResult = searchParams.get('dna');

// After signup + populate_profile_from_waitlist:
if (dnaResult) {
  await supabase.from('profiles').update({ execution_dna: dnaResult }).eq('id', user.id);
}
```

