import { useState, useCallback, type RefObject, type PointerEvent } from "react";

const CLOSE_THRESHOLD = 10; // SVG units

export function useRoomDraw(svgRef: RefObject<SVGSVGElement | null>) {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isNearFirst, setIsNearFirst] = useState(false);

  const screenToSvg = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const svg = svgRef.current;
      if (!svg) return null;
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    [svgRef],
  );

  const updateCursor = useCallback(
    (e: PointerEvent, draftVertices: { x: number; y: number }[]) => {
      const pos = screenToSvg(e.clientX, e.clientY);
      if (!pos) return;
      setCursorPos(pos);

      if (draftVertices.length > 0) {
        const first = draftVertices[0];
        const dx = pos.x - first.x;
        const dy = pos.y - first.y;
        setIsNearFirst(Math.sqrt(dx * dx + dy * dy) < CLOSE_THRESHOLD);
      } else {
        setIsNearFirst(false);
      }
    },
    [screenToSvg],
  );

  const getClickPos = useCallback(
    (e: PointerEvent): { x: number; y: number } | null => {
      return screenToSvg(e.clientX, e.clientY);
    },
    [screenToSvg],
  );

  const reset = useCallback(() => {
    setCursorPos(null);
    setIsNearFirst(false);
  }, []);

  return { cursorPos, isNearFirst, updateCursor, getClickPos, reset };
}
