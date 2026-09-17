# Sticky Notes

Single-page sticky notes board. Desktop-first (minimum 1024×768). Latest Chrome and Firefox.

## Setup

```bash
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
```

Unit tests cover geometry, the notes reducer, and localStorage load/save (including corrupt data). Hook and provider tests cover pointer sessions and persistence. Integration tests drive the board through create, move, resize, trash, colour, text, and z-order.

## Usage

- Drag on the empty board to draw a note at that position and size.
- **New note** places a default-size note using the selected toolbar colour.
- Drag a note’s header to move it. Drop it on the trash zone to delete.
- Drag the edges or corners to resize.
- Click the note body to edit text. Escape or click away to stop editing.
- Use the colour dots on the toolbar (new notes) or on a note (existing notes).
- Clicking a note brings it in front of overlapping notes.
- Notes are saved to `localStorage` and restored on reload.
