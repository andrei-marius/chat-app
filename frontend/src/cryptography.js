const { subtle } = crypto;

async function generateECDHKeyPair() {
  return await subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256"
    },
    true, 
    ["deriveKey", "deriveBits"]
  );
}

async function generateECDSAKeyPair() {
  return await subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256", 
    },
    true, 
    ["sign", "verify"] 
  );
}

async function exportPublicKey(keyPair) {
  return await subtle.exportKey("jwk", keyPair.publicKey); 
}

async function importECDHPublicKey(jwkPublicKey) {
  return await subtle.importKey(
    "jwk",
    jwkPublicKey,
    {
      name: "ECDH",
      namedCurve: "P-256"
    },
    true, 
    []
  );
}

async function importECDSAPublicKey(jwkPublicKey) {
  return await subtle.importKey(
    "jwk",
    jwkPublicKey,
    {
      name: "ECDSA",
      namedCurve: "P-256", 
    },
    true, 
    ["verify"] 
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

  const tag = new Uint8Array(ciphertext.slice(ciphertext.byteLength - 16)); // Extract authentication tag

  return {
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext.slice(0, ciphertext.byteLength - 16))), // Exclude the tag
    tag: Array.from(tag),
  };
}

async function decryptMessage(sharedKey, iv, ciphertext, tag) {
  try {
    // Append the authentication tag back to the ciphertext before decryption
    const fullCiphertext = new Uint8Array([...ciphertext, ...tag]);

    const decoder = new TextDecoder();
    const decrypted = await subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(iv),
        additionalData: new Uint8Array(0), // optional additional authenticated data
        tagLength: 128,
      },
      sharedKey,
      fullCiphertext
    );

    return decoder.decode(decrypted);
  } catch (err) {
    console.error("Decryption failed:", err);
  }
}

async function signMessage(privateKey, encryptedMessage) {
  const encoder = new TextEncoder();
  const messageToSign = encoder.encode(
    JSON.stringify({
      ciphertext: encryptedMessage.ciphertext,
      iv: encryptedMessage.iv,
      tag: encryptedMessage.tag,
    })
  );

  return await subtle.sign(
    {
      name: "ECDSA",
      namedCurve: "P-256", 
      hash: { name: "SHA-256" }, 
    },
    privateKey,
    messageToSign
  );
}

async function verifySignature(publicKey, encryptedMessage, signature) {
  const encoder = new TextEncoder();
  const messageToVerify = encoder.encode(
    JSON.stringify({
      ciphertext: encryptedMessage.ciphertext,
      iv: encryptedMessage.iv,
      tag: encryptedMessage.tag,
    })
  );

  return await subtle.verify(
    {
      name: "ECDSA",
      namedCurve: "P-256", 
      hash: { name: "SHA-256" },  
    },
    publicKey,
    signature,
    messageToVerify
  );
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
  generateECDHKeyPair,
  generateECDSAKeyPair,
  exportPublicKey,
  importECDHPublicKey,
  importECDSAPublicKey,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage,
  signMessage,
  verifySignature,
  exportPrivateKeyToHex,
  exportPublicKeyToHex,
  exportSharedKeyToHex,
}
