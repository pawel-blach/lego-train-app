import type { RoomVertex } from "../types/track";

const DEFAULT_ROOM_SCALE = 100; // 100 SVG units = 1 meter

export { DEFAULT_ROOM_SCALE };

export function edgeLengthMeters(a: RoomVertex, b: RoomVertex, scale: number): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy) / scale;
}

export function formatEdgeLabel(a: RoomVertex, b: RoomVertex, scale: number): string {
  return `${edgeLengthMeters(a, b, scale).toFixed(1)} m`;
}
