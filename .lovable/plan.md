

## Plan: Apply Navy + Gold "Midnight Wealth" Theme to Dashboard & Backend

Update the app's CSS variables and utility classes to match the SkillMarket landing's dark navy (#0D1B2A) + gold (#D4A843) design, so the dashboard and all internal pages share the same premium look.

### Changes to `src/index.css`

**Update `:root` CSS variables:**
- `--background`: Navy `#0D1B2A` → `210 52% 11%`
- `--card`: Dark navy card `#1A2A3E` → `212 40% 17%`
- `--popover`: Same as card
- `--primary`: Gold `#D4A843` → `42 62% 55%`
- `--primary-foreground`: Navy dark → `210 52% 11%`
- `--secondary`: `#162236` → `213 40% 15%`
- `--accent`: Gold (same as primary) → `42 62% 55%`
- `--accent-foreground`: Navy dark
- `--muted-foreground`: `#7A94B0` → `212 25% 58%`
- `--foreground`: `#F0F4F8` → `210 33% 96%`
- `--border` / `--input`: Navy border → `212 30% 22%`
- `--ring`: Gold
- **Sidebar**: Navy bg with gold primary
- **Path colors**: Gold active, gold completed

**Update gradient utility classes:**
- `.gradient-primary` → gold gradient (D4A843 → F0C96A)
- `.gradient-accent` → gold gradient
- `.gradient-hero` → navy gradient
- `.gradient-glow` → gold radial glow
- `.text-gradient` → gold gradient text
- `.glow-primary` / `.glow-accent` → gold glow shadows

**Update `.light` theme** with matching light-mode gold palette.

**Add Playfair Display font** to the heading styles (already imported in skillmarket.css, add to base layer for global use).

### Files Changed
| File | Action |
|------|--------|
| `src/index.css` | Edit — update all CSS variables + gradients to navy/gold |

No component changes needed — everything uses CSS variables already.

