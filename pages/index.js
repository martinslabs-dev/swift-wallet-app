import React from "react";
import dynamic from "next/dynamic";
import { ethers } from "ethers";

function TelegramApp() {
  const [step, setStep] = React.useState("start");
  const [mnemonic, setMnemonic] = React.useState(null);
  const [wallet, setWallet] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }

    const saved = localStorage.getItem("swift_wallet");
    if (saved) {
      setWallet(JSON.parse(saved));
      setStep("wallet");
    }
  }, []);

  if (!mounted) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  function generateSeed() {
    const w = ethers.Wallet.createRandom();
    return {
      address: w.address,
      privateKey: w.privateKey,
      mnemonic: w.mnemonic.phrase,
    };
  }

  return (
    <main style={{ padding: 20 }}>
      {step === "start" && (
        <>
          <h1>⚡ Swift Wallet</h1>
          <p>Create a new wallet</p>

          <button
            onClick={() => {
              const data = generateSeed();
              setMnemonic(data.mnemonic);
              setWallet(data);
              setStep("show-seed");
            }}
          >
            Create Wallet
          </button>
        </>
      )}

      {step === "show-seed" && (
        <>
          <h2>Write down your recovery phrase</h2>

          <div style={{ background: "#111", padding: 12 }}>
            {mnemonic}
          </div>

          <p style={{ color: "red" }}>
            Never share this phrase with anyone.
          </p>

          <button onClick={() => setStep("confirm")}>
            I have written it down
          </button>
        </>
      )}

      {step === "confirm" && (
        <>
          <h2>Confirm</h2>
          <p>
            If you lose your recovery phrase, you lose access to your wallet.
          </p>

          <button
            onClick={() => {
              localStorage.setItem(
                "swift_wallet",
                JSON.stringify(wallet)
              );
              setStep("wallet");
            }}
          >
            Continue
          </button>
        </>
      )}

      {step === "wallet" && (
        <>
          <h2>Your Wallet</h2>
          <p><strong>Address:</strong></p>
          <p>{wallet.address}</p>
        </>
      )}
    </main>
  );
}

export default dynamic(() => Promise.resolve(TelegramApp), {
  ssr: false,
});
