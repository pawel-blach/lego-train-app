import { useMemo } from "react";
import { PIECE_TYPES } from "../../lib/track/pieces";
import { getWorldConnectionPoint } from "../../lib/track/geometry";
import { getFreeConnectionPoints } from "../../lib/track/operations";
import { useTrackLayout } from "../../context/TrackLayoutContext";
import { TrackPieceShape } from "./TrackPieceShape";
import { ConnectionDot } from "./ConnectionDot";

const PADDING = 20;
const DEFAULT_VIEWBOX = "-50 -50 100 100";

export function TrackBoard() {
  const { layout, lastPieceId } = useTrackLayout();

  const { viewBox, allPoints } = useMemo(() => {
    if (layout.pieces.size === 0) {
      return { viewBox: DEFAULT_VIEWBOX, allPoints: [] };
    }

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

    const vx = minX - PADDING;
    const vy = minY - PADDING;
    const vw = maxX - minX + 2 * PADDING;
    const vh = maxY - minY + 2 * PADDING;

    return {
      viewBox: `${vx} ${vy} ${vw} ${vh}`,
      allPoints: points,
    };
  }, [layout]);

  const freeKeys = useMemo(() => {
    const free = getFreeConnectionPoints(layout);
    return new Set(free.map((fp) => `${fp.pieceId}:${fp.pointId}`));
  }, [layout]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0"
    >
      {[...layout.pieces.values()].map((piece) => (
        <TrackPieceShape
          key={piece.id}
          piece={piece}
          pieceDef={PIECE_TYPES[piece.typeId]}
          isHighlighted={piece.id === lastPieceId}
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
