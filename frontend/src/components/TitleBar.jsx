export default function TitleBar() {
  const minimize = () => window.electron?.minimize();
  const maximize = () => window.electron?.maximize();
  const close = () => window.electron?.close();

  return (
    <div
      className="flex items-center justify-between h-10 px-4 bg-surface-1 border-b border-border select-none"
      style={{ WebkitAppRegion: "drag" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <span className="text-sm font-semibold text-white tracking-wide">Alignix</span>
      </div>
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: "no-drag" }}
      >
        <button onClick={minimize} className="w-8 h-8 rounded-lg hover:bg-surface-3 text-muted hover:text-white transition-colors flex items-center justify-center text-lg leading-none">
          ─
        </button>
        <button onClick={maximize} className="w-8 h-8 rounded-lg hover:bg-surface-3 text-muted hover:text-white transition-colors flex items-center justify-center text-sm">
          ▢
        </button>
        <button onClick={close} className="w-8 h-8 rounded-lg hover:bg-danger text-muted hover:text-white transition-colors flex items-center justify-center text-sm">
          ✕
        </button>
      </div>
    </div>
  );
}
