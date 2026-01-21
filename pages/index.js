import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import OnboardingCarousel from "../components/OnboardingCarousel";
import CreatePasscode from "../components/auth/CreatePasscode";
import ConfirmPasscode from "../components/auth/ConfirmPasscode";
import EnableBiometrics from "../components/auth/EnableBiometrics";
import UnlockScreen from "../components/auth/UnlockScreen";
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

  useEffect(() => {
    setMounted(true);
    const onboardingStatus = storage.hasCompletedOnboarding();
    setHasCompletedOnboarding(onboardingStatus);
    const biometricsStatus = !!storage.getWebAuthnCredentialId();
    setHasBiometrics(biometricsStatus);

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

  const handleCreateWalletClick = () => {
    setWalletCreationStep('createPasscode');
  };

  const handlePasscodeCreated = (newPasscode) => {
    setPasscode(newPasscode);
    setWalletCreationStep('confirmPasscode');
  };

  const handlePasscodeConfirmed = async () => {
    const walletData = { privateKey: "super-secret-private-key" }; // Mock wallet data
    await storage.saveEncryptedWallet(walletData, passcode);
    setWalletCreationStep('enableBiometrics');
  };

  const handleBiometricsEnabled = async () => {
    try {
        const credentialId = await webauthn.register();
        storage.setWebAuthnCredentialId(credentialId);
        storage.setHasCompletedOnboarding();
        setIsUnlocked(true); // Go to main app
    } catch (err) {
        console.error("Biometric registration failed", err);
        // If it fails, we still complete onboarding, just without biometrics
        handleSkipBiometrics();
    }
  };

  const handleSkipBiometrics = () => {
    storage.setHasCompletedOnboarding();
    setIsUnlocked(true); // Go to main app
  };

  const handleBack = () => {
    setWalletCreationStep('createPasscode');
  };

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

  const renderCreationStep = () => {
    if (isUnlocked) {
        // This is where your main application would be rendered
        return <div className="text-white">Welcome to your wallet!</div>
    }

    if (hasCompletedOnboarding) {
        return <UnlockScreen onUnlock={handleUnlock} hasBiometrics={hasBiometrics} onBiometricUnlock={handleBiometricUnlock} error={unlockError} clearError={() => setUnlockError('')} />
    }

    switch (walletCreationStep) {
      case 'createPasscode':
        return <CreatePasscode onPasscodeCreated={handlePasscodeCreated} />;
      case 'confirmPasscode':
        return <ConfirmPasscode originalPasscode={passcode} onPasscodeConfirmed={handlePasscodeConfirmed} onBack={handleBack} />;
      case 'enableBiometrics':
        return <EnableBiometrics onEnable={handleBiometricsEnabled} onSkip={handleSkipBiometrics} />;
      default:
        return <OnboardingCarousel onCreateWallet={handleCreateWalletClick} />;
    }
  }

  return (
    <div className="cosmic-background min-h-screen flex flex-col justify-center items-center font-sans text-center overflow-hidden">
      <main className="w-full h-full flex flex-col justify-center">
         {renderCreationStep()}
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(GatewayScreen), {
  ssr: false,
});
