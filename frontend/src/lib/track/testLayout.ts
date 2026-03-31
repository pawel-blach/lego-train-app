import { createEmptyLayout, type Layout } from "./layout";
import { placeFirstPiece, placePiece } from "./operations";

function getNewPieceId(prev: Layout, next: Layout): string {
  for (const key of next.pieces.keys()) {
    if (!prev.pieces.has(key)) return key;
  }
  throw new Error("No new piece found");
}

export function buildTestLayout(): Layout {
  let layout = createEmptyLayout();

  // First piece: straight at origin
  let prev = layout;
  layout = placeFirstPiece(layout, "straight16");
  let lastId = getNewPieceId(prev, layout);

  // Chain more pieces to form a visible track
  const chain: [string, string, string][] = [
    // [pieceTypeId, targetPointId, newPointId]
    ["straight16", "b", "a"],
    ["curveR40L", "b", "a"],
    ["curveR40L", "b", "a"],
    ["curveR40L", "b", "a"],
    ["curveR40L", "b", "a"],
    ["straight16", "b", "a"],
    ["straight16", "b", "a"],
    ["curveR40R", "b", "a"],
    ["curveR40R", "b", "a"],
    ["switchL", "b", "trunk"],
    ["straight16", "through", "a"],
  ];

  for (const [typeId, targetPointId, newPointId] of chain) {
    prev = layout;
    layout = placePiece(layout, typeId, lastId, targetPointId, newPointId);
    lastId = getNewPieceId(prev, layout);
  }

  // Add opposite curve + straight on the switch's diverge to form parallel siding
  let switchPieceId = "";
  for (const [id, p] of layout.pieces) {
    if (p.typeId === "switchL") {
      switchPieceId = id;
      break;
    }
  }
  if (switchPieceId) {
    prev = layout;
    layout = placePiece(layout, "curveR40R", switchPieceId, "diverge", "a");
    let sidingId = getNewPieceId(prev, layout);

    prev = layout;
    layout = placePiece(layout, "straight16", sidingId, "b", "a");
  }

  return layout;
}
