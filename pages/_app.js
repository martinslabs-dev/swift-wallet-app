import "../styles/globals.css";
import "../styles/fonts.css";
import { NetworkProvider } from "../context/NetworkContext";

export default function App({ Component, pageProps }) {
  return (
    <NetworkProvider>
      <Component {...pageProps} />
    </NetworkProvider>
  );
}
