import { useState } from "react";
import { MenuBar } from "./components/layout/MenuBar";
import { BuildExplorer } from "./components/sidebar/BuildExplorer";
import { Controls } from "./components/sidebar/Controls";
import { TrackBoard } from "./components/board/TrackBoard";
import { TrackLayoutProvider } from "./context/TrackLayoutContext";

export default function App() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <TrackLayoutProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden text-black text-sm">
        <MenuBar
          onToggleExplorer={() => setExplorerOpen((o) => !o)}
          onToggleControls={() => setControlsOpen((o) => !o)}
        />
        <main className="flex-1 relative overflow-hidden bg-[#2e7d32] cursor-default">
          <TrackBoard />
          <BuildExplorer open={explorerOpen} onClose={() => setExplorerOpen(false)} />
          <Controls open={controlsOpen} onClose={() => setControlsOpen(false)} />
        </main>
      </div>
    </TrackLayoutProvider>
  );
}
