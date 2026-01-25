
import '../styles/globals.css';
import '../styles/fonts.css';
import { NetworkProvider } from '../context/NetworkContext';
import { WalletConnectProvider } from '../context/WalletConnectContext';
import { DappConnectionProvider } from '../context/DappConnectionContext';
import { WalletProvider } from '../context/WalletContext';
import { ModalProvider } from '../context/ModalContext';
import ModalRenderer from '../components/modals/ModalRenderer';

export default function App({ Component, pageProps }) {
  return (
    <NetworkProvider>
      <WalletProvider>
        <WalletConnectProvider>
          <DappConnectionProvider>
            <ModalProvider>
              <Component {...pageProps} />
              <ModalRenderer />
            </ModalProvider>
          </DappConnectionProvider>
        </WalletConnectProvider>
      </WalletProvider>
    </NetworkProvider>
  );
}
