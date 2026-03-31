interface Win95TitleBarProps {
  icon: string;
  title: string;
}

export function Win95TitleBar({ icon, title }: Win95TitleBarProps) {
  return (
    <div className="win95-title flex items-center p-1 px-2 mb-1">
      <span className="text-white font-bold text-xs flex items-center gap-1">
        <span className="material-symbols-outlined text-xs">{icon}</span>
        {title}
      </span>
    </div>
  );
}
