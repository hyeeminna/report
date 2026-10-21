---
name: Mindful Notes
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1b1c'
  on-surface-variant: '#414754'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#727785'
  outline-variant: '#c1c6d6'
  surface-tint: '#005bc0'
  primary: '#005bbf'
  on-primary: '#ffffff'
  primary-container: '#1a73e8'
  on-primary-container: '#ffffff'
  inverse-primary: '#adc7ff'
  secondary: '#6750a4'
  on-secondary: '#ffffff'
  secondary-container: '#bba2fd'
  on-secondary-container: '#4b3486'
  tertiary: '#805600'
  on-tertiary: '#ffffff'
  tertiary-container: '#a06d00'
  on-tertiary-container: '#0a0400'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cfbcff'
  on-secondary-fixed: '#22005d'
  on-secondary-fixed-variant: '#4f378a'
  tertiary-fixed: '#ffddb0'
  tertiary-fixed-dim: '#ffba45'
  on-tertiary-fixed: '#281800'
  on-tertiary-fixed-variant: '#614000'
  background: '#fcf9f8'
  on-background: '#1b1b1c'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Noto Sans
    fontSize: 57px
    fontWeight: '400'
    lineHeight: 64px
  headline-lg:
    fontFamily: Noto Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Noto Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Noto Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Noto Sans
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
  title-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Noto Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Noto Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system blends Google Material Design 3 (M3) tactile dynamics with the cheerful, analog comfort of physical sticky notes. Built around mindful task tracking and Gemini AI sentiment analysis, the interface creates an empathetic workspace that transforms daily to-dos into emotionally intelligent self-reflections.

### Target Audience & Personality
- **Audience:** Everyday knowledge workers, students, and creators who manage high cognitive loads and benefit from emotionally resonant, low-friction task tracking.
- **Tone:** Empathetic, warm, clear, intelligent, and tactile.
- **Aesthetic Direction:** Modern M3 minimalism infused with playful analog warmth. Features generous white space, organic pastel containers, soft ambient elevation levels, and clean geometric typography.

## Colors

The palette grounds itself in Google M3’s signature tonal architecture while introducing an emotion-specific sticky note spectrum:

### Functional Accents
- **Primary (`#1A73E8`):** Material Blue for primary call-to-actions, focus rings, and Gemini active states.
- **Secondary (`#6750A4`):** Deep Iris for secondary filtering, AI sparkle accents, and tonal chips.
- **Neutral Surface Canvas (`#F8F9FA`):** An airy off-white canvas that ensures colorful sticky notes stand out.
- **Text & Neutral (`#1F1F1F` / `#444746`):** On-surface neutral tones tuned for accessible contrast over both white surfaces and tinted note containers.

### Emotion & Sentiment Note Palette
Each sticky note card uses a subtle surface tint paired with high-contrast text and a matching tonal border/tag:
- **Positive / Joy (Lemon Yellow):** Background `#FEF7D0`, Border `#FEEAA0`, Accent `#B08800`.
- **Urgent / Warning / Energy (Soft Peach):** Background `#FFE8D6`, Border `#FFD4B8`, Accent `#C25400`.
- **Calm / Focus / Balanced (Mint):** Background `#E6F4EA`, Border `#CEEAD6`, Accent `#137333`.
- **Creative / Reflection (Lavender):** Background `#F3E8FD`, Border `#E9D2FD`, Accent `#7B1FA2`.
- **Neutral / Routine (Sky Blue):** Background `#E8F0FE`, Border `#D2E3FC`, Accent `#1A73E8`.

## Typography

The typography scale relies on **Noto Sans** (with full Noto Sans KR fallback) to preserve crisp legibility across Latin and Korean characters. 

- **Titles & Display:** Scaled with tight letter-spacing (`-0.015em`) for modern digital clarity.
- **Memo Content & Body:** Set with generous line heights (`1.5` to `1.6`) to simulate natural note readability and prevent visual crowding on compact note cards.
- **Labels & Sentiment Badges:** High-legibility medium weight (`500`) with subtle uppercase tracking on tags for quick scanning.

## Layout & Spacing

The layout adapts the structured vertical creation flow from the reference wireframe (Header $\rightarrow$ Category Picker $\rightarrow$ Input Textarea $\rightarrow$ Primary Action Button $\rightarrow$ Horizontal/Masonry Board) into a flexible, multi-column workspace.

### Grid Architecture
- **Mobile (< 600px):** Single vertical column. Full-width sticky creation module at the top; generated notes flow into a 1-column stack or horizontally scrollable snap-strip with `16px` padding and `12px` gaps.
- **Tablet (600px – 1024px):** Fixed top input card with an 8-column layout. Generated notes arrange into a 2-to-3 column auto-fit grid (`gutter: 1rem`).
- **Desktop (> 1024px):** Max container width of `1280px`. Left panel (or top center card, max `680px`) hosts the creation workflow, while the sticky collection displays as an organic multi-column masonry board (4 columns, `gutter: 1.5rem`).

## Elevation & Depth

This system utilizes Google M3's multi-tiered surface tonal layering combined with warm, tinted contact shadows to emulate physical paper sheets laying on a smooth desk surface.

- **Level 0 (Flat / Canvas):** Pure background surface (`#F8F9FA`), 0px shadow.
- **Level 1 (Default Sticky Note & Inactive Cards):** Subtle ambient diffusion: `box-shadow: 0px 1px 3px rgba(60, 64, 67, 0.12), 0px 1px 2px rgba(60, 64, 67, 0.08);`.
- **Level 2 (Hovered Note / Actionable Buttons):** Floating paper effect: `box-shadow: 0px 4px 8px 3px rgba(60, 64, 67, 0.1), 0px 1px 3px rgba(60, 64, 67, 0.12);` paired with a -2px vertical translate.
- **Level 3 (Modal / Floating Input / Dragged Note):** High physical lift: `box-shadow: 0px 10px 24px rgba(60, 64, 67, 0.15), 0px 4px 8px rgba(60, 64, 67, 0.1);`.
- **AI Glow Layer:** Gemini emotion processing highlights inputs and notes with an ambient colored halo matching the detected emotion (e.g., `0px 0px 16px rgba(103, 80, 164, 0.2)`).

## Shapes

The design incorporates Material Design 3's rounded geometric ethos:
- **Base Rounding (`roundedness: 2` / `0.5rem` / `8px`):** Used for internal list items, form fields, and sentiment indicator pills.
- **Large Containers (`rounded-lg` / `1rem` / `16px`):** Applied to the main memo input card and sticky notes, balancing modern UI cleanliness with paper-sheet friendliness.
- **Buttons & Pills (`rounded-xl` to Full Pill):** Applied to category selection chips, sticky note pinning buttons, and AI sentiment reaction chips.

## Components

### Memo Input Card
- **Structure:** Encapsulated container with `#FFFFFF` background, `16px` border radius, and Level 1 elevation.
- **Header Slot:** App header with service title in `title-lg`, featuring a subtle Gemini Sparkle badge in secondary purple.
- **Category Filter (Segmented Chips):** Horizontally scrolling row of pill chips. Selected chip receives `surface-container-high` fill with a crisp checkmark; unselected chips feature subtle outlines (`#E0E2EC`).
- **Text Area:** Borderless or subtle under-line input with auto-expanding height. Includes placeholder text ("무엇을 기억하고 싶으신가요? AI가 감정을 분석해 드립니다...").
- **Gemini Status Indicator:** Real-time micro-badge in the lower left corner showing "감정 분석 대기 중" (Waiting) or dynamic live badges (e.g., "✨ 긍정적인 감정 감지됨").

### Pinning Button (포스트잇 부착 버튼)
- **Visuals:** Full-width or prominent right-aligned M3 Filled Button.
- **States:**
  - *Default:* `#1A73E8` solid fill, white bold text, Level 1 shadow.
  - *Hover:* Slight brightness lift, Level 2 elevation.
  - *Active:* Scaled down to `0.98` with subtle tactile ripple.
  - *Loading (Analyzing):* Shimmer gradient wave simulating Gemini inference.

### Sticky Note Cards (포스트잇 아이템)
- **Dimensions:** Min-height `180px`, aspect ratio roughly `1:1` or fluid auto-height.
- **Anatomy:**
  - *Top Row:* Category tag (pill) on the left; Gemini sentiment badge (emoji + tone name) on the right; pin/kebab action icon.
  - *Body:* Task/memo text in `body-md` (`#1F1F1F`).
  - *Bottom Bar:* Timestamp and completed checkbox (circular M3 checkbox that strikes out text when toggled).
- **Physical Affordance:** Subtle 0.5-degree random rotational variation on desktop hover to evoke real sticky notes pinned to a board.

### Chips & Badges
- **Emotion Tags:** Compact `24px` height pills using emotion-specific colors with `12px` font size and matching tinted border.
- **Checkboxes:** Circular M3 shape that fills with the note's individual accent color upon task completion.