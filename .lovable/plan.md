

# Plan: VSL Russell Brunson cu Voiceover AI

## Abordare

Videoul va fi generat în 3 pași:
1. **Generare voiceover** — ElevenLabs TTS cu voce masculină (română)
2. **Render video** — Remotion (muted, din cauza limitărilor sandbox)
3. **Merge audio + video** — ffmpeg combină MP3-ul cu MP4-ul

## Pași tehnici

### 1. Conectare ElevenLabs
Conexiunea "ElevenLaba" există în workspace dar nu e legată la proiect. O legăm cu `connect`.

### 2. Edge function TTS
Creare `supabase/functions/elevenlabs-tts/index.ts` — primește text, returnează MP3.

### 3. Script generare voiceover
Script Python care trimite scriptul VSL (în română) la edge function-ul TTS și salvează MP3-ul în `/tmp/vsl-video/public/voiceover.mp3`.

**Scriptul narativ (~25s):**
> "Ai skill-uri valoroase. Dar nimeni nu plătește pentru ele. Trimiți CV-uri, aplici pe platforme, și... nimic. SkillMarket transformă skill-urile tale în venit real. Scanner de skill-uri, Ikigai Builder, Generator de CV, Dream 100 Tracker, Outreach automat — totul într-o singură platformă. Valoare totală: peste trei mii cinci sute de lire. Tu plătești doar nouăzeci și șapte pe lună. Preț blocat pentru totdeauna. Devino Founding Member acum."

### 4. Proiect Remotion (5 scene)
Același concept vizual din planul aprobat anterior — navy + gold, kinetic typography, value stack Brunson. Scenele sunt sincronizate cu timing-ul vocii.

### 5. Render + Merge
```bash
# Render video muted
node scripts/render.mjs  → /tmp/vsl-muted.mp4

# Merge cu ffmpeg
ffmpeg -i /tmp/vsl-muted.mp4 -i voiceover.mp3 -c:v copy -c:a aac /mnt/documents/skillmarket-vsl.mp4
```

## Fișiere create

```
supabase/functions/elevenlabs-tts/index.ts    — Edge function TTS
/tmp/vsl-video/                                — Proiect Remotion complet
  src/Root.tsx, MainVideo.tsx
  src/scenes/ (5 scene)
  scripts/render.mjs
```

## Output final
`/mnt/documents/skillmarket-vsl.mp4` — Video 1920x1080, 30fps, ~25s, cu voiceover românesc.

