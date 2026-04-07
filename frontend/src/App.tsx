import { useState, useEffect, useCallback } from "react";
import { MenuBar } from "./components/layout/MenuBar";
import { BuildExplorer } from "./components/sidebar/BuildExplorer";
import { Controls } from "./components/sidebar/Controls";
import { TrackBoard } from "./components/board/TrackBoard";
import { TrackLayoutProvider, useTrackLayout, useTrackLayoutDispatch } from "./context/TrackLayoutContext";
import type { BoardMode } from "./types/track";

function AppContent() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [boardMode, setBoardMode] = useState<BoardMode>("pan");
  const [moveWholeTrack, setMoveWholeTrack] = useState(true);

  const { undoStack, room } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();

  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, [dispatch]);

  const handleDefineRoom = useCallback(() => {
    if (room) {
      dispatch({ type: "CLEAR_ROOM" });
    }
    setBoardMode("room");
  }, [room, dispatch]);

  const handleClearRoom = useCallback(() => {
    dispatch({ type: "CLEAR_ROOM" });
    if (boardMode === "room") {
      setBoardMode("pan");
    }
  }, [dispatch, boardMode]);

  const toggleMoveWholeTrack = useCallback(
    () => setMoveWholeTrack((v) => !v),
    [],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === "Escape") {
        if (boardMode === "room") {
          dispatch({ type: "CLEAR_ROOM" });
          setBoardMode("pan");
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === "v" || e.key === "V") {
        if (boardMode === "room") dispatch({ type: "CLEAR_ROOM" });
        setBoardMode("select");
      }
      if (e.key === "h" || e.key === "H") {
        if (boardMode === "room") dispatch({ type: "CLEAR_ROOM" });
        setBoardMode("pan");
      }
      if (e.key === "d" || e.key === "D") {
        toggleMoveWholeTrack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleMoveWholeTrack, handleUndo, boardMode, dispatch]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-black text-sm">
      <MenuBar
        onToggleExplorer={() => setExplorerOpen((o) => !o)}
        onToggleControls={() => setControlsOpen((o) => !o)}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
        hasRoom={room !== null}
        isRoomMode={boardMode === "room"}
        onDefineRoom={handleDefineRoom}
        onClearRoom={handleClearRoom}
      />
      <main className="flex-1 relative overflow-hidden bg-[rgb(0,128,128)]">
        <TrackBoard
          boardMode={boardMode}
          moveWholeTrack={moveWholeTrack}
          onExitRoomMode={() => setBoardMode("pan")}
        />
        <BuildExplorer
          open={explorerOpen}
          onClose={() => setExplorerOpen(false)}
        />
        <Controls
          open={controlsOpen}
          onClose={() => setControlsOpen(false)}
          boardMode={boardMode}
          onBoardModeChange={setBoardMode}
          moveWholeTrack={moveWholeTrack}
          onMoveWholeTrackChange={setMoveWholeTrack}
        />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <TrackLayoutProvider>
      <AppContent />
    </TrackLayoutProvider>
  );
}
