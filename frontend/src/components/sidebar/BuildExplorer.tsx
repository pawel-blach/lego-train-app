import { useMemo } from "react";
import { trackPieceTree } from "../../data/trackPieceTree";
import { useTrackLayout, useTrackLayoutDispatch } from "../../context/TrackLayoutContext";
import { defaultBudget } from "../../data/budgets/default";
import { getRemainingCounts } from "../../lib/track/budget";
import type { TreeItem } from "../../types/track";

function collectLeaves(items: TreeItem[]): TreeItem[] {
  const leaves: TreeItem[] = [];
  for (const item of items) {
    if (item.children) {
      leaves.push(...collectLeaves(item.children));
    } else {
      leaves.push(item);
    }
  }
  return leaves;
}

interface BuildExplorerProps {
  open: boolean;
  onClose: () => void;
}

export function BuildExplorer({ open, onClose }: BuildExplorerProps) {
  const { layout } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();

  const remainingCounts = useMemo(
    () => getRemainingCounts(defaultBudget, layout),
    [layout]
  );

  const leaves = useMemo(() => collectLeaves(trackPieceTree), []);

  function handleAdd(pieceTypeId: string) {
    const remaining = remainingCounts.get(pieceTypeId) ?? 0;
    if (remaining <= 0) return;
    dispatch({ type: "ADD_PIECE", pieceTypeId });
  }

  if (!open) return null;

  return (
    <aside className="absolute top-2 left-2 z-40 bg-white border border-gray-300 w-56">
      <div className="flex items-center justify-between px-2 py-1 border-b border-gray-200">
        <span className="font-bold text-sm">Build Explorer</span>
        <button className="text-sm px-1 hover:bg-gray-100" onClick={onClose}>X</button>
      </div>
      <div className="p-2 space-y-1">
        {leaves.map((item) => {
          const remaining = remainingCounts.get(item.id) ?? 0;
          const isDisabled = remaining <= 0;
          return (
            <div
              key={item.id}
              className={`px-2 py-0.5 text-sm ${
                isDisabled ? "opacity-50" : "cursor-pointer hover:bg-gray-100"
              }`}
              onClick={() => !isDisabled && handleAdd(item.id)}
            >
              {item.label} ({remaining})
            </div>
          );
        })}
      </div>
    </aside>
  );
}
