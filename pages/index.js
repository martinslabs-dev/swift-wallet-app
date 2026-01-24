
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
import SwapScreen from "../components/dashboard/SwapScreen";
import ConfirmTransactionScreen from "../components/dashboard/ConfirmTransactionScreen";
import NetworkSelector from "../components/NetworkSelector";
import ImportToken from "../components/ImportToken";
import ImportWallet from "../components/auth/ImportWallet";
import ImportFromMnemonic from "../components/auth/ImportFromMnemonic";
import ImportFromPrivateKey from "../components/auth/ImportFromPrivateKey";
import AddViewOnlyWallet from "../components/auth/AddViewOnlyWallet";

// --- Util & Asset Imports ---
import { storage } from "../utils/storage";
import { deriveWalletFromMnemonic, deriveWalletFromPrivateKey, createViewOnlyWallet, reconstructWallet } from "../utils/wallet";
import { ERC20_ABI } from "../utils/tokens";
import UsdtIcon from '../components/dashboard/icons/UsdtIcon';
import UsdcIcon from '../components/dashboard/icons/UsdcIcon';

const FLOW = {
    ONBOARDING: 'onboarding',
    CREATE_PASSCODE: 'create_passcode',
    CONFIRM_PASSCODE: 'confirm_passcode',
    SHOW_BACKUP_PHRASE: 'show_backup_phrase',
    VERIFY_BACKUP_PHRASE: 'verify_backup_phrase',
    WALLET_READY: 'wallet_ready',
    IMPORT_WALLET: 'import_wallet',
    IMPORT_FROM_MNEMONIC: 'import_from_mnemonic',
    IMPORT_FROM_PRIVATE_KEY: 'import_from_private_key',
    ADD_VIEW_ONLY_WALLET: 'add_view_only_wallet'
};
const tokenIcons = { USDT: UsdtIcon, USDC: UsdcIcon };

function GatewayScreen() {
    // --- State ---
    const [isLoading, setIsLoading] = useState(true);
    const [flowStep, setFlowStep] = useState(FLOW.ONBOARDING);
    const [passcode, setPasscode] = useState("");
    const [sessionPasscode, setSessionPasscode] = useState("");
    const [mnemonic, setMnemonic] = useState("");
    const [importedPrivateKey, setImportedPrivateKey] = useState(null);
    const [importNetworkId, setImportNetworkId] = useState(null);
    const [decryptedWallet, setDecryptedWallet] = useState(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [unlockError, setUnlockError] = useState("");
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [userId, setUserId] = useState(null);
    const { activeNetwork } = useNetwork();
    const [showResetConfirmation, setShowResetConfirmation] = useState(false);
    const [showReceiveScreen, setShowReceiveScreen] = useState(false);
    const [showSendScreen, setShowSendScreen] = useState(false);
    const [showSwapScreen, setShowSwapScreen] = useState(false);
    const [showConfirmScreen, setShowConfirmScreen] = useState(false);
    const [showImportTokenModal, setShowImportTokenModal] = useState(false);
    const [nativeBalance, setNativeBalance] = useState('0.00');
    const [tokenBalances, setTokenBalances] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [portfolioData, setPortfolioData] = useState({ totalValue: '0.00', change24h: 0, change24hValue: 0 });
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
        if (!decryptedWallet || !userId) return;
        // No fetching needed if it's a view-only wallet with no real session passcode
        if (decryptedWallet.viewOnly && !sessionPasscode) {
             if (decryptedWallet.viewOnly.address) {
                // You could implement a view-only data fetching logic here if desired
            }
            setIsLoading(false);
            return;
        }
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
            }
            
            if (data) {
                setNativeBalance(data.nativeBalance);
                setTransactions(data.transactions || []);
                setPortfolioData(data.portfolio || { totalValue: '0.00', change24h: 0, change24hValue: 0 });

                let finalTokenList = data.tokenBalances || [];
                if (activeNetwork.chainType === 'evm' && sessionPasscode) { // Ensure sessionPasscode exists for custom tokens
                    const customTokens = await storage.getCustomTokens(activeNetwork.chainId, userId, sessionPasscode);
                    if (customTokens.length > 0 && ethersProvider) {
                        const customTokenPromises = customTokens.map(async t => {
                            try {
                                const contract = new ethers.Contract(t.address, ERC20_ABI, ethersProvider);
                                const balanceRaw = await contract.balanceOf(decryptedWallet.evm.address);
                                const balance = ethers.formatUnits(balanceRaw, t.decimals);
                                return { ...t, balance, value_usd: '0.00', price_change_24h: 0 };
                            } catch { return { ...t, balance: '0', value_usd: '0.00', price_change_24h: 0 }; }
                        });
                        const customTokenBalances = await Promise.all(customTokenPromises);
                        const combined = [...finalTokenList];
                        customTokenBalances.forEach(ct => { if (!combined.some(t => t.address.toLowerCase() === ct.address.toLowerCase())) combined.push(ct); });
                        finalTokenList = combined;
                    }
                }
                setTokenBalances(finalTokenList);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setDataError("Could not load wallet data.");
        } finally {
            setIsLoading(false);
        }
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
    const handlePasscodeConfirmed = async () => {
        setIsLoading(true);
        if (mnemonic) {
            const wallet = await deriveWalletFromMnemonic(mnemonic);
            await completeWalletSetup(wallet);
        } else if (importedPrivateKey && importNetworkId) {
            const wallet = deriveWalletFromPrivateKey(importedPrivateKey, importNetworkId);
            if (wallet) {
                await completeWalletSetup(wallet);
            } else {
                // Handle error: private key is invalid for the network
                setIsLoading(false);
                setFlowStep(FLOW.IMPORT_FROM_PRIVATE_KEY); 
            }
        } else {
            // This is the create new wallet flow
            setMnemonic(ethers.Wallet.createRandom().mnemonic.phrase);
            setIsLoading(false);
            setFlowStep(FLOW.SHOW_BACKUP_PHRASE);
        }
    };
    
    const handlePhraseVerified = async () => {
        setIsLoading(true);
        const wallet = await deriveWalletFromMnemonic(mnemonic);
        await completeWalletSetup(wallet);
    };

    const completeWalletSetup = async (wallet) => {
        setDecryptedWallet(wallet);
        await storage.saveEncryptedWallet(wallet, passcode, userId);
        storage.setHasCompletedOnboarding(userId);
        setSessionPasscode(passcode);
        setIsLoading(false);
        setFlowStep(FLOW.WALLET_READY);
    };

    const handleMnemonicImportSubmit = (importedMnemonic) => {
        setMnemonic(importedMnemonic);
        setFlowStep(FLOW.CREATE_PASSCODE);
    };

    const handlePrivateKeyImportSubmit = (key, networkId) => {
        setImportedPrivateKey(key);
        setImportNetworkId(networkId);
        setFlowStep(FLOW.CREATE_PASSCODE);
    };

    const handleViewOnlyAddressSubmit = async (address, networkId) => {
        setIsLoading(true);
        const viewOnlyWallet = createViewOnlyWallet(address, networkId);
        if (viewOnlyWallet) {
            // For view-only wallets, we don't encrypt. We save it differently.
            // This could be a separate storage function if we need to store multiple view-only wallets.
            // For now, we'll just treat it as the main wallet.
            await storage.saveEncryptedWallet(viewOnlyWallet, "view-only", userId); // Use a placeholder for passcode
            storage.setHasCompletedOnboarding(userId);
            setDecryptedWallet(viewOnlyWallet);
            setSessionPasscode("view-only"); // Use a placeholder session passcode
            setIsUnlocked(true);
        }
        setIsLoading(false);
    };

    const handleUnlock = async (attemptedPasscode) => {
        setUnlockError("");
        setIsLoading(true);
        const walletData = await storage.getDecryptedWallet(attemptedPasscode, userId);
        if (walletData) {
             if (walletData.viewOnly) {
                setDecryptedWallet(walletData);
                setSessionPasscode("view-only");
            } else {
                setDecryptedWallet(reconstructWallet(walletData));
                setSessionPasscode(attemptedPasscode);
                const hidden = await storage.getHiddenTokens(activeNetwork.chainId, userId, attemptedPasscode);
                const sort = await storage.getSortPreference(userId, attemptedPasscode);
                setHiddenTokens(hidden);
                setSortPreference(sort);
            }
            setIsUnlocked(true);
        } else { setUnlockError("Incorrect passcode."); }
        setIsLoading(false);
    };

    const handleHideToken = async (tokenAddress) => {
        if (!tokenAddress || !userId || !sessionPasscode || sessionPasscode === 'view-only') return;
        const lowerCaseAddress = tokenAddress.toLowerCase();
        const newHiddenTokens = [...hiddenTokens, lowerCaseAddress];
        setHiddenTokens(newHiddenTokens);
        await storage.hideToken(lowerCaseAddress, activeNetwork.chainId, userId, sessionPasscode);
    };

    const handleSortChange = async (newSort) => {
        if (!userId || !sessionPasscode || sessionPasscode === 'view-only') return;
        setSortPreference(newSort);
        await storage.setSortPreference(newSort, userId, sessionPasscode);
    };

    const handleTokenImported = () => { fetchAllData(); };

    const processedTokenBalances = useMemo(() => {
        const visibleTokens = tokenBalances.filter(token => 
            !hiddenTokens.includes(token.address?.toLowerCase())
        );

        switch (sortPreference) {
            case 'name_asc': return [...visibleTokens].sort((a, b) => a.name.localeCompare(b.name));
            case 'name_desc': return [...visibleTokens].sort((a, b) => b.name.localeCompare(a.name));
            case 'value_desc': return [...visibleTokens].sort((a, b) => parseFloat(b.value_usd) - parseFloat(a.value_usd));
            default: return visibleTokens;
        }
    }, [tokenBalances, hiddenTokens, sortPreference]);
    
    const getDisplayAddress = () => {
        if (!decryptedWallet) return '';
        if (decryptedWallet.viewOnly) return decryptedWallet.viewOnly.address;
        switch (activeNetwork.chainType) {
            case 'evm': return decryptedWallet.evm?.address;
            case 'solana': return decryptedWallet.solana?.address;
            case 'bitcoin': return decryptedWallet.bitcoin?.address;
            default: return '';
        }
    };
    
    const isViewOnly = decryptedWallet?.viewOnly != null;

    const renderContent = () => {
        if (isLoading && !decryptedWallet) return <LoadingIndicator show={true} />;

        if (isUnlocked && decryptedWallet) {
            return (
                <div className="w-full h-full flex flex-col">
                    <header className="w-full max-w-md mx-auto p-4 flex justify-end"><NetworkSelector /></header>
                    <MainDashboard 
                        wallet={{ address: getDisplayAddress() }}
                        portfolio={portfolioData}
                        tokenBalances={processedTokenBalances}
                        transactions={transactions}
                        isLoading={isLoading}
                        error={dataError}
                        onSend={() => setShowSendScreen(true)}
                        onReceive={() => setShowReceiveScreen(true)}
                        onSwap={() => setShowSwapScreen(true)}
                        onImportToken={() => setShowImportTokenModal(true)}
                        network={activeNetwork}
                        onSortChange={handleSortChange}
                        currentSort={sortPreference}
                        onHideToken={handleHideToken}
                        isViewOnly={isViewOnly}
                    />
                </div>
            );
        }

        if (hasCompletedOnboarding) return <UnlockScreen onUnlock={handleUnlock} error={unlockError} clearError={() => setUnlockError('')} onResetRequest={() => setShowResetConfirmation(true)} onImportWallet={() => setFlowStep(FLOW.IMPORT_WALLET)} />;

        switch (flowStep) {
            case FLOW.CREATE_PASSCODE: return <CreatePasscode onPasscodeCreated={(p) => { setPasscode(p); setFlowStep(FLOW.CONFIRM_PASSCODE); }} />
            case FLOW.CONFIRM_PASSCODE: return <ConfirmPasscode originalPasscode={passcode} onPasscodeConfirmed={handlePasscodeConfirmed} onBack={() => setFlowStep(FLOW.CREATE_PASSCODE)} />;
            case FLOW.SHOW_BACKUP_PHRASE: return <BackupPhrase phrase={mnemonic} onContinue={() => setFlowStep(FLOW.VERIFY_BACKUP_PHRASE)} />;
            case FLOW.VERIFY_BACKUP_PHRASE: return <VerifyPhrase phrase={mnemonic} onVerified={handlePhraseVerified} />;
            case FLOW.WALLET_READY: return <WalletReady onContinue={() => { setHasCompletedOnboarding(true); setIsUnlocked(true); }} />;
            case FLOW.IMPORT_WALLET: return <ImportWallet onImportMnemonic={() => setFlowStep(FLOW.IMPORT_FROM_MNEMONIC)} onImportPrivateKey={() => setFlowStep(FLOW.IMPORT_FROM_PRIVATE_KEY)} onViewOnly={() => setFlowStep(FLOW.ADD_VIEW_ONLY_WALLET)} onBack={() => setFlowStep(FLOW.ONBOARDING)} />;
            case FLOW.IMPORT_FROM_MNEMONIC: return <ImportFromMnemonic onMnemonicSubmit={handleMnemonicImportSubmit} onBack={() => setFlowStep(FLOW.IMPORT_WALLET)} />;
            case FLOW.IMPORT_FROM_PRIVATE_KEY: return <ImportFromPrivateKey onPrivateKeySubmit={handlePrivateKeyImportSubmit} onBack={() => setFlowStep(FLOW.IMPORT_WALLET)} />;
            case FLOW.ADD_VIEW_ONLY_WALLET: return <AddViewOnlyWallet onAddressSubmit={handleViewOnlyAddressSubmit} onBack={() => setFlowStep(FLOW.IMPORT_WALLET)} />;
            default: return <OnboardingCarousel onCreateWallet={() => setFlowStep(FLOW.CREATE_PASSCODE)} onAlreadyHaveWallet={() => setFlowStep(FLOW.IMPORT_WALLET)} />;
        }
    };

    return (
        <div className="cosmic-background min-h-screen flex flex-col justify-center items-center font-sans text-center overflow-hidden">
            <main className="w-full h-full flex flex-col justify-center">
                <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
            </main>
            <AnimatePresence>
                {showReceiveScreen && decryptedWallet && <ReceiveScreen wallet={{ address: getDisplayAddress() }} onClose={() => setShowReceiveScreen(false)} />}
                {showSendScreen && decryptedWallet && !isViewOnly && <SendScreen userId={userId} sessionPasscode={sessionPasscode} onClose={() => setShowSendScreen(false)} onConfirm={(d) => { setTransactionDetails(d); setShowSendScreen(false); setShowConfirmScreen(true); }} ethBalance={nativeBalance} tokenBalances={tokenBalances} icons={tokenIcons} network={activeNetwork} />}
                {showSwapScreen && !isViewOnly && <SwapScreen onClose={() => setShowSwapScreen(false)} onConfirm={(d) => { setTransactionDetails(d); setShowSwapScreen(false); setShowConfirmScreen(true); }} nativeBalance={nativeBalance} tokenBalances={tokenBalances} icons={tokenIcons} network={activeNetwork} />}
                {showConfirmScreen && decryptedWallet && transactionDetails && !isViewOnly && <ConfirmTransactionScreen wallet={decryptedWallet} transaction={transactionDetails} onCancel={() => {setTransactionDetails(null); setShowConfirmScreen(false);}} onComplete={() => {setTransactionDetails(null); setShowConfirmScreen(false); fetchAllData();}} network={activeNetwork} />}
                {showImportTokenModal && decryptedWallet && !isViewOnly && (
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
