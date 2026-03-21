

## Plan: Imbunatatiri Vizuale Landing Page

### Ce vom adauga:

**1. Scroll-triggered fade-in animations (Intersection Observer)**
- Fiecare sectiune (Stats, HowItWorks, Dream100, ValueStack, etc.) va aparea cu animatie fade-up cand userul scrolleaza pana la ea
- Custom hook `useScrollReveal` care foloseste IntersectionObserver
- Stagger delay pe elementele din grid (carduri, steps) pentru efect cascada

**2. Image hover effects pe step cards**
- Scale + subtle shadow glow pe hover pe imaginile din How It Works
- Tranzitie smooth 300ms

**3. Parallax subtil pe hero background**
- Grid-ul din hero se misca usor la scroll, creand efect de profunzime
- Implementat cu CSS transform translateY bazat pe scroll position

**4. Counter animation pe Stats**
- Numerele din sectiunea Stats (7+, 100+, etc.) vor conta de la 0 la valoarea finala cand devin vizibile
- Efect clasic de "counting up" care atrage atentia

**5. Smooth image transitions pe step cards**
- Imaginile din How It Works vor avea un efect de slide-in din lateral (stanga sau dreapta, alternand) cand apar in viewport
- Coordonat cu directia layout-ului (alternant stanga/dreapta)

**6. Gold shimmer accent pe section badges**
- Animatie subtila de shimmer/glow pe badge-urile de sectiune la hover

### Fisiere modificate:
- `src/pages/SkillMarketLanding.tsx` — adaugare hooks, clase de animatie, counter logic
- `src/pages/skillmarket.css` — keyframes noi pentru slide-in, fade-up cu stagger, parallax, counter

### Abordare tehnica:
- Custom hook `useScrollReveal(ref)` cu IntersectionObserver (threshold 0.15)
- CSS classes conditionale aplicate cand elementul devine vizibil
- Counter animation cu `requestAnimationFrame` in useEffect
- Zero dependinte externe noi — totul nativ React + CSS

