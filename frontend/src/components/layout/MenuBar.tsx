import { AppBar, Toolbar, Button } from "react95";

interface MenuBarProps {
  onToggleExplorer: () => void;
}

export function MenuBar({ onToggleExplorer }: MenuBarProps) {
  return (
    <AppBar position="static" style={{ zIndex: 50 }}>
      <Toolbar style={{ justifyContent: "space-between" }}>
        <span style={{ fontWeight: "bold" }}>Track Designer Pro</span>
        <Button onClick={onToggleExplorer} size="sm">
          Build Explorer
        </Button>
      </Toolbar>
    </AppBar>
  );
}
