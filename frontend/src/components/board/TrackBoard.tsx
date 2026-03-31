import { useMemo } from "react";
import { PIECE_TYPES } from "../../lib/track/pieces";
import { getWorldConnectionPoint } from "../../lib/track/geometry";
import { getFreeConnectionPoints } from "../../lib/track/operations";
import { buildTestLayout } from "../../lib/track/testLayout";
import { TrackPieceShape } from "./TrackPieceShape";
import { ConnectionDot } from "./ConnectionDot";

const PADDING = 20;

export function TrackBoard() {
  const layout = useMemo(() => buildTestLayout(), []);

  const { bounds, allPoints } = useMemo(() => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    const points: { x: number; y: number; key: string }[] = [];

    for (const piece of layout.pieces.values()) {
      const def = PIECE_TYPES[piece.typeId];
      for (const pt of def.connectionPoints) {
        const world = getWorldConnectionPoint(piece, pt);
        minX = Math.min(minX, world.x);
        minY = Math.min(minY, world.y);
        maxX = Math.max(maxX, world.x);
        maxY = Math.max(maxY, world.y);
        points.push({ x: world.x, y: world.y, key: `${piece.id}:${pt.id}` });
      }
    }

    return {
      bounds: { minX, minY, maxX, maxY },
      allPoints: points,
    };
  }, [layout]);

  const freeKeys = useMemo(() => {
    const free = getFreeConnectionPoints(layout);
    return new Set(free.map((fp) => `${fp.pieceId}:${fp.pointId}`));
  }, [layout]);

  const vx = bounds.minX - PADDING;
  const vy = bounds.minY - PADDING;
  const vw = bounds.maxX - bounds.minX + 2 * PADDING;
  const vh = bounds.maxY - bounds.minY + 2 * PADDING;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0"
    >
      {[...layout.pieces.values()].map((piece) => (
        <TrackPieceShape
          key={piece.id}
          piece={piece}
          pieceDef={PIECE_TYPES[piece.typeId]}
        />
      ))}
      {allPoints.map((pt) => (
        <ConnectionDot
          key={pt.key}
          x={pt.x}
          y={pt.y}
          isFree={freeKeys.has(pt.key)}
        />
      ))}
    </svg>
  );
}
