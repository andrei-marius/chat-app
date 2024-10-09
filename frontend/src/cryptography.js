const { subtle } = crypto;

async function generateAesKey(length = 256) {
  const key = await subtle.generateKey(
    {
      name: "AES-CBC",
      length,
    },
    true,
    ["encrypt", "decrypt"]
  );

  return key;
}

async function aesEncrypt(plaintext) {
  const ec = new TextEncoder();
  const key = await generateAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv,
    },
    key,
    ec.encode(plaintext)
  );

  const exportedKey = await crypto.subtle.exportKey("jwk", key);

  return {
    key: exportedKey,
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(ciphertext)),
  };
}

async function importKey(key) {
  const keyNew = await crypto.subtle.importKey(
    "jwk",
    key,
    {
      name: "AES-CBC",
    },
    false,
    ["decrypt"]
  );

  return keyNew;
}

async function aesDecrypt(ciphertext, key, iv) {
  const dec = new TextDecoder();
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: new Uint8Array(iv),
    },
    key,
    new Uint8Array(ciphertext)
  );

  return dec.decode(plaintext);
}

export { aesEncrypt, aesDecrypt, importKey };
