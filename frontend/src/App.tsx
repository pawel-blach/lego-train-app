import { useState } from "react";
import { MenuBar } from "./components/layout/MenuBar";
import { Taskbar } from "./components/layout/Taskbar";
import { BuildExplorer } from "./components/sidebar/BuildExplorer";

export default function App() {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden text-black text-sm">
      <MenuBar />
      <div className="flex-1 flex overflow-hidden">
        <BuildExplorer selectedPieceId={selectedPieceId} onSelectPiece={setSelectedPieceId} />
        <main className="flex-1 relative overflow-auto felt-texture cursor-crosshair" />
      </div>
      <Taskbar />
    </div>
  );
}
