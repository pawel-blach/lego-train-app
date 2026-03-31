import type { RotationIndex } from "./pieces";

export interface PlacedPiece {
  id: string;
  typeId: string;
  x: number;
  y: number;
  rotationIndex: RotationIndex;
}

export interface Connection {
  pieceAId: string;
  pointAId: string;
  pieceBId: string;
  pointBId: string;
}

export interface Layout {
  pieces: Map<string, PlacedPiece>;
  connections: Connection[];
}

export function createEmptyLayout(): Layout {
  return {
    pieces: new Map(),
    connections: [],
  };
}
