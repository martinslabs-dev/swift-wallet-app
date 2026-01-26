import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";
import { AnimatePresence } from 'framer-motion';
import { Contract, JsonRpcProvider, formatUnits, Wallet } from "ethers";

// --- Context & Service Imports ---
import { useNetwork } from "../context/NetworkContext";
import { fetchEvmData } from "../services/evmService";
import { fetchSolanaData } from "../services/solanaService";
import { fetchBitcoinData } from "../services/bitcoinService";
import { tokenService } from "../services/tokenService";

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
import SettingsScreen from "../components/dashboard/SettingsScreen";
import AddAccountScreen from "../components/auth/AddAccountScreen";
import ExportPrivateKeyScreen from "../components/auth/ExportPrivateKeyScreen";
import RenameAccountScreen from "../components/auth/RenameAccountScreen";
import PasscodeConfirmationScreen from "../components/auth/PasscodeConfirmationScreen";
import TransactionDetailModal from "../components/dashboard/TransactionDetailModal";
import TokenDetailModal from "../components/dashboard/TokenDetailModal";
import BottomNavBar from "../components/dashboard/BottomNavBar";
import AccountsScreen from "../components/dashboard/AccountsScreen";
import BridgeScreen from "../components/dashboard/BridgeScreen";
import ManageTokensScreen from "../components/dashboard/ManageTokensScreen";

// --- Util & Asset Imports ---
import { storage } from "../utils/storage";
import { ERC20_ABI, PREDEFINED_TOKENS } from "../utils/tokens";
import { 
    deriveWalletFromMnemonic, 
    deriveWalletFromPrivateKey, 
    createViewOnlyWallet, 
    deriveAccount, 
    reconstructWallet 
} from "../utils/wallet";
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
    const router = useRouter();
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
    const [showManageTokens, setShowManageTokens] = useState(false);
    const [showSeedPhrase, setShowSeedPhrase] = useState(false);
    const [showAddAccountScreen, setShowAddAccountScreen] = useState(false);
    const [showExportPrivateKeyScreen, setShowExportPrivateKeyScreen] = useState(false);
    const [exportedPrivateKey, setExportedPrivateKey] = useState('');
    const [nativeBalance, setNativeBalance] = useState('0.00');
    const [tokenBalances, setTokenBalances] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [portfolioData, setPortfolioData] = useState({ totalValue: '0.00', change24h: 0, change24hValue: 0 });
    const [transactionDetails, setTransactionDetails] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [selectedToken, setSelectedToken] = useState(null);
    const [dataError, setDataError] = useState(null);
    const [ethersProvider, setEthersProvider] = useState(null);
    const [hiddenTokens, setHiddenTokens] = useState([]);
    const [sortPreference, setSortPreference] = useState('default');
    const [showRenameAccountScreen, setShowRenameAccountScreen] = useState(false);
    const [accountToRename, setAccountToRename] = useState(null);
    const [showPasscodeConfirmation, setShowPasscodeConfirmation] = useState(false);
    const [passcodeConfirmationAction, setPasscodeConfirmationAction] = useState(null);
    const [passcodeConfirmationError, setPasscodeConfirmationError] = useState('');
    const [activeTab, setActiveTab] = useState('wallet');

    const activeAccount = decryptedWallet?.accounts[decryptedWallet.activeAccountIndex];

    // --- Effects ---
    useEffect(() => {
        if (activeNetwork.rpcUrl) {
            try {
                setEthersProvider(new JsonRpcProvider(activeNetwork.rpcUrl, undefined, { staticNetwork: true }));
            } catch (e) { console.error("Failed to create ethers provider:", e); setEthersProvider(null); }
        }
    }, [activeNetwork]);

    const fetchAllData = useCallback(async () => {
        if (!decryptedWallet || !userId) return;
        if (decryptedWallet.viewOnly && !sessionPasscode) {
             if (decryptedWallet.accounts[0]?.viewOnly?.address) {
            }
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setDataError(null);
        try {
            let data;
            const currentAccount = decryptedWallet.accounts[decryptedWallet.activeAccountIndex];

            if (activeNetwork.chainType === 'evm') {
                data = await fetchEvmData({ ...decryptedWallet, evm: currentAccount.evm }, activeNetwork);
            } else if (activeNetwork.chainType === 'solana') {
                data = await fetchSolanaData({ ...decryptedWallet, solana: currentAccount.solana }, activeNetwork);
            } else if (activeNetwork.chainType === 'bitcoin') {
                data = await fetchBitcoinData({ ...decryptedWallet, bitcoin: currentAccount.bitcoin }, activeNetwork);
            }
            
            if (data) {
                setNativeBalance(data.nativeBalance);
                setTransactions(data.transactions || []);
                setPortfolioData(data.portfolio || { totalValue: '0.00', change24h: 0, change24hValue: 0 });

                let finalList = data.tokenBalances || [];
                if (activeNetwork.chainType === 'evm' && sessionPasscode && !decryptedWallet.viewOnly) {
                    const customTokens = await storage.getCustomTokens(activeNetwork.chainId, userId, sessionPasscode);
                    if (customTokens.length > 0 && ethersProvider) {
                        const customTokenPromises = customTokens.map(async t => {
                            try {
                                const contract = new Contract(t.address, ERC20_ABI, ethersProvider);
                                const balanceRaw = await contract.balanceOf(currentAccount.evm.address);
                                const balance = formatUnits(balanceRaw, t.decimals);
                                return { ...t, balance, value_usd: '0.00', price_change_24h: 0 };
                            } catch { return { ...t, balance: '0', value_usd: '0.00', price_change_24h: 0 }; }
                        });
                        const customTokenBalances = await Promise.all(customTokenPromises);
                        const combined = [...finalList];
                        customTokenBalances.forEach(ct => { if (!combined.some(t => t.address.toLowerCase() === ct.address.toLowerCase())) combined.push(ct); });
                        finalList = combined;
                    }

                    // --- Automatic Token Detection ---
                    if (ethersProvider) {
                        const detectedTokens = await tokenService.detectNewTokens(
                            currentAccount.evm.address, 
                            ethersProvider, 
                            finalList, 
                            activeNetwork.chainId
                        );
                        if (detectedTokens.length > 0) {
                            finalList = [...finalList, ...detectedTokens];
                            // Save detected tokens for future sessions
                            for (const token of detectedTokens) {
                                await storage.addCustomToken(token, activeNetwork.chainId, userId, sessionPasscode);
                            }
                        }
                    }
                }
                setTokenBalances(finalList);
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
        let wallet;
        if (mnemonic) {
            wallet = await deriveWalletFromMnemonic(mnemonic);
        } else if (importedPrivateKey && importNetworkId) {
            wallet = deriveWalletFromPrivateKey(importedPrivateKey, importNetworkId);
            if (!wallet) {
                setIsLoading(false);
                setFlowStep(FLOW.IMPORT_FROM_PRIVATE_KEY);
                return;
            }
        } else {
            const newMnemonic = Wallet.createRandom().mnemonic.phrase;
            setMnemonic(newMnemonic);
            wallet = await deriveWalletFromMnemonic(newMnemonic);
        }
        await completeWalletSetup(wallet, passcode, userId);
        setFlowStep(FLOW.WALLET_READY);
    };
    
    const handlePhraseVerified = async () => {
        setIsLoading(true);
        const wallet = await deriveWalletFromMnemonic(mnemonic);
        await completeWalletSetup(wallet, passcode, userId);
        setFlowStep(FLOW.WALLET_READY);
    };

    const completeWalletSetup = async (wallet, pass, id) => {
        await storage.saveEncryptedWallet(wallet, pass, id);
        setDecryptedWallet(wallet);
        storage.setHasCompletedOnboarding(id);
        setSessionPasscode(pass);
        setIsLoading(false);
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
            await storage.saveEncryptedWallet(viewOnlyWallet, "view-only", userId); 
            storage.setHasCompletedOnboarding(userId);
            setDecryptedWallet(viewOnlyWallet);
            setSessionPasscode("view-only"); 
            setIsUnlocked(true);
        }
        setIsLoading(false);
    };

    const handleUnlock = async (attemptedPasscode) => {
        setUnlockError("");
        setIsLoading(true);
        const walletData = await storage.getDecryptedWallet(attemptedPasscode, userId);
        if (walletData) {
            const reconstructed = reconstructWallet(walletData);
            setDecryptedWallet(reconstructed);
            setSessionPasscode(reconstructed.viewOnly ? "view-only" : attemptedPasscode);
            if (!reconstructed.viewOnly) {
                 const hidden = await storage.getHiddenTokens(activeNetwork.chainId, userId, attemptedPasscode);
                 const sort = await storage.getSortPreference(userId, attemptedPasscode);
                 setHiddenTokens(hidden);
                 setSortPreference(sort);
            }
            setIsUnlocked(true);
        } else { setUnlockError("Incorrect passcode."); }
        setIsLoading(false);
    };

    const handleAddAccount = async (accountName) => {
        if (!decryptedWallet || decryptedWallet.viewOnly || !decryptedWallet.mnemonic) return;
        setIsLoading(true);
        const newIndex = decryptedWallet.accounts.length;
        const newAccount = await deriveAccount(decryptedWallet.mnemonic, newIndex, accountName);
        const updatedWallet = {
            ...decryptedWallet,
            accounts: [...decryptedWallet.accounts, newAccount],
            activeAccountIndex: newIndex, // Switch to the new account
        };
        await storage.saveEncryptedWallet(updatedWallet, sessionPasscode, userId);
        setDecryptedWallet(updatedWallet);
        setShowAddAccountScreen(false);
        setIsLoading(false);
    };

    const handleSwitchAccount = async (index) => {
        if (index === decryptedWallet.activeAccountIndex) return;
        const updatedWallet = { ...decryptedWallet, activeAccountIndex: index };
        await storage.saveEncryptedWallet(updatedWallet, sessionPasscode, userId);
        setDecryptedWallet(updatedWallet);
    };

    const handleShowRenameAccount = (account) => {
        setAccountToRename(account);
        setShowRenameAccountScreen(true);
    };

    const handleRenameAccount = async (accountIndex, newName) => {
        if (!decryptedWallet || decryptedWallet.viewOnly) return;
        setIsLoading(true);
        const updatedAccounts = decryptedWallet.accounts.map((acc, index) => {
            if (index === accountIndex) {
                return { ...acc, name: newName };
            }
            return acc;
        });
        const updatedWallet = { ...decryptedWallet, accounts: updatedAccounts };
        await storage.saveEncryptedWallet(updatedWallet, sessionPasscode, userId);
        setDecryptedWallet(updatedWallet);
        setShowRenameAccountScreen(false);
        setAccountToRename(null);
        setIsLoading(false);
    };

    const handlePasscodeConfirmation = (pass) => {
        if (pass !== sessionPasscode) {
            setPasscodeConfirmationError("Incorrect passcode.");
            return;
        }

        if (passcodeConfirmationAction === 'viewSeed') {
            setMnemonic(decryptedWallet.mnemonic);
            setShowSeedPhrase(true);
        } else if (passcodeConfirmationAction === 'exportKey') {
            const key = activeAccount[activeNetwork.chainType]?.privateKey;
            setExportedPrivateKey(key);
            setShowExportPrivateKeyScreen(true);
        }
        
        setShowPasscodeConfirmation(false);
        setPasscodeConfirmationAction(null);
        setPasscodeConfirmationError('');
    };

    const handleCancelPasscodeConfirmation = () => {
        setShowPasscodeConfirmation(false);
        setPasscodeConfirmationAction(null);
        setPasscodeConfirmationError('');
    };

    const handleRequestViewSeed = () => {
        if (decryptedWallet && !decryptedWallet.viewOnly) {
            setPasscodeConfirmationAction('viewSeed');
            setShowPasscodeConfirmation(true);
        }
    };

    const handleRequestExportKey = () => {
        if (decryptedWallet && !decryptedWallet.viewOnly) {
            setPasscodeConfirmationAction('exportKey');
            setShowPasscodeConfirmation(true);
        }
    };

    const handleHideToken = async (tokenAddress) => {
        if (!tokenAddress || !userId || !sessionPasscode || sessionPasscode === 'view-only') return;
        const lowerCaseAddress = tokenAddress.toLowerCase();
        const newHiddenTokens = [...hiddenTokens, lowerCaseAddress];
        setHiddenTokens(newHiddenTokens);
        await storage.hideToken(lowerCaseAddress, activeNetwork.chainId, userId, sessionPasscode);
    };

    const handleToggleTokenVisibility = async (token) => {
        const address = token.address.toLowerCase();
        const isHidden = hiddenTokens.includes(address);
        let newHiddenTokens;

        if (isHidden) {
            newHiddenTokens = hiddenTokens.filter(t => t !== address);
            // It was hidden, now we show it. We might need to add it to custom tokens if it's not a default one.
            const isPredefined = (PREDEFINED_TOKENS[activeNetwork.chainId] || []).some(t => t.address.toLowerCase() === address);
            if (!isPredefined) {
                // This logic assumes `token` object is complete for storage
                await storage.addCustomToken(token, activeNetwork.chainId, userId, sessionPasscode);
            }
        } else {
            newHiddenTokens = [...hiddenTokens, address];
        }

        setHiddenTokens(newHiddenTokens);
        // Persist the entire list of hidden tokens for simplicity
        await storage.setHiddenTokens(newHiddenTokens, activeNetwork.chainId, userId, sessionPasscode);
        fetchAllData(); // Refresh data to show/hide token
    };

    const handleSortChange = async (newSort) => {
        if (!userId || !sessionPasscode || sessionPasscode === 'view-only') return;
        setSortPreference(newSort);
        await storage.setSortPreference(newSort, userId, sessionPasscode);
    };

    const handleTokenImported = () => { fetchAllData(); };

    const handleTransactionClick = (tx) => {
        setSelectedTransaction(tx);
    };

    const handleTokenClick = (token) => {
        setSelectedToken(token);
    };

    const handleTabChange = (tab) => {
        // Close all modals
        setShowReceiveScreen(false);
        setShowSendScreen(false);
        setShowSwapScreen(false);
        setShowConfirmScreen(false);
        setShowImportTokenModal(false);
        setShowSeedPhrase(false);
        setShowAddAccountScreen(false);
        setShowExportPrivateKeyScreen(false);
        setShowRenameAccountScreen(false);
        setShowPasscodeConfirmation(false);
        setSelectedTransaction(null);
        setSelectedToken(null);
        setAccountToRename(null)

        if (tab === 'dapps') {
            router.push('/dapps');
        } else {
            setActiveTab(tab);
        }
    };

    const processedTokenBalances = useMemo(() => {
        return tokenBalances.filter(token => 
            !hiddenTokens.includes(token.address?.toLowerCase())
        );
    }, [tokenBalances, hiddenTokens]);
    
    const getDisplayAddress = () => {
        const account = decryptedWallet?.accounts[decryptedWallet.activeAccountIndex];
        if (!account) return '';
        switch (activeNetwork.chainType) {
            case 'evm': return account.evm?.address;
            case 'solana': return account.solana?.address;
            case 'bitcoin': return account.bitcoin?.address;
            default: return '';
        }
    };
    
    const isViewOnly = decryptedWallet?.viewOnly === true;

    const renderContent = () => {
        if (isLoading && !decryptedWallet) return <LoadingIndicator show={true} />;

        if (isUnlocked && decryptedWallet) {
            let content;
            switch (activeTab) {
                case 'wallet':
                    content = <MainDashboard 
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
                        onManageTokens={() => setShowManageTokens(true)}
                        onTransactionClick={handleTransactionClick}
                        onTokenClick={handleTokenClick}
                        network={activeNetwork}
                        onSortChange={handleSortChange}
                        currentSort={sortPreference}
                        onHideToken={handleHideToken}
                        isViewOnly={isViewOnly}
                    />;
                    break;
                case 'bridge':
                    content = <BridgeScreen />;
                    break;
                case 'accounts':
                    content = <AccountsScreen />;
                    break;
                case 'settings':
                    content = <SettingsScreen 
                        onBack={() => setActiveTab('wallet')} 
                        wallet={decryptedWallet} 
                        activeNetwork={activeNetwork} 
                        onViewSeedPhrase={handleRequestViewSeed}
                        onAddAccount={() => setShowAddAccountScreen(true)}
                        onSwitchAccount={handleSwitchAccount}
                        onShowExportPrivateKey={handleRequestExportKey}
                        onShowRenameAccount={handleShowRenameAccount}
                    />;
                    break;
                default:
                    content = null;
            }
            return (
                <div className="w-full h-full flex flex-col">
                    <header className="w-full max-w-md mx-auto p-4 flex justify-end"><NetworkSelector /></header>
                    {content}
                    <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
                </div>
            );
        }

        if (hasCompletedOnboarding) return <UnlockScreen onUnlock={handleUnlock} error={unlockError} clearError={() => setUnlockError('')} onResetRequest={() => setShowResetConfirmation(true)} onImportWallet={() => setFlowStep(FLOW.IMPORT_WALLET)} />;

        switch (flowStep) {
            case FLOW.CREATE_PASSCODE: return <CreatePasscode onPasscodeCreated={(p) => { setPasscode(p); setFlowStep(FLOW.CONFIRM_PASSCODE); }} />
            case FLOW.CONFIRM_PASSCODE: return <ConfirmPasscode originalPasscode={passcode} onPasscodeConfirmed={handlePasscodeConfirmed} onBack={() => setFlowStep(FLOW.CREATE_PASSCODE)} />;
            case FLOW.SHOW_BACKUP_PHRASE: return <BackupPhrase phrase={mnemonic} onContinue={() => { if (decryptedWallet) { setFlowStep(FLOW.WALLET_READY); } else { setFlowStep(FLOW.VERIFY_BACKUP_PHRASE); } }} />;
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
                {showManageTokens && (
                    <ManageTokensScreen
                        onClose={() => setShowManageTokens(false)}
                        onImportToken={() => {
                            setShowManageTokens(false);
                            setShowImportTokenModal(true);
                        }}
                        visibleTokens={processedTokenBalances}
                        onToggleToken={handleToggleTokenVisibility}
                        network={activeNetwork}
                    />
                )}
                {showReceiveScreen && decryptedWallet && <ReceiveScreen wallet={{ address: getDisplayAddress() }} onClose={() => setShowReceiveScreen(false)} />}
                {showSendScreen && decryptedWallet && !isViewOnly && <SendScreen userId={userId} sessionPasscode={sessionPasscode} onClose={() => setShowSendScreen(false)} onConfirm={(d) => { setTransactionDetails(d); setShowSendScreen(false); setShowConfirmScreen(true); }} ethBalance={nativeBalance} tokenBalances={tokenBalances} icons={tokenIcons} network={activeNetwork} activeAccount={activeAccount}/>}
                {showSwapScreen && !isViewOnly && <SwapScreen onClose={() => setShowSwapScreen(false)} onConfirm={(d) => { setTransactionDetails(d); setShowSwapScreen(false); setShowConfirmScreen(true); }} nativeBalance={nativeBalance} tokenBalances={tokenBalances} icons={tokenIcons} network={activeNetwork} />}
                {showConfirmScreen && decryptedWallet && transactionDetails && !isViewOnly && <ConfirmTransactionScreen wallet={decryptedWallet} transaction={transactionDetails} onCancel={() => {setTransactionDetails(null); setShowConfirmScreen(false);}} onComplete={() => {setTransactionDetails(null); setShowConfirmScreen(false); fetchAllData();}} network={activeNetwork} activeAccount={activeAccount}/>}
                {showAddAccountScreen && decryptedWallet && !isViewOnly && (
                    <AddAccountScreen 
                        onBack={() => setShowAddAccountScreen(false)} 
                        onAddAccount={handleAddAccount} 
                    />
                )}
                {showExportPrivateKeyScreen && !isViewOnly && (
                    <ExportPrivateKeyScreen
                        onBack={() => setShowExportPrivateKeyScreen(false)}
                        privateKey={exportedPrivateKey}
                    />
                )}
                 {showRenameAccountScreen && accountToRename && !isViewOnly && (
                    <RenameAccountScreen
                        onBack={() => { setShowRenameAccountScreen(false); setAccountToRename(null); }}
                        onRename={handleRenameAccount}
                        account={accountToRename}
                    />
                )}
                {showSeedPhrase && <BackupPhrase phrase={mnemonic} onContinue={() => setShowSeedPhrase(false)} isViewing={true} />}
                
                {showPasscodeConfirmation && (
                    <PasscodeConfirmationScreen 
                        onConfirm={handlePasscodeConfirmation}
                        onCancel={handleCancelPasscodeConfirmation}
                        error={passcodeConfirmationError}
                        clearError={() => setPasscodeConfirmationError('')}
                    />
                )}

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

                {selectedTransaction && 
                    <TransactionDetailModal 
                        transaction={selectedTransaction} 
                        onClose={() => setSelectedTransaction(null)} 
                        network={activeNetwork} 
                    />
                }

                {selectedToken && 
                    <TokenDetailModal 
                        token={selectedToken} 
                        onClose={() => setSelectedToken(null)} 
                        network={activeNetwork} 
                    />
                }
            </AnimatePresence>
            <ResetConfirmation show={showResetConfirmation} onConfirm={() => { storage.clearAllData(userId); window.location.reload(); }} onCancel={() => setShowResetConfirmation(false)} />
            <LoadingIndicator show={isLoading && !!decryptedWallet} />
        </div>
    );
}

export default dynamic(() => Promise.resolve(GatewayScreen), { ssr: false });
