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

async function exportPublicKey(keyPair) {
  return await subtle.exportKey("jwk", keyPair.publicKey); 
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
}
