import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from 'framer-motion';
import OnboardingCarousel from "../components/OnboardingCarousel";
import CreatePasscode from "../components/auth/CreatePasscode";
import ConfirmPasscode from "../components/auth/ConfirmPasscode";
import BiometricPrompt from "../components/auth/BiometricPrompt";
import WalletReady from "../components/auth/WalletReady";
import UnlockScreen from "../components/auth/UnlockScreen";
import ResetConfirmation from "../components/auth/ResetConfirmation";
import LoadingIndicator from "../components/auth/LoadingIndicator";
import MainDashboard from "../components/dashboard/MainDashboard";
import { storage } from "../utils/storage";
import { webauthn } from "../utils/webauthn";

function GatewayScreen() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletCreationStep, setWalletCreationStep] = useState(null);
  const [passcode, setPasscode] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [biometricError, setBiometricError] = useState("");

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

  const handlePasscodeConfirmed = () => {
    setWalletCreationStep('biometricPrompt');
  };

  const completeOnboarding = async (credentialId = null) => {
    const walletData = { privateKey: "super-secret-private-key" }; 
    await storage.saveEncryptedWallet(walletData, passcode);
    if (credentialId) {
        storage.setWebAuthnCredentialId(credentialId);
    }
    storage.setHasCompletedOnboarding();
    setWalletCreationStep('walletReady');
  };

  // QUICK FIX: Ensure we show loading while attempting biometric registration and DO NOT auto-complete onboarding on failure.
  const handleBiometricEnable = async () => {
    // Show loading immediately so user knows something is happening
    setIsLoading(true);
    setBiometricError("");

    try {
        const credentialId = await webauthn.register();
        // If registration returns a credentialId, proceed to complete onboarding with it
        if (credentialId) {
            // Keep loading while we persist and finish onboarding
            await completeOnboarding(credentialId);
        } else {
            // navigator.credentials.create may return null in some environments
            setBiometricError('Biometric registration did not complete. Please try again or skip.');
            setWalletCreationStep('biometricPrompt');
        }
    } catch (err) {
        console.error("Biometric registration failed:", err);
        // Do NOT proceed to completeOnboarding here. Let the user retry or skip.
        setBiometricError('Biometric registration failed. Make sure your device supports biometrics and try again, or skip.');
        setWalletCreationStep('biometricPrompt');
    } finally {
        setIsLoading(false);
    }
  };

  const handleBiometricSkip = async () => {
      setIsLoading(true);
      // Simulate a brief delay for a better user experience
      setTimeout(async () => {
        await completeOnboarding();
        setIsLoading(false);
    }, 1200);
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
      case 'biometricPrompt':
        return <BiometricPrompt onEnable={handleBiometricEnable} onSkip={handleBiometricSkip} error={biometricError} clearError={() => setBiometricError('')} />;
      case 'walletReady':
        return <WalletReady onContinue={handleWalletReadyContinue} />;
      default:
        return <OnboardingCarousel onCreateWallet={handleCreateWalletClick} />;
    }
  }

  return (
    <div className="cosmic-background min-h-screen flex flex-col justify-center items-center font-sans text-center overflow-hidden">
      <LoadingIndicator show={isLoading} />
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
