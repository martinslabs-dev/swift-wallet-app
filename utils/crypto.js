
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
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await getKey(password, salt);
    const dataBuffer = new TextEncoder().encode(JSON.stringify(data));
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        dataBuffer
    );
    const saltAndEncryptedData = new Uint8Array([...salt, ...iv, ...new Uint8Array(encryptedBuffer)]);
    return Buffer.from(saltAndEncryptedData).toString('base64');
}

export async function decrypt(encryptedData, password) {
    try {
        // Try new format first (salt + iv + data)
        const saltIvAndEncryptedData = new Uint8Array(Buffer.from(encryptedData, 'base64'));
        const salt = saltIvAndEncryptedData.slice(0, 16);
        const iv = saltIvAndEncryptedData.slice(16, 28);
        const encryptedBuffer = saltIvAndEncryptedData.slice(28);
        const key = await getKey(password, salt);
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedBuffer
        );
        return JSON.parse(new TextDecoder().decode(decryptedBuffer));
    } catch (e) {
        console.warn("Decryption with new format failed, attempting fallback to old format.", e);
        // Fallback to old format (salt + data)
        try {
            const saltAndEncryptedData = new Uint8Array(Buffer.from(encryptedData, 'base64'));
            const salt = saltAndEncryptedData.slice(0, 16);
            const encryptedBuffer = saltAndEncryptedData.slice(16);
            const key = await getKey(password, salt);
            const staticIv = new Uint8Array(12); // The old, static IV
            const decryptedBuffer = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: staticIv },
                key,
                encryptedBuffer
            );
            return JSON.parse(new TextDecoder().decode(decryptedBuffer));
        } catch (e2) {
            console.error("Decryption failed with both new and old formats.", e2);
            return null;
        }
    }
}
