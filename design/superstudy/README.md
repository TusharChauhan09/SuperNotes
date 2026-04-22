# SuperStudy UI Kit

A high-fidelity click-through prototype of the SuperStudy web app.

## Screens covered

| Screen | Description |
|---|---|
| Clubs / Dashboard | Discord-like club rail + channel sidebar + message area |
| Notes | Folder tree sidebar + TipTap-like rich text editor with AI refine |
| Live Room | Video grid (LiveKit-style) + participant list + chat |
| Profile | Heatmap, streak card, room history |

## Usage

Open `index.html` in a browser. Navigate between screens using the left sidebar.
All state is local/fake — no real API calls.

## Component files

- `Sidebar.jsx` — Left rail + channel/club sidebar
- `Notes.jsx` — Folder tree + note editor
- `Room.jsx` — Live room video grid + chat
- `Profile.jsx` — Profile page with heatmap

## Design spec

See `../../README.md` and `../../colors_and_type.css` for full token reference.
Fonts: Geist Sans + Geist Mono via Google Fonts.
Icons: Lucide (CDN) — 16px, stroke-width 1.75.
