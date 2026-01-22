
import React, { useEffect, useState, useCallback } from "react";
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
import NetworkSelector from "../components/dashboard/NetworkSelector";

// --- Util & Asset Imports ---
import { storage } from "../utils/storage";
import { NETWORKS } from "../utils/networks";
import { getTokensForNetwork, ERC20_ABI } from '../utils/tokens';
import UsdtIcon from '../components/dashboard/icons/UsdtIcon';
import UsdcIcon from '../components/dashboard/icons/UsdcIcon';

// --- Constants ---
const FLOW = {
    ONBOARDING: 'onboarding',
    CREATE_PASSCODE: 'create_passcode',
    CONFIRM_PASSCODE: 'confirm_passcode',
    SHOW_BACKUP_PHRASE: 'show_backup_phrase',
    VERIFY_BACKUP_PHRASE: 'verify_backup_phrase',
    WALLET_READY: 'wallet_ready'
  };
const ETHERSCAN_API_KEY = 'YOUR_ETHERSCAN_API_KEY';

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

  // Network State
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

  // --- Data Fetching --- 
  const fetchAllData = useCallback(async () => {
        if (!decryptedWallet?.address) return;

        setIsLoading(true);
        setDataError(null);
        try {
            const provider = new ethers.JsonRpcProvider(currentNetwork.rpcUrl);

            // 1. Fetch Native Balance
            const balanceWei = await provider.getBalance(decryptedWallet.address);
            setNativeBalance(parseFloat(ethers.formatEther(balanceWei)).toFixed(4));

            // 2. Fetch Token Balances
            const supportedTokens = getTokensForNetwork(currentNetwork.id);
            const tokenPromises = supportedTokens.map(async (token) => {
                const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                const balanceRaw = await contract.balanceOf(decryptedWallet.address);
                const decimals = await contract.decimals();
                const balanceFormatted = ethers.formatUnits(balanceRaw, decimals);
                return { ...token, balance: parseFloat(balanceFormatted).toFixed(2) }; 
            });
            setTokenBalances(await Promise.all(tokenPromises));

            // 3. Fetch Transaction History
            const url = `${currentNetwork.etherscanApiUrl}?module=account&action=txlist&address=${decryptedWallet.address}&sort=desc&apikey=${ETHERSCAN_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "1") {
                // Filter out old pending transactions from the new list
                const newTxs = data.result.map(tx => ({...tx, value: ethers.formatEther(tx.value) }));
                setTransactions(currentTxs => {
                    const nonPending = currentTxs.filter(tx => tx.status !== 'pending');
                    // Simple merge: replace old with new, but you could get more sophisticated
                    return [...newTxs]; 
                });
            } else if (data.message === "No transactions found") {
                 setTransactions(currentTxs => currentTxs.filter(tx => tx.status === 'pending'));
            } else {
                // Keep pending transactions if the API fails
                console.warn("Could not fetch new txs:", data.result);
            }

        } catch (err) {
            console.error("Failed to fetch wallet data:", err);
            setDataError("Could not load wallet data. Check network or try again.");
        } finally {
            setIsLoading(false);
        }
    }, [decryptedWallet, currentNetwork]);

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
    if (decryptedWallet?.address) {
        fetchAllData(); // Initial fetch
        const interval = setInterval(fetchAllData, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }
  }, [decryptedWallet, fetchAllData]);

  // --- Handlers ---
  const handleCreateWalletClick = () => setFlowStep(FLOW.CREATE_PASSCODE);
  const handleAlreadyHaveWalletClick = () => setHasCompletedOnboarding(true);
  const handlePasscodeCreated = (newPasscode) => { setPasscode(newPasscode); setFlowStep(FLOW.CONFIRM_PASSCODE); };
  const handlePasscodeConfirmed = () => { setMnemonic(ethers.Wallet.createRandom().mnemonic.phrase); setFlowStep(FLOW.SHOW_BACKUP_PHRASE); };
  const handleBackupContinue = () => setFlowStep(FLOW.VERIFY_BACKUP_PHRASE);
  const handlePhraseVerified = async () => {
    setIsLoading(true);
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
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
    if (walletData && walletData.privateKey) {
      try {
        setDecryptedWallet(new ethers.Wallet(walletData.privateKey));
        setIsUnlocked(true);
      } catch (error) {
        setUnlockError("Failed to reconstruct wallet. Data may be corrupt.");
      }
    } else {
      setUnlockError("Incorrect passcode or corrupt wallet data.");
    }
    setIsLoading(false);
  };
  const handleResetRequest = () => setShowResetConfirmation(true);
  const handleResetCancel = () => setShowResetConfirmation(false);
  const handleResetConfirm = () => { storage.clearAllData(userId); window.location.reload(); };


  const handleSendConfirm = (details) => { setTransactionDetails(details); setShowSendScreen(false); setShowConfirmScreen(true); };

  // --- THIS IS THE NEW CORE LOGIC ---
  const handleTransactionSubmitted = (txResponse) => {
        // This function is called from ConfirmTransactionScreen
        setShowConfirmScreen(false); // Close the modal immediately
        setTransactionDetails(null);

        if (!txResponse) return; // User cancelled

        // 1. Create a placeholder pending transaction
        const pendingTx = {
            hash: txResponse.hash,
            from: txResponse.from,
            to: txResponse.to,
            value: txResponse.value.toString(), // Store as string
            timeStamp: Math.floor(Date.now() / 1000),
            status: 'pending',
        };
        setTransactions(prevTxs => [pendingTx, ...prevTxs]);

        // 2. Start monitoring in the background
        monitorTransaction(txResponse);
    };

    const monitorTransaction = async (txResponse) => {
        try {
            const receipt = await txResponse.wait(); // Wait for 1 confirmation
            // 3. On success, fetch all data again to get the final state
            await fetchAllData();
        } catch (error) {
            console.error("Transaction monitoring failed:", error);
            // 4. On failure, mark the specific transaction as 'failed'
            setTransactions(prevTxs => prevTxs.map(tx => 
                tx.hash === txResponse.hash ? { ...tx, status: 'failed' } : tx
            ));
        }
    };

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
                network={currentNetwork}
                onRefreshData={fetchAllData} // Pass the refresh function
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
        default: return <OnboardingCarousel onCreateWallet={handleCreateWalletClick} onAlreadyHaveWallet={handleAlreadyHaveWalletClick} />;
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
                ethBalance={nativeBalance}
                tokenBalances={tokenBalances}
                icons={tokenIcons}
                network={currentNetwork}
            />
        )}
        {showConfirmScreen && decryptedWallet && transactionDetails && (
            <ConfirmTransactionScreen 
                wallet={decryptedWallet} 
                transaction={transactionDetails}
                onCancel={() => handleTransactionSubmitted(null)} // Pass null on cancel
                onComplete={handleTransactionSubmitted} // Use the new handler
                network={currentNetwork}
            />
        )}
      </AnimatePresence>
      <ResetConfirmation show={showResetConfirmation} onConfirm={handleResetConfirm} onCancel={handleResetCancel} />
      <LoadingIndicator show={isLoading && !!decryptedWallet} />
    </div>
  );
}

export default dynamic(() => Promise.resolve(GatewayScreen), { ssr: false });
