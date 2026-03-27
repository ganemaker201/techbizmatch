# Design System Documentation: The Tactile Playground

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Tactile Playground."** 

Education in economics for children often feels abstract and dry. This system moves beyond the "flat" web to create a digital environment that feels like a premium physical toy—polished, chunky, and irresistibly interactive. We break the standard "template" look by utilizing intentional asymmetry, where our mascot and currency elements (gold coins) frequently "break the box," overlapping containers to create a sense of life and depth. We avoid rigid, corporate grids in favor of a bouncy, rhythmic layout that rewards exploration with visual delight.

## 2. Colors & Surface Logic
The palette is a high-chroma trio of Green, Yellow, and Blue, balanced by a sophisticated warm-neutral base. 

- **Primary (`#2a6900`):** Growth and "Go." Used for the most critical actions and success states.
- **Secondary (`#725800`):** Wealth and Reward. Used for currency-related elements and "Premium" features.
- **Tertiary (`#00628c`):** Trust and Information. Used for instructional zones and secondary navigation.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. To separate content, designers must use **Background Color Shifts**. For example, a card should not have an outline; it should be a `surface-container-lowest` block sitting on a `surface-container-low` background. This creates a softer, more modern editorial feel.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, high-quality plastic or frosted glass sheets.
- **Base Layer:** `surface` (`#f8f6f5`).
- **Section Layer:** `surface-container-low` (`#f2f0f0`) to define large content areas.
- **Interactive Layer:** `surface-container-lowest` (`#ffffff`) for cards or inputs that the user needs to touch.

### The "Glass & Signature" Rule
For overlays and modal backdrops, use the `surface` color at 80% opacity with a `backdrop-blur` of 20px. To provide "soul," apply a subtle linear gradient to main CTA buttons, transitioning from `primary` to `primary_container`. This prevents the "flat vector" look and adds professional polish.

## 3. Typography
We use a high-contrast scale to ensure readability for younger audiences while maintaining a premium editorial edge.

- **Display & Headlines (`plusJakartaSans`):** This is our "Character" font. With its generous x-height and geometric curves, it feels friendly yet authoritative. Use `display-lg` (3.5rem) for celebratory moments—like earning a new coin.
- **Title & Body (`beVietnamPro`):** Chosen for its exceptional legibility. We use `title-md` for most instructional text to keep the "voice" of the app conversational and clear.
- **Hierarchy Tip:** Always pair a `headline-sm` in `on_surface` with a `body-md` in `on_surface_variant` to create clear information signaling through tonal contrast rather than just size.

## 4. Elevation & Depth: The 3D Principle
In this design system, depth is not an afterthought—it is a functional mechanic.

### The Layering Principle
Depth is achieved through **Tonal Layering**. Place a `surface-container-lowest` card on a `surface-dim` background to create a soft, natural lift. 

### Chunky 3D Buttons
All primary interactive elements must use the "Chunky" effect. 
- **The Visual:** A button has a solid fill (e.g., `primary`) and a 4px bottom border (the "Shadow") using the "Dim" variant (e.g., `primary_dim`).
- **The Interaction:** On click/tap, the button should translate 2px downward, and the bottom border should shrink to 2px, mimicking a physical press.

### Ambient Shadows & Ghost Borders
- **Shadows:** Avoid dark grey. Use the `on_surface` color at 4% opacity with a 32px blur for floating elements.
- **The Ghost Border:** For accessibility in high-density areas, use a `outline-variant` at 15% opacity. Never use 100% opaque borders.

## 5. Components

### Buttons
- **Primary:** `primary` fill, `primary_dim` 4px bottom border, `on_primary` text. Use `xl` (3rem) corner radius.
- **Secondary:** `secondary_container` fill, `secondary` 4px bottom border, `on_secondary_container` text.
- **Animation:** Use a "spring" curve (mass: 1, stiffness: 300, damping: 15) for all button presses.

### Cards & Content Blocks
- **Forbid Dividers:** Use vertical white space (Scale `8` or `10`) or a shift to `surface-container-high` to separate content. 
- **Shape:** All cards must use the `lg` (2rem) or `xl` (3rem) corner radius to maintain the "playful" DNA.

### Progress Bars
- **Track:** `surface-container-highest`.
- **Fill:** `primary` or `tertiary`. 
- **Style:** 20px height with a "gloss" highlight (a white 10% opacity stripe) across the top half to make it look like a physical tube.

### Input Fields
- **Background:** `surface-container-lowest`.
- **Border:** 2px "Ghost Border" using `outline-variant` at 20%.
- **Active State:** Border jumps to 3px `primary` with a subtle `primary_container` glow.

### The Mascot Overlay
The mascot (Piggy/Owl) should never be confined to a box. Use `z-index` to allow the mascot to "sit" on top of the bottom navigation or "peek" from behind a content card.

## 6. Do's and Don'ts

### Do:
- **Use "Bouncy" Motion:** Elements should overshoot their destination slightly before settling (Spring physics).
- **Embrace White Space:** Use the `16` (5.5rem) spacing token to let high-level screens breathe.
- **Color-Code Logic:** Green for "Earned," Red (`error`) for "Spent," and Yellow (`secondary`) for "Saved."

### Don't:
- **Don't use 1px black borders:** This breaks the premium, toy-like immersion.
- **Don't use sharp corners:** Even the "none" setting in our scale should be avoided for UI elements; stick to `DEFAULT` (1rem) minimum.
- **Don't use standard drop shadows:** They feel "dirty." Use tonal background shifts instead.
- **Don't crowd the screen:** If a child can't tap it with a thumb-sized margin of error, it’s too small. Use the Spacing Scale to pad all touch targets.