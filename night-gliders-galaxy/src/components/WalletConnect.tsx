import { useEffect } from "react";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { getDefaultWallets, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { apechain } from "@/lib/chains";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID!;
const { chains, publicClient } = configureChains([apechain], [http(apechain.rpcUrls.default.http[0])]);
const { connectors } = getDefaultWallets({ appName: "Night Gliders", projectId, chains });

const wagmiConfig = createConfig({ connectors, publicClient, ssr: true });

export default function WalletConnectProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!projectId) console.warn("Missing WalletConnect project id");
  }, []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme({ accentColor: "#7c3aed", borderRadius: "large" })}>
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}