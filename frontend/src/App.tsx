import { MenuBar } from "./components/layout/MenuBar";
import { Taskbar } from "./components/layout/Taskbar";
import { BuildExplorer } from "./components/sidebar/BuildExplorer";
import { TrackBoard } from "./components/board/TrackBoard";
import { TrackLayoutProvider } from "./context/TrackLayoutContext";

export default function App() {
  return (
    <TrackLayoutProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden text-black text-sm">
        <MenuBar />
        <div className="flex-1 flex overflow-hidden">
          <BuildExplorer />
          <main className="flex-1 relative overflow-hidden bg-[#2e7d32] cursor-crosshair">
            <TrackBoard />
          </main>
        </div>
        <Taskbar />
      </div>
    </TrackLayoutProvider>
  );
}
