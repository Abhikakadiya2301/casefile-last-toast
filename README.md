# CASEFILE — The Last Toast

A self-contained browser detective game prototype.

## Run locally

Option 1:
- Open `index.html` directly in a modern browser.

Option 2 (recommended):
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080`.

## Features

- Cinematic investigation dashboard
- Persistent progress with `localStorage`
- Crime-scene hotspots
- Searchable mansion rooms
- Five suspect interviews
- Evidence locker and forensic reports
- Evidence-board deduction mechanic
- Drag-and-drop timeline reconstruction
- Final accusation builder
- Multi-step case reveal
- Detective hints
- Autosaved notes
- Responsive mobile layout
- Reduced-motion accessibility support

## Story logic

The current playable solution is internally locked to:
- Culprit: Victor Hale
- Motive: conceal financial embezzlement
- Method: fictional compound VX-17 introduced into Adrian's whiskey

VX-17 is intentionally fictional.

## Deploy

The project has no build step and can be deployed as a static site on:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages
- Any standard web server

## Suggested next production upgrades

1. Replace initials / CSS scenery with final character and location artwork.
2. Add ambient sound and voice-over.
3. Add account-based multiplayer rooms and shared state.
4. Add an admin CMS for creating new cases.
5. Add backend analytics and save synchronization.
6. Run usability testing before shipping the final mystery.
