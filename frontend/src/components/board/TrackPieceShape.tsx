import type { PlacedPiece } from "../../lib/track/layout";
import type { PieceTypeDef } from "../../lib/track/pieces";

interface TrackPieceShapeProps {
  piece: PlacedPiece;
  pieceDef: PieceTypeDef;
}

const COLORS: Record<string, string> = {
  straight16: "#555",
  straight4: "#777",
  curveR40L: "#2196F3",
  curveR40R: "#1976D2",
  switchL: "#FF9800",
  switchR: "#F57C00",
};

const TRACK_GAUGE = 4;

export function TrackPieceShape({ piece, pieceDef }: TrackPieceShapeProps) {
  const color = COLORS[piece.typeId] ?? "#888";
  const rotation = piece.rotationIndex * 22.5;

  return (
    <g transform={`translate(${piece.x}, ${piece.y}) rotate(${rotation})`}>
      {renderShape(piece.typeId, pieceDef, color)}
    </g>
  );
}

function renderShape(typeId: string, def: PieceTypeDef, color: string) {
  const pointB = def.connectionPoints.find((p) => p.id === "b");

  if (typeId === "straight16" || typeId === "straight4") {
    const length = pointB ? pointB.localX : 16;
    return (
      <rect
        x={0}
        y={-TRACK_GAUGE / 2}
        width={length}
        height={TRACK_GAUGE}
        fill={color}
        rx={0.5}
      />
    );
  }

  if (typeId === "curveR40L" || typeId === "curveR40R") {
    if (!pointB) return null;
    const sweepFlag = typeId === "curveR40L" ? 1 : 0;
    return (
      <path
        d={`M 0 0 A 40 40 0 0 ${sweepFlag} ${pointB.localX} ${pointB.localY}`}
        stroke={color}
        strokeWidth={TRACK_GAUGE}
        strokeLinecap="round"
        fill="none"
      />
    );
  }

  if (typeId === "switchL" || typeId === "switchR") {
    const through = def.connectionPoints.find((p) => p.id === "through");
    const diverge = def.connectionPoints.find((p) => p.id === "diverge");
    return (
      <>
        {through && (
          <rect
            x={0}
            y={-TRACK_GAUGE / 2}
            width={through.localX}
            height={TRACK_GAUGE}
            fill={color}
            rx={0.5}
          />
        )}
        {diverge && (
          <path
            d={`M 0 0 A 40 40 0 0 ${typeId === "switchL" ? 1 : 0} ${diverge.localX} ${diverge.localY}`}
            stroke={color}
            strokeWidth={TRACK_GAUGE * 0.6}
            strokeLinecap="round"
            fill="none"
            opacity={0.7}
          />
        )}
      </>
    );
  }

  return null;
}
