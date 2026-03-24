

# Plan: Salvare automată AI outputs în toate edge functions

## Problema
Tabelul `ai_outputs` există și pagina admin îl citește corect, dar **niciuna din cele ~12 edge functions AI nu face INSERT în `ai_outputs`**. Rezultatele se returnează clientului și se pierd.

## Soluție
Adăugăm un INSERT în `ai_outputs` în fiecare edge function, imediat după ce primim răspunsul AI valid. Folosim `SUPABASE_SERVICE_ROLE_KEY` (deja disponibil) pentru a bypassa RLS.

### Edge functions de actualizat (13 fișiere):
1. `skill-scanner` — adăugăm auth header parsing + insert
2. `ikigai-builder`
3. `offer-builder`
4. `profile-builder`
5. `outreach-generator`
6. `outreach-sequence` — deja are auth, adăugăm insert
7. `cv-generator`
8. `gig-generator`
9. `gig-platform-generator`
10. `dream100-analyzer`
11. `dream100-scanner`
12. `life-os-wizard`
13. `vision-image-generator`

### Pattern pentru fiecare funcție
```typescript
// After getting AI result, before returning response:
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const adminClient = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Extract user_id from auth header if available
const token = req.headers.get("Authorization")?.replace("Bearer ", "");
let userId = null;
if (token) {
  const { data } = await adminClient.auth.getUser(token);
  userId = data?.user?.id || null;
}

// Save to ai_outputs
await adminClient.from("ai_outputs").insert({
  user_id: userId,
  tool: "skill-scanner",  // matches the function name
  input_json: { experiences, studyField, interests: interestsText },
  output_json: result,
});
```

### Ce NU se schimbă
- Tabelul `ai_outputs` — deja există cu RLS corect
- Pagina `AIOutputsManager.tsx` — deja funcțională
- Flow-ul utilizatorului — insert-ul este fire-and-forget, nu blochează răspunsul

## Fișiere afectate
13 edge functions din `supabase/functions/` — adăugare ~10 linii fiecare

