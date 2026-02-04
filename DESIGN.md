# Revenant Bridge UI Design

## Bold Maximalist Production-Grade Interface

### Design Principles

**Typography**
- Primary: Inter Bold 72px for headlines (-0.04em letter spacing)
- Secondary: Inter Bold 42px for section titles
- Body: Inter Bold 18px for forms
- Emphasis on weight hierarchy over size variety

**Layout**
- Asymmetric grid: `1.2fr 0.8fr 1fr`
- Generous whitespace: 120px container padding, 100px grid gaps
- Deliberate imbalance creates visual interest
- Sections span multiple grid cells for dynamic composition

**Color Palette**
- Background: `#FAFAFA` (off-white, reduces eye strain)
- Cards: `#FFFFFF` (pure white for contrast)
- Primary: `#0A0A0A` (near-black for text & CTAs)
- Accent: `#1F2937` (dark status card)
- Borders: `#E5E7EB` (subtle gray)
- Inputs: `#F9FAFB` (light gray background)

**Shadows & Depth**
- Base: `0 4px 24px rgba(0,0,0,0.04)` - subtle elevation
- Hover: `0 12px 48px rgba(0,0,0,0.08)` - pronounced lift
- Buttons: `0 4px 16px rgba(0,0,0,0.12)` - tactile weight
- Inset: `inset 0 2px 8px rgba(0,0,0,0.03)` - recessed results

**Interactions**
- Cubic bezier easing: `(0.4, 0, 0.2, 1)` for smooth acceleration
- 400ms transitions for major state changes
- Hover transforms: `-4px` translateY for lift effect
- 6px top accent bar scales on card hover
- Button ripple effect using pseudo-element expansion

**Grid Asymmetry**
```
┌─────────────┬───────┬───────┐
│             │       │       │
│  Salvage    │ Revive        │
│             │       │       │
│  (1/3)      ├───────┼───────┤
│             │       │       │
│             │  Pay  │Status │
│             │       │(dark) │
└─────────────┴───────┴───────┘
```

**Responsive Breakpoints**
- Desktop: 3-column asymmetric grid
- Tablet (< 1400px): 2-column symmetric grid
- Mobile (< 768px): Single column stack

**Accessibility**
- ARIA labels on all inputs
- Live regions for dynamic content (`role="status" aria-live="polite"`)
- Semantic HTML5 structure
- Prefers-reduced-motion media query support
- High contrast ratios (WCAG AAA compliant)
- Focus states with 4px outline offset

**Railway Deployment**
- All assets inline (no external dependencies except Google Fonts)
- Single `server.js` file contains HTML/CSS/JS
- Environment-aware port binding (`process.env.PORT`)
- Health check endpoint for monitoring
- Structured console output for debugging

**Production Features**
- Form validation with error states
- Loading states during API calls
- Status indicators with pulse animation
- Timestamp tracking for activity
- Error boundary handling
- Button disabled states during processing

### Technical Implementation

**Performance**
- Font preconnect for faster loading
- CSS transitions use GPU-accelerated properties (transform, opacity)
- No external JavaScript libraries (vanilla JS)
- Efficient event delegation
- Minimal reflows/repaints

**Maintainability**
- Semantic class names (.section, .result, .status-indicator)
- Consistent spacing scale (multiples of 4/8)
- Logical CSS organization (reset → layout → components → responsive)
- Self-documenting code structure

**Browser Support**
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox for layout
- CSS Custom Properties not used (for wider compatibility)
- Progressive enhancement philosophy

### Visual Hierarchy

1. **Hero Title**: 72px bold, immediate attention
2. **Section Titles**: 42px bold, scannable structure
3. **Form Labels**: 14px bold uppercase, guidance
4. **Input Fields**: 18px bold, clear data entry
5. **Results**: Monospace code blocks, technical precision

### Micro-Interactions

- Card hover: Border accent reveal + shadow elevation
- Button hover: Background darken + ripple effect
- Input focus: Border color shift + background lighten + lift
- Form submit: Button text change + disable state
- Status pulse: Continuous attention draw

### Design Rationale

**Why Bold Maximalism?**
- Confidence: Heavy typography communicates authority
- Clarity: High contrast aids quick comprehension
- Modern: Aligns with contemporary design trends
- Memorable: Distinctive visual identity

**Why Asymmetry?**
- Dynamic: Breaks grid monotony
- Hierarchy: Naturally prioritizes content
- Professional: Demonstrates design sophistication
- Engaging: Creates visual flow and exploration

**Why High Whitespace?**
- Focus: Reduces cognitive load
- Premium: Conveys quality and care
- Breathability: Comfortable extended use
- Scalability: Accommodates future features

---

**Version**: 2.0.0  
**Last Updated**: 2026-02-04  
**Commit**: d9c6f093
