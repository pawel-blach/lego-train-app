import { useState, useCallback, useRef, type RefObject } from "react";

const DRAG_THRESHOLD = 2; // pixels in screen space
const SNAP_GRID = 4;

interface DragState {
  pieceId: string;
  startClientX: number;
  startClientY: number;
  startSvgX: number;
  startSvgY: number;
  isDragging: boolean;
  currentDx: number;
  currentDy: number;
}

function snapToGrid(value: number): number {
  return Math.round(value / SNAP_GRID) * SNAP_GRID;
}

export function usePieceDrag(
  svgRef: RefObject<SVGSVGElement | null>
) {
  const [dragPreview, setDragPreview] = useState<{ dx: number; dy: number } | null>(null);
  const dragRef = useRef<DragState | null>(null);

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
    [svgRef]
  );

  const startDrag = useCallback(
    (pieceId: string, e: React.PointerEvent) => {
      const svgPt = screenToSvg(e.clientX, e.clientY);
      dragRef.current = {
        pieceId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startSvgX: svgPt?.x ?? 0,
        startSvgY: svgPt?.y ?? 0,
        isDragging: false,
        currentDx: 0,
        currentDy: 0,
      };
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [screenToSvg]
  );

  const updateDrag = useCallback(
    (e: React.PointerEvent): boolean => {
      const drag = dragRef.current;
      if (!drag) return false;

      const screenDx = e.clientX - drag.startClientX;
      const screenDy = e.clientY - drag.startClientY;

      if (!drag.isDragging) {
        if (Math.hypot(screenDx, screenDy) < DRAG_THRESHOLD) return false;
        drag.isDragging = true;
      }

      const svgPt = screenToSvg(e.clientX, e.clientY);
      if (!svgPt) return true;
      const rawDx = svgPt.x - drag.startSvgX;
      const rawDy = svgPt.y - drag.startSvgY;
      const dx = snapToGrid(rawDx);
      const dy = snapToGrid(rawDy);
      drag.currentDx = dx;
      drag.currentDy = dy;
      setDragPreview({ dx, dy });
      return true;
    },
    [screenToSvg]
  );

  const endDrag = useCallback((): {
    pieceId: string;
    dx: number;
    dy: number;
  } | null => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragPreview(null);

    if (!drag || !drag.isDragging) return null;
    if (drag.currentDx === 0 && drag.currentDy === 0) return null;

    return {
      pieceId: drag.pieceId,
      dx: drag.currentDx,
      dy: drag.currentDy,
    };
  }, []);

  const cancelDrag = useCallback(() => {
    dragRef.current = null;
    setDragPreview(null);
  }, []);

  return {
    isDragging: dragRef.current?.isDragging ?? false,
    dragPreview,
    startDrag,
    updateDrag,
    endDrag,
    cancelDrag,
  };
}
