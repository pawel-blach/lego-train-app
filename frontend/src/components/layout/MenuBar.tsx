import { useState, useRef, useEffect } from "react";
import { Frame, List } from "@react95/core";

interface MenuBarProps {
  onToggleExplorer: () => void;
}

export function MenuBar({ onToggleExplorer }: MenuBarProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsHover, setToolsHover] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toolsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [toolsOpen]);

  return (
    <Frame
      as="header"
      display="flex"
      padding="$4"
      boxShadow="$out"
      backgroundColor="$material"
      style={{ alignItems: "baseline", zIndex: 50, gap: 12 }}
    >
      <span style={{ fontWeight: "bold", fontSize: "12px" }}>
        Track Designer Pro
      </span>

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <span
          style={{
            fontSize: "12px",
            padding: "1px 8px",
            cursor: "default",
            background: toolsOpen || toolsHover ? "#000e7a" : undefined,
            color: toolsOpen || toolsHover ? "#ffffff" : undefined,
          }}
          onMouseEnter={() => {
            setToolsHover(true);
            setToolsOpen(true);
          }}
          onMouseLeave={() => {
            setToolsHover(false);
          }}
        >
          Tools
        </span>

        {toolsOpen && (
          <List
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              minWidth: 160,
              marginTop: 2,
            }}
            boxShadow="$out"
            backgroundColor="$material"
          >
            <List.Item
              style={{ cursor: "default", fontSize: "12px", padding: "4px 8px" }}
              onClick={() => {
                setToolsOpen(false);
                onToggleExplorer();
              }}
>
              Available parts
            </List.Item>
          </List>
        )}
      </div>
    </Frame>
  );
}
