import type { Layout } from "./layout";
import type { TrackBudget } from "../../types/track";

export function getRemainingCounts(budget: TrackBudget, layout: Layout): Map<string, number> {
  const placed = new Map<string, number>();
  for (const piece of layout.pieces.values()) {
    placed.set(piece.typeId, (placed.get(piece.typeId) ?? 0) + 1);
  }

  const remaining = new Map<string, number>();
  for (const [typeId, owned] of Object.entries(budget.pieces)) {
    remaining.set(typeId, owned - (placed.get(typeId) ?? 0));
  }
  return remaining;
}
