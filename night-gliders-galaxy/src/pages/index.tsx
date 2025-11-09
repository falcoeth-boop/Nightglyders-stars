import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import Galaxy from "@/components/Galaxy";
import { HUD } from "@/components/HUD";
import { auraRateByCount } from "@/lib/aura";
import { seededPos } from "@/lib/rng";
import type { HoldingsResponse } from "@/types";

type StarBasic = { id: string; x: number; y: number; z: number };

export default function Home() {
  const { address, isConnected } = useAccount();

  // --- MOCK MODE: enable by visiting ?mock=5 (or any number)
  const [mockCount, setMockCount] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const n = parseInt(new URLSearchParams(window.location.search).get("mock") || "0", 10);
    setMockCount(Number.isFinite(n) && n > 0 ? n : 0);
  }, []);
  const mockAddress = "0xMOCK000000000000000000000000000000000000";

  const [unlistedCount, setUnlistedCount] = useState(0);
  const [auraRate, setAuraRate] = useState(0);
  const [auraTotal, setAuraTotal] = useState(0);
  const [stars, setStars] = useState<StarBasic[]>([]);
  const [allStars, setAllStars] = useState<StarBasic[]>([]);

  useEffect(() => {
    const run = async () => {
      // If not connected and mock is enabled -> synthesize data
      if ((!isConnected || !address) && mockCount > 0) {
        const count = mockCount;
        setUnlistedCount(count);
        setAuraRate(auraRateByCount(count));
        setAuraTotal(0);

        const myStars: StarBasic[] = Array.from({ length: count }).map((_, i) => {
          const pos = seededPos(`${mockAddress}:${i}`);
          return { id: `${mockAddress}:${i}`, ...pos };
        });
        setStars(myStars);

        // still pull everyone to see the shared galaxy (safe if empty)
        const everyone = await fetch(`/api/stars-get`).then((r) => r.json()).catch(() => ({ stars: [] }));
        setAllStars(everyone.stars || []);
        return;
      }

      // Real flow (wallet connected)
      if (!isConnected || !address) return;

      try {
        const resp = await fetch(`/api/holdings?address=${address}`);
        const data = (await resp.json()) as HoldingsResponse;

        const count = data.unlistedCount ?? 0;
        setUnlistedCount(count);
        setAuraRate(auraRateByCount(count));

        // accrue + store star positions server-side
        const auraResp = await fetch(`/api/stars-put`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, unlistedCount: count, tokens: data.tokens }),
        }).then((r) => r.json()).catch(() => ({}));
        setAuraTotal(auraResp.auraTotal ?? 0);

        const myStars: StarBasic[] = (data.tokens.length ? data.tokens : [{ tokenId: "self" }]).map((t, i) => {
          const pos = seededPos(`${address}:${t.tokenId ?? i}`);
          return { id: `${address}:${t.tokenId ?? i}`, ...pos };
        });
        setStars(myStars);

        const everyone = await fetch(`/api/stars-get`).then((r) => r.json()).catch(() => ({ stars: [] }));
        setAllStars(everyone.stars || []);
      } catch {
        // graceful fallback if API fails
        setUnlistedCount(0);
        setAuraRate(0);
        setAuraTotal(0);
        setStars([]);
      }
    };
    run();
  }, [isConnected, address, mockCount]);

  const merged = useMemo(() => {
    const map = new Map<string, StarBasic>();
    [...allStars, ...stars].forEach((s) => map.set(s.id, s));
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
