import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { createEmptyLayout, type Layout } from "../lib/track/layout";
import { PIECE_TYPES } from "../lib/track/pieces";
import { placeFirstPiece, placePiece, getFreeConnectionPoints, getConnectedSubgraph, movePieces, findNearbyConnection } from "../lib/track/operations";
import type { Budget, Room, RoomVertex } from "../types/track";
import { DEFAULT_ROOM_SCALE } from "../lib/room";

interface UndoSnapshot {
  layout: Layout;
  budgets: Budget[];
  lastUsedBudgetByType: Record<string, string>;
  room: Room | null;
}

interface TrackLayoutState {
  layout: Layout;
  lastPieceId: string | null;
  selection: Set<string>;
  undoStack: UndoSnapshot[];
  budgets: Budget[];
  lastUsedBudgetByType: Record<string, string>;
  room: Room | null;
  roomDraft: RoomVertex[];
}

type TrackLayoutAction =
  | { type: "ADD_PIECE"; pieceTypeId: string; budgetId: string }
  | { type: "REMOVE_PIECE"; pieceId: string }
  | { type: "SET_LAYOUT"; layout: Layout }
  | { type: "SELECT_PIECE"; pieceId: string; additive: boolean }
  | { type: "BOX_SELECT"; pieceIds: string[]; additive: boolean }
  | { type: "CLEAR_SELECTION" }
  | { type: "MOVE_PIECES"; pieceIds: string[]; dx: number; dy: number; detach: boolean }
  | { type: "UNDO" }
  | { type: "ADD_BUDGET"; budget: Budget }
  | { type: "DELETE_BUDGET"; budgetId: string }
  | { type: "ADD_ROOM_VERTEX"; x: number; y: number }
  | { type: "CLOSE_ROOM" }
  | { type: "CLEAR_ROOM" };

function getOutputPointId(typeId: string): string {
  if (typeId === "switchL" || typeId === "switchR") return "through";
  return "b";
}

function getInputPointId(typeId: string): string {
  if (typeId === "switchL" || typeId === "switchR") return "trunk";
  return "a";
}

function findNewPieceId(prev: Layout, next: Layout): string | null {
  for (const key of next.pieces.keys()) {
    if (!prev.pieces.has(key)) return key;
  }
  return null;
}

function isPointFree(layout: Layout, pieceId: string, pointId: string): boolean {
  return !layout.connections.some(
    (c) =>
      (c.pieceAId === pieceId && c.pointAId === pointId) ||
      (c.pieceBId === pieceId && c.pointBId === pointId)
  );
}

function takeSnapshot(state: TrackLayoutState): UndoSnapshot {
  return {
    layout: state.layout,
    budgets: state.budgets,
    lastUsedBudgetByType: { ...state.lastUsedBudgetByType },
    room: state.room,
  };
}

function reducer(state: TrackLayoutState, action: TrackLayoutAction): TrackLayoutState {
  switch (action.type) {
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const snapshot = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        layout: snapshot.layout,
        budgets: snapshot.budgets,
        lastUsedBudgetByType: snapshot.lastUsedBudgetByType,
        room: snapshot.room,
        undoStack: state.undoStack.slice(0, -1),
        lastPieceId: null,
      };
    }
    case "ADD_PIECE": {
      const { pieceTypeId, budgetId } = action;
      if (!PIECE_TYPES[pieceTypeId]) return state;

      const snapshot = takeSnapshot(state);

      // First piece on empty board
      if (state.layout.pieces.size === 0) {
        const newLayout = placeFirstPiece(state.layout, pieceTypeId);
        const newId = findNewPieceId(state.layout, newLayout);
        // Set budgetId on the new piece
        if (newId) {
          const piece = newLayout.pieces.get(newId)!;
          newLayout.pieces.set(newId, { ...piece, budgetId });
        }
        return {
          ...state,
          layout: newLayout,
          lastPieceId: newId,
          undoStack: [...state.undoStack, snapshot],
          lastUsedBudgetByType: { ...state.lastUsedBudgetByType, [pieceTypeId]: budgetId },
        };
      }

      // Append to last piece
      if (!state.lastPieceId) return state;

      const lastPiece = state.layout.pieces.get(state.lastPieceId);
      if (!lastPiece) return state;

      const targetPointId = getOutputPointId(lastPiece.typeId);
      if (!isPointFree(state.layout, state.lastPieceId, targetPointId)) return state;

      const newPointId = getInputPointId(pieceTypeId);
      const newLayout = placePiece(
        state.layout,
        pieceTypeId,
        state.lastPieceId,
        targetPointId,
        newPointId
      );
      const newId = findNewPieceId(state.layout, newLayout);
      // Set budgetId on the new piece
      if (newId) {
        const piece = newLayout.pieces.get(newId)!;
        newLayout.pieces.set(newId, { ...piece, budgetId });
      }
      return {
        ...state,
        layout: newLayout,
        lastPieceId: newId,
        undoStack: [...state.undoStack, snapshot],
        lastUsedBudgetByType: { ...state.lastUsedBudgetByType, [pieceTypeId]: budgetId },
      };
    }
    case "SELECT_PIECE": {
      const { pieceId, additive } = action;
      const selection = new Set(additive ? state.selection : []);
      if (additive && selection.has(pieceId)) {
        selection.delete(pieceId);
      } else {
        selection.add(pieceId);
      }
      return { ...state, selection };
    }
    case "BOX_SELECT": {
      const { pieceIds, additive } = action;
      const selection = additive ? new Set([...state.selection, ...pieceIds]) : new Set(pieceIds);
      return { ...state, selection };
    }
    case "CLEAR_SELECTION": {
      return { ...state, selection: new Set() };
    }
    case "MOVE_PIECES": {
      const { pieceIds, dx, dy, detach } = action;

      // Determine which pieces actually move
      let movingIds: Set<string>;
      if (detach) {
        movingIds = new Set(pieceIds);
      } else {
        movingIds = getConnectedSubgraph(state.layout, pieceIds);
      }

      // Move pieces and break external connections
      let newLayout = movePieces(state.layout, movingIds, dx, dy, detach);

      // Check for nearby connection snap
      const snap = findNearbyConnection(newLayout, movingIds);
      if (snap) {
        // Apply snap offset to all moved pieces
        newLayout = movePieces(
          { pieces: newLayout.pieces, connections: newLayout.connections },
          movingIds,
          snap.dx,
          snap.dy,
          false
        );
        // Add the new connection
        newLayout = {
          ...newLayout,
          connections: [
            ...newLayout.connections,
            {
              pieceAId: snap.movedPieceId,
              pointAId: snap.movedPointId,
              pieceBId: snap.staticPieceId,
              pointBId: snap.staticPointId,
            },
          ],
        };
      }

      return { ...state, layout: newLayout, undoStack: [...state.undoStack, takeSnapshot(state)] };
    }
    case "ADD_BUDGET": {
      return {
        ...state,
        budgets: [...state.budgets, action.budget],
      };
    }
    case "DELETE_BUDGET": {
      const { budgetId } = action;
      const snapshot = takeSnapshot(state);

      // Remove all pieces belonging to this budget
      const piecesToRemove = new Set<string>();
      for (const [id, piece] of state.layout.pieces) {
        if (piece.budgetId === budgetId) {
          piecesToRemove.add(id);
        }
      }

      const newPieces = new Map(state.layout.pieces);
      for (const id of piecesToRemove) {
        newPieces.delete(id);
      }

      // Remove connections involving deleted pieces
      const newConnections = state.layout.connections.filter(
        (c) => !piecesToRemove.has(c.pieceAId) && !piecesToRemove.has(c.pieceBId)
      );

      // Clear lastUsedBudgetByType entries for this budget
      const newLastUsed = { ...state.lastUsedBudgetByType };
      for (const [typeId, bid] of Object.entries(newLastUsed)) {
        if (bid === budgetId) delete newLastUsed[typeId];
      }

      return {
        ...state,
        layout: { pieces: newPieces, connections: newConnections },
        budgets: state.budgets.filter((b) => b.id !== budgetId),
        lastUsedBudgetByType: newLastUsed,
        undoStack: [...state.undoStack, snapshot],
        lastPieceId: piecesToRemove.has(state.lastPieceId ?? "") ? null : state.lastPieceId,
      };
    }
    case "ADD_ROOM_VERTEX": {
      return {
        ...state,
        roomDraft: [...state.roomDraft, { x: action.x, y: action.y }],
      };
    }
    case "CLOSE_ROOM": {
      if (state.roomDraft.length < 3) return state;
      const snapshot = takeSnapshot(state);
      return {
        ...state,
        room: { vertices: state.roomDraft, scale: DEFAULT_ROOM_SCALE },
        roomDraft: [],
        undoStack: [...state.undoStack, snapshot],
      };
    }
    case "CLEAR_ROOM": {
      if (!state.room && state.roomDraft.length === 0) return state;
      const snapshot = takeSnapshot(state);
      return {
        ...state,
        room: null,
        roomDraft: [],
        undoStack: [...state.undoStack, snapshot],
      };
    }
    default:
      return state;
  }
}

const initialState: TrackLayoutState = {
  layout: createEmptyLayout(),
  lastPieceId: null,
  selection: new Set(),
  undoStack: [],
  budgets: [],
  lastUsedBudgetByType: {},
  room: null,
  roomDraft: [],
};

const TrackLayoutContext = createContext<TrackLayoutState>(initialState);
const TrackLayoutDispatchContext = createContext<Dispatch<TrackLayoutAction>>(() => {});

export function TrackLayoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TrackLayoutContext.Provider value={state}>
      <TrackLayoutDispatchContext.Provider value={dispatch}>
        {children}
      </TrackLayoutDispatchContext.Provider>
    </TrackLayoutContext.Provider>
  );
}

export function useTrackLayout() {
  return useContext(TrackLayoutContext);
}

export function useTrackLayoutDispatch() {
  return useContext(TrackLayoutDispatchContext);
}
