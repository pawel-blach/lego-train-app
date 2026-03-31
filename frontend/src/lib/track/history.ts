import type { Layout, PlacedPiece, Connection } from "./layout";
import {
  placeFirstPiece,
  placePiece,
  removePiece,
} from "./operations";

export interface Command {
  type: "place" | "remove";
  pieceSnapshot: PlacedPiece;
  connectionsAdded: Connection[];
  connectionsRemoved: Connection[];
}

export interface History {
  undoStack: Command[];
  redoStack: Command[];
  current: Layout;
}

export function createHistory(layout: Layout): History {
  return {
    undoStack: [],
    redoStack: [],
    current: layout,
  };
}

function diffConnections(
  oldConns: Connection[],
  newConns: Connection[]
): { added: Connection[]; removed: Connection[] } {
  const key = (c: Connection) =>
    `${c.pieceAId}:${c.pointAId}-${c.pieceBId}:${c.pointBId}`;

  const oldSet = new Set(oldConns.map(key));
  const newSet = new Set(newConns.map(key));

  const added = newConns.filter((c) => !oldSet.has(key(c)));
  const removed = oldConns.filter((c) => !newSet.has(key(c)));

  return { added, removed };
}

function findNewPiece(
  oldLayout: Layout,
  newLayout: Layout
): PlacedPiece | undefined {
  for (const [id, piece] of newLayout.pieces) {
    if (!oldLayout.pieces.has(id)) return piece;
  }
  return undefined;
}

export function executePlace(
  history: History,
  pieceTypeId: string,
  targetPieceId?: string,
  targetPointId?: string,
  newPointId?: string
): History {
  let newLayout: Layout;
  if (targetPieceId && targetPointId && newPointId) {
    newLayout = placePiece(
      history.current,
      pieceTypeId,
      targetPieceId,
      targetPointId,
      newPointId
    );
  } else {
    newLayout = placeFirstPiece(history.current, pieceTypeId);
  }

  const newPiece = findNewPiece(history.current, newLayout);
  if (!newPiece) {
    throw new Error("No new piece found after place operation");
  }

  const { added } = diffConnections(
    history.current.connections,
    newLayout.connections
  );

  const command: Command = {
    type: "place",
    pieceSnapshot: newPiece,
    connectionsAdded: added,
    connectionsRemoved: [],
  };

  return {
    undoStack: [...history.undoStack, command],
    redoStack: [],
    current: newLayout,
  };
}

export function executeRemove(history: History, pieceId: string): History {
  const piece = history.current.pieces.get(pieceId);
  if (!piece) {
    throw new Error(`Piece not found: ${pieceId}`);
  }

  const newLayout = removePiece(history.current, pieceId);

  const { removed } = diffConnections(
    history.current.connections,
    newLayout.connections
  );

  const command: Command = {
    type: "remove",
    pieceSnapshot: piece,
    connectionsAdded: [],
    connectionsRemoved: removed,
  };

  return {
    undoStack: [...history.undoStack, command],
    redoStack: [],
    current: newLayout,
  };
}

export function undo(history: History): History {
  if (history.undoStack.length === 0) return history;

  const command = history.undoStack[history.undoStack.length - 1];
  const undoStack = history.undoStack.slice(0, -1);
  let current = history.current;

  if (command.type === "place") {
    // Undo place = remove the piece and its connections
    const pieces = new Map(current.pieces);
    pieces.delete(command.pieceSnapshot.id);
    const connectionKeys = new Set(
      command.connectionsAdded.map(
        (c) => `${c.pieceAId}:${c.pointAId}-${c.pieceBId}:${c.pointBId}`
      )
    );
    const connections = current.connections.filter(
      (c) =>
        !connectionKeys.has(
          `${c.pieceAId}:${c.pointAId}-${c.pieceBId}:${c.pointBId}`
        )
    );
    current = { pieces, connections };
  } else {
    // Undo remove = re-add the piece and its connections
    const pieces = new Map(current.pieces);
    pieces.set(command.pieceSnapshot.id, command.pieceSnapshot);
    const connections = [...current.connections, ...command.connectionsRemoved];
    current = { pieces, connections };
  }

  return {
    undoStack,
    redoStack: [...history.redoStack, command],
    current,
  };
}

export function redo(history: History): History {
  if (history.redoStack.length === 0) return history;

  const command = history.redoStack[history.redoStack.length - 1];
  const redoStack = history.redoStack.slice(0, -1);
  let current = history.current;

  if (command.type === "place") {
    // Redo place = re-add the piece and its connections
    const pieces = new Map(current.pieces);
    pieces.set(command.pieceSnapshot.id, command.pieceSnapshot);
    const connections = [...current.connections, ...command.connectionsAdded];
    current = { pieces, connections };
  } else {
    // Redo remove = remove the piece and its connections
    const pieces = new Map(current.pieces);
    pieces.delete(command.pieceSnapshot.id);
    const connectionKeys = new Set(
      command.connectionsRemoved.map(
        (c) => `${c.pieceAId}:${c.pointAId}-${c.pieceBId}:${c.pointBId}`
      )
    );
    const connections = current.connections.filter(
      (c) =>
        !connectionKeys.has(
          `${c.pieceAId}:${c.pointAId}-${c.pieceBId}:${c.pointBId}`
        )
    );
    current = { pieces, connections };
  }

  return {
    undoStack: [...history.undoStack, command],
    redoStack,
    current,
  };
}
