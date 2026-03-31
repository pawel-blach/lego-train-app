export interface TreeItem {
  id: string;
  label: string;
  icon?: string;
  children?: TreeItem[];
  thumbnailSrc?: string;
}

export interface SelectedPiece {
  id: string;
  label: string;
  thumbnailSrc?: string;
}
