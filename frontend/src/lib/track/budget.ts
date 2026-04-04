import type { Layout } from "./layout";
import type { Budget } from "../../types/track";

/**
 * Get remaining piece counts for a single budget.
 * Returns how many of each piece type this budget still has available
 * (owned minus placed from this budget).
 */
export function getBudgetRemainingCounts(budget: Budget, layout: Layout): Map<string, number> {
  const placed = new Map<string, number>();
  for (const piece of layout.pieces.values()) {
    if (piece.budgetId === budget.id) {
      placed.set(piece.typeId, (placed.get(piece.typeId) ?? 0) + 1);
    }
  }

  const remaining = new Map<string, number>();
  for (const [typeId, owned] of Object.entries(budget.pieces)) {
    remaining.set(typeId, owned - (placed.get(typeId) ?? 0));
  }
  return remaining;
}

/**
 * Get remaining piece counts summed across all budgets.
 */
export function getAllRemainingCounts(budgets: Budget[], layout: Layout): Map<string, number> {
  const totals = new Map<string, number>();
  for (const budget of budgets) {
    const remaining = getBudgetRemainingCounts(budget, layout);
    for (const [typeId, count] of remaining) {
      totals.set(typeId, (totals.get(typeId) ?? 0) + count);
    }
  }
  return totals;
}

/**
 * Auto-select which budget to use when adding a piece from the "All" tab.
 * Prefers lastUsedBudgetByType, then falls back to first budget with remaining pieces.
 * Returns the budgetId or null if no budget has remaining pieces.
 */
export function autoSelectBudget(
  pieceTypeId: string,
  budgets: Budget[],
  layout: Layout,
  lastUsedBudgetByType: Record<string, string>,
): string | null {
  const lastUsedId = lastUsedBudgetByType[pieceTypeId];
  if (lastUsedId) {
    const lastBudget = budgets.find((b) => b.id === lastUsedId);
    if (lastBudget) {
      const remaining = getBudgetRemainingCounts(lastBudget, layout);
      if ((remaining.get(pieceTypeId) ?? 0) > 0) {
        return lastUsedId;
      }
    }
  }

  for (const budget of budgets) {
    const remaining = getBudgetRemainingCounts(budget, layout);
    if ((remaining.get(pieceTypeId) ?? 0) > 0) {
      return budget.id;
    }
  }

  return null;
}
