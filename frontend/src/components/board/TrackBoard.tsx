import { useRef, useMemo, useCallback, type PointerEvent } from "react";
import type { BoardMode } from "../../types/track";
import { Cursor } from "@react95/core";
import { PIECE_TYPES } from "../../lib/track/pieces";
import { getWorldConnectionPoint } from "../../lib/track/geometry";
import { getFreeConnectionPoints } from "../../lib/track/operations";
import { useTrackLayout, useTrackLayoutDispatch } from "../../context/TrackLayoutContext";
import { useViewBox } from "../../hooks/useViewBox";
import { useBoxSelect } from "../../hooks/useBoxSelect";
import { usePieceDrag } from "../../hooks/usePieceDrag";
import { useRoomDraw } from "../../hooks/useRoomDraw";
import { TrackPieceShape } from "./TrackPieceShape";
import { ConnectionDot } from "./ConnectionDot";
import { RoomDraft, RoomPolygon } from "./RoomShape";
import { DEFAULT_ROOM_SCALE } from "../../lib/room";

const GRID_SIZE = 8;
const GRID_EXTENT = 10000;

export function TrackBoard({
  boardMode,
  moveWholeTrack,
  onExitRoomMode,
}: {
  boardMode: BoardMode;
  moveWholeTrack: boolean;
  onExitRoomMode?: () => void;
}) {
  const { layout, lastPieceId, selection, budgets, room, roomDraft } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { cursorPos, isNearFirst, updateCursor, getClickPos, reset: resetRoomDraw } = useRoomDraw(svgRef);
  const { viewBox, handlers, isPanning } = useViewBox(svgRef, boardMode !== "pan");

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

  const budgetColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of budgets) {
      map.set(b.id, b.color);
    }
    return map;
  }, [budgets]);

  const freeKeys = useMemo(() => {
    const free = getFreeConnectionPoints(layout);
    return new Set(free.map((fp) => `${fp.pieceId}:${fp.pointId}`));
  }, [layout]);

  const handlePiecePointerDown = useCallback(
    (pieceId: string, e: PointerEvent) => {
      if (boardMode !== "select") return;
      if (!selection.has(pieceId)) {
        dispatch({ type: "SELECT_PIECE", pieceId, additive: e.shiftKey });
      }
      startDrag(pieceId, e);
    },
    [dispatch, selection, startDrag, boardMode]
  );

  const handleBoardPointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (e.button !== 0) return;

      if (boardMode === "room") {
        const pos = getClickPos(e);
        if (!pos) return;

        // Check if near first vertex → close
        if (roomDraft.length >= 3 && isNearFirst) {
          dispatch({ type: "CLOSE_ROOM" });
          resetRoomDraw();
          onExitRoomMode?.();
          return;
        }

        dispatch({ type: "ADD_ROOM_VERTEX", x: pos.x, y: pos.y });
        return;
      }

      if (boardMode !== "select") return;
      boxSelectRef.current = true;
      startBoxSelect(e);
    },
    [startBoxSelect, boardMode, getClickPos, roomDraft, isNearFirst, dispatch, resetRoomDraw, onExitRoomMode],
  );

  const handleBoardPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (boardMode === "room") {
        updateCursor(e, roomDraft);
      }
      if (updateDrag(e)) return;
      if (boxSelectRef.current) {
        updateBoxSelect(e);
      }
    },
    [updateDrag, updateBoxSelect, boardMode, updateCursor, roomDraft],
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
        : boardMode === "room"
          ? Cursor.Crosshair
          : boardMode === "select"
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

      {/* Room layer — under track pieces */}
      {room && <RoomPolygon room={room} />}
      {boardMode === "room" && (
        <RoomDraft
          vertices={roomDraft}
          cursorPos={cursorPos}
          isNearFirst={isNearFirst}
          scale={DEFAULT_ROOM_SCALE}
        />
      )}

      {[...layout.pieces.values()].map((piece) => (
        <TrackPieceShape
          key={piece.id}
          piece={piece}
          pieceDef={PIECE_TYPES[piece.typeId]}
          budgetColor={budgetColorMap.get(piece.budgetId)}
          isHighlighted={piece.id === lastPieceId}
          isSelected={selection.has(piece.id)}
          selectMode={boardMode === "select"}
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
                budgetColor={budgetColorMap.get(piece.budgetId)}
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
