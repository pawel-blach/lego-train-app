import type { TreeItem } from "../types/track";

const straightSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23aaa'/%3E%3Cline x1='0' y1='5' x2='16' y2='5' stroke='%23333' stroke-width='1.5'/%3E%3Cline x1='0' y1='11' x2='16' y2='11' stroke='%23333' stroke-width='1.5'/%3E%3C/svg%3E";

const longStraightSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23aaa'/%3E%3Cline x1='0' y1='4' x2='16' y2='4' stroke='%23333' stroke-width='2'/%3E%3Cline x1='0' y1='12' x2='16' y2='12' stroke='%23333' stroke-width='2'/%3E%3Cline x1='4' y1='4' x2='4' y2='12' stroke='%23666' stroke-width='1'/%3E%3Cline x1='12' y1='4' x2='12' y2='12' stroke='%23666' stroke-width='1'/%3E%3C/svg%3E";

const curveSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23aaa'/%3E%3Cpath d='M0 5 Q11 5 11 16' stroke='%23333' stroke-width='1.5' fill='none'/%3E%3Cpath d='M0 11 Q5 11 5 16' stroke='%23333' stroke-width='1.5' fill='none'/%3E%3C/svg%3E";

const switchSvg =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='16' height='16' fill='%23aaa'/%3E%3Cline x1='0' y1='8' x2='16' y2='8' stroke='%23333' stroke-width='1.5'/%3E%3Cpath d='M0 8 Q8 8 16 3' stroke='%23555' stroke-width='1' fill='none'/%3E%3C/svg%3E";

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
          { id: "short-straight", label: "Short Straight", thumbnailSrc: straightSvg },
          { id: "long-straight", label: "Long Straight", thumbnailSrc: longStraightSvg },
        ],
      },
      {
        id: "curves",
        label: "Curves",
        icon: "folder",
        children: [
          { id: "curve-left", label: "Curve Left", thumbnailSrc: curveSvg },
          { id: "curve-right", label: "Curve Right", thumbnailSrc: curveSvg },
        ],
      },
      {
        id: "switches",
        label: "Switches",
        icon: "folder",
        children: [
          { id: "switch-left", label: "Switch Left", thumbnailSrc: switchSvg },
          { id: "switch-right", label: "Switch Right", thumbnailSrc: switchSvg },
        ],
      },
    ],
  },
  {
    id: "scenery-items",
    label: "Scenery Items",
    icon: "folder",
    children: [],
  },
];
