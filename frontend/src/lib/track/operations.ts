import { PIECE_TYPES } from "./pieces";
import type { Layout, PlacedPiece, Connection } from "./layout";
import {
  getWorldConnectionPoint,
  connectionPointsMatch,
  computeSnapTransform,
  normalizeAngle,
} from "./geometry";
import type { WorldConnectionPoint } from "./geometry";

export interface FreeConnectionPoint {
  pieceId: string;
  pointId: string;
  x: number;
  y: number;
  angle: number;
}

export function getFreeConnectionPoints(layout: Layout): FreeConnectionPoint[] {
  const connected = new Set<string>();
  for (const conn of layout.connections) {
    connected.add(`${conn.pieceAId}:${conn.pointAId}`);
    connected.add(`${conn.pieceBId}:${conn.pointBId}`);
  }

  const free: FreeConnectionPoint[] = [];
  for (const piece of layout.pieces.values()) {
    const pieceType = PIECE_TYPES[piece.typeId];
    for (const point of pieceType.connectionPoints) {
      const key = `${piece.id}:${point.id}`;
      if (!connected.has(key)) {
        const world = getWorldConnectionPoint(piece, point);
        free.push({
          pieceId: piece.id,
          pointId: point.id,
          x: world.x,
          y: world.y,
          angle: world.angle,
        });
      }
    }
  }
  return free;
}

export function placeFirstPiece(layout: Layout, pieceTypeId: string): Layout {
  const pieceType = PIECE_TYPES[pieceTypeId];
  if (!pieceType) {
    throw new Error(`Unknown piece type: ${pieceTypeId}`);
  }

  const piece: PlacedPiece = {
    id: crypto.randomUUID(),
    typeId: pieceTypeId,
    x: 0,
    y: 0,
    rotationIndex: 0,
  };

  const pieces = new Map(layout.pieces);
  pieces.set(piece.id, piece);

  return {
    pieces,
    connections: [...layout.connections],
  };
}

export function placePiece(
  layout: Layout,
  pieceTypeId: string,
  targetPieceId: string,
  targetPointId: string,
  newPointId: string
): Layout {
  const pieceType = PIECE_TYPES[pieceTypeId];
  if (!pieceType) {
    throw new Error(`Unknown piece type: ${pieceTypeId}`);
  }

  const targetPiece = layout.pieces.get(targetPieceId);
  if (!targetPiece) {
    throw new Error(`Target piece not found: ${targetPieceId}`);
  }

  const targetPieceType = PIECE_TYPES[targetPiece.typeId];
  const targetPointDef = targetPieceType.connectionPoints.find(
    (p) => p.id === targetPointId
  );
  if (!targetPointDef) {
    throw new Error(
      `Connection point "${targetPointId}" not found on piece "${targetPieceId}"`
    );
  }

  const targetWorld = getWorldConnectionPoint(targetPiece, targetPointDef);
  const snap = computeSnapTransform(targetWorld, pieceType, newPointId);

  const newPiece: PlacedPiece = {
    id: crypto.randomUUID(),
    typeId: pieceTypeId,
    x: snap.x,
    y: snap.y,
    rotationIndex: snap.rotationIndex,
  };

  const pieces = new Map(layout.pieces);
  pieces.set(newPiece.id, newPiece);

  const primaryConnection: Connection = {
    pieceAId: targetPieceId,
    pointAId: targetPointId,
    pieceBId: newPiece.id,
    pointBId: newPointId,
  };

  const connections = [...layout.connections, primaryConnection];

  // Loop closure: check other free points on the new piece
  const additionalConnections: Connection[] = [];
  const existingFree = getFreeConnectionPoints({ pieces, connections });

  for (const point of pieceType.connectionPoints) {
    if (point.id === newPointId) continue;

    const newWorld = getWorldConnectionPoint(newPiece, point);

    for (const existing of existingFree) {
      if (existing.pieceId === newPiece.id) continue;

      if (
        connectionPointsMatch(newWorld, {
          x: existing.x,
          y: existing.y,
          angle: existing.angle,
        })
      ) {
        additionalConnections.push({
          pieceAId: newPiece.id,
          pointAId: point.id,
          pieceBId: existing.pieceId,
          pointBId: existing.pointId,
        });
      }
    }
  }

  return {
    pieces,
    connections: [...connections, ...additionalConnections],
  };
}

export function getConnectedSubgraph(layout: Layout, pieceIds: string[]): Set<string> {
  const result = new Set(pieceIds);
  const queue = [...pieceIds];

  while (queue.length > 0) {
    const current = queue.pop()!;
    for (const conn of layout.connections) {
      let neighbor: string | null = null;
      if (conn.pieceAId === current) neighbor = conn.pieceBId;
      else if (conn.pieceBId === current) neighbor = conn.pieceAId;

      if (neighbor && !result.has(neighbor)) {
        result.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return result;
}

export function movePieces(
  layout: Layout,
  pieceIds: Set<string>,
  dx: number,
  dy: number,
  detach: boolean
): Layout {
  const pieces = new Map(layout.pieces);
  let connections = [...layout.connections];

  if (detach) {
    connections = connections.filter(
      (c) =>
        (pieceIds.has(c.pieceAId) && pieceIds.has(c.pieceBId)) ||
        (!pieceIds.has(c.pieceAId) && !pieceIds.has(c.pieceBId))
    );
  } else {
    connections = connections.filter(
      (c) =>
        (pieceIds.has(c.pieceAId) && pieceIds.has(c.pieceBId)) ||
        (!pieceIds.has(c.pieceAId) && !pieceIds.has(c.pieceBId))
    );
  }

  for (const id of pieceIds) {
    const piece = pieces.get(id);
    if (piece) {
      pieces.set(id, { ...piece, x: piece.x + dx, y: piece.y + dy });
    }
  }

  return { pieces, connections };
}

const SNAP_THRESHOLD = 3;

export function findNearbyConnection(
  layout: Layout,
  movedPieceIds: Set<string>
): { movedPieceId: string; movedPointId: string; staticPieceId: string; staticPointId: string; dx: number; dy: number } | null {
  const freePoints = getFreeConnectionPoints(layout);

  const movedFree = freePoints.filter((p) => movedPieceIds.has(p.pieceId));
  const staticFree = freePoints.filter((p) => !movedPieceIds.has(p.pieceId));

  let best: ReturnType<typeof findNearbyConnection> = null;
  let bestDist = SNAP_THRESHOLD;

  for (const mf of movedFree) {
    for (const sf of staticFree) {
      const dist = Math.hypot(mf.x - sf.x, mf.y - sf.y);
      const angleDiff = Math.abs(normalizeAngle(mf.angle - sf.angle - 180));

      if (dist < bestDist && angleDiff < 5) {
        bestDist = dist;
        best = {
          movedPieceId: mf.pieceId,
          movedPointId: mf.pointId,
          staticPieceId: sf.pieceId,
          staticPointId: sf.pointId,
          dx: sf.x - mf.x,
          dy: sf.y - mf.y,
        };
      }
    }
  }

  return best;
}

export function removePiece(layout: Layout, pieceId: string): Layout {
  const pieces = new Map(layout.pieces);
  pieces.delete(pieceId);

  const connections = layout.connections.filter(
    (c) => c.pieceAId !== pieceId && c.pieceBId !== pieceId
  );

  return { pieces, connections };
}
