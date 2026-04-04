import { useState, useRef, useEffect } from "react";
import { Frame, List } from "@react95/core";

interface MenuBarProps {
  onToggleExplorer: () => void;
  onToggleControls: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function MenuBar({ onToggleExplorer, onToggleControls, onUndo, canUndo }: MenuBarProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editHover, setEditHover] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsHover, setToolsHover] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editOpen && !toolsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (editOpen && editRef.current && !editRef.current.contains(e.target as Node)) {
        setEditOpen(false);
      }
      if (toolsOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editOpen, toolsOpen]);

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

      <div ref={editRef} style={{ position: "relative" }}>
        <span
          style={{
            fontSize: "12px",
            padding: "1px 8px",
            cursor: "default",
            background: editOpen || editHover ? "#000e7a" : undefined,
            color: editOpen || editHover ? "#ffffff" : undefined,
          }}
          onMouseEnter={() => {
            setEditHover(true);
            setEditOpen(true);
          }}
          onMouseLeave={() => {
            setEditHover(false);
          }}
        >
          Edit
        </span>

        {editOpen && (
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
              style={{
                cursor: canUndo ? "default" : "not-allowed",
                fontSize: "12px",
                padding: "4px 8px",
                color: canUndo ? undefined : "#808080",
              }}
              onClick={() => {
                if (!canUndo) return;
                setEditOpen(false);
                onUndo();
              }}
            >
              Undo&nbsp;&nbsp;&nbsp;&nbsp;Ctrl+Z
            </List.Item>
          </List>
        )}
      </div>

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
            <List.Item
              style={{ cursor: "default", fontSize: "12px", padding: "4px 8px" }}
              onClick={() => {
                setToolsOpen(false);
                onToggleControls();
              }}
            >
              Controls
            </List.Item>
          </List>
        )}
      </div>
    </Frame>
  );
}
