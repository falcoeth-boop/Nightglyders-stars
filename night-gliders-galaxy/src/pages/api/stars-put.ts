import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { auraRateByCount, accrueAura } from "@/lib/aura";
import { seededPos } from "@/lib/rng";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
};
const app = getApps().length ? getApps()[0] : initializeApp(config);
const db = getFirestore(app);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { address, unlistedCount, tokens } = req.body as {
      address: string; unlistedCount: number; tokens: { tokenId: string }[];
    };
    if (!address) return res.status(400).json({});

    const ref = doc(db, "gliders", address.toLowerCase());
    const snap = await getDoc(ref);
    const prev = snap.exists() ? snap.data() : { auraTotal: 0, lastUpdate: Date.now() };

    const rate = auraRateByCount(unlistedCount);
    const { total, now } = accrueAura(prev.auraTotal || 0, prev.lastUpdate || 0, rate);

    const starPositions = (tokens?.length ? tokens : [{ tokenId: "self" }]).map((t:any, i:number) => {
      const p = seededPos(`${address}:${t.tokenId ?? i}`);
      return { id: `${address}:${t.tokenId ?? i}`, x: p.x, y: p.y, z: p.z };
    });

    await setDoc(ref, {
      address: address.toLowerCase(),
      unlistedCount,
      auraRate: rate,
      auraTotal: total,
      lastUpdate: now,
      stars: starPositions
    }, { merge: true });

    res.status(200).json({ auraTotal: total, auraRate: rate, stars: starPositions });
  } catch (e:any) {
    console.error(e);
    res.status(200).json({ auraTotal: 0, auraRate: 0, stars: [] });
  }
}