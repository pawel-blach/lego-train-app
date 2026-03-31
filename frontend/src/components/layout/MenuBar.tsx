import { Win95Button } from "../win95/Win95Button";

export function MenuBar() {
  return (
    <header className="flex items-center justify-between bg-retro-gray p-1 border-b border-white z-50">
      <div className="flex items-center">
        <div className="flex items-center gap-1 px-2 border-r border-gray-500 mr-2">
          <span className="material-symbols-outlined text-sm">train</span>
          <span className="font-bold">Track Designer Pro</span>
        </div>
        <nav className="flex">
          <button className="px-3 hover:bg-[#000080] hover:text-white">File</button>
          <button className="px-3 hover:bg-[#000080] hover:text-white">Edit</button>
          <button className="px-3 hover:bg-[#000080] hover:text-white">View</button>
          <button className="px-3 hover:bg-[#000080] hover:text-white">Help</button>
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
