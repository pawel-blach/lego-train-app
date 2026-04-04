import { useRef, useMemo, useCallback, type PointerEvent } from "react";
import { Cursor } from "@react95/core";
import { PIECE_TYPES } from "../../lib/track/pieces";
import { getWorldConnectionPoint } from "../../lib/track/geometry";
import { getFreeConnectionPoints } from "../../lib/track/operations";
import { useTrackLayout, useTrackLayoutDispatch } from "../../context/TrackLayoutContext";
import { useViewBox } from "../../hooks/useViewBox";
import { useBoxSelect } from "../../hooks/useBoxSelect";
import { usePieceDrag } from "../../hooks/usePieceDrag";
import { TrackPieceShape } from "./TrackPieceShape";
import { ConnectionDot } from "./ConnectionDot";

const GRID_SIZE = 8;
const GRID_EXTENT = 10000;

export function TrackBoard({ selectMode, moveWholeTrack }: { selectMode: boolean; moveWholeTrack: boolean }) {
  const { layout, lastPieceId, selection } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { viewBox, handlers, spaceHeld, isPanning } = useViewBox(svgRef, selectMode);

  const { isBoxSelecting, selectionRect, startBoxSelect, updateBoxSelect, endBoxSelect } =
    useBoxSelect(svgRef, layout.pieces, PIECE_TYPES);

  const { dragPreview, startDrag, updateDrag, endDrag } = usePieceDrag(svgRef);

  const boxSelectRef = useRef(false);

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

  const handlePiecePointerDown = useCallback(
    (pieceId: string, e: PointerEvent) => {
      if (!selectMode) return;
      if (!selection.has(pieceId)) {
        dispatch({ type: "SELECT_PIECE", pieceId, additive: e.shiftKey });
      }
      startDrag(pieceId, e);
    },
    [dispatch, selection, startDrag, selectMode]
  );

  const handleBoardPointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;
      if (spaceHeld?.current || !selectMode) return; // Space+drag or pan mode = pan, not box select
      boxSelectRef.current = true;
      startBoxSelect(e);
    },
    [startBoxSelect, spaceHeld, selectMode]
  );

  const handleBoardPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (updateDrag(e)) return; // piece drag takes priority
      if (boxSelectRef.current) {
        updateBoxSelect(e);
      }
    },
    [updateDrag, updateBoxSelect]
  );

  const handleBoardPointerUp = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      const dragResult = endDrag();
      if (dragResult) {
        const pieceIds = [...selection];
        if (pieceIds.length === 0) pieceIds.push(dragResult.pieceId);
        dispatch({
          type: "MOVE_PIECES",
          pieceIds,
          dx: dragResult.dx,
          dy: dragResult.dy,
          detach: e.altKey || !moveWholeTrack,
        });
        return;
      }
      if (boxSelectRef.current) {
        boxSelectRef.current = false;
        const selectedIds = endBoxSelect();
        if (selectedIds.length > 0) {
          dispatch({ type: "BOX_SELECT", pieceIds: selectedIds, additive: e.shiftKey });
        } else {
          dispatch({ type: "CLEAR_SELECTION" });
        }
      }
    },
    [endDrag, endBoxSelect, dispatch, selection, moveWholeTrack]
  );

  const cursorClass = dragPreview
    ? Cursor.Grabbing
    : isPanning?.current
      ? Cursor.Grabbing
      : isBoxSelecting
        ? Cursor.Crosshair
        : selectMode
          ? Cursor.Auto
          : Cursor.Grab;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={`absolute inset-0 ${cursorClass}`}
      onPointerDown={(e) => {
        handleBoardPointerDown(e);
        handlers.onMouseDown(e as any);
      }}
      onPointerMove={(e) => {
        handleBoardPointerMove(e);
        handlers.onMouseMove(e as any);
      }}
      onPointerUp={(e) => {
        handleBoardPointerUp(e);
        handlers.onMouseUp();
      }}
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
            stroke="rgba(0,100,100,0.25)"
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
        fill="rgb(0,128,128)"
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
          isSelected={selection.has(piece.id)}
          selectMode={selectMode}
          onPiecePointerDown={handlePiecePointerDown}
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
      {dragPreview && (
        <g opacity={0.5}>
          {[...layout.pieces.values()]
            .filter((piece) => selection.has(piece.id))
            .map((piece) => (
              <TrackPieceShape
                key={`ghost-${piece.id}`}
                piece={{ ...piece, x: piece.x + dragPreview.dx, y: piece.y + dragPreview.dy }}
                pieceDef={PIECE_TYPES[piece.typeId]}
              />
            ))}
        </g>
      )}
      {selectionRect && (
        <rect
          x={selectionRect.x}
          y={selectionRect.y}
          width={selectionRect.width}
          height={selectionRect.height}
          fill="rgba(33, 150, 243, 0.15)"
          stroke="#2196F3"
          strokeWidth={0.3}
          strokeDasharray="1 1"
          pointerEvents="none"
        />
      )}
    </svg>
  );
}
