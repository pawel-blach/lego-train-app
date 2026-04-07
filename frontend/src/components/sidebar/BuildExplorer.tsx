import { useState, useCallback, useMemo } from "react";
import { Frame, Modal, Tree, TitleBar, Tabs, Tab, Button } from "@react95/core";
import { trackPieceTree } from "../../data/trackPieceTree";
import { useTrackLayout, useTrackLayoutDispatch } from "../../context/TrackLayoutContext";
import { getAllRemainingCounts, getBudgetRemainingCounts, autoSelectBudget } from "../../lib/track/budget";
import { AddBudgetModal } from "./AddBudgetModal";
import type { TreeItem, Budget } from "../../types/track";

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

function buildBudgetTreeData(
  budgets: Budget[],
  layout: Parameters<typeof getBudgetRemainingCounts>[1],
  onAdd: (pieceTypeId: string, budgetId: string) => void,
  onDelete: (budgetId: string) => void,
): any[] {
  return budgets.map((budget) => {
    const remaining = getBudgetRemainingCounts(budget, layout);
    return {
      id: budget.id,
      label: budget.name,
      children: [
        ...trackPieceTree[0].children!.map((category) => ({
          id: `${budget.id}-${category.id}`,
          label: category.label,
          children: category.children!.map((piece) => {
            const count = remaining.get(piece.id) ?? 0;
            return {
              id: `${budget.id}-${piece.id}`,
              label: `${piece.label} (${count})`,
              onClick: () => {
                if (count > 0) onAdd(piece.id, budget.id);
              },
            };
          }),
        })),
        {
          id: `${budget.id}-delete`,
          label: "🗑 Delete Budget",
          onClick: () => onDelete(budget.id),
        },
      ],
    };
  });
}

export function BuildExplorer({ open, onClose }: BuildExplorerProps) {
  const { layout, budgets, lastUsedBudgetByType } = useTrackLayout();
  const dispatch = useTrackLayoutDispatch();
  const [showAddModal, setShowAddModal] = useState(false);

  const allRemainingCounts = useMemo(
    () => getAllRemainingCounts(budgets, layout),
    [budgets, layout]
  );

  const handleAddFromAll = useCallback(
    (pieceTypeId: string) => {
      const budgetId = autoSelectBudget(pieceTypeId, budgets, layout, lastUsedBudgetByType);
      if (budgetId) {
        dispatch({ type: "ADD_PIECE", pieceTypeId, budgetId });
      }
    },
    [dispatch, budgets, layout, lastUsedBudgetByType]
  );

  const handleAddFromBudget = useCallback(
    (pieceTypeId: string, budgetId: string) => {
      dispatch({ type: "ADD_PIECE", pieceTypeId, budgetId });
    },
    [dispatch]
  );

  const handleDeleteBudget = useCallback(
    (budgetId: string) => {
      dispatch({ type: "DELETE_BUDGET", budgetId });
    },
    [dispatch]
  );

  const handleAddBudget = useCallback(
    (name: string, color: string, pieces: Record<string, number>) => {
      const budget: Budget = {
        id: crypto.randomUUID(),
        name,
        color,
        pieces,
      };
      dispatch({ type: "ADD_BUDGET", budget });
      setShowAddModal(false);
    },
    [dispatch]
  );

  const allTreeData = useMemo(
    () => buildTreeData(trackPieceTree, allRemainingCounts, handleAddFromAll),
    [allRemainingCounts, handleAddFromAll]
  );

  const budgetTreeData = useMemo(
    () => buildBudgetTreeData(budgets, layout, handleAddFromBudget, handleDeleteBudget),
    [budgets, layout, handleAddFromBudget, handleDeleteBudget]
  );

  if (!open) return null;

  return (
    <>
      <Modal
        title="Build Explorer"
        titleBarOptions={<TitleBar.Close onClick={onClose} />}
        style={{ position: "absolute", top: 8, left: 8, zIndex: 40, width: 260, height: 320 }}
        dragOptions={{ disabled: false }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Tabs defaultActiveTab="All">
            <Tab title="All">
              <Frame
                boxShadow="in"
                bg="white"
                style={{ height: 180, overflow: "auto", padding: 4 }}
              >
                <Tree data={allTreeData} />
              </Frame>
            </Tab>
            <Tab title="Budgets">
              <Frame
                boxShadow="in"
                bg="white"
                style={{ height: 180, overflow: "auto", padding: 4 }}
              >
                {budgets.length === 0 ? (
                  <div style={{ padding: 8, color: "#666" }}>
                    No budgets yet. Add one below.
                  </div>
                ) : (
                  <Tree data={budgetTreeData} />
                )}
              </Frame>
            </Tab>
          </Tabs>
        </div>
        <div style={{ padding: 4 }}>
          <Button onClick={() => setShowAddModal(true)} style={{ width: "100%" }}>
            Add Budget
          </Button>
        </div>
      </Modal>
      {showAddModal && (
        <AddBudgetModal
          onConfirm={handleAddBudget}
          onCancel={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
