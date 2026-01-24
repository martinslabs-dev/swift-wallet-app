
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory } from 'bip32';
import * as ecc from 'tiny-secp256k1'; // Required for BIP32
import { NETWORKS } from './networks.js';

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
 * Derives a single-chain wallet from a private key.
 *
 * @param {string} privateKey The private key in hex or WIF format.
 * @param {string} networkId The ID of the network (e.g., 'mainnet', 'solana', 'bitcoin').
 * @returns {object|null} A wallet object for the specified chain or null if the network is not supported.
 */
export const deriveWalletFromPrivateKey = (privateKey, networkId) => {
    const network = NETWORKS[networkId];
    if (!network) return null;

    const wallet = {
        evm: null,
        solana: null,
        bitcoin: null,
        viewOnly: null
    };

    try {
        if (network.chainType === 'evm') {
            const evmWallet = new ethers.Wallet(privateKey);
            wallet.evm = {
                address: evmWallet.address,
                privateKey: evmWallet.privateKey,
            };
        } else if (network.chainType === 'solana') {
            const secretKey = Buffer.from(privateKey, 'hex');
            const solanaKeypair = Keypair.fromSecretKey(secretKey);
            wallet.solana = {
                address: solanaKeypair.publicKey.toBase58(),
                privateKey: privateKey,
            };
        } else if (network.chainType === 'bitcoin') {
            const keyPair = bitcoin.ECPair.fromWIF(privateKey, network.bitcoinjslib_network);
            const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: network.bitcoinjslib_network });
            wallet.bitcoin = {
                address: address,
                privateKey: privateKey,
            };
        }
        return wallet;
    } catch (error) {
        console.error("Failed to derive wallet from private key:", error);
        return null; // Return null on error
    }
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

/**
 * Creates a view-only wallet object.
 *
 * @param {string} address The public address.
 * @param {string} networkId The ID of the network.
 * @returns {object|null} A view-only wallet object or null if the network is not supported.
 */
export const createViewOnlyWallet = (address, networkId) => {
    const network = NETWORKS[networkId];
    if (!network) return null;

    const wallet = {
        evm: null,
        solana: null,
        bitcoin: null,
        viewOnly: {
            address: address,
            networkId: networkId
        }
    };
    
    if (network.chainType === 'evm') {
        wallet.evm = { address: address, privateKey: null };
    } else if (network.chainType === 'solana') {
        wallet.solana = { address: address, privateKey: null };
    } else if (network.chainType === 'bitcoin') {
        wallet.bitcoin = { address: address, privateKey: null };
    }

    return wallet;
};
