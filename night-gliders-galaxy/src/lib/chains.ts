import { defineChain } from "viem";

export const apechain = defineChain({
  id: 33139,
  name: "ApeChain",
  nativeCurrency: { name: "ApeCoin", symbol: "APE", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_APECHAIN_RPC || "https://apechain.calderachain.xyz/http"] }
  },
  blockExplorers: {
    default: { name: "Caldera Explorer", url: "https://apechain.calderaexplorer.xyz" }
  }
});