import { useMemo } from "react";
import { Win95TitleBar } from "../win95/Win95TitleBar";
import { TreeView } from "./TreeView";
import { trackPieceTree } from "../../data/trackPieceTree";
import { useTrackLayout, useTrackLayoutDispatch } from "../../context/TrackLayoutContext";
import { defaultBudget } from "../../data/budgets/default";
import { getRemainingCounts } from "../../lib/track/budget";

export function BuildExplorer() {
  const { layout } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();

  const remainingCounts = useMemo(
    () => getRemainingCounts(defaultBudget, layout),
    [layout]
  );

  function handleAdd(pieceTypeId: string) {
    const remaining = remainingCounts.get(pieceTypeId) ?? 0;
    if (remaining <= 0) return;
    dispatch({ type: "ADD_PIECE", pieceTypeId });
  }

  return (
    <aside className="w-64 bg-retro-gray flex flex-col border-r border-black p-1 z-40 shrink-0">
      <Win95TitleBar icon="folder_open" title="Build Explorer" />
      <div className="win95-border-inset flex-1 p-2 overflow-y-auto bg-white">
        <TreeView items={trackPieceTree} onSelect={handleAdd} remainingCounts={remainingCounts} />
      </div>
    </aside>
  );
}
