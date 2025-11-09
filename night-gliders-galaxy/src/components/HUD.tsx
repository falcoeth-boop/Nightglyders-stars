import { ConnectButton } from "@rainbow-me/rainbowkit";

export function HUD({ auraRate, auraTotal, unlistedCount }: { auraRate: number; auraTotal: number; unlistedCount: number }) {
  const pct = Math.min(100, (auraTotal % 100));
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-3 flex items-center gap-4 backdrop-blur bg-black/30 text-white">
      <div className="text-sm opacity-90">Unlisted NightGlyders: <b>{unlistedCount}</b></div>
      <div className="flex-1 max-w-[420px]">
        <div className="text-xs mb-1 opacity-80">Night Aura • {auraRate}/day</div>
        <div className="h-2 w-full bg-white/10 rounded">
          <div className="h-2 bg-white/80 rounded" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
    </div>
  );
}