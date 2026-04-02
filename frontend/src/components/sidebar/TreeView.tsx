import type { TreeItem } from "../../types/track";
import { useTreeState } from "../../hooks/useTreeState";
import { TreeNode } from "./TreeNode";

interface TreeViewProps {
  items: TreeItem[];
  onSelect: (id: string) => void;
}

export function TreeView({ items, onSelect }: TreeViewProps) {
  const { expanded, toggle } = useTreeState(["track-pieces", "straights"]);

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const isFolder = item.children !== undefined;
        const isExpanded = isFolder && expanded.has(item.id);

        return (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-1">
              {isFolder && (
                <button
                  className="win95-border bg-white w-3 h-3 flex items-center justify-center text-[10px] shrink-0"
                  onClick={() => toggle(item.id)}
                >
                  {isExpanded ? "-" : "+"}
                </button>
              )}
              <span className="material-symbols-outlined text-sm text-yellow-600">folder</span>
              <span>{item.label}</span>
            </div>
            {isExpanded && item.children && item.children.length > 0 && (
              <div className="ml-6 space-y-1">
                {item.children.map((child, i) => (
                  <TreeNode
                    key={child.id}
                    item={child}
                    expanded={expanded}
                    onToggle={toggle}
                    onSelect={onSelect}
                    isLast={i === item.children!.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
