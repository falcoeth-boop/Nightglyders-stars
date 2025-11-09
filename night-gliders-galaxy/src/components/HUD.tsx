import { ConnectButton } from "@rainbow-me/rainbowkit";

export function HUD({
  auraRate,
  auraTotal,
  unlistedCount,
}: { auraRate: number; auraTotal: number; unlistedCount: number }) {
  const pct = Math.min(100, auraTotal % 100);
  return (
    <div className="hud">
      <div className="hud-stat">
        Unlisted NightGlyders: <b>{unlistedCount}</b>
      </div>

      <div className="hud-bar">
        <div className="hud-bar-label">Night Aura • {auraRate}/day</div>
        <div className="hud-bar-track">
          <div className="hud-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="hud-btn">
        <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />
      </div>
    </div>
  );
}
