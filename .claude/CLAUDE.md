# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LEGO train track layout builder — a visual editor for designing LEGO train layouts. Users place track pieces (straights, curves, switches) on a board and connect them together.

## Commands

```bash
# Development (from root — yarn workspaces)
yarn dev:frontend    # Vite dev server on :5173
yarn dev:backend     # Express dev server on :3001 (tsx watch)

# Build
yarn workspace frontend build   # tsc + vite build
yarn workspace backend build    # tsc

# Install dependencies
yarn
```

No test runner is currently configured.

## Architecture

**Monorepo** with yarn workspaces: `frontend/` and `backend/`.

### Frontend (React + Vite + Tailwind v4)

- **UI style**: Windows 95 look via `@react95/core` + `@react95/icons`
- **State**: `useReducer` in `TrackLayoutContext` — actions: ADD_PIECE, REMOVE_PIECE, MOVE_PIECES, SELECT_PIECE, BOX_SELECT, CLEAR_SELECTION, SET_LAYOUT
- **Track geometry engine** (`lib/track/`):
  - `pieces.ts` — piece type definitions with connection points in local coordinates. Rotation uses 16-step index (22.5° increments)
  - `layout.ts` — `Layout` type: `Map<string, PlacedPiece>` + `Connection[]`
  - `geometry.ts` — coordinate transforms (local↔world), rotation math
  - `operations.ts` — placement, movement, connection snapping, subgraph detection
  - `validation.ts`, `budget.ts`, `history.ts` — layout validation, piece budget tracking, undo/redo
- **Board rendering** (`components/board/`): SVG-based with `TrackBoard`, `TrackPieceShape`, `ConnectionDot`
- **Sidebar** (`components/sidebar/BuildExplorer`): piece palette as a tree explorer

### Backend (Express + tsx)

Minimal — only a `/api/health` endpoint. Frontend proxies `/api` to `:3001` via Vite config.

## Key Concepts

- **Connection points**: Each piece type has named points (e.g., `a`/`b` for straights, `trunk`/`through`/`diverge` for switches) with local position and angle
- **Pieces connect by aligning connection points**: world position + angle matching with 180° flip
- **RotationIndex**: 0–15 integer representing rotation in 22.5° steps (16 positions = 360°)
- **Piece placement**: first piece uses `placeFirstPiece`, subsequent use `placePiece` which connects to an existing piece's free connection point
