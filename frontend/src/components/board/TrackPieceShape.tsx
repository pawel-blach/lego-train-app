import type { PlacedPiece } from "../../lib/track/layout";
import type { PieceTypeDef } from "../../lib/track/pieces";

interface TrackPieceShapeProps {
  piece: PlacedPiece;
  pieceDef: PieceTypeDef;
  isHighlighted?: boolean;
}

const COLORS: Record<string, string> = {
  straight16: "#555",
  straight4: "#777",
  curveR40L: "#2196F3",
  curveR40R: "#1976D2",
  switchL: "#FF9800",
  switchR: "#F57C00",
};

const HIGHLIGHT_COLORS: Record<string, string> = {
  straight16: "#888",
  straight4: "#aaa",
  curveR40L: "#64B5F6",
  curveR40R: "#42A5F5",
  switchL: "#FFB74D",
  switchR: "#FFA726",
};

const TRACK_GAUGE = 4;

export function TrackPieceShape({ piece, pieceDef, isHighlighted }: TrackPieceShapeProps) {
  const color = (isHighlighted ? HIGHLIGHT_COLORS[piece.typeId] : COLORS[piece.typeId]) ?? "#888";
  const rotation = piece.rotationIndex * 22.5;

  return (
    <g transform={`translate(${piece.x}, ${piece.y}) rotate(${rotation})`}>
      {renderShape(piece.typeId, pieceDef, color)}
      {isHighlighted && renderHighlightOutline(piece.typeId, pieceDef)}
    </g>
  );
}

function renderHighlightOutline(typeId: string, def: PieceTypeDef) {
  const pointB = def.connectionPoints.find((p) => p.id === "b");

  if (typeId === "straight16" || typeId === "straight4") {
    const length = pointB ? pointB.localX : 16;
    return (
      <rect
        x={-0.5}
        y={-TRACK_GAUGE / 2 - 0.5}
        width={length + 1}
        height={TRACK_GAUGE + 1}
        fill="none"
        stroke="#fff"
        strokeWidth={0.4}
        strokeDasharray="1 1"
        opacity={0.8}
      />
    );
  }

  if (typeId === "curveR40L" || typeId === "curveR40R") {
    if (!pointB) return null;
    const sweepFlag = typeId === "curveR40L" ? 0 : 1;
    return (
      <path
        d={`M 0 0 A 40 40 0 0 ${sweepFlag} ${pointB.localX} ${pointB.localY}`}
        stroke="#fff"
        strokeWidth={TRACK_GAUGE + 1}
        strokeLinecap="round"
        fill="none"
        opacity={0.3}
      />
    );
  }

  if (typeId === "switchL" || typeId === "switchR") {
    const through = def.connectionPoints.find((p) => p.id === "through");
    if (!through) return null;
    return (
      <rect
        x={-0.5}
        y={-TRACK_GAUGE / 2 - 0.5}
        width={through.localX + 1}
        height={TRACK_GAUGE + 1}
        fill="none"
        stroke="#fff"
        strokeWidth={0.4}
        strokeDasharray="1 1"
        opacity={0.8}
      />
    );
  }

  return null;
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
    const sweepFlag = typeId === "curveR40L" ? 0 : 1;
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
        {diverge && (() => {
          const angleRad = (22.5 * Math.PI) / 180;
          const handleLen = Math.hypot(diverge.localX, diverge.localY) / 3;
          const cp1x = handleLen;
          const cp1y = 0;
          const cp2x = diverge.localX - handleLen * Math.cos(angleRad);
          const cp2y = diverge.localY - handleLen * Math.sign(diverge.localY) * Math.sin(angleRad);
          return (
            <path
              d={`M 0 0 C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${diverge.localX} ${diverge.localY}`}
              stroke={color}
              strokeWidth={TRACK_GAUGE * 0.6}
              strokeLinecap="round"
              fill="none"
              opacity={0.7}
            />
          );
        })()}
      </>
    );
  }

  return null;
}
