export interface TreeItem {
  id: string;
  label: string;
  icon?: string;
  children?: TreeItem[];
}

export interface TrackBudget {
  name: string;
  pieces: Record<string, number>;
}
