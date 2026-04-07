import type { Room, RoomVertex } from "../../types/track";
import { formatEdgeLabel } from "../../lib/room";

interface EdgeLabelProps {
  a: RoomVertex;
  b: RoomVertex;
  scale: number;
}

function EdgeLabel({ a, b, scale }: EdgeLabelProps) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  // Keep text readable (not upside down)
  const adjustedAngle = angle > 90 || angle < -90 ? angle + 180 : angle;

  return (
    <text
      x={mx}
      y={my}
      fill="rgba(255,255,255,0.6)"
      fontSize={3}
      textAnchor="middle"
      dominantBaseline="text-after-edge"
      transform={`rotate(${adjustedAngle}, ${mx}, ${my})`}
    >
      {formatEdgeLabel(a, b, scale)}
    </text>
  );
}

interface RoomDraftProps {
  vertices: RoomVertex[];
  cursorPos: { x: number; y: number } | null;
  isNearFirst: boolean;
  scale: number;
}

export function RoomDraft({ vertices, cursorPos, isNearFirst, scale }: RoomDraftProps) {
  if (vertices.length === 0 && !cursorPos) return null;

  const pointsStr = vertices.map((v) => `${v.x},${v.y}`).join(" ");
  const lastVertex = vertices[vertices.length - 1];

  return (
    <g>
      {/* Edges between placed vertices */}
      {vertices.length >= 2 && (
        <polyline
          points={pointsStr}
          fill="none"
          stroke="white"
          strokeWidth={0.5}
          strokeDasharray="2 1"
        />
      )}

      {/* Preview line from last vertex to cursor */}
      {lastVertex && cursorPos && (
        <line
          x1={lastVertex.x}
          y1={lastVertex.y}
          x2={isNearFirst && vertices.length >= 3 ? vertices[0].x : cursorPos.x}
          y2={isNearFirst && vertices.length >= 3 ? vertices[0].y : cursorPos.y}
          stroke="white"
          strokeWidth={0.3}
          strokeDasharray="1 1"
          opacity={0.5}
        />
      )}

      {/* Edge labels */}
      {vertices.map((v, i) => {
        if (i === 0) return null;
        return <EdgeLabel key={i} a={vertices[i - 1]} b={v} scale={scale} />;
      })}

      {/* Vertices */}
      {vertices.map((v, i) => (
        <circle
          key={i}
          cx={v.x}
          cy={v.y}
          r={i === 0 && isNearFirst && vertices.length >= 3 ? 2 : 1.2}
          fill={i === 0 && isNearFirst && vertices.length >= 3 ? "#4CAF50" : "white"}
          stroke="white"
          strokeWidth={0.3}
        />
      ))}

      {/* "zamknij" label on first vertex when near */}
      {isNearFirst && vertices.length >= 3 && (
        <text
          x={vertices[0].x}
          y={vertices[0].y + 4}
          fill="#4CAF50"
          fontSize={3}
          textAnchor="middle"
        >
          zamknij
        </text>
      )}
    </g>
  );
}

interface RoomPolygonProps {
  room: Room;
}

export function RoomPolygon({ room }: RoomPolygonProps) {
  const { vertices, scale } = room;
  const pointsStr = vertices.map((v) => `${v.x},${v.y}`).join(" ");

  return (
    <g>
      <polygon
        points={pointsStr}
        fill="rgba(255,255,255,0.08)"
        stroke="white"
        strokeWidth={0.5}
      />

      {/* Edge labels */}
      {vertices.map((v, i) => {
        const next = vertices[(i + 1) % vertices.length];
        return <EdgeLabel key={i} a={v} b={next} scale={scale} />;
      })}

      {/* Vertex dots */}
      {vertices.map((v, i) => (
        <circle
          key={i}
          cx={v.x}
          cy={v.y}
          r={0.8}
          fill="rgba(255,255,255,0.4)"
        />
      ))}
    </g>
  );
}
