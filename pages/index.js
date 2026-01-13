import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      setUser(tg.initDataUnsafe?.user || null);
    }
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>⚡Swift Wallet</h1>

      {user ? (
        <p>Welcome, {user.first_name} 👋</p>
      ) : (
        <p>Opened outside Telegram</p>
      )}
    </main>
  );
}
