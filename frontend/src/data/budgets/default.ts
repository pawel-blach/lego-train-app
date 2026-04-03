import type { TrackBudget } from "../../types/track";

export const defaultBudget: TrackBudget = {
  name: "Default Collection",
  pieces: {
    straight16: 36,
    straight4: 8,
    curveR40L: 16,
    curveR40R: 16,
    switchL: 4,
    switchR: 4,
  },
};
