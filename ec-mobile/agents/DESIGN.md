# Design System Document



## 1. Overview & Creative North Star: "The Neon Luminary"



This design system is built to transform a high-energy marketplace into a premium, editorial-grade digital experience. Moving away from the flat, uninspired grids of traditional e-commerce, this system adopts **"The Neon Luminary"** as its Creative North Star.



The aesthetic is characterized by deep, nocturnal surfaces punctuated by vibrant, "glowing" royal blues. It treats the UI not as a flat canvas, but as an architectural space defined by light and depth. By utilizing intentional asymmetry—such as staggered product cards and floating navigation modules—we break the "template" feel, ensuring the marketplace feels curated, reliable, and sophisticated.



---



## 2. Colors



The palette is anchored in deep navy tones, allowing the vibrant primary blues to function as a source of "digital light."



### Core Palette

- **Primary (`#90abff`):** Our signature glow. Used for key interactions and highlights.

- **Surface (`#060e20`):** The foundation. A deep, ink-blue that provides more soul than pure black.

- **Tertiary (`#ffa7eb`):** Used sparingly for "high-energy" moments, such as limited offers or status indicators.



### The "No-Line" Rule

To maintain a high-end editorial feel, **1px solid borders are strictly prohibited for sectioning.** Structural boundaries must be defined solely through background color shifts. For example, a `surface-container-low` card sitting on a `surface` background creates a clean, sophisticated edge without the visual noise of a stroke.



### Surface Hierarchy & Nesting

Treat the UI as a series of physical layers. We use a "Nesting" principle to define importance:

- **Base Level:** `surface` (#060e20)

- **Secondary Tier:** `surface-container` (#0f1930)

- **Elevated Tier:** `surface-container-high` (#141f38)

*Example: A search bar should be a `surface-container-highest` element nested within a `surface-container-low` header.*



### The "Glass & Gradient" Rule

Floating elements (like the navigation dock or specialized product tags) should utilize **Glassmorphism**. Apply semi-transparent surface colors with a `backdrop-blur` (minimum 12px). For primary CTAs, use a subtle linear gradient from `primary` (#90abff) to `primary-dim` (#316bf3) to add a sense of three-dimensional "soul."



---



## 3. Typography



The system utilizes a dual-font strategy to balance authority with modern accessibility.



- **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech-premium" feel. Use `display-lg` (3.5rem) with tight letter-spacing for hero sections to create an editorial impact.

- **Titles & Body (Inter):** The workhorse. Inter provides maximum legibility for product descriptions and functional labels.



**Hierarchy Strategy:**

Large, bold Manrope headlines establish a clear brand voice, while Inter in `body-md` (0.875rem) handles the utilitarian data. This contrast ensures that even in a data-heavy marketplace, the interface remains breathable and high-end.



---



## 4. Elevation & Depth



We eschew "standard" drop shadows in favor of **Tonal Layering** and **Ambient Light**.



- **The Layering Principle:** Depth is achieved by "stacking" surface tiers. To make a product card "pop," don't add a border; place a `surface-container-low` card on a `surface` background.

- **Ambient Shadows:** For floating components like Modals or Navigation Docks, shadows must be extra-diffused.

- *Spec:* Offset: 0, 8px; Blur: 24px; Color: `on-surface` at 6% opacity.

- **The "Ghost Border" Fallback:** If a border is required for accessibility, use a "Ghost Border": the `outline-variant` (#40485d) at 15% opacity. Never use 100% opaque lines.

- **Frosted Glass:** Use `surface-bright` (#1f2b49) at 60% opacity with a heavy blur for elements that need to feel integrated into the background while remaining legible.



---



## 5. Components



### Buttons

- **Primary:** Gradient fill (`primary` to `primary-dim`). Corner radius: `full`. High-energy, rounded, and authoritative.

- **Secondary:** Surface-container-high fill with `on-surface` text. No border.

- **Tertiary (Ghost):** No background. Use `label-md` Inter with 1.5px letter spacing for a refined, minimal look.



### Cards & Lists

- **Rule:** Forbid divider lines.

- **Implementation:** Separate items using `6` (1.5rem) vertical white space or subtle shifts from `surface-container` to `surface-container-low`.

- **Rounding:** Use `xl` (1.5rem) for main product cards to emphasize a modern, friendly marketplace feel.



### Input Fields

- **Default State:** `surface-container-highest` background, no border.

- **Active State:** A 1px "Ghost Border" using `primary` at 40% and a subtle `primary` outer glow (4px blur).

- **Corner Radius:** `md` (0.75rem).



### Navigation Dock (Custom)

Instead of a traditional footer, use a floating Glassmorphic dock.

- **Style:** `surface-container` at 80% opacity, `backdrop-blur: 16px`, corner radius `xl`.



---



## 6. Do's and Don'ts



### Do

- **Do** use asymmetrical layouts. Stagger product images slightly to create a sense of movement.

- **Do** prioritize white space. Let the deep surface colors "breathe" to maintain a premium feel.

- **Do** use the `primary` color for "moments of joy" (success states, cart badges, active toggles).



### Don't

- **Don't** use 1px solid white or grey dividers. It kills the "Neon Luminary" vibe and creates visual clutter.

- **Don't** use sharp corners. Every interactive element must follow the `Roundedness Scale` (minimum `md`).

- **Don't** use generic black shadows. Shadows must always be a tinted, low-opacity version of the deep navy background.

- **Don't** crowd product information. If a product has multiple variants, use `Chips` with `sm` rounding instead of a standard dropdown.