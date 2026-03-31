export function Taskbar() {
  const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-retro-gray border-t-2 border-white p-0.5 flex items-center gap-1 h-8">
      <button className="win95-button px-2 py-0.5 flex items-center gap-1 font-bold italic">
        <span className="bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
          L
        </span>
        Start
      </button>
      <div className="w-px h-full bg-gray-500 mx-1" />
      <div className="win95-border-inset px-2 py-0.5 flex items-center gap-2 text-[11px] bg-retro-gray">
        <span className="material-symbols-outlined text-xs">edit_square</span>
        <span>Track Editor v3.0</span>
      </div>
      <div className="flex-1" />
      <div className="win95-border-inset px-2 py-0.5 flex items-center gap-2 text-[11px]">
        <span className="material-symbols-outlined text-xs">volume_up</span>
        <span>{time}</span>
      </div>
    </div>
  );
}
