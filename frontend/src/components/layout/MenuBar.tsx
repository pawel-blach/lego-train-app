import { useState, useRef, useEffect } from "react";
import { Win95Button } from "../win95/Win95Button";

type MenuItem = { label: string; shortcut?: string } | "separator";

const menus: Record<string, MenuItem[]> = {
  File: [
    { label: "New Layout", shortcut: "Ctrl+N" },
    { label: "Open...", shortcut: "Ctrl+O" },
    { label: "Save", shortcut: "Ctrl+S" },
    { label: "Save As..." },
    "separator",
    { label: "Export as BMP..." },
    { label: "Print...", shortcut: "Ctrl+P" },
    "separator",
    { label: "Exit" },
  ],
  Edit: [
    { label: "Undo", shortcut: "Ctrl+Z" },
    { label: "Redo", shortcut: "Ctrl+Y" },
    "separator",
    { label: "Cut", shortcut: "Ctrl+X" },
    { label: "Copy", shortcut: "Ctrl+C" },
    { label: "Paste", shortcut: "Ctrl+V" },
    { label: "Delete", shortcut: "Del" },
    "separator",
    { label: "Select All", shortcut: "Ctrl+A" },
  ],
  View: [
    { label: "Zoom In", shortcut: "+" },
    { label: "Zoom Out", shortcut: "-" },
    { label: "Fit to Window" },
    "separator",
    { label: "Show Grid" },
    { label: "Show Connections" },
    { label: "Show Piece Labels" },
    "separator",
    { label: "Toolbar" },
    { label: "Status Bar" },
  ],
  Help: [
    { label: "Contents", shortcut: "F1" },
    { label: "Search for Help on..." },
    "separator",
    { label: "About Track Designer Pro" },
  ],
};

export function MenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    if (openMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [openMenu]);

  function handleMenuButton(name: string) {
    setOpenMenu(openMenu === name ? null : name);
  }

  function handleMenuHover(name: string) {
    if (openMenu) setOpenMenu(name);
  }

  return (
    <header className="relative flex items-center justify-between bg-retro-gray p-1 border-b border-white z-50">
      <div className="flex items-center">
        <div className="flex items-center gap-1 px-2 border-r border-gray-500 mr-2">
          <span className="material-symbols-outlined text-sm">train</span>
          <span className="font-bold">Track Designer Pro</span>
        </div>
        <nav className="flex relative" ref={barRef}>
          {Object.keys(menus).map((name) => (
            <div key={name} className="relative">
              <button
                className={`px-3 ${openMenu === name ? "bg-[#000080] text-white" : "hover:bg-[#000080] hover:text-white"}`}
                onMouseDown={() => handleMenuButton(name)}
                onMouseEnter={() => handleMenuHover(name)}
              >
                {name}
              </button>
              {openMenu === name && (
                <div className="absolute top-full mt-1.5 left-0 bg-retro-gray win95-border py-0.5 min-w-[200px] z-[100]">
                  {menus[name].map((item, i) =>
                    item === "separator" ? (
                      <div key={i} className="mx-1 my-0.5 border-t border-[#808080] border-b border-b-white" />
                    ) : (
                      <button
                        key={i}
                        disabled
                        className="w-full text-left px-5 py-0.5 flex justify-between gap-6 text-[#808080]"
                        onClick={() => setOpenMenu(null)}
                      >
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-inherit">{item.shortcut}</span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex gap-1 pr-1">
        <Win95Button size="sm" className="w-5 h-5 flex items-center justify-center text-xs font-bold">
          0
        </Win95Button>
        <Win95Button size="sm" className="w-5 h-5 flex items-center justify-center text-xs font-bold">
          X
        </Win95Button>
      </div>
    </header>
  );
}
