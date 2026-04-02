import type { TreeItem } from "../types/track";

export const trackPieceTree: TreeItem[] = [
  {
    id: "track-pieces",
    label: "Track Pieces",
    icon: "folder",
    children: [
      {
        id: "straights",
        label: "Straights",
        icon: "folder",
        children: [
          { id: "straight16", label: "Straight 16" },
          { id: "straight4", label: "Straight 4" },
        ],
      },
      {
        id: "curves",
        label: "Curves",
        icon: "folder",
        children: [
          { id: "curveR40L", label: "Curve R40 Left" },
          { id: "curveR40R", label: "Curve R40 Right" },
        ],
      },
      {
        id: "switches",
        label: "Switches",
        icon: "folder",
        children: [
          { id: "switchL", label: "Switch Left" },
          { id: "switchR", label: "Switch Right" },
        ],
      },
    ],
  },
];
