import React from "react";
import dynamic from "next/dynamic";

function Home() {
  return <TelegramApp />;
}

function TelegramApp() {
  const [mounted, setMounted] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    setMounted(true);

    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();

      setUser(tg.initDataUnsafe?.user || null);
    }
  }, []);

  if (!mounted) {
    return <p style={{ padding: 20 }}>Loading...</p>;
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>⚡ Swift Wallet</h1>

      {user ? (
        <p>Welcome, {user.first_name} 👋</p>
      ) : (
        <p>Opened inside Telegram, but no user data</p>
      )}
    </main>
  );
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
