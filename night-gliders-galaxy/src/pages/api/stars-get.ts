import type { NextApiRequest, NextApiResponse } from "next";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
  const snaps = await getDocs(collection(db, "gliders"));
  const stars = snaps.docs.flatMap(d => (d.data().stars || []));
  res.status(200).json({ stars });
}