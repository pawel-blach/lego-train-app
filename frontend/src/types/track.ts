export interface TreeItem {
  id: string;
  label: string;
  icon?: string;
  children?: TreeItem[];
}
