import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const q = z.object({ address: z.string().min(3) });

const NG_CONTRACT = (process.env.NEXT_PUBLIC_NG_CONTRACT || "").toLowerCase();
const NG_SLUG = process.env.NEXT_PUBLIC_NG_SLUG || "nightglyders";

type Tok = { contract?: string; tokenId: string; listed: boolean };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  try {
    const { address } = q.parse(req.query);
    const tokens = await getUnlistedTokens(address);
    const unlisted = tokens.filter(t => !t.listed);
    res.status(200).json({ unlistedCount: unlisted.length, tokens: unlisted });
  } catch (e:any) {
    console.error(e);
    res.status(200).json({ unlistedCount: 0, tokens: [] });
  }
}

async function getUnlistedTokens(address: string): Promise<Tok[]> {
  const providers = [
    process.env.ME_PRIMARY === "true" ? meProvider : null,
    process.env.DUNE_PRIMARY === "true" ? duneProvider : null,
    process.env.MORALIS_PRIMARY === "true" ? moralisProvider : null
  ].filter(Boolean) as ((a: string) => Promise<Tok[]>)[];

  for (const p of providers) {
    try { const out = await p(address); return out; } catch {}
  }
  return [];
}

/** Magic Eden EVM provider (primary) */
async function meProvider(address: string): Promise<Tok[]> {
  const key = process.env.ME_API_KEY!;
  const baseV4 = "https://api-mainnet.magiceden.dev/v3/rtp/apechain";
  const url1 = `${baseV4}/users/${address}/collections/${NG_SLUG}/tokens/v4`;
  const url2 = `${baseV4}/users/${address}/tokens/v4`;
  let items: any[] = [];

  const tryFetch = async (u: string) => {
    const r = await fetch(u, { headers: { "accept": "application/json", "x-api-key": key } });
    if (r.ok) return r.json();
    throw new Error(`ME fetch failed ${r.status}`);
  };

  try {
    const data = await tryFetch(url1);
    items = data?.tokens || data?.data || [];
  } catch {
    const data = await tryFetch(url2);
    items = (data?.tokens || []).filter((t:any) =>
      NG_CONTRACT ? (t?.token?.contract?.toLowerCase() === NG_CONTRACT) :
      (t?.token?.collection?.toLowerCase().includes(NG_SLUG))
    );
  }

  const tokens: Tok[] = items.map((it:any) => {
    const contract = (it.token?.contract || it.contract)?.toLowerCase();
    const tokenId = String(it.token?.tokenId ?? it.tokenId);
    const listed = Boolean(it?.market?.floorAsk || it?.token?.market?.floorAsk || it?.ask || it?.listing);
    return { contract, tokenId, listed };
  });

  return tokens.filter(t => NG_CONTRACT ? t.contract === NG_CONTRACT : true);
}

/** Dune Sim Collectibles (optional) */
async function duneProvider(address: string): Promise<Tok[]> {
  const key = process.env.DUNE_API_KEY!;
  const headers = { "x-dune-api-key": key };
  const r = await fetch(`https://api.dune.com/api/sim/collectibles?chain=apechain&owner=${address}`, { headers });
  if (!r.ok) throw new Error("Dune fail");
  const data = await r.json();
  const toks: Tok[] = (data.items || []).filter((it:any) => {
    const contract = (it.contract || "").toLowerCase();
    if (NG_CONTRACT) return contract === NG_CONTRACT;
    return (it.collection_slug || "").toLowerCase().includes(NG_SLUG);
  }).map((it:any) => ({
    contract: (it.contract || "").toLowerCase(),
    tokenId: String(it.token_id),
    listed: Boolean(it.listing_active || it.market?.is_listed)
  }));
  return toks;
}

/** Moralis fallback (optional) */
async function moralisProvider(address: string): Promise<Tok[]> {
  const key = process.env.MORALIS_API_KEY!;
  const r = await fetch(`https://deep-index.moralis.io/api/v2.2/${address}/nft?chain=0x8163&format=decimal`, {
    headers: { "X-API-Key": key }
  });
  if (!r.ok) throw new Error("Moralis fail");
  const data = await r.json();
  const filtered = (data.result || []).filter((it:any) => {
    const c = (it.token_address || "").toLowerCase();
    return NG_CONTRACT ? c === NG_CONTRACT : (it.name || "").toLowerCase().includes("nightglyders");
  });
  const withListStatus: Tok[] = await Promise.all(filtered.map(async (it:any) => {
    const tokenId = String(it.token_id);
    let listed = false;
    try {
      const me = await fetch(`https://api-mainnet.magiceden.dev/v2/tokens/${it.token_address}:${tokenId}/listings`, {
        headers: { "x-api-key": process.env.ME_API_KEY || "" }
      });
      listed = me.ok && (await me.json())?.length > 0;
    } catch {}
    return { contract: it.token_address.toLowerCase(), tokenId, listed };
  }));
  return withListStatus;
}