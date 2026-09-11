# Zuiver

A dependency-free restaurant website using the supplied photography, films, logos, and local Aguero fonts.

## Run

- `npm run dev` — http://localhost:5819 (override with `PORT=...`).
- `npm run check` — JavaScript syntax checks.
- `npm run build` — deployable static site in `dist/`.

## Design and motion

Wheel scrolling travels at 58% of the native distance with 170ms time-based damping. Keyboard scrolling eases into place, and navigation links use a 1.1–2.6 second ease-in/ease-out transition. Reversing direction cancels prior momentum. Native touch, pinch-to-zoom, nested scroll areas, dialogs, and reduced-motion preferences retain their normal behavior.

- Text-free cinematic hero; fixed navigation and context-sensitive logo.
- Scroll-driven heritage collage and rising Heritage title.
- Three-column editorial menu with all six `menu-image-*.png` photographs. The center panel stays sticky until the section ends. Click anywhere on it, or focus its button and press Enter/Space, to switch food/drinks. Hover and keyboard focus turn the paper black. Side images have independent parallax.
- Full-height philosophy film, with a mobile overlay composition.
- Stronger Aguero display type, masked sunrise title entrances, and ordered letter reveals. Original text remains available to assistive technology.
- A pinned evening scene expands from a small frame at the bottom, then slides left to reveal the ivory visit section.
- The original header logo descends and grows into the footer. The original navigation controls move alongside it, above stacked footer links, while `footer-background.png` fades in.
- Native dialogs preserve focus and support Escape. Films pause offscreen; manual controls are in Explore and alongside the kitchen film.
- Reduced motion disables parallax, character delays, and scroll choreography, stops autoplay, and exposes evening and visit as ordinary consecutive sections.

## Content

Food names, prices, and address come from the supplied menu artwork. The supplied assets do not contain a drinks list or prices, so the drinks panel uses unpriced editorial categories. Replace these with the restaurant's actual list before launch. Brand narrative does not invent historical dates or awards.

Reservations remain unconnected to a booking provider. The visit dialog explains that online booking is unavailable; no reservations are submitted or stored.

## Verification

Production build and syntax checks. Browser inspections at 1280×720, 390×844, and 375×667. Verified full-panel and keyboard menu switching, sticky panel position, full-height kitchen video, evening expansion and horizontal reveal, visit navigation and dialog, and footer logo/background transition. Reduced-motion behavior is implemented in CSS and JavaScript; OS preference was not changed during browser checks.
