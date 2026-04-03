import { useState, useCallback, useRef, type RefObject } from "react";
import type { PlacedPiece } from "../lib/track/layout";
import type { PieceTypeDef } from "../lib/track/pieces";
import { getPieceBoundingBox, boxesOverlap, type BoundingBox } from "../lib/track/geometry";

interface BoxSelectState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function useBoxSelect(
  svgRef: RefObject<SVGSVGElement | null>,
  pieces: Map<string, PlacedPiece>,
  pieceDefs: Record<string, PieceTypeDef>
) {
  const [box, setBox] = useState<BoxSelectState | null>(null);
  const boxRef = useRef<BoxSelectState | null>(null);

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

  const startBoxSelect = useCallback(
    (e: React.PointerEvent) => {
      const svgPt = screenToSvg(e.clientX, e.clientY);
      if (!svgPt) return;
      const state: BoxSelectState = {
        startX: svgPt.x,
        startY: svgPt.y,
        currentX: svgPt.x,
        currentY: svgPt.y,
      };
      boxRef.current = state;
      setBox(state);
    },
    [screenToSvg]
  );

  const updateBoxSelect = useCallback(
    (e: React.PointerEvent) => {
      if (!boxRef.current) return;
      const svgPt = screenToSvg(e.clientX, e.clientY);
      if (!svgPt) return;
      const state: BoxSelectState = {
        ...boxRef.current,
        currentX: svgPt.x,
        currentY: svgPt.y,
      };
      boxRef.current = state;
      setBox(state);
    },
    [screenToSvg]
  );

  const endBoxSelect = useCallback((): string[] => {
    const b = boxRef.current;
    boxRef.current = null;
    setBox(null);
    if (!b) return [];

    const selectionBox: BoundingBox = {
      minX: Math.min(b.startX, b.currentX),
      minY: Math.min(b.startY, b.currentY),
      maxX: Math.max(b.startX, b.currentX),
      maxY: Math.max(b.startY, b.currentY),
    };

    const selected: string[] = [];
    for (const piece of pieces.values()) {
      const def = pieceDefs[piece.typeId];
      if (!def) continue;
      const pieceBB = getPieceBoundingBox(piece, def);
      if (boxesOverlap(selectionBox, pieceBB)) {
        selected.push(piece.id);
      }
    }
    return selected;
  }, [pieces, pieceDefs]);

  const selectionRect = box
    ? {
        x: Math.min(box.startX, box.currentX),
        y: Math.min(box.startY, box.currentY),
        width: Math.abs(box.currentX - box.startX),
        height: Math.abs(box.currentY - box.startY),
      }
    : null;

  return {
    isBoxSelecting: box !== null,
    selectionRect,
    startBoxSelect,
    updateBoxSelect,
    endBoxSelect,
  };
}
