import { useMemo } from "react";
import {
  Window,
  WindowHeader,
  WindowContent,
  TreeView,
  Button,
} from "react95";
import type { TreeLeaf } from "react95/dist/TreeView/TreeView";
import { trackPieceTree } from "../../data/trackPieceTree";
import { useTrackLayout, useTrackLayoutDispatch } from "../../context/TrackLayoutContext";
import { defaultBudget } from "../../data/budgets/default";
import { getRemainingCounts } from "../../lib/track/budget";
import type { TreeItem } from "../../types/track";

function toTreeLeaves(
  items: TreeItem[],
  remainingCounts: Map<string, number>
): TreeLeaf<string>[] {
  return items.map((item) => {
    if (item.children) {
      return {
        id: item.id,
        label: item.label,
        items: toTreeLeaves(item.children, remainingCounts),
      };
    }
    const remaining = remainingCounts.get(item.id) ?? 0;
    return {
      id: item.id,
      label: `${item.label} (${remaining})`,
      disabled: remaining <= 0,
    };
  });
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

  const tree = useMemo(
    () => toTreeLeaves(trackPieceTree, remainingCounts),
    [remainingCounts]
  );

  function handleNodeSelect(_event: React.MouseEvent<HTMLElement>, id: string) {
    const remaining = remainingCounts.get(id) ?? 0;
    if (remaining <= 0) return;
    dispatch({ type: "ADD_PIECE", pieceTypeId: id });
  }

  if (!open) return null;

  return (
    <Window
      shadow
      style={{ position: "absolute", top: 8, left: 8, zIndex: 40, width: 240 }}
    >
      <WindowHeader style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>Build Explorer</span>
        <Button onClick={onClose} size="sm" square>
          <span style={{ fontWeight: "bold" }}>✕</span>
        </Button>
      </WindowHeader>
      <WindowContent>
        <TreeView
          tree={tree}
          onNodeSelect={handleNodeSelect}
          defaultExpanded={["track-pieces"]}
        />
      </WindowContent>
    </Window>
  );
}
