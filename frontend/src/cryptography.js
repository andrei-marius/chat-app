const { subtle } = crypto;

async function generateKeyPair() {
  return await subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-521"
    },
    true, 
    ["deriveKey", "deriveBits"]
  );
}
async function deriveRootChainKeys(rootKey, dhOutput) {
    // Import the root key as HKDF input key material (IKM)
    const hkdfKey = await subtle.importKey(
        "jwk",
        rootKey,
        { name: "HKDF" },
        false,
        ["deriveKey"]
    );

    // Derive the new root key and chain key
    const derivedKeys = await subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: dhOutput,  // New DH shared secret as salt
            info: new Uint8Array([]),  // Additional context if needed
        },
        hkdfKey,
        { name: "HKDF", length: 512 },  // Derive 512 bits (64 bytes) to split into two keys
        true,
        ["deriveBits"]
    );

    // Split derived bits into two keys: new root key and chain key
    const bits = new Uint8Array(await subtle.exportKey("jwk", derivedKeys));
    const newRootKey = bits.slice(0, 32);  // First 32 bytes for the new root key
    const chainKey = bits.slice(32, 64);   // Next 32 bytes for the output chain key

    return { newRootKey, chainKey };
}

async function exportPublicKey(keyPair) {
  return await subtle.exportKey("jwk", keyPair.publicKey); 
}
async function exportHKDF(keyPair) {
    return await subtle.exportKey("jwk", keyPair);
}

async function importPublicKey(jwkPublicKey) {
  return await subtle.importKey(
    "jwk",
    jwkPublicKey,
    {
      name: "ECDH",
      namedCurve: "P-521"
    },
    false, 
    []
  );
}

async function deriveSharedSecret(privateKey, publicKey) {
  return await subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey, 
    },
    privateKey, 
    {
      name: "AES-GCM",
      length: 256, 
    },
    true, 
    ["encrypt", "decrypt"] 
  );
}

async function encryptMessage(sharedKey, message) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); 
  const encoder = new TextEncoder();
  const ciphertext = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    sharedKey, 
    encoder.encode(message) 
  );

  return {
    iv: Array.from(iv), 
    ciphertext: Array.from(new Uint8Array(ciphertext))
  };
}

async function decryptMessage(sharedKey, iv, ciphertext) {
  const decoder = new TextDecoder();
  const decrypted = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(iv), 
    },
    sharedKey, 
    new Uint8Array(ciphertext) 
  );

  return decoder.decode(decrypted); 
}

async function exportPrivateKeyToHex(privateKey) {
  const exported = await subtle.exportKey("pkcs8", privateKey);
  const byteArray = new Uint8Array(exported);
  
  return Array.from(byteArray)
      .map(byte => ('0' + byte.toString(16)).slice(-2)) 
      .join('');
}

async function exportPublicKeyToHex(publicKey) {
  const exported = await subtle.exportKey("spki", publicKey);
  const byteArray = new Uint8Array(exported);
  
  return Array.from(byteArray)
      .map(byte => ('0' + byte.toString(16)).slice(-2))
      .join('');
}

async function exportSharedKeyToHex(key) {
  const exported = await subtle.exportKey("raw", key);
  const byteArray = new Uint8Array(exported);

  return Array.from(byteArray)
      .map(byte => ('0' + byte.toString(16)).slice(-2)) 
      .join('');
}

export {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage,
  exportPrivateKeyToHex,
  exportPublicKeyToHex,
  exportSharedKeyToHex,
  deriveRootChainKeys,
  exportHKDF,
}
