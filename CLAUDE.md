# CLAUDE.md — Jesse Peters Portfolio

> Dit document is de single source of truth voor het ontwerp en de bouw van de site. Alles wat hier staat moet de implementatie volgen, tenzij Jesse expliciet anders aangeeft.

---

## 1. Project context

Custom-coded herbouw van het Webflow portfolio (`portfolio-site-544c15.webflow.io`) naar een eigen Next.js + Tailwind v4 site. Doel: volledige controle, betere performance, richer animaties, dark mode, en een CMS voor projecten.

**Tech stack** (al opgezet):
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (CSS-native config in `app/globals.css`)
- Framer Motion voor animaties
- Sanity.io CMS (nog te integreren)
- Vercel hosting (planned)

**Bronnen:**
- Figma: `https://www.figma.com/design/hXKoXILOFwzmcZ85Vo4n7k/Portfolio-site` (node `2015:7026` = Home)
- Live ref: `https://portfolio-site-544c15.webflow.io/`

---

## 2. Design system

### 2.1 Kleuren

Het ontwerp gebruikt een **donker thema** als primair (de huidige Webflow site is overwegend licht — dit is een belangrijke wijziging). Op basis van de Home screenshot:

| Token | Waarde | Gebruik |
|---|---|---|
| `--bg` | `#0E0E0D` (near-black, warm) | Page background |
| `--bg-secondary` | `#1A1A18` | Card/panel background |
| `--white` | `#FFFFFF` | Primary text (small/body) |
| `--off-white` | `#F9F9F9` | Display text (hero) |
| `--text-muted` | `~#888884` | Secondary/labels |
| `--border` | `~#2A2A28` | Dividers |
| `--accent-magenta` | `#FC44CE` ✓ confirmed | Statement blocks |
| `--accent-yellow` | TBD | Statement blocks (Leeuw Worden) |
| `--accent-blue` | TBD | Project card fills (Makers van werkgeluk) |

Light mode is **actief** via `[data-theme="light"]` in `globals.css`. De CSS variables schakelen automatisch: `--white` is `#ffffff` in dark en `#1a1a18` in light, `--off-white` en `--text-muted` idem.

### 2.2 Typografie

Op basis van de hero proporties (`Jesse Peters` 1780×183 px, `A Visual & Digital Designer` 685×85 px) zijn dit display-formaten. De huidige Webflow site lijkt met een **light/thin sans-serif** te werken voor display + sans voor body.

**Bevestigd systeem:**

| Token | Font | Weight | Waar gebruikt |
|---|---|---|---|
| `--font-display` | **PP Right Grotesk Wide Medium** | 500 | Hero, "See all my work", "Say, hi!" |
| `--font-sans` | **PP Neue Montreal** | 400/500 | Body, navigation, captions, sub-headings |

**Bevestigde type styles:**

```css
/* Display (PP Right Grotesk Wide) */
--type-hero {
  font-family: "PP Right Grotesk";
  font-size: 170px;
  font-weight: 500;
  line-height: 183px; /* 107.6% */
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'salt' on;
  color: #F9F9F9;
}

/* Sub / heading (PP Neue Montreal) */
--type-sub {
  font-family: "PP Neue Montreal";
  font-size: 60px;
  font-weight: 500;
  line-height: 120%; /* 72px */
  font-variant-numeric: lining-nums proportional-nums;
  font-feature-settings: 'salt' on;
  color: #FFFFFF;
}
```

**Schaal (afgeleid en geschat):**

- Hero — `170px` (PP Right Grotesk) — "Jesse Peters", "Say, hi!", "See all my work"
- Sub-display — `60px` (PP Neue Montreal) — "A Visual & Digital Designer", section labels
- Body L — `24px` (PP Neue Montreal) — intros, meta
- Body — `16px` (PP Neue Montreal) — paragraph, navigation
- Caption — `12-14px` (PP Neue Montreal) — labels

**Font-feature-settings**: alle text gebruikt `'salt' on` + `lining-nums proportional-nums` voor consistente cijfers en stylistic alternates.

### 2.3 Spacing & layout

- **Canvas-breedte design:** 1920px (full-width desktop)
- **Page padding:** ~70px links/rechts op desktop (ruim, royaal)
- **Grid:** asymmetrische kaartgrid op de home (geen vast 3-kolom systeem — sommige cards 614px, andere 915px, andere 1216px breed)
- **Verticale ritme:** ~150-250px tussen secties

### 2.4 Iconografie

- **Pijl-icoon (→)** voor navigatie ("View all my work", project cards)
- **Circulaire CTA button** — 174×174px ronde knop met pijl in de footer (naast "Say, hi!"). Dit is een opvallend element.
- Geen complexe iconensets nodig.

---

## 3. Page structuur

### 3.1 Home (`/`) — Figma node `2015:7026`

**Layout flow:**
1. **Header bar** (top, fixed-positioned)
   - Links: `Jesse Peters` (logo, klein, 14-16px)
   - Rechts: `hi@jessepeters.nl` (klein, 14-16px) + profielfoto rond
2. **Hero sectie** (~100vh visueel)
   - GROTE `Jesse Peters` display tekst (full-width, 140-180px)
   - `A Visual & Digital Designer` subtitle, rechts uitgelijnd onder
3. **🆕 Infinite scrolling photo backdrop** (zie sectie 4.1)
4. **Floating pill menu** (zie sectie 4.2) — `Home / About / Work / Moments`
5. **Asymmetrische projectgrid** — 6 featured projects als beeld-cards in verschillende formaten en kleuraccenten
6. **"See all my work" CTA** — grote display tekst met pijl, klikbaar
7. **Footer** — "Say, hi!" + LinkedIn / Awwwards / Instagram + circulaire mail-knop

### 3.2 Work (`/work`)
- Sticky tekst (zie sectie 4.3) + grid van alle 9 projecten
- **Te bevestigen:** layout van work-overview (screenshot nodig)

### 3.3 Project detail (`/work/[slug]`)
- Case study layout
- **Te bevestigen:** screenshot nodig

### 3.4 About (`/about`)
- Bio, expertise, hobby's (analoge fotografie, triatlon)
- **Te bevestigen:** screenshot nodig

### 3.5 Moments (`/moments`)
- Sticky tekst + foto grid (analoge reisfoto's)
- **Te bevestigen:** screenshot nodig

---

## 4. Speciale interacties (uit Jesse's brief)

### 4.1 Infinite scrolling photo backdrop (Home)
- **Wat:** achtergrond foto's van Jesse die infinite blijven scrollen
- **Waar:** **alleen op 100vh van de eerste load** — daarna stopt het effect
- **Hoe:** content scrollt eroverheen (zoals op de huidige Webflow site)
- **Implementatie:** vaste `position: fixed` strip met foto's + CSS animation `marquee` (translateX). Wordt overlapt door content die over deze sectie heen scrollt.
- **Reference:** zie `https://portfolio-site-544c15.webflow.io/` voor hetzelfde effect

### 4.2 Floating navigatie menu
- **Positie:** floating onderaan de pagina, horizontaal gecentreerd
- **Inhoud:** `Home / About / Work / Moments`
- **Stijl:** pill-shape (afgeronde rechthoek), 449×56px in design (proportioneel naar viewport schalen)
- **Gedrag:** altijd zichtbaar (sticky / fixed bottom), users navigeren hierdoorheen
- **Tip:** subtle backdrop-blur en achtergrondkleur met transparantie zodat het over content "drijft"

### 4.3 Sticky teksten
- **Waar:** Work overview én Moments page
- **Wat:** twee teksten per pagina blijven sticky tijdens scrollen
- **Te bevestigen:** welke teksten precies en hun positie (links/rechts/center?). **Screenshot nodig.**

### 4.4 Custom cursor
- **Default:** 16×16px circle, volgt muis met **kleine delay** (smooth lag)
- **Hover state:** vergroot naar 24×24px wanneer over klikbare elementen (links, knoppen, project cards)
- **Implementatie:** `position: fixed` div, `transform: translate(x, y)` met `transition` of Framer Motion `useSpring`
- **Hide on touch devices:** alleen tonen wanneer `pointer: fine`

---

## 5. Inconsistencies & open vragen

Dit zijn dingen die in het Figma-bestand of de brief afwijken/onduidelijk zijn — graag bevestigen.

### 5.1 Menu positie in Figma
**Inconsistentie:** in Figma staat het Menu op `(728, 886)` — dat is **vlak onder de hero**, niet onderaan de pagina. De brief zegt expliciet: "het menu onderaan is een floating menu".

**Mijn interpretatie:** ik bouw het menu als een **floating sticky pill aan de onderkant van de viewport** (ongeveer 24-32px van bottom), gecentreerd. De positie in Figma (`y=886`) negeer ik als "design canvas placement". Als jij wel wilt dat het menu na de hero verschijnt en pas onderaan plakt na scrollen, geef dat dan even aan.

### 5.2 Header bar elementen
**Wat ik zie:** `Jesse Peters` logo links + `hi@jessepeters.nl` rechts in de header (y=40).

**Vraag:** is `hi@jessepeters.nl` letterlijk de tekst die in de header staat (een mailto link)? Of komt daar een ander element (bijv. CTA button)?

### 5.3 Hero proporties
**Wat ik zie:** `Jesse Peters` is **enorm** (1780×183px op een 1920px canvas). `A Visual & Digital Designer` is rechts uitgelijnd onder de naam.

**Aanname:** dit is bedoeld als statement hero, vol-breedte. Op mobile schaal ik dit naar `clamp(48px, 12vw, 180px)`. **Bevestig dat dit klopt.**

### 5.4 Project grid kleurblokken
**Wat ik zie:** sommige project cards hebben een gekleurde achtergrond (blauw "Makers van werkgeluk", roze/geel "Leeuw worden") in plaats van een foto.

**Vraag:** zijn die kleurblokken "design teasers" voor projecten waar nog geen foto van is, of zijn dit bewuste statement-blocks die per project apart gestyled worden? Ik vermoed het laatste — dan moet `color` een prop op het Project schema worden in Sanity.

### 5.5 Light mode
**Beslissing:** ik bouw eerst alleen het donkere thema. Light mode toggle stop ik in week 2 als alles staat. De CSS variable structuur is al klaar.

### 5.6 Lorem ipsum content
**Wat ik zie:** in de Figma metadata staan veel placeholder Latijnse teksten in de embedded project cards.

**Aanname:** ik gebruik de echte content van de Webflow site voor projecten. Lorem ipsum laat ik weg.

### 5.7 Display font
**Onbekend:** ik zie in de screenshot een licht/thin sans (mogelijk PP Neue Montreal of vergelijkbaar). **Welk font gebruik je?** Stuur de Figma typography styles screenshot of de font namen.

### 5.8 Accent kleuren exact
**Onbekend:** ik heb hex codes gegokt (`#FFE800`, `#FF3DA8`, `#3050D8`). **Stuur de exacte hex codes** of een screenshot van de Figma color variables.

---

## 6. Conventies voor implementatie

### 6.1 CSS variables boven Tailwind utilities voor design tokens
Tokens (`--bg`, `--text`, `--accent-*`) wonen in `app/globals.css` onder `:root`. In componenten gebruik je `style={{ color: "var(--text)" }}` of een Tailwind utility die naar de variable verwijst (`bg-[var(--bg)]`). Dit maakt theme-switching trivial.

### 6.6 Tekst kleur — gebruik ALTIJD CSS variables, nooit hardcoded hex

**Regel:** gebruik voor alle tekst de design-token variables, zodat dark → light automatisch correct is. Gebruik **nooit** hardcoded `#fff`, `#ffffff`, `#FFF`, `#1a1a18`, `#727272`, etc. voor tekstkleur in de UI.

| Gebruik | Variable | Dark | Light |
|---|---|---|---|
| Primaire tekst | `var(--white)` | `#ffffff` | `#1a1a18` |
| Display / hero tekst | `var(--off-white)` | `#f9f9f9` | `#1a1a18` |
| Body tekst | `var(--text)` | `#f0ede6` | `#1a1a18` |
| Secundaire / labels | `var(--text-muted)` | `#888884` | `#7a7a76` |

**Uitzondering — tekst op afbeeldingen of donkere hero-overlays:**
Tekst die direct over een foto of video staat (bijv. projecttitel in hero, "Next project" kop boven de next-project card) blijft altijd `#ffffff` hardcoded. De achtergrond is altijd donker (foto + overlay), dus het thema is hier niet relevant. Zet in een comment `/* always white — over image */` om de intentie duidelijk te maken.

### 6.2 Animatie principes
- **Subtiel boven flashy** — fade + 16-24px translate, 400-600ms easing.
- **Page transitions** via Framer Motion `AnimatePresence` op layout-niveau.
- **Scroll triggers** via `whileInView` met `once: true` en `margin: "-80px"`.
- **Geen** parallax tenzij expliciet gevraagd.

### 6.3 Componenten eerst herbruikbaar maken
Project card, photo card, sticky text — bouw als losse components in `components/`. Pages blijven dun.

### 6.4 Geen comments tenzij niet-vanzelfsprekend
Volg de algemene afspraak: als de naamgeving het uitlegt, geen comment.

### 6.5 Mobiel schaalt vanuit desktop
Ontwerp is `1920px` first. Mobile breakpoints: `<768` (sm), `768-1280` (md), `>1280` (xl).

---

## 7. TODO-status

- [x] Next.js + Tailwind v4 + Framer Motion setup
- [x] Eerste pass alle pagina's (placeholder donker thema, lichte stijl)
- [ ] **Site herstylen naar Figma-spec** (donker thema, juiste typografie, asymmetrische grid)
- [ ] Floating bottom navigation
- [ ] Custom cursor
- [ ] Infinite scrolling photo backdrop op home
- [ ] Sticky teksten op Work + Moments
- [ ] Sanity CMS schema's
- [ ] Echte project beelden importeren
- [ ] Light mode toggle (deferred)

---

## 8. Wat ik nog van Jesse nodig heb

1. **Screenshots** van Work-overview, Project-detail, About en Moments frames in Figma
2. **Font namen** (display + body) — uit Figma styles
3. **Exacte hex codes** voor de accent kleuren (geel, magenta, blauw) — uit Figma color variables
4. **Bevestiging** op de open punten in sectie 5
