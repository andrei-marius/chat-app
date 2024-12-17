import { useEffect } from "react";
import { useContextCustom } from "../contexts/Context";
import { 
  exportPublicKey,
  importECDHPublicKey,
  importECDSAPublicKey,
  deriveSharedSecretKey,
  exportPublicKeyToHex,
  exportSharedKeyToHex,
} from "../cryptography";
import Chat from "../components/Chat";

const Home = () => {
  const { socket, ECDHKeyPair, ECDSAKeyPair, setSharedSecret, setClient2ECDSAPublicKey } = useContextCustom();
  
  useEffect(() => {
    sendPublicKeys();

    socket.on("exchangePublicKeys", async (client2PublicECDSAKeyJwk, client2PublicECDHKeyJwk, publicKeyHex) => {
      await exchangePublicKeys(client2PublicECDSAKeyJwk, client2PublicECDHKeyJwk, publicKeyHex);
    });
    
    return () => {
      socket.off("exchangePublicKeys");
      socket.off("connect");
    };
  }, [socket]);

  const getSharedSecret = async (client2PublicKey) => {
    const sharedSecret = await deriveSharedSecretKey(ECDHKeyPair.privateKey, client2PublicKey);
    setSharedSecret(sharedSecret)
    
    const sharedKeyHex = await exportSharedKeyToHex(sharedSecret);
    console.log(`Shared Key (Hex): ${sharedKeyHex}`);
  };

  const exchangePublicKeys = async (client2PublicECDSAKeyJwk, client2PublicECDHKeyJwk, publicKeyHex) => {
    const client2ECDHPublicKey = await importECDHPublicKey(client2PublicECDHKeyJwk);
    const client2ECDSAPublicKey = await importECDSAPublicKey(client2PublicECDSAKeyJwk);
    // console.log("Received public key:", client2PublicKey);
    console.log('client2 public key', publicKeyHex)
    setClient2ECDSAPublicKey(client2ECDSAPublicKey);
    await getSharedSecret(client2ECDHPublicKey);
  }

  async function sendPublicKeys() {
    const publicECDHKeyJwk = await exportPublicKey(ECDHKeyPair);
    const publicECDSAKeyJwk = await exportPublicKey(ECDSAKeyPair);
    const publicKeyHex = await exportPublicKeyToHex(ECDHKeyPair.publicKey);
    socket.emit('sendPublicKeys', publicECDSAKeyJwk, publicECDHKeyJwk, publicKeyHex);
  }

  return (
    <Chat />
  );
};

export default Home;
