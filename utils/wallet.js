
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1'; // Required for BIP32

// --- Instantiate BIP32 with the elliptic curve library ---
const bip32 = BIP32Factory(ecc);

/**
 * Derives a full multi-chain wallet from a mnemonic phrase.
 * 
 * @param {string} mnemonic The 12-word secret phrase.
 * @returns {object} An object containing the derived keys and addresses for all supported chains.
 */
export const deriveWalletFromMnemonic = async (mnemonic) => {
    // --- 1. Derive the master seed from the mnemonic --- 
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bip32.fromSeed(seed); // Create a root HD node

    // --- 2. Derive the EVM-compatible wallet (Ethereum, Polygon, etc.) ---
    const evmWallet = ethers.Wallet.fromPhrase(mnemonic);

    // --- 3. Derive the Solana wallet ---
    const solanaSeed = seed.slice(0, 32);
    const solanaKeypair = Keypair.fromSeed(solanaSeed); 

    // --- 4. Derive the Bitcoin wallet (Native SegWit - P2WPKH) ---
    // Derivation path: m/84'/0'/0'/0/0
    const btcChild = root.derivePath("m/84'/0'/0'/0/0");
    const btcAddress = bitcoin.payments.p2wpkh({ pubkey: btcChild.publicKey }).address;
    const btcPrivateKey = btcChild.toWIF(); // Wallet Import Format

    return {
        mnemonic: mnemonic,
        evm: {
            address: evmWallet.address,
            privateKey: evmWallet.privateKey,
        },
        solana: {
            address: solanaKeypair.publicKey.toBase58(),
            privateKey: Buffer.from(solanaKeypair.secretKey).toString('hex'),
        },
        bitcoin: {
            address: btcAddress,
            privateKey: btcPrivateKey,
        }
    };
};

/**
 * Reconstructs a wallet object from stored encrypted data.
 * 
 * @param {object} walletData The decrypted wallet data.
 * @returns {object} The reconstructed wallet object.
 */
export const reconstructWallet = (walletData) => {
    return walletData;
};
