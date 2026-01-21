import { generateRegistrationOptions } from '@simplewebauthn/server';
import { verifyInitData } from '../../../lib/telegram/verifyInitData';
import { serverStore } from '../../../lib/webauthn/serverStore';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { initData, displayName } = req.body || {};
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return res.status(500).json({ error: 'Server misconfiguration' });

  try {
    const init = verifyInitData(initData, botToken);
    const telegramUserId = String(init.user.id);

    const rpName = process.env.NEXT_PUBLIC_RP_NAME || 'Swift Wallet';
    const rpID = process.env.NEXT_PUBLIC_RP_ID || (req.headers.host || 'localhost').split(':')[0];

    const userId = telegramUserId;
    const userName = displayName || init.user.username || init.user.first_name || `tg_${userId}`;

    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
      userName,
      attestationType: 'indirect',
      authenticatorSelection: {
        residentKey: 'discouraged',
        userVerification: 'preferred',
      },
      supportedAlgorithmIDs: [-7, -257],
    });

    // store challenge tied to user
    serverStore.saveChallengeForUser(userId, options.challenge);

    return res.status(200).json(options);
  } catch (err) {
    console.error('register/options error', err);
    return res.status(400).json({ error: 'Invalid initData or request' });
  }
}