import { Win95TitleBar } from "../win95/Win95TitleBar";
import { TreeView } from "./TreeView";
import { trackPieceTree } from "../../data/trackPieceTree";

interface BuildExplorerProps {
  selectedPieceId: string | null;
  onSelectPiece: (id: string) => void;
}

export function BuildExplorer({ selectedPieceId, onSelectPiece }: BuildExplorerProps) {
  return (
    <aside className="w-64 bg-retro-gray flex flex-col border-r border-black p-1 z-40 shrink-0">
      <Win95TitleBar icon="folder_open" title="Build Explorer" />
      <div className="win95-border-inset flex-1 p-2 overflow-y-auto bg-white">
        <TreeView items={trackPieceTree} selectedId={selectedPieceId} onSelect={onSelectPiece} />
      </div>
    </aside>
  );
}
