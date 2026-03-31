interface ConnectionDotProps {
  x: number;
  y: number;
  isFree: boolean;
}

export function ConnectionDot({ x, y, isFree }: ConnectionDotProps) {
  return (
    <circle
      cx={x}
      cy={y}
      r={1.2}
      fill={isFree ? "#ff5722" : "#4caf50"}
      stroke={isFree ? "#bf360c" : "#2e7d32"}
      strokeWidth={0.3}
    />
  );
}
