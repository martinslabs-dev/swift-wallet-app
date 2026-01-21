
const iv = new Uint8Array(12); // Initialization vector

async function getKey(password, salt) {
    const passwordBuffer = new TextEncoder().encode(password);
    const importedKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        importedKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

export async function encrypt(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await getKey(password, salt);
    const dataBuffer = new TextEncoder().encode(JSON.stringify(data));
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataBuffer
    );
    const saltAndEncryptedData = new Uint8Array([...salt, ...new Uint8Array(encryptedBuffer)]);
    return Buffer.from(saltAndEncryptedData).toString('base64');
}

export async function decrypt(encryptedData, password) {
    try {
        const saltAndEncryptedData = new Uint8Array(Buffer.from(encryptedData, 'base64'));
        const salt = saltAndEncryptedData.slice(0, 16);
        const encryptedBuffer = saltAndEncryptedData.slice(16);
        const key = await getKey(password, salt);
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedBuffer
        );
        return JSON.parse(new TextDecoder().decode(decryptedBuffer));
    } catch (e) {
        console.error("Decryption failed", e);
        return null;
    }
}
