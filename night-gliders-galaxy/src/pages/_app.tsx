import "@/styles.css";
import type { AppProps } from "next/app";
import WalletConnectProvider from "@/components/WalletConnect";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WalletConnectProvider>
      <Component {...pageProps} />
    </WalletConnectProvider>
  );
}