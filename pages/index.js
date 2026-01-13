import React from "react";
import dynamic from "next/dynamic";
import { ethers } from "ethers";

const MAX_WALLETS = 5;
const STORAGE_KEY = "swift_wallets";

function TelegramApp() {
  const [step, setStep] = React.useState("start"); 
  // start | show-seed | confirm | wallet

  const [mnemonic, setMnemonic] = React.useState(null);

  const [wallets, setWallets] = React.useState([]);
  const [activeWalletId, setActiveWalletId] = React.useState(null);

  const [pendingWallet, setPendingWallet] = React.useState(null);
  const [mounted, setMounted] = React.useState(false);

  // ---------- INIT ----------
  React.useEffect(() => {
    setMounted(true);

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setWallets(parsed.wallets || []);
      setActiveWalletId(parsed.activeWalletId || null);
      if (parsed.wallets?.length > 0) {
        setStep("wallet");
      }
    }
  }, []);

  if (!mounted) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  // ---------- HELPERS ----------
  function generateSeed() {
    const w = ethers.Wallet.createRandom();
    return {
      id: `wallet-${Date.now()}`,
      address: w.address,
      privateKey: w.privateKey,
      mnemonic: w.mnemonic.phrase,
    };
  }

  function saveWallets(updatedWallets, newActiveId) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        wallets: updatedWallets,
        activeWalletId: newActiveId,
      })
    );
  }

  function getActiveWallet() {
    return wallets.find(w => w.id === activeWalletId);
  }

  const activeWallet = getActiveWallet();

  // ---------- UI ----------
  return (
    <main style={{ padding: 20 }}>
      {/* STEP 1: START */}
      {step === "start" && (
        <>
          <h1>⚡ Swift Wallet</h1>
          <p>Create a new wallet</p>

          {wallets.length >= MAX_WALLETS && (
            <p style={{ color: "red" }}>
              Maximum of {MAX_WALLETS} wallets reached
            </p>
          )}

          <button
            disabled={wallets.length >= MAX_WALLETS}
            onClick={() => {
              const w = generateSeed();
              setPendingWallet(w);
              setMnemonic(w.mnemonic);
              setStep("show-seed");
            }}
          >
            Create Wallet
          </button>
        </>
      )}

      {/* STEP 2: SHOW SEED */}
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

      {/* STEP 3: CONFIRM */}
      {step === "confirm" && (
        <>
          <h2>Confirm</h2>
          <p>
            If you lose your recovery phrase, you lose access to your wallet.
          </p>

          <button
            onClick={() => {
              const updatedWallets = [...wallets, pendingWallet];
              setWallets(updatedWallets);
              setActiveWalletId(pendingWallet.id);
              saveWallets(updatedWallets, pendingWallet.id);

              setPendingWallet(null);
              setMnemonic(null);
              setStep("wallet");
            }}
          >
            Continue
          </button>
        </>
      )}

      {/* STEP 4: WALLET HOME */}
      {step === "wallet" && activeWallet && (
        <>
          <h2>Your Wallet</h2>

          <p><strong>Active Address:</strong></p>
          <p>{activeWallet.address}</p>

          <h3 style={{ marginTop: 20 }}>Your Wallets</h3>

          {wallets.map(w => (
            <div
              key={w.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                background: "#111",
                padding: 8,
              }}
            >
              <span
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setActiveWalletId(w.id);
                  saveWallets(wallets, w.id);
                }}
              >
                {w.address.slice(0, 6)}...{w.address.slice(-4)}
              </span>

              <button
                style={{ color: "red" }}
                onClick={() => {
                  const updated = wallets.filter(x => x.id !== w.id);
                  const newActive =
                    w.id === activeWalletId
                      ? updated[0]?.id || null
                      : activeWalletId;

                  setWallets(updated);
                  setActiveWalletId(newActive);
                  saveWallets(updated, newActive);

                  if (updated.length === 0) {
                    setStep("start");
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}

          {wallets.length < MAX_WALLETS && (
            <button
              style={{ marginTop: 20 }}
              onClick={() => setStep("start")}
            >
              Create Another Wallet
            </button>
          )}
        </>
      )}
    </main>
  );
}

export default dynamic(() => Promise.resolve(TelegramApp), {
  ssr: false,
});
