export interface TreeItem {
  id: string;
  label: string;
  icon?: string;
  children?: TreeItem[];
}

export interface Budget {
  id: string;
  name: string;
  color: string;
  pieces: Record<string, number>;
}

export interface RoomVertex {
  x: number;
  y: number;
}

export interface Room {
  vertices: RoomVertex[];
  scale: number;
}
