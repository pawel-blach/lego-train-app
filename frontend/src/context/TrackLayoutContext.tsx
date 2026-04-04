import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { createEmptyLayout, type Layout } from "../lib/track/layout";
import { PIECE_TYPES } from "../lib/track/pieces";
import { placeFirstPiece, placePiece, getFreeConnectionPoints, getConnectedSubgraph, movePieces, findNearbyConnection } from "../lib/track/operations";

interface TrackLayoutState {
  layout: Layout;
  lastPieceId: string | null;
  selection: Set<string>;
  undoStack: Layout[];
}

type TrackLayoutAction =
  | { type: "ADD_PIECE"; pieceTypeId: string }
  | { type: "REMOVE_PIECE"; pieceId: string }
  | { type: "SET_LAYOUT"; layout: Layout }
  | { type: "SELECT_PIECE"; pieceId: string; additive: boolean }
  | { type: "BOX_SELECT"; pieceIds: string[]; additive: boolean }
  | { type: "CLEAR_SELECTION" }
  | { type: "MOVE_PIECES"; pieceIds: string[]; dx: number; dy: number; detach: boolean }
  | { type: "UNDO" };

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

function reducer(state: TrackLayoutState, action: TrackLayoutAction): TrackLayoutState {
  switch (action.type) {
    case "UNDO": {
      if (state.undoStack.length === 0) return state;
      const prevLayout = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        layout: prevLayout,
        undoStack: state.undoStack.slice(0, -1),
        lastPieceId: null,
      };
    }
    case "ADD_PIECE": {
      const { pieceTypeId } = action;
      if (!PIECE_TYPES[pieceTypeId]) return state;

      // First piece on empty board
      if (state.layout.pieces.size === 0) {
        const newLayout = placeFirstPiece(state.layout, pieceTypeId);
        const newId = findNewPieceId(state.layout, newLayout);
        return { ...state, layout: newLayout, lastPieceId: newId, undoStack: [...state.undoStack, state.layout] };
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
      return { ...state, layout: newLayout, lastPieceId: newId, undoStack: [...state.undoStack, state.layout] };
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

      return { ...state, layout: newLayout, undoStack: [...state.undoStack, state.layout] };
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
