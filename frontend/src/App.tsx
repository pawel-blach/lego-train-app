import { useState } from "react";
import { MenuBar } from "./components/layout/MenuBar";
import { BuildExplorer } from "./components/sidebar/BuildExplorer";
import { TrackBoard } from "./components/board/TrackBoard";
import { TrackLayoutProvider } from "./context/TrackLayoutContext";

export default function App() {
  const [explorerOpen, setExplorerOpen] = useState(false);

  return (
    <TrackLayoutProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden text-black text-sm">
        <MenuBar onToggleExplorer={() => setExplorerOpen((o) => !o)} />
        <main className="flex-1 relative overflow-hidden bg-[#2e7d32] cursor-default">
          <TrackBoard />
          <BuildExplorer open={explorerOpen} onClose={() => setExplorerOpen(false)} />
        </main>
      </div>
    </TrackLayoutProvider>
  );
}
