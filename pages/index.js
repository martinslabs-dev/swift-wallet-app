import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;

      tg.ready(); // tell Telegram the app is ready
      setIsTelegram(true);

      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser) {
        setUser(telegramUser);
      }
    }
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>⚡ Swift Wallet</h1>

      {!isTelegram && (
        <p style={{ color: "red" }}>
          Open this app inside Telegram
        </p>
      )}

      {user && (
        <div>
          <p>Welcome, {user.first_name} 👋</p>
          <p>Username: @{user.username}</p>
          <p>User ID: {user.id}</p>
        </div>
      )}
    </main>
  );
  }
