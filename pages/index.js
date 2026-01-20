import React from "react";
import dynamic from "next/dynamic";

// A more fitting icon for the new theme
const SwapIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="#E5E7EB" // A light gray, not pure white
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M16.5 3L21 7.5m0 0L16.5 12M21 7.5H3"
    />
  </svg>
);

function CosmicBridgeApp() {
  const [mounted, setMounted] = React.useState(false);
  const [isFromActive, setFromActive] = React.useState(false);
  const [isToActive, setToActive] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      // Set the background color of the Telegram app to match our theme
      window.Telegram.WebApp.setHeaderColor('#0B0F1A');
      window.Telegram.WebApp.setBackgroundColor('#0B0F1A');
    }
  }, []);

  if (!mounted) {
    return <div className="cosmic-background w-full h-screen"></div>; // Show background during SSR
  }

  return (
    <div className="cosmic-background min-h-screen p-4 flex flex-col justify-center items-center font-sans">
      <main className="w-full max-w-md mx-auto">
        {/* Header - Minimalist approach */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-wider">COSMIC BRIDGE</h1>
          <p className="text-light-cyan/80 text-sm">The seamless path between blockchains</p>
        </header>

        <div className="relative flex flex-col items-center justify-center space-y-2">
          {/* From Card */}
          <div className={`glass-card w-full p-4 ${isFromActive ? 'active' : ''}`}>
              <div className="flex justify-between text-gray-300 text-sm mb-2">
                  <span>From</span>
              </div>
              <div className="flex justify-between items-center">
                  <input
                      type="number"
                      placeholder="0.0"
                      className="bg-transparent text-white text-4xl font-light focus:outline-none w-1/2"
                      onFocus={() => { setFromActive(true); setToActive(false); }}
                  />
                  <button className="bg-gray-800/50 hover:bg-gray-700/70 border border-glass-border text-white px-5 py-3 rounded-xl flex items-center space-x-3 transition-colors">
                      <div className="w-8 h-8 bg-blue-500 rounded-full"></div> {/* Placeholder */}
                      <span className="font-bold text-lg">ETH</span>
                      <span>&gt;</span>
                  </button>
              </div>
              <div className="text-gray-400 text-sm mt-1">$0.00</div>
          </div>

          {/* Swap Orb */}
          <div className="swap-orb z-10">
            <SwapIcon />
          </div>

          {/* To Card */}
          <div className={`glass-card w-full p-4 ${isToActive ? 'active' : ''}`}>
              <div className="flex justify-between text-gray-300 text-sm mb-2">
                  <span>To</span>
              </div>
              <div className="flex justify-between items-center">
                  <input
                      type="text"
                      placeholder="0.0"
                      className="bg-transparent text-white text-4xl font-light focus:outline-none w-1/2 cursor-default"
                      readOnly
                  />
                  <button 
                    onClick={() => { setToActive(true); setFromActive(false); }}
                    className="bg-energy-gradient text-black px-5 py-3 rounded-xl font-bold text-lg flex items-center space-x-2 transition-transform hover:scale-105">
                      <span>SELECT TOKEN</span>
                      <span>&gt;</span>
                  </button>
              </div>
              <div className="text-gray-400 text-sm mt-1">$0.00</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button className="w-full bg-energy-gradient text-black py-4 rounded-xl font-bold text-xl tracking-wider transition-transform hover:scale-105 animate-pulse-glow">
            CONNECT WALLET
          </button>
        </div>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(CosmicBridgeApp), {
  ssr: false,
});
