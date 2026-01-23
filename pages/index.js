
import React, { useEffect, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from 'framer-motion';
import { ethers } from "ethers";

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
import ImportToken from "../components/ImportToken";

// --- Util & Asset Imports ---
import { storage } from "../utils/storage";
import { deriveWalletFromMnemonic, reconstructWallet } from "../utils/wallet";
import { ERC20_ABI } from "../utils/tokens";
import UsdtIcon from '../components/dashboard/icons/UsdtIcon';
import UsdcIcon from '../components/dashboard/icons/UsdcIcon';

const FLOW = { ONBOARDING: 'onboarding', CREATE_PASSCODE: 'create_passcode', CONFIRM_PASSCODE: 'confirm_passcode', SHOW_BACKUP_PHRASE: 'show_backup_phrase', VERIFY_BACKUP_PHRASE: 'verify_backup_phrase', WALLET_READY: 'wallet_ready' };
const tokenIcons = { USDT: UsdtIcon, USDC: UsdcIcon };

function GatewayScreen() {
    // --- State ---
    const [isLoading, setIsLoading] = useState(true);
    const [flowStep, setFlowStep] = useState(FLOW.ONBOARDING);
    const [passcode, setPasscode] = useState("");
    const [sessionPasscode, setSessionPasscode] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [decryptedWallet, setDecryptedWallet] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [unlockError, setUnlockError] = useState("");
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [userId, setUserId] = useState(null);
    const { activeNetwork } = useNetwork();
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showReceiveScreen, setShowReceiveScreen] = useState(false);
    const [showSendScreen, setShowSendScreen] = useState(false);
    const [showConfirmScreen, setShowConfirmScreen] = useState(false);
    const [showImportTokenModal, setShowImportTokenModal] = useState(false);
    const [nativeBalance, setNativeBalance] = useState('0.00');
    const [tokenBalances, setTokenBalances] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [dataError, setDataError] = useState(null);
    const [ethersProvider, setEthersProvider] = useState(null);
    const [hiddenTokens, setHiddenTokens] = useState([]);
    const [sortPreference, setSortPreference] = useState('default');

    // --- Effects ---
    useEffect(() => {
        if (activeNetwork.rpcUrl) {
            try {
                setEthersProvider(new ethers.JsonRpcProvider(activeNetwork.rpcUrl, undefined, { staticNetwork: true }));
            } catch (e) { console.error("Failed to create ethers provider:", e); setEthersProvider(null); }
        }
    }, [activeNetwork]);

    const fetchAllData = useCallback(async () => {
        if (!decryptedWallet || !userId || !sessionPasscode) return;
        setIsLoading(true);
        setDataError(null);
        try {
            let data;
            if (activeNetwork.chainType === 'evm') {
                data = await fetchEvmData(decryptedWallet, activeNetwork);
                const customTokens = await storage.getCustomTokens(activeNetwork.chainId, userId, sessionPasscode);
                let customTokenBalances = [];
                if (customTokens.length > 0 && ethersProvider) {
                    const promises = customTokens.map(async t => {
                        try {
                            const contract = new ethers.Contract(t.address, ERC20_ABI, ethersProvider);
                            const bal = await contract.balanceOf(decryptedWallet.evm.address);
                            return { ...t, balance: ethers.formatUnits(bal, t.decimals) };
                        } catch { return { ...t, balance: '0' }; }
                    });
                    customTokenBalances = await Promise.all(promises);
                }
                const combined = [...(data?.tokenBalances || [])];
                customTokenBalances.forEach(ct => { if (!combined.some(t => t.address.toLowerCase() === ct.address.toLowerCase())) combined.push(ct); });
                setTokenBalances(combined);
            } else if (activeNetwork.chainType === 'solana') {
                data = await fetchSolanaData(decryptedWallet, activeNetwork);
                setTokenBalances(data.tokenBalances);
            } else if (activeNetwork.chainType === 'bitcoin') {
                data = await fetchBitcoinData(decryptedWallet, activeNetwork);
                setTokenBalances(data.tokenBalances);
            }
            if (data) { setNativeBalance(data.nativeBalance); setTransactions(data.transactions); }
        } catch (err) { console.error("Fetch Error:", err); setDataError("Could not load wallet data.");
        } finally { setIsLoading(false); }
    }, [decryptedWallet, activeNetwork, userId, sessionPasscode, ethersProvider]);

    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready(); tg.expand();
            tg.setHeaderColor('#0B0F1A'); tg.setBackgroundColor('#0B0F1A');
        }
        const finalUserId = tg?.initDataUnsafe?.user?.id?.toString() || 'dev-mock-user-id';
        setUserId(finalUserId);
        setHasCompletedOnboarding(storage.hasCompletedOnboarding(finalUserId));
        setIsLoading(false);
    }, []);
    
    useEffect(() => { if (decryptedWallet) { fetchAllData(); const i = setInterval(fetchAllData, 30000); return () => clearInterval(i); } }, [decryptedWallet, fetchAllData]);

    // --- Wallet & Auth Handlers ---
    const handlePasscodeConfirmed = () => { setMnemonic(ethers.Wallet.createRandom().mnemonic.phrase); setFlowStep(FLOW.SHOW_BACKUP_PHRASE); };
    const handlePhraseVerified = async () => {
        setIsLoading(true);
        const wallet = await deriveWalletFromMnemonic(mnemonic);
        setDecryptedWallet(wallet);
        await storage.saveEncryptedWallet(wallet, passcode, userId);
        storage.setHasCompletedOnboarding(userId);
        setSessionPasscode(passcode);
        setIsLoading(false);
        setFlowStep(FLOW.WALLET_READY);
    };

    const handleUnlock = async (attemptedPasscode) => {
        setUnlockError("");
        setIsLoading(true);
        const walletData = await storage.getDecryptedWallet(attemptedPasscode, userId);
        if (walletData) {
            setDecryptedWallet(reconstructWallet(walletData));
            setSessionPasscode(attemptedPasscode);
            const hidden = await storage.getHiddenTokens(activeNetwork.chainId, userId, attemptedPasscode);
            const sort = await storage.getSortPreference(userId, attemptedPasscode);
            setHiddenTokens(hidden);
            setSortPreference(sort);
            setIsUnlocked(true);
        } else { setUnlockError("Incorrect passcode."); }
        setIsLoading(false);
    };

    // --- New Handlers for Sorting/Hiding ---
    const handleHideToken = async (tokenAddress) => {
        if (!tokenAddress || !userId || !sessionPasscode) return;
        const lowerCaseAddress = tokenAddress.toLowerCase();
        setHiddenTokens(prev => [...prev, lowerCaseAddress]);
        await storage.hideToken(lowerCaseAddress, activeNetwork.chainId, userId, sessionPasscode);
    };

    const handleSortChange = async (newSort) => {
        if (!userId || !sessionPasscode) return;
        setSortPreference(newSort);
        await storage.setSortPreference(newSort, userId, sessionPasscode);
    };

    const handleTokenImported = () => { fetchAllData(); };

    // --- Processed Token List (Memoized) ---
    const processedTokenBalances = useMemo(() => {
        const visibleTokens = tokenBalances.filter(token => 
            !hiddenTokens.includes(token.address?.toLowerCase())
        );

        switch (sortPreference) {
            case 'name_asc': return [...visibleTokens].sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc': return [...visibleTokens].sort((a, b) => b.name.localeCompare(a.name));
            case 'value_desc': return [...visibleTokens].sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
            default: return visibleTokens;
        }
    }, [tokenBalances, hiddenTokens, sortPreference]);


    const getDisplayAddress = () => {
        if (!decryptedWallet) return '';
        switch (activeNetwork.chainType) {
            case 'evm': return decryptedWallet.evm.address;
            case 'solana': return decryptedWallet.solana.address;
            case 'bitcoin': return decryptedWallet.bitcoin.address;
            default: return '';
        }
    };

    // --- Render Logic ---
    const renderContent = () => {
        if (isLoading && !decryptedWallet) return <LoadingIndicator show={true} />;

        if (isUnlocked && decryptedWallet) {
            return (
                <div className="w-full h-full flex flex-col">
                    <header className="w-full max-w-md mx-auto p-4 flex justify-end"><NetworkSelector /></header>
                    <MainDashboard 
                        wallet={{ address: getDisplayAddress() }}
                        balance={nativeBalance}
                        tokenBalances={processedTokenBalances}
                        transactions={transactions}
                        isLoading={isLoading}
                        error={dataError}
                        onSend={() => setShowSendScreen(true)}
                        onReceive={() => setShowReceiveScreen(true)}
                        onImportToken={() => setShowImportTokenModal(true)}
                        network={activeNetwork}
                        onRefreshData={fetchAllData}
                        onSortChange={handleSortChange}
                        currentSort={sortPreference}
                        onHideToken={handleHideToken}
                    />
                </div>
            );
        }

        if (hasCompletedOnboarding) return <UnlockScreen onUnlock={handleUnlock} error={unlockError} clearError={() => setUnlockError('')} onResetRequest={() => setShowResetConfirmation(true)} />;

        switch (flowStep) {
            case FLOW.CREATE_PASSCODE: return <CreatePasscode onPasscodeCreated={(p) => { setPasscode(p); setFlowStep(FLOW.CONFIRM_PASSCODE); }} />;
            case FLOW.CONFIRM_PASSCODE: return <ConfirmPasscode originalPasscode={passcode} onPasscodeConfirmed={handlePasscodeConfirmed} onBack={() => setFlowStep(FLOW.CREATE_PASSCODE)} />;
            case FLOW.SHOW_BACKUP_PHRASE: return <BackupPhrase phrase={mnemonic} onContinue={() => setFlowStep(FLOW.VERIFY_BACKUP_PHRASE)} />;
            case FLOW.VERIFY_BACKUP_PHRASE: return <VerifyPhrase phrase={mnemonic} onVerified={handlePhraseVerified} />;
            case FLOW.WALLET_READY: return <WalletReady onContinue={() => { setHasCompletedOnboarding(true); setIsUnlocked(true); }} />;
            default: return <OnboardingCarousel onCreateWallet={() => setFlowStep(FLOW.CREATE_PASSCODE)} onAlreadyHaveWallet={() => setHasCompletedOnboarding(true)} />;
        }
    };

    return (
        <div className="cosmic-background min-h-screen flex flex-col justify-center items-center font-sans text-center overflow-hidden">
            <main className="w-full h-full flex flex-col justify-center">
                <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
            </main>
            <AnimatePresence>
                {showReceiveScreen && decryptedWallet && <ReceiveScreen wallet={{ address: getDisplayAddress() }} onClose={() => setShowReceiveScreen(false)} />}
                {showSendScreen && decryptedWallet && <SendScreen onClose={() => setShowSendScreen(false)} onConfirm={(d) => { setTransactionDetails(d); setShowSendScreen(false); setShowConfirmScreen(true); }} ethBalance={nativeBalance} tokenBalances={tokenBalances} icons={tokenIcons} network={activeNetwork} />}
                {showConfirmScreen && decryptedWallet && transactionDetails && <ConfirmTransactionScreen wallet={decryptedWallet} transaction={transactionDetails} onCancel={() => handleTransactionSubmitted(null)} onComplete={handleTransactionSubmitted} network={activeNetwork} />}
                {showImportTokenModal && decryptedWallet && (
                    <ImportToken 
                        onClose={() => setShowImportTokenModal(false)}
                        onTokenImported={handleTokenImported}
                        chainId={activeNetwork.chainId}
                        userId={userId}
                        passcode={sessionPasscode}
                        provider={ethersProvider}
                    />
                )}
            </AnimatePresence>
            <ResetConfirmation show={showResetConfirmation} onConfirm={() => { storage.clearAllData(userId); window.location.reload(); }} onCancel={() => setShowResetConfirmation(false)} />
            <LoadingIndicator show={isLoading && !!decryptedWallet} />
        </div>
    );
}

export default dynamic(() => Promise.resolve(GatewayScreen), { ssr: false });
