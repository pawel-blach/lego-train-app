import { useCallback, useMemo } from "react";
import { Frame, Modal, Tree, TitleBar } from "@react95/core";
import { trackPieceTree } from "../../data/trackPieceTree";
import { useTrackLayout, useTrackLayoutDispatch } from "../../context/TrackLayoutContext";
import { defaultBudget } from "../../data/budgets/default";
import { getRemainingCounts } from "../../lib/track/budget";
import type { TreeItem } from "../../types/track";

interface BuildExplorerProps {
  open: boolean;
  onClose: () => void;
}

function buildTreeData(
  items: TreeItem[],
  remainingCounts: Map<string, number>,
  onAdd: (id: string) => void,
): any[] {
  return items.map((item) => {
    if (item.children) {
      return {
        id: item.id,
        label: item.label,
        children: buildTreeData(item.children, remainingCounts, onAdd),
      };
    }
    const remaining = remainingCounts.get(item.id) ?? 0;
    return {
      id: item.id,
      label: `${item.label} (${remaining})`,
      onClick: () => {
        if (remaining > 0) onAdd(item.id);
      },
    };
  });
}

export function BuildExplorer({ open, onClose }: BuildExplorerProps) {
  const { layout } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();

  const remainingCounts = useMemo(
    () => getRemainingCounts(defaultBudget, layout),
    [layout]
  );

  const handleAdd = useCallback(
    (pieceTypeId: string) => {
      dispatch({ type: "ADD_PIECE", pieceTypeId });
    },
    [dispatch]
  );

  const treeData = useMemo(
    () => buildTreeData(trackPieceTree, remainingCounts, handleAdd),
    [remainingCounts, handleAdd]
  );

  if (!open) return null;

  return (
    <Modal
      title="Build Explorer"
      titleBarOptions={<TitleBar.Close onClick={onClose} />}
      style={{ position: "absolute", top: 8, left: 8, zIndex: 40, width: 240, height: 280 }}
      dragOptions={{ disabled: false }}
    >
      <Frame
        boxShadow="in"
        bg="white"
        style={{ flex: 1, overflow: "auto", padding: 4 }}
      >
        <Tree data={treeData} />
      </Frame>
    </Modal>
  );
}
