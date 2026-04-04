interface MenuBarProps {
  onToggleExplorer: () => void;
}

export function MenuBar({ onToggleExplorer }: MenuBarProps) {
  return (
    <header className="flex items-center justify-between bg-white px-3 py-1 border-b border-gray-200 z-50">
      <span className="font-bold text-sm">Track Designer Pro</span>
      <button
        className="px-2 py-0.5 text-sm border border-gray-300 bg-white hover:bg-gray-50"
        onClick={onToggleExplorer}
      >
        Build Explorer
      </button>
    </header>
  );
}
