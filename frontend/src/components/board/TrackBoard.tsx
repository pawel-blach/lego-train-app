import { useRef, useMemo } from "react";
import { PIECE_TYPES } from "../../lib/track/pieces";
import { getWorldConnectionPoint } from "../../lib/track/geometry";
import { getFreeConnectionPoints } from "../../lib/track/operations";
import { useTrackLayout } from "../../context/TrackLayoutContext";
import { useViewBox } from "../../hooks/useViewBox";
import { TrackPieceShape } from "./TrackPieceShape";
import { ConnectionDot } from "./ConnectionDot";

const GRID_SIZE = 8;
const GRID_EXTENT = 10000;

export function TrackBoard() {
  const { layout, lastPieceId } = useTrackLayout();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { viewBox, handlers } = useViewBox(svgRef);

  const allPoints = useMemo(() => {
    const points: { x: number; y: number; key: string }[] = [];
    for (const piece of layout.pieces.values()) {
      const def = PIECE_TYPES[piece.typeId];
      for (const pt of def.connectionPoints) {
        const world = getWorldConnectionPoint(piece, pt);
        points.push({ x: world.x, y: world.y, key: `${piece.id}:${pt.id}` });
      }
    }
    return points;
  }, [layout]);

  const freeKeys = useMemo(() => {
    const free = getFreeConnectionPoints(layout);
    return new Set(free.map((fp) => `${fp.pieceId}:${fp.pointId}`));
  }, [layout]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0"
      {...handlers}
    >
      <defs>
        <pattern
          id="grid"
          width={GRID_SIZE}
          height={GRID_SIZE}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
            fill="none"
            stroke="rgba(0,0,0,0.12)"
            strokeWidth={0.3}
          />
        </pattern>
      </defs>

      {/* Green background + grid covering the pannable area */}
      <rect
        x={-GRID_EXTENT}
        y={-GRID_EXTENT}
        width={GRID_EXTENT * 2}
        height={GRID_EXTENT * 2}
        fill="#2e7d32"
      />
      <rect
        x={-GRID_EXTENT}
        y={-GRID_EXTENT}
        width={GRID_EXTENT * 2}
        height={GRID_EXTENT * 2}
        fill="url(#grid)"
      />

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
