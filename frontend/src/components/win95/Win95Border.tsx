interface Win95BorderProps {
  variant: "outset" | "inset";
  children: React.ReactNode;
  className?: string;
}

export function Win95Border({ variant, children, className }: Win95BorderProps) {
  const cls = variant === "outset" ? "win95-border" : "win95-border-inset";
  return <div className={`${cls} ${className ?? ""}`}>{children}</div>;
}
