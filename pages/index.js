
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';

// --- Component Imports ---
import OnboardingCarousel from "../components/OnboardingCarousel";
import CreatePasscode from "../components/auth/CreatePasscode";
import ConfirmPasscode from "../components/auth/ConfirmPasscode";
import BackupPhrase from "../components/auth/BackupPhrase";
import VerifyPhrase from "../components/auth/VerifyPhrase";
import WalletReady from "../components/auth/WalletReady";
import UnlockScreen from "../components/auth/UnlockScreen";
import ResetConfirmation from "../components/auth/ResetConfirmation";
import LoadingIndicator from "../components/auth/LoadingIndicator";
import MainDashboard from "../components/dashboard/MainDashboard";
import ReceiveScreen from "../components/dashboard/ReceiveScreen";
import SendScreen from "../components/dashboard/SendScreen";
import ConfirmTransactionScreen from "../components/dashboard/ConfirmTransactionScreen";
import NetworkSelector from "../components/dashboard/NetworkSelector"; // New!

// --- Util & Asset Imports ---
import { storage } from "../utils/storage";
import { NETWORKS } from "../utils/networks"; // New!
import { getTokensForNetwork, ERC20_ABI } from '../utils/tokens';
import UsdtIcon from '../components/dashboard/icons/UsdtIcon';
import UsdcIcon from '../components/dashboard/icons/UsdcIcon';

// --- Constants ---
const FLOW = { /* Onboarding flow steps */ }; // Kept minimal for brevity
const ETHERSCAN_API_KEY = 'YOUR_ETHERSCAN_API_KEY'; // Replace with your actual Etherscan API key

const tokenIcons = {
  USDT: UsdtIcon,
  USDC: UsdcIcon,
};

function GatewayScreen() {
  // --- State Management ---
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [flowStep, setFlowStep] = useState(FLOW.ONBOARDING);
  const [passcode, setPasscode] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [decryptedWallet, setDecryptedWallet] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userId, setUserId] = useState(null);

  // Network State - New!
  const [currentNetwork, setCurrentNetwork] = useState(NETWORKS.sepolia);

  // Screen visibility states
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showReceiveScreen, setShowReceiveScreen] = useState(false);
  const [showSendScreen, setShowSendScreen] = useState(false);
  const [showConfirmScreen, setShowConfirmScreen] = useState(false);
  
  // Data states
  const [nativeBalance, setNativeBalance] = useState('0.00');
  const [tokenBalances, setTokenBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [dataError, setDataError] = useState(null);

  // --- Effects ---
  useEffect(() => {
    setMounted(true);
    const tg = window.Telegram?.WebApp;
    if (tg) {
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#0B0F1A');
        tg.setBackgroundColor('#0B0F1A');
    }
    const finalUserId = tg?.initDataUnsafe?.user?.id?.toString() || 'dev-mock-user-id';
    setUserId(finalUserId);
    setHasCompletedOnboarding(storage.hasCompletedOnboarding(finalUserId));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Fetches all blockchain data when wallet is unlocked OR when network changes
    if (decryptedWallet?.address) {
        const fetchAllData = async () => {
            setIsLoading(true);
            setDataError(null);
            try {
                const provider = new ethers.providers.JsonRpcProvider(currentNetwork.rpcUrl);

                // 1. Fetch Native Balance (ETH, SepoliaETH, etc.)
                const balanceWei = await provider.getBalance(decryptedWallet.address);
                setNativeBalance(parseFloat(ethers.utils.formatEther(balanceWei)).toFixed(4));

                // 2. Fetch Token Balances for the current network
                const supportedTokens = getTokensForNetwork(currentNetwork.id);
                const tokenPromises = supportedTokens.map(async (token) => {
                    const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                    const balanceRaw = await contract.balanceOf(decryptedWallet.address);
                    const decimals = await contract.decimals();
                    const balanceFormatted = ethers.utils.formatUnits(balanceRaw, decimals);
                    return { ...token, balance: parseFloat(balanceFormatted).toFixed(2) }; 
                });
                setTokenBalances(await Promise.all(tokenPromises));

                // 3. Fetch Transaction History
                const url = `${currentNetwork.etherscanApiUrl}?module=account&action=txlist&address=${decryptedWallet.address}&sort=asc&apikey=${ETHERSCAN_API_KEY}`;
                const response = await fetch(url);
                const data = await response.json();
                if (data.status === "1") {
                    setTransactions(data.result.map(tx => ({...tx, value: ethers.utils.formatEther(tx.value) })).reverse());
                } else {
                    setTransactions([]);
                }

            } catch (err) {
                console.error("Failed to fetch wallet data:", err);
                setDataError("Could not load wallet data. Check network or try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
        const interval = setInterval(fetchAllData, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }
  }, [decryptedWallet, currentNetwork]); // Re-run when network changes!

  // --- Handlers ---
  // ... (onboarding and auth handlers remain the same)
  const handleCreateWalletClick = () => setFlowStep(FLOW.CREATE_PASSCODE);
  const handlePasscodeCreated = (newPasscode) => { setPasscode(newPasscode); setFlowStep(FLOW.CONFIRM_PASSCODE); };
  const handlePasscodeConfirmed = () => { setMnemonic(ethers.Wallet.createRandom().mnemonic.phrase); setFlowStep(FLOW.SHOW_BACKUP_PHRASE); };
  const handleBackupContinue = () => setFlowStep(FLOW.VERIFY_BACKUP_PHRASE);
  const handlePhraseVerified = async () => {
    setIsLoading(true);
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    setDecryptedWallet(wallet);
    await storage.saveEncryptedWallet({ privateKey: wallet.privateKey, address: wallet.address }, passcode, userId);
    storage.setHasCompletedOnboarding(userId);
    setIsLoading(false);
    setFlowStep(FLOW.WALLET_READY);
  };
  const handleWalletReadyContinue = () => { setHasCompletedOnboarding(true); setIsUnlocked(true); };
  const handleBack = () => setFlowStep(FLOW.CREATE_PASSCODE);
  
  // Auth Handlers
  const handleUnlock = async (attemptedPasscode) => {
    setUnlockError("");
    setIsLoading(true);
    const walletData = await storage.getDecryptedWallet(attemptedPasscode, userId);
    if (walletData) {
      setDecryptedWallet(new ethers.Wallet(walletData.privateKey));
      setIsUnlocked(true);
    } else {
      setUnlockError("Incorrect passcode.");
    }
    setIsLoading(false);
  };
  const handleResetRequest = () => setShowResetConfirmation(true);
  const handleResetCancel = () => setShowResetConfirmation(false);
  const handleResetConfirm = () => { storage.clearAllData(userId); window.location.reload(); };


  const handleSendConfirm = (details) => { setTransactionDetails(details); setShowSendScreen(false); setShowConfirmScreen(true); };
  const handleTransactionComplete = () => { setShowConfirmScreen(false); setTransactionDetails(null); };

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading && !decryptedWallet) return <LoadingIndicator show={true} />;
    if (isUnlocked && decryptedWallet) {
      return (
        <div className="w-full h-full flex flex-col">
            <header className="w-full max-w-md mx-auto p-4 flex justify-end">
                 <NetworkSelector 
                    currentNetwork={currentNetwork}
                    networks={Object.values(NETWORKS)}
                    onSelectNetwork={setCurrentNetwork}
                 />
            </header>
            <MainDashboard 
                wallet={decryptedWallet}
                balance={nativeBalance}
                tokenBalances={tokenBalances}
                transactions={transactions}
                isLoading={isLoading}
                error={dataError}
                onSend={() => setShowSendScreen(true)}
                onReceive={() => setShowReceiveScreen(true)}
                network={currentNetwork} // Pass network down
             />
        </div>
      );
    }
    if (hasCompletedOnboarding) {
      return <UnlockScreen onUnlock={handleUnlock} error={unlockError} clearError={() => setUnlockError('')} onResetRequest={handleResetRequest} />;
    }
    // Onboarding flow components...
    switch (flowStep) {
        case FLOW.CREATE_PASSCODE: return <CreatePasscode onPasscodeCreated={handlePasscodeCreated} />;
        case FLOW.CONFIRM_PASSCODE: return <ConfirmPasscode originalPasscode={passcode} onPasscodeConfirmed={handlePasscodeConfirmed} onBack={handleBack} />;
        case FLOW.SHOW_BACKUP_PHRASE: return <BackupPhrase phrase={mnemonic} onContinue={handleBackupContinue} />;
        case FLOW.VERIFY_BACKUP_PHRASE: return <VerifyPhrase phrase={mnemonic} onVerified={handlePhraseVerified} />;
        case FLOW.WALLET_READY: return <WalletReady onContinue={handleWalletReadyContinue} />;
        default: return <OnboardingCarousel onCreateWallet={handleCreateWalletClick} />;
    }
  };

  return (
    <div className="cosmic-background min-h-screen flex flex-col justify-center items-center font-sans text-center overflow-hidden">
      <main className="w-full h-full flex flex-col justify-center">
         <AnimatePresence mode="wait">
            {renderContent()}
         </AnimatePresence>
      </main>
      <AnimatePresence>
        {showReceiveScreen && decryptedWallet && <ReceiveScreen wallet={decryptedWallet} onClose={() => setShowReceiveScreen(false)} />}
        {showSendScreen && decryptedWallet && (
            <SendScreen 
                onClose={() => setShowSendScreen(false)} 
                onConfirm={handleSendConfirm}
                ethBalance={nativeBalance} // Use nativeBalance
                tokenBalances={tokenBalances}
                icons={tokenIcons}
                network={currentNetwork} // Pass network down
            />
        )}
        {showConfirmScreen && decryptedWallet && transactionDetails && (
            <ConfirmTransactionScreen 
                wallet={decryptedWallet} 
                transaction={transactionDetails}
                onCancel={() => setShowConfirmScreen(false)}
                onComplete={handleTransactionComplete}
                network={currentNetwork} // Pass network down
            />
        )}
      </AnimatePresence>
      <ResetConfirmation show={showResetConfirmation} onConfirm={handleResetConfirm} onCancel={handleResetCancel} />
      <LoadingIndicator show={isLoading && !!decryptedWallet} />
    </div>
  );
}

export default dynamic(() => Promise.resolve(GatewayScreen), { ssr: false });
