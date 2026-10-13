# IceGuard — Design System

> Instrument-panel aesthetic: calm, precise, high-contrast-on-dark.
> Inspired by maritime ECDIS displays, not Silicon-Valley dashboards.

---

## 1 Colour tokens (CSS custom properties on `:root`)

```
--bg-page:        #101820   /* near-black blue-grey */
--bg-panel:       #18222e   /* card / instrument background */
--bg-panel-hover: #1f2d3d   /* hovered row or card */
--border:         #2a3a4e   /* subtle panel borders */
--text-primary:   #e8ecf1   /* main copy */
--text-secondary: #8899aa   /* labels, captions */
--accent:         #4db8ff   /* interactive elements, links, focus rings */
--accent-dim:     #2a7ab5   /* muted accent */
--danger:         #e05252   /* iceberg zones, errors */
--danger-dim:     rgba(224,82,82,0.15)
--route-baseline: #6b7280   /* grey — direct/baseline route */
--route-balanced: #e5a318   /* warm amber — balanced route */
--route-safest:   #22c55e   /* green — safest route */
--positive:       #22c55e   /* positive change, ice-reduction % */
--negative:       #e05252   /* negative change */
--warning:        #e5a318
--badge-mock-bg:  rgba(229,163,24,0.15)
--badge-mock-fg:  #e5a318
```

## 2 Typography

- **Font stack**: `'DM Sans', system-ui, -apple-system, sans-serif`
  Load weights **400, 500, 700** from Google Fonts.
- **Mono** (metrics, percentages): `'DM Mono', ui-monospace, monospace`
  Load weight **400** from Google Fonts.

| Role             | Size     | Weight | Colour           |
|------------------|----------|--------|------------------|
| Page title       | 1.25rem  | 700    | --text-primary   |
| Subtitle / tag   | 0.75rem  | 500    | --text-secondary |
| Section heading  | 0.85rem  | 700    | --text-primary   |
| Body / table     | 0.8rem   | 400    | --text-primary   |
| Caption / hint   | 0.7rem   | 400    | --text-secondary |
| Metric value     | 0.8rem   | 400    | --text-primary, mono |
| Badge            | 0.65rem  | 700    | varies           |

## 3 Spacing & radii

| Token        | Value |
|--------------|-------|
| --space-xs   | 4px   |
| --space-sm   | 8px   |
| --space-md   | 12px  |
| --space-lg   | 16px  |
| --space-xl   | 24px  |
| --radius     | 6px   |
| --radius-sm  | 4px   |

## 4 Component patterns

### Cards
```css
background: var(--bg-panel);
border: 1px solid var(--border);
border-radius: var(--radius);
padding: var(--space-lg);
```
No box-shadow. No gradients. No glow.

### Buttons
```css
/* Primary */
background: var(--accent);
color: #101820;
font-weight: 700;
font-size: 0.8rem;
padding: 10px 20px;
border: none;
border-radius: var(--radius);
cursor: pointer;
min-height: 44px;          /* tap target */
transition: background 0.15s;
```
Hover: `filter: brightness(1.1)`. Disabled: `opacity: 0.45; cursor: not-allowed`.

Secondary / ghost buttons: `background: transparent; border: 1px solid var(--border); color: var(--text-primary)`. Hover: `background: var(--bg-panel-hover)`.

### Table
No outer border. Rows separated by `1px solid var(--border)`.
Header row: `color: var(--text-secondary); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em`.
Clickable rows: `cursor: pointer`, hover `background: var(--bg-panel-hover)`.
Active/highlighted row: left 3px border in route colour.

### Badges
```css
font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
padding: 2px 8px; border-radius: var(--radius-sm);
```

## 5 Layout

**Desktop (≥ 768px)**:
Two-column grid: map column ~62%, instrument panel ~38%.
Full viewport height, no scroll on the outer shell (panel scrolls internally).

```
┌──────────────────────────────────┬──────────────────┐
│            MAP (62%)             │  INSTRUMENT      │
│                                  │  PANEL (38%)     │
│                                  │  (scrolls)       │
└──────────────────────────────────┴──────────────────┘
```

**Mobile (< 768px)**:
Stack: map on top (52vh), panel below (scrolls).

Container: no max-width on desktop (full bleed). On mobile, 100% with `padding: 0 var(--space-md)` for the panel.

## 6 Header

A thin bar (40px) at the very top, spanning both columns.
- Left: **IceGuard** (title) + **Antarctic route advisor** (subtitle), inline.
- Right: **Team Paradox** badge.
- Background: `var(--bg-panel)`. Bottom border: `1px solid var(--border)`.

## 7 Map styling

- **Tiles**: OpenStreetMap via unpkg Leaflet 1.9.4.
  Apply a CSS filter to the tile pane to mute colours:
  ```css
  .leaflet-tile-pane { filter: saturate(0.2) brightness(0.55); }
  ```
- **Ice cells**: `color: var(--accent-dim)`, `fillOpacity: value * 0.6`, `stroke: false`, `interactive: false`.
- **Iceberg zones**: `color: var(--danger)`, `fillColor: var(--danger)`, `fillOpacity: 0.12`, `weight: 1`, `dashArray: '4 4'`, tooltip "Iceberg: forecast risk zone".
- **Markers**: Use `L.circleMarker` (radius 7, `color: var(--accent)`, `fillColor: var(--accent)`, `fillOpacity: 1`, `weight: 2`). Bind a permanent tooltip with className `marker-label` showing "START" or "END" in uppercase 0.65rem bold.
- **Hint line**: Dashed `var(--accent-dim)`, weight 1, dashArray '6 6'.
- **Route lines**:
  | Route    | Colour             | Weight | Dash       |
  |----------|--------------------|--------|------------|
  | baseline | --route-baseline   | 2      | 6 4        |
  | balanced | --route-balanced   | 2.5    | none       |
  | safest   | --route-safest     | 3.5    | none       |

- **Legend**: Bottom-left, compact card style matching `--bg-panel`, 0.65rem text.
- **Scale**: `L.control.scale({ metric: true, imperial: false })`.

## 8 Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0s !important; animation-duration: 0s !important; }
}
```
All transitions: 0.15s ease. No spring physics, no bounce, no parallax.

## 9 Focus & accessibility

- Focus ring: `outline: 2px solid var(--accent); outline-offset: 2px`.
- All interactive elements reachable via keyboard.
- Minimum contrast: 4.5:1 for body text, 3:1 for large text.

## 10 Copy rules

- **Do** say: "route advisor", "recommended route", "navigator retains final decision".
- **Don't** say: "AI-powered", "smart", "intelligent", "magic", emoji.
- Tone: calm, factual, deferential to the human operator.
