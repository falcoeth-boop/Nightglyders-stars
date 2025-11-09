import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import Galaxy from "@/components/Galaxy";
import { HUD } from "@/components/HUD";
import { auraRateByCount } from "@/lib/aura";
import { seededPos } from "@/lib/rng";
import type { HoldingsResponse } from "@/types";

type StarBasic = { id: string; x:number;y:number;z:number };

export default function Home() {
  const { address, isConnected } = useAccount();
  const [unlistedCount, setUnlistedCount] = useState(0);
  const [auraRate, setAuraRate] = useState(0);
  const [auraTotal, setAuraTotal] = useState(0);
  const [stars, setStars] = useState<StarBasic[]>([]);
  const [allStars, setAllStars] = useState<StarBasic[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!isConnected || !address) return;
      const resp = await fetch(`/api/holdings?address=${address}`);
      const data = (await resp.json()) as HoldingsResponse;
      const count = data.unlistedCount;
      setUnlistedCount(count);
      const rate = auraRateByCount(count);
      setAuraRate(rate);

      const auraResp = await fetch(`/api/stars-put`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, unlistedCount: count, tokens: data.tokens })
      });
      const auraData = await auraResp.json();
      setAuraTotal(auraData.auraTotal ?? 0);

      const myStars = (data.tokens.length ? data.tokens : [{ tokenId: "self" }]).map((t, i) => {
        const pos = seededPos(`${address}:${t.tokenId ?? i}`);
        return { id: `${address}:${t.tokenId ?? i}`, ...pos };
      });
      setStars(myStars);

      const everyone = await fetch(`/api/stars-get`).then(r => r.json());
      setAllStars(everyone.stars || []);
    };
    load();
  }, [isConnected, address]);

  const merged = useMemo(() => {
    const map = new Map<string, StarBasic>();
    [...allStars, ...stars].forEach(s => map.set(s.id, s));
    return Array.from(map.values());
  }, [allStars, stars]);

  return (
    <>
      <HUD auraRate={auraRate} auraTotal={auraTotal} unlistedCount={unlistedCount} />
      <Galaxy stars={merged} />
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center text-white/75 text-sm px-4">
        Night Gliders • Connect and let your stars shine
      </div>
    </>
  );
}