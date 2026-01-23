
import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from 'framer-motion';

// --- Context & Service Imports ---
import { useNetwork } from "../context/NetworkContext";
import { fetchEvmData } from "../services/evmService";
import { fetchSolanaData } from "../services/solanaService";
import { fetchBitcoinData } from "../services/bitcoinService";

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
import NetworkSelector from "../components/NetworkSelector";

// --- Util & Asset Imports ---
import { storage } from "../utils/storage";
import { deriveWalletFromMnemonic, reconstructWallet } from "../utils/wallet";
import UsdtIcon from '../components/dashboard/icons/UsdtIcon';
import UsdcIcon from '../components/dashboard/icons/UsdcIcon';
import { ethers } from "ethers";

// --- Constants ---
const FLOW = {
    ONBOARDING: 'onboarding',
    CREATE_PASSCODE: 'create_passcode',
    CONFIRM_PASSCODE: 'confirm_passcode',
    SHOW_BACKUP_PHRASE: 'show_backup_phrase',
    VERIFY_BACKUP_PHRASE: 'verify_backup_phrase',
    WALLET_READY: 'wallet_ready'
};

const tokenIcons = {
    USDT: UsdtIcon,
    USDC: UsdcIcon,
};

function GatewayScreen() {
    // --- State Management ---
    const [isLoading, setIsLoading] = useState(true);
    const [flowStep, setFlowStep] = useState(FLOW.ONBOARDING);
    const [passcode, setPasscode] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [decryptedWallet, setDecryptedWallet] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [unlockError, setUnlockError] = useState("");
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [userId, setUserId] = useState(null);

    // Network & Data State
    const { activeNetwork } = useNetwork();
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showReceiveScreen, setShowReceiveScreen] = useState(false);
    const [showSendScreen, setShowSendScreen] = useState(false);
    const [showConfirmScreen, setShowConfirmScreen] = useState(false);
    const [nativeBalance, setNativeBalance] = useState('0.00');
    const [tokenBalances, setTokenBalances] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [dataError, setDataError] = useState(null);

    // --- Data Fetching --- 
    const fetchAllData = useCallback(async () => {
        if (!decryptedWallet) return;

        setIsLoading(true);
        setDataError(null);

        try {
            let data;
            if (activeNetwork.chainType === 'evm') {
                data = await fetchEvmData(decryptedWallet, activeNetwork);
            } else if (activeNetwork.chainType === 'solana') {
                data = await fetchSolanaData(decryptedWallet, activeNetwork);
            } else if (activeNetwork.chainType === 'bitcoin') {
                data = await fetchBitcoinData(decryptedWallet, activeNetwork);
            } else {
                throw new Error(`Unsupported chainType: ${activeNetwork.chainType}`);
            }

            setNativeBalance(data.nativeBalance);
            setTokenBalances(data.tokenBalances);
            setTransactions(data.transactions);

        } catch (err) {
            console.error("Failed to fetch wallet data:", err);
            setDataError("Could not load wallet data. Check network or try again.");
        } finally {
            setIsLoading(false);
        }
    }, [decryptedWallet, activeNetwork]);

    useEffect(() => {
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
        if (decryptedWallet) {
            fetchAllData();
            const interval = setInterval(fetchAllData, 30000);
            return () => clearInterval(interval);
        }
    }, [decryptedWallet, fetchAllData]);

    // --- Wallet & Auth Handlers ---
    const handlePasscodeConfirmed = () => {
        setMnemonic(ethers.Wallet.createRandom().mnemonic.phrase);
        setFlowStep(FLOW.SHOW_BACKUP_PHRASE);
    };

    const handlePhraseVerified = async () => {
        setIsLoading(true);
        const fullWallet = await deriveWalletFromMnemonic(mnemonic);
        setDecryptedWallet(fullWallet);
        await storage.saveEncryptedWallet(fullWallet, passcode, userId);
        storage.setHasCompletedOnboarding(userId);
        setIsLoading(false);
        setFlowStep(FLOW.WALLET_READY);
    };

    const handleUnlock = async (attemptedPasscode) => {
        setUnlockError("");
        setIsLoading(true);
        const walletData = await storage.getDecryptedWallet(attemptedPasscode, userId);
        if (walletData) {
            const fullWallet = reconstructWallet(walletData);
            setDecryptedWallet(fullWallet);
            setIsUnlocked(true);
        } else {
            setUnlockError("Incorrect passcode or corrupt wallet data.");
        }
        setIsLoading(false);
    };
    
    const getDisplayAddress = () => {
        if (!decryptedWallet) return '';
        switch (activeNetwork.chainType) {
            case 'evm':
                return decryptedWallet.evm.address;
            case 'solana':
                return decryptedWallet.solana.address;
            case 'bitcoin':
                return decryptedWallet.bitcoin.address;
            default:
                return '';
        }
    };

    // --- UI Handlers ---
    const handleCreateWalletClick = () => setFlowStep(FLOW.CREATE_PASSCODE);
    const handleAlreadyHaveWalletClick = () => setHasCompletedOnboarding(true);
    const handlePasscodeCreated = (newPasscode) => { setPasscode(newPasscode); setFlowStep(FLOW.CONFIRM_PASSCODE); };
    const handleBackupContinue = () => setFlowStep(FLOW.VERIFY_BACKUP_PHRASE);
    const handleWalletReadyContinue = () => { setHasCompletedOnboarding(true); setIsUnlocked(true); };
    const handleBack = () => setFlowStep(FLOW.CREATE_PASSCODE);
    const handleResetRequest = () => setShowResetConfirmation(true);
    const handleResetCancel = () => setShowResetConfirmation(false);
    const handleResetConfirm = () => { storage.clearAllData(userId); window.location.reload(); };
    const handleSendConfirm = (details) => { setTransactionDetails(details); setShowSendScreen(false); setShowConfirmScreen(true); };

    const handleTransactionSubmitted = (txResponse) => {
        setShowConfirmScreen(false);
        setTransactionDetails(null);
        if (!txResponse) return;

        let value = txResponse.value.toString(); // Already a string for bitcoin
        if (activeNetwork.chainType === 'evm' && txResponse.value) {
            value = ethers.formatEther(txResponse.value);
        }

        const pendingTx = {
            hash: txResponse.hash,
            from: txResponse.from,
            to: txResponse.to,
            value: value,
            timeStamp: Math.floor(Date.now() / 1000),
            status: 'pending',
        };
        setTransactions(prevTxs => [pendingTx, ...prevTxs]);
        monitorTransaction(txResponse);
    };

    const monitorTransaction = async (txResponse) => {
        try {
            if (typeof txResponse.wait === 'function') {
                await txResponse.wait();
            } else {
                await new Promise(resolve => setTimeout(resolve, 20000)); // Wait 20 seconds for non-EVM chains
            }
            await fetchAllData();
        } catch (error) {
            console.error("Transaction monitoring failed:", error);
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
                        <NetworkSelector />
                    </header>
                    <MainDashboard 
                        wallet={{ address: getDisplayAddress() }}
                        balance={nativeBalance}
                        tokenBalances={tokenBalances}
                        transactions={transactions}
                        isLoading={isLoading}
                        error={dataError}
                        onSend={() => setShowSendScreen(true)}
                        onReceive={() => setShowReceiveScreen(true)}
                        network={activeNetwork}
                        onRefreshData={fetchAllData}
                    />
                </div>
            );
        }

        if (hasCompletedOnboarding) {
            return <UnlockScreen onUnlock={handleUnlock} error={unlockError} clearError={() => setUnlockError('')} onResetRequest={handleResetRequest} />;
        }

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
                {showReceiveScreen && decryptedWallet && 
                    <ReceiveScreen 
                        wallet={{ address: getDisplayAddress() }}
                        onClose={() => setShowReceiveScreen(false)} 
                    />}
                {showSendScreen && decryptedWallet && (
                    <SendScreen 
                        onClose={() => setShowSendScreen(false)} 
                        onConfirm={handleSendConfirm}
                        ethBalance={nativeBalance}
                        tokenBalances={tokenBalances}
                        icons={tokenIcons}
                        network={activeNetwork}
                    />
                )}
                {showConfirmScreen && decryptedWallet && transactionDetails && (activeNetwork.chainType === 'evm' || activeNetwork.chainType === 'bitcoin') && (
                    <ConfirmTransactionScreen 
                        wallet={decryptedWallet}
                        transaction={transactionDetails}
                        onCancel={() => handleTransactionSubmitted(null)}
                        onComplete={handleTransactionSubmitted}
                        network={activeNetwork}
                    />
                )}
            </AnimatePresence>
            <ResetConfirmation show={showResetConfirmation} onConfirm={handleResetConfirm} onCancel={handleResetCancel} />
            <LoadingIndicator show={isLoading && !!decryptedWallet} />
        </div>
    );
}

export default dynamic(() => Promise.resolve(GatewayScreen), { ssr: false });
