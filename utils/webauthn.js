
function bufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function base64ToBuffer(base64) {
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const str = atob(base64 + padding);
    const buffer = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        buffer[i] = str.charCodeAt(i);
    }
    return buffer;
}

export const webauthn = {
    register: async () => {
        // These details would normally come from your server
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const userId = crypto.getRandomValues(new Uint8Array(16));

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: challenge,
                rp: { name: "Your App Name" }, // Set your Relying Party name
                user: {
                    id: userId,
                    name: "user@example.com", // A user-friendly name
                    displayName: "User",
                },
                pubKeyCredParams: [{ type: 'public-key', alg: -7 }], // ES256 algorithm
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'required',
                },
                timeout: 60000,
                attestation: 'direct'
            }
        });

        // In a real app, you would send this credential object to your server for verification and storage.
        // For this demo, we'll just store the credential ID in local storage.
        const credentialId = bufferToBase64(credential.rawId);
        console.log("Registration successful! Credential ID:", credentialId);

        return credentialId;
    },

    authenticate: async (credentialId) => {
        const challenge = crypto.getRandomValues(new Uint8Array(32));

        try {
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    allowCredentials: [{
                        type: 'public-key',
                        id: base64ToBuffer(credentialId),
                        transports: ['internal'],
                    }],
                    userVerification: 'required',
                }
            });

            // In a real app, you'd send this assertion to your server for verification.
            // For this demo, we'll just log it and assume it's successful.
            console.log("Authentication successful!", credential);
            return true;
        } catch (err) {
            console.error("Authentication failed:", err);
            return false;
        }
    }
};
