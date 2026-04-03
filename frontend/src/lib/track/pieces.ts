export type RotationIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export interface ConnectionPointDef {
  id: string;
  localX: number;
  localY: number;
  localAngle: number;
}

export interface PieceTypeDef {
  id: string;
  name: string;
  connectionPoints: ConnectionPointDef[];
}

// Pre-computed constants for R40 curve at 22.5°
const R40_SIN_22_5 = 40 * Math.sin((22.5 * Math.PI) / 180); // ≈ 15.307
const R40_1_MINUS_COS_22_5 = 40 * (1 - Math.cos((22.5 * Math.PI) / 180)); // ≈ 3.045

// Switch diverge: derived from constraint that switch diverge + opposite R40 curve
// = switch through + straight16, with 16 studs lateral offset
const SWITCH_DIVERGE_X = 48 - R40_SIN_22_5; // ≈ 32.693
const SWITCH_DIVERGE_Y = 16 - R40_1_MINUS_COS_22_5; // ≈ 12.955

export const PIECE_TYPES: Record<string, PieceTypeDef> = {
  straight16: {
    id: "straight16",
    name: "Straight 16",
    connectionPoints: [
      { id: "a", localX: 0, localY: 0, localAngle: 180 },
      { id: "b", localX: 16, localY: 0, localAngle: 0 },
    ],
  },
  straight4: {
    id: "straight4",
    name: "Straight 4",
    connectionPoints: [
      { id: "a", localX: 0, localY: 0, localAngle: 180 },
      { id: "b", localX: 4, localY: 0, localAngle: 0 },
    ],
  },
  curveR40L: {
    id: "curveR40L",
    name: "Curve R40 Left",
    connectionPoints: [
      { id: "a", localX: 0, localY: 0, localAngle: 180 },
      { id: "b", localX: R40_SIN_22_5, localY: -R40_1_MINUS_COS_22_5, localAngle: -22.5 },
    ],
  },
  curveR40R: {
    id: "curveR40R",
    name: "Curve R40 Right",
    connectionPoints: [
      { id: "a", localX: 0, localY: 0, localAngle: 180 },
      { id: "b", localX: R40_SIN_22_5, localY: R40_1_MINUS_COS_22_5, localAngle: 22.5 },
    ],
  },
  switchL: {
    id: "switchL",
    name: "Switch Left",
    connectionPoints: [
      { id: "trunk", localX: 0, localY: 0, localAngle: 180 },
      { id: "through", localX: 32, localY: 0, localAngle: 0 },
      { id: "diverge", localX: SWITCH_DIVERGE_X, localY: -SWITCH_DIVERGE_Y, localAngle: -22.5 },
    ],
  },
  switchR: {
    id: "switchR",
    name: "Switch Right",
    connectionPoints: [
      { id: "trunk", localX: 0, localY: 0, localAngle: 180 },
      { id: "through", localX: 32, localY: 0, localAngle: 0 },
      { id: "diverge", localX: SWITCH_DIVERGE_X, localY: SWITCH_DIVERGE_Y, localAngle: 22.5 },
    ],
  },
};
