import type { TreeItem } from "../../types/track";

interface TreeNodeProps {
  item: TreeItem;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  isLast: boolean;
  remainingCounts: Map<string, number>;
}

export function TreeNode({ item, expanded, onToggle, onSelect, isLast, remainingCounts }: TreeNodeProps) {
  const isFolder = item.children !== undefined;
  const isExpanded = isFolder && expanded.has(item.id);

  if (isFolder) {
    return (
      <>
        <div
          className={`tree-line tree-node flex items-center gap-1 relative ${
            isLast && !isExpanded ? "tree-line-last" : ""
          }`}
        >
          <button
            className="win95-border bg-white w-3 h-3 flex items-center justify-center text-[10px] shrink-0"
            onClick={() => onToggle(item.id)}
          >
            {isExpanded ? "-" : "+"}
          </button>
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
                onToggle={onToggle}
                onSelect={onSelect}
                isLast={i === item.children!.length - 1}
                remainingCounts={remainingCounts}
              />
            ))}
          </div>
        )}
      </>
    );
  }

  const remaining = remainingCounts.get(item.id) ?? 0;
  const isDisabled = remaining <= 0;

  return (
    <div
      className={`tree-line tree-node flex items-center gap-1 relative px-1
        ${isLast ? "tree-line-last" : ""}
        ${isDisabled ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-[#000080] hover:text-white"}`}
      onClick={() => onSelect(item.id)}
    >
      <span>{item.label} ({remaining})</span>
    </div>
  );
}
