import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from 'framer-motion';
import OnboardingCarousel from "../components/OnboardingCarousel";
import CreatePasscode from "../components/auth/CreatePasscode";
import ConfirmPasscode from "../components/auth/ConfirmPasscode";
import WalletReady from "../components/auth/WalletReady";
import UnlockScreen from "../components/auth/UnlockScreen";
import ResetConfirmation from "../components/auth/ResetConfirmation";
import MainDashboard from "../components/dashboard/MainDashboard";
import { storage } from "../utils/storage";
import { webauthn } from "../utils/webauthn";

function GatewayScreen() {
  const [mounted, setMounted] = useState(false);
  const [walletCreationStep, setWalletCreationStep] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onboardingStatus = storage.hasCompletedOnboarding();
    setHasCompletedOnboarding(onboardingStatus);
    if (onboardingStatus) {
        const biometricsStatus = !!storage.getWebAuthnCredentialId();
        setHasBiometrics(biometricsStatus);
    }

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#0B0F1A');
      window.Telegram.WebApp.setBackgroundColor('#0B0F1A');
    }
  }, []);

  if (!mounted) {
    return <div className="cosmic-background w-full h-screen" />;
  }

  const handleCreateWalletClick = () => setWalletCreationStep('createPasscode');

  const handlePasscodeCreated = (newPasscode) => {
    setPasscode(newPasscode);
    setWalletCreationStep('confirmPasscode');
  };

  const handlePasscodeConfirmed = async () => {
    const walletData = { privateKey: "super-secret-private-key" };
    await storage.saveEncryptedWallet(walletData, passcode);
    
    try {
        const credentialId = await webauthn.register();
        storage.setWebAuthnCredentialId(credentialId);
    } catch (err) {
        console.error("Biometric registration skipped or failed", err);
    }

    storage.setHasCompletedOnboarding();
    setWalletCreationStep('walletReady');
  };
  
  const handleWalletReadyContinue = () => setIsUnlocked(true);

  const handleBack = () => setWalletCreationStep('createPasscode');

  const handleUnlock = async (attemptedPasscode) => {
    const wallet = await storage.getDecryptedWallet(attemptedPasscode);
    if (wallet) {
      setIsUnlocked(true);
    } else {
      setUnlockError("Incorrect passcode. Please try again.");
    }
  };

  const handleBiometricUnlock = async () => {
    const credentialId = storage.getWebAuthnCredentialId();
    const success = await webauthn.authenticate(credentialId);
    if (success) {
      setIsUnlocked(true);
    } else {
      setUnlockError("Biometric authentication failed.");
    }
  };

  const handleResetRequest = () => setShowResetConfirmation(true);
  const handleResetCancel = () => setShowResetConfirmation(false);
  const handleResetConfirm = () => {
      storage.clearAllData();
      window.location.reload();
  };

  const renderContent = () => {
    if (isUnlocked) {
        return <MainDashboard />;
    }

    if (hasCompletedOnboarding) {
        return <UnlockScreen 
                  onUnlock={handleUnlock} 
                  hasBiometrics={hasBiometrics} 
                  onBiometricUnlock={handleBiometricUnlock} 
                  error={unlockError} 
                  clearError={() => setUnlockError('')} 
                  onResetRequest={handleResetRequest}
               />;
    }

    switch (walletCreationStep) {
      case 'createPasscode':
        return <CreatePasscode onPasscodeCreated={handlePasscodeCreated} />;
      case 'confirmPasscode':
        return <ConfirmPasscode originalPasscode={passcode} onPasscodeConfirmed={handlePasscodeConfirmed} onBack={handleBack} />;
      case 'walletReady':
        return <WalletReady onContinue={handleWalletReadyContinue} />;
      default:
        return <OnboardingCarousel onCreateWallet={handleCreateWalletClick} />;
    }
  }

  return (
    <div className="cosmic-background min-h-screen flex flex-col justify-center items-center font-sans text-center overflow-hidden">
      <main className="w-full h-full flex flex-col justify-center">
         <AnimatePresence mode="wait">
            {renderContent()}
         </AnimatePresence>
      </main>
      <ResetConfirmation 
        show={showResetConfirmation} 
        onConfirm={handleResetConfirm} 
        onCancel={handleResetCancel} 
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(GatewayScreen), {
  ssr: false,
});
