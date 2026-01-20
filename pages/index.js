import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AnimatedShowcase from "../components/AnimatedShowcase";

function GatewayScreen() {
  const [mounted, setMounted] = useState(false);

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

  return (
    <div className="cosmic-background min-h-screen flex flex-col justify-center items-center p-6 font-sans text-center overflow-hidden">
      <main className="w-full max-w-sm mx-auto flex flex-col justify-center" style={{minHeight: '80vh'}}>
        
        {/* Header - Integrated into the showcase */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide mb-4" style={{textShadow: '0 0 10px rgba(255,255,255,0.3)'}}>
          Swift Wallet
        </h1>

        {/* Dynamic Animated Showcase */}
        <AnimatedShowcase />

        {/* Action Buttons */}
        <div className="space-y-4">
          <button className="w-full bg-energy-gradient text-black py-4 rounded-xl font-bold text-xl tracking-wider transition-transform hover:scale-105 animate-pulse-glow shadow-lg shadow-cyan-500/20">
            Create New Wallet
          </button>
          <button className="w-full bg-glass-white/80 border border-glass-border text-black py-3.5 rounded-xl font-semibold text-lg hover:bg-glass-white transition-colors duration-300">
            Import Existing Wallet
          </button>
        </div>

        {/* Footer Text */}
        <div className="mt-10 text-gray-500 text-xs">
            <p>By proceeding, you agree to our</p>
            <p><a href="#" className="underline hover:text-light-cyan/80 transition-colors">Terms of Service</a> & <a href="#" className="underline hover:text-light-cyan/80 transition-colors">Privacy Policy</a>.</p>
        </div>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(GatewayScreen), {
  ssr: false,
});
