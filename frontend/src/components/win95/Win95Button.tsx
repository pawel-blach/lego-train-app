interface Win95ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function Win95Button({ children, className, onClick, size = "md" }: Win95ButtonProps) {
  const sizeClass = size === "sm" ? "px-1 py-0.5" : "px-3 py-1";
  return (
    <button className={`win95-button ${sizeClass} ${className ?? ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
