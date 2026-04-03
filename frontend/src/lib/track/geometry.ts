import type { ConnectionPointDef, PieceTypeDef, RotationIndex } from "./pieces";
import type { PlacedPiece } from "./layout";

export interface WorldConnectionPoint {
  x: number;
  y: number;
  angle: number;
}

const DEG_TO_RAD = Math.PI / 180;
const EPSILON = 0.01;

export function normalizeAngle(degrees: number): number {
  let a = degrees % 360;
  if (a >= 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

export function getWorldConnectionPoint(
  piece: PlacedPiece,
  point: ConnectionPointDef
): WorldConnectionPoint {
  const theta = piece.rotationIndex * 22.5 * DEG_TO_RAD;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  return {
    x: piece.x + point.localX * cosT - point.localY * sinT,
    y: piece.y + point.localX * sinT + point.localY * cosT,
    angle: normalizeAngle(point.localAngle + piece.rotationIndex * 22.5),
  };
}

export function connectionPointsMatch(
  a: WorldConnectionPoint,
  b: WorldConnectionPoint
): boolean {
  return (
    Math.abs(a.x - b.x) < EPSILON &&
    Math.abs(a.y - b.y) < EPSILON &&
    Math.abs(normalizeAngle(a.angle - b.angle - 180)) < EPSILON
  );
}

function normalizeRotationIndex(raw: number): RotationIndex {
  const n = ((raw % 16) + 16) % 16;
  return n as RotationIndex;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function getPieceBoundingBox(piece: PlacedPiece, pieceDef: PieceTypeDef): BoundingBox {
  const GAUGE = 4;
  const points: { x: number; y: number }[] = [];

  for (const pt of pieceDef.connectionPoints) {
    const world = getWorldConnectionPoint(piece, pt);
    points.push({ x: world.x, y: world.y });
  }

  points.push({ x: piece.x, y: piece.y });

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  return {
    minX: minX - GAUGE,
    minY: minY - GAUGE,
    maxX: maxX + GAUGE,
    maxY: maxY + GAUGE,
  };
}

export function boxesOverlap(a: BoundingBox, b: BoundingBox): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

export function computeSnapTransform(
  target: WorldConnectionPoint,
  pieceType: PieceTypeDef,
  pointId: string
): { x: number; y: number; rotationIndex: RotationIndex } {
  const point = pieceType.connectionPoints.find((p) => p.id === pointId);
  if (!point) {
    throw new Error(`Connection point "${pointId}" not found on piece type "${pieceType.id}"`);
  }

  const rawIndex = Math.round(
    (target.angle + 180 - point.localAngle) / 22.5
  );
  const rotationIndex = normalizeRotationIndex(rawIndex);

  const theta = rotationIndex * 22.5 * DEG_TO_RAD;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  return {
    x: target.x - (point.localX * cosT - point.localY * sinT),
    y: target.y - (point.localX * sinT + point.localY * cosT),
    rotationIndex,
  };
}
