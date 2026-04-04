import { useState, useEffect, useCallback } from "react";
import { MenuBar } from "./components/layout/MenuBar";
import { BuildExplorer } from "./components/sidebar/BuildExplorer";
import { Controls } from "./components/sidebar/Controls";
import { TrackBoard } from "./components/board/TrackBoard";
import { TrackLayoutProvider, useTrackLayout, useTrackLayoutDispatch } from "./context/TrackLayoutContext";

function AppContent() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [moveWholeTrack, setMoveWholeTrack] = useState(true);

  const { undoStack } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();

  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, [dispatch]);

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
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (e.key === "v" || e.key === "V") {
        setSelectMode(true);
      }
      if (e.key === "h" || e.key === "H") {
        setSelectMode(false);
      }
      if (e.key === "d" || e.key === "D") {
        toggleMoveWholeTrack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleMoveWholeTrack, handleUndo]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-black text-sm">
      <MenuBar
        onToggleExplorer={() => setExplorerOpen((o) => !o)}
        onToggleControls={() => setControlsOpen((o) => !o)}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
      />
      <main className="flex-1 relative overflow-hidden bg-[rgb(0,128,128)]">
        <TrackBoard selectMode={selectMode} moveWholeTrack={moveWholeTrack} />
        <BuildExplorer
          open={explorerOpen}
          onClose={() => setExplorerOpen(false)}
        />
        <Controls
          open={controlsOpen}
          onClose={() => setControlsOpen(false)}
          selectMode={selectMode}
          onSelectModeChange={setSelectMode}
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
