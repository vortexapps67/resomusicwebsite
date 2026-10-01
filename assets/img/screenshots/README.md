# Screenshot slots

Drop your app screenshots in this folder using the exact filenames below.
Nothing else to configure — each placeholder disappears the moment its file appears.

| Slot | File | Shows | Used on |
|---|---|---|---|
| 01 | `01-now-playing.png` | Now Playing screen | `index.html` — inside the phone frame in the hero |
| 02 | `02-library.png` | Library / albums grid | `index.html` — "The library" section |
| 03 | `03-search.png` | Search results | `index.html` — "The library" section |
| 04 | `04-now-playing-full.png` | Full Now Playing screen | `index.html` — "Now playing" section |
| 05 | `05-queue.png` | Queue / up next | `index.html` — "Now playing" section |

## Recommended specs

- **Ratio** 9:19.5 portrait (matches a modern phone). Slots 02–05 are cropped
  to 9:17 in the showcase cards, so keep the important UI in the upper two thirds.
- **Size** 1170 × 2532 px is ideal. Anything proportionally similar works.
- **Format** PNG for crisp text. WebP also works.
- **No rounded corners needed** — the phone frame crops and rounds for you.
- **No status bar clutter** is fine; the frame draws its own.

## Adding more slots

Copy an existing `<figure class="shot-card glass">` block and change the `src`,
the `alt`, and the placeholder text. Same for the hero: the slot is a single
`<figure class="shot">` inside `.device__screen`.
