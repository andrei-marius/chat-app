import { useEffect } from "react";
import { useContextCustom } from "../contexts/Context";
import { 
  exportPublicKey,
  importPublicKey,
  deriveSharedSecret,
  exportPublicKeyToHex,
  exportSharedKeyToHex,
  deriveRootChainKeys,
  exportHKDF,
} from "../cryptography";
import Chat from "../components/Chat";

const Home = () => {
  const { socket, keyPair, setSharedSecret } = useContextCustom();
  
  useEffect(() => {
    sendPublicKey();

    socket.on("exchangePublicKey", async (client2PublicKeyJwk, publicKeyHex) => {
      await exchangePublicKey(client2PublicKeyJwk, publicKeyHex);
    });
    
    return () => {
      socket.off("exchangePublicKey");
      socket.off("connect");
    };
  }, []);
  // broke the encryption of messages
  const getSharedSecret = async (client2PublicKey) => {
    const sharedSecret = await deriveSharedSecret(keyPair.privateKey, client2PublicKey);
      setSharedSecret(sharedSecret);
    
    const sharedKeyHex = await exportSharedKeyToHex(sharedSecret);
      console.log(`Shared Key (Hex): ${sharedKeyHex}`);
     // test of kdf function keyPair.privateKey should be the rootKey (the first shared secret) or last key in the chain. sharedSecret should the the new DH output from dh ratchet 
      const { newRootKey, chainKey } = await deriveRootChainKeys(keyPair.privateKey, sharedSecret);
      const newRootKeyJWk = await exportHKDF(newRootKey);
      const chainKeyJWK = await exportHKDF(chainKey);
      console.log("HKDF KEYS",newRootKeyJWk, chainKeyJWK);
  };

  const exchangePublicKey = async (client2PublicKeyJwk, publicKeyHex) => {
    const client2PublicKey = await importPublicKey(client2PublicKeyJwk);
    // console.log("Received public key:", client2PublicKey);
    console.log('client2 public key', publicKeyHex)
    await getSharedSecret(client2PublicKey);
  }

  async function sendPublicKey() {
    const publicKeyJwk = await exportPublicKey(keyPair);
    const publicKeyHex = await exportPublicKeyToHex(keyPair.publicKey);
    socket.emit('sendPublicKey', publicKeyJwk, publicKeyHex);
  }

  return (
    <Chat />
  );
};

export default Home;
