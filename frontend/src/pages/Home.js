import { useEffect } from "react";
import { useContextCustom } from "../contexts/Context";
import { 
  exportPublicKey,
  importPublicKey,
  deriveSharedSecret,
  exportPublicKeyToHex,
  exportSharedKeyToHex,
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

  const getSharedSecret = async (client2PublicKey) => {
    const sharedSecret = await deriveSharedSecret(keyPair.privateKey, client2PublicKey);
    setSharedSecret(sharedSecret)
    
    const sharedKeyHex = await exportSharedKeyToHex(sharedSecret);
    console.log(`Shared Key (Hex): ${sharedKeyHex}`);
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
