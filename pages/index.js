
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import OnboardingCarousel from "../components/OnboardingCarousel";
import CreatePasscode from "../components/auth/CreatePasscode";
import ConfirmPasscode from "../components/auth/ConfirmPasscode";

function GatewayScreen() {
  const [mounted, setMounted] = useState(false);
  const [walletCreationStep, setWalletCreationStep] = useState(null);
  const [passcode, setPasscode] = useState("");

  useEffect(() => {
    setMounted(true);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#0B0F1A');
      window.Telegram.WebApp.setBackgroundColor('#0B0F1A');
    }
  }, []);

  if (!mounted) {
    return <div className="cosmic-background w-full h-screen" />; // Render background for smooth transition
  }

  const handleCreateWalletClick = () => {
    setWalletCreationStep('createPasscode');
  };

  const handlePasscodeCreated = (newPasscode) => {
    setPasscode(newPasscode);
    setWalletCreationStep('confirmPasscode');
  };

  const handlePasscodeConfirmed = () => {
    // For now, just log it. In Phase 2, we'll navigate to the biometrics step.
    console.log("Wallet creation complete! Passcode:", passcode);
    // Reset the flow for now
    setWalletCreationStep(null);
  };

  const renderCreationStep = () => {
    switch (walletCreationStep) {
      case 'createPasscode':
        return <CreatePasscode onPasscodeCreated={handlePasscodeCreated} />;
      case 'confirmPasscode':
        return <ConfirmPasscode originalPasscode={passcode} onPasscodeConfirmed={handlePasscodeConfirmed} />;
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
