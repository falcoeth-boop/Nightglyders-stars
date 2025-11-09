# Night Gliders — Galaxy

3D galaxy + wallet connect. Shows your **unlisted NightGlyders** as moving stars and accrues **Night Aura** daily by tier.

## Quick Start
1. Copy `.env.local.example` to `.env.local` and fill values.
2. `pnpm i` (or `npm i` / `yarn`)
3. `pnpm dev` then open `http://localhost:3000`
4. Push to GitHub → Deploy on Vercel.

## Notes
- Read‑only wallet connect (no tx signing).
- Uses Firebase Firestore to store aura & stars.
- API route `/api/holdings` queries providers (Magic Eden primary) to detect listing status.
