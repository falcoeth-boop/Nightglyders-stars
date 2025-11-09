import { useEffect } from "react";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { apechain } from "@/lib/chains";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;

// Build a Wagmi config using RainbowKit’s helper (v2)
const config = getDefaultConfig({
  appName: "Night Gliders",
  projectId,
  chains: [apechain],
  transports: {
    [apechain.id]: http(apechain.rpcUrls.default.http[0]),
  },
  ssr: true,
});

export default function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!projectId) console.warn("Missing NEXT_PUBLIC_WC_PROJECT_ID");
  }, []);

  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider theme={darkTheme({ accentColor: "#7c3aed", borderRadius: "large" })}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
