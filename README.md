# Reso Music — marketing website

An offline, local-first music player for Android. This repository is the
marketing site: plain HTML, CSS and JavaScript with no build step.

## Stack

No framework, no bundler, no npm install. Open `index.html` through any static
server and it runs.

| Piece | What it is |
| --- | --- |
| `index.html` | Landing page — hero, features, screenshots, how it works, wordmark, developer credit |
| `privacy.html` | Privacy policy (sticky table of contents) |
| `terms.html` | Terms of service (sticky table of contents) |
| `404.html` | Not-found page |
| `assets/css/style.css` | The whole design system, including both themes |
| `assets/js/main.js` | Theme toggle, mobile nav, scroll spy, reveal animations, Lenis setup |
| `assets/vendor/lenis.min.js` | Lenis 1.3.11, vendored so there is no runtime CDN dependency |

## Design system

Warm amber "liquid glass" on espresso neutrals, following Apple's Liquid Glass
material spec — 22px backdrop blur at 1.55× saturation, a translucent fill, a
gradient hairline rim and a specular sheen.

Tokens live in one place, the `:root` block at the top of `assets/css/style.css`.
Retune the whole site by editing only that block:

```css
--accent-h       /* hue of the amber family: 32 amber, 210 ice, 265 violet */
--glass-blur     /* material blur radius */
--glass-sat      /* material saturation boost */
--scroll-pad     /* clearance for the sticky nav when jumping to an anchor */
```

Three token layers: primitive ramps → semantic theme variables → component
rules. Light and dark themes are both driven from the same semantic set, so
adding a component rarely means writing a second dark-mode rule.

## Screenshots

Five slots are wired up in `index.html` and currently hold styled placeholders.
Drop real captures at these exact paths and they replace the placeholders on
load — no markup changes needed:

```
assets/img/screenshots/01-now-playing.png
assets/img/screenshots/02-library.png
assets/img/screenshots/03-search.png
assets/img/screenshots/04-now-playing-full.png
assets/img/screenshots/05-queue.png
```

See `assets/img/screenshots/README.md` for the recommended dimensions.

## Icons

`logo.png` at the repository root is the master app mark. It carries a black
background, so the shipped icons are keyed to transparency and un-premultiplied
to avoid a dark fringe:

```
assets/favicon.ico              multi-size (16/32/48)
assets/favicon-16x16.png
assets/favicon-32x32.png
assets/favicon-192.png
assets/favicon-512.png
assets/apple-touch-icon.png
assets/icon-512.png             used in the nav, footer and og:image
assets/icon-maskable-512.png    opaque, 20% safe-zone inset
assets/icon-maskable-192.png
assets/octa-logo.png            OCTA DEVS mark, keyed from octa_favicon.jpg
```

To rebuild the set after changing a source logo, key the black background to
alpha over a 12→34 luminance ramp with colour un-premultiplied, then downscale
the 512px master for the smaller sizes.

## Running locally

Any static server works:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>. Opening the file directly over `file://`
mostly works, but a server avoids browser-specific restrictions on `fetch` and
the service worker-less manifest.

## Before shipping

- **Legal pages are drafts, not legal advice.** `privacy.html` and
  `terms.html` contain `▼▼▼` comments marking the facts only the owner can
  supply — effective date, legal entity, jurisdiction, data host and provider,
  and pricing. Fill those in and have the pages reviewed by a lawyer.
- **Placeholder screenshots** are still in place.
- **Store links** for the download buttons are not set yet.

## Credits

Built by **OCTA DEVS** — [octadevs.fun](https://octadevs.fun) ·
[@octadevsofficial](https://instagram.com/octadevsofficial) ·
hello@octadevs.fun
