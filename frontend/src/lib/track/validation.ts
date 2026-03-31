import type { Layout } from "./layout";
import { getFreeConnectionPoints } from "./operations";
import type { FreeConnectionPoint } from "./operations";

export function getFreeEnds(layout: Layout): FreeConnectionPoint[] {
  return getFreeConnectionPoints(layout);
}

export function isClosedLoop(layout: Layout): boolean {
  return layout.pieces.size > 0 && getFreeEnds(layout).length === 0;
}

export function getDisconnectedGroups(layout: Layout): string[][] {
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();

  for (const id of layout.pieces.keys()) {
    parent.set(id, id);
    rank.set(id, 0);
  }

  function find(x: string): string {
    let root = x;
    while (parent.get(root) !== root) {
      root = parent.get(root)!;
    }
    // Path compression
    let current = x;
    while (current !== root) {
      const next = parent.get(current)!;
      parent.set(current, root);
      current = next;
    }
    return root;
  }

  function union(a: string, b: string): void {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;

    const rankA = rank.get(rootA)!;
    const rankB = rank.get(rootB)!;
    if (rankA < rankB) {
      parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      parent.set(rootB, rootA);
    } else {
      parent.set(rootB, rootA);
      rank.set(rootA, rankA + 1);
    }
  }

  for (const conn of layout.connections) {
    union(conn.pieceAId, conn.pieceBId);
  }

  const groups = new Map<string, string[]>();
  for (const id of layout.pieces.keys()) {
    const root = find(id);
    if (!groups.has(root)) {
      groups.set(root, []);
    }
    groups.get(root)!.push(id);
  }

  return Array.from(groups.values());
}
