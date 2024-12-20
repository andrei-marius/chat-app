import { useState, useEffect } from "react";
import { useContextCustom } from "../contexts/Context";
import NavBar from "../components/NavBar";
import { 
  encryptMessage,
  decryptMessage,
  signMessage,
  verifySignature,
} from "../cryptography";

function Chat() {
  const { socket, displayName, sharedSecret, ECDSAKeyPair, client2ECDSAPublicKey } = useContextCustom();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("chatMessageVerifyAndDecryptAndUpdate", async (encryptedMsg, signature, latestSenderDisplayName) => {
      await verifyAndDecrypt(encryptedMsg, signature, latestSenderDisplayName);
    });
    
    return () => {
      socket.off("chatMessage");
    };
  }, [sharedSecret, socket]);

  const verifyAndDecrypt = async (encryptedMsg, signature, latestSenderDisplayName) => {
    const { ciphertext, iv, tag } = encryptedMsg;

    if (client2ECDSAPublicKey) {
      const isVerified = await verifySignature(client2ECDSAPublicKey, encryptedMsg, signature);
      
      if (isVerified) {
        const decryptedMsg = await decryptMessage(sharedSecret, iv, ciphertext, tag);
        updateChat(decryptedMsg, latestSenderDisplayName)
      } else {
        console.error("Signature verification failed");
      }
    }
  }

  const updateChat = (decryptedMsg, latestSenderDisplayName) => {
    setChat((prevChat) => [...prevChat, { msg: decryptedMsg || message, displayName: latestSenderDisplayName || displayName }]);
    setMessage("");
  }
    
  const sendMessage = async (e) => {
    e.preventDefault();

    if (message.trim()) {
      const encryptedMsg = await encryptMessage(sharedSecret, message);
      const signature = await signMessage(ECDSAKeyPair.privateKey, encryptedMsg);
      socket.emit("chatMessage", encryptedMsg, signature, displayName);
      updateChat()
    }
  };

  return (
    <div style={styles.container}>
      <NavBar />
      <div style={styles.chatWindow}>
        {chat.map((msg, index) => (
          <div
            key={index}
            style={{
              backgroundColor: displayName === msg.displayName ? "gainsboro" : "unset",
              alignSelf: displayName === msg.displayName ? "end" : "start",
              ...styles.message,
            }}
          >
            {msg.displayName}: {msg.msg}
          </div>
        ))}
      </div>
      <form style={styles.sendMsgForm} onSubmit={sendMessage}>
        <input
          style={styles.msgInput}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button style={styles.sendBtn} type="submit">
          SEND
        </button>
      </form>
        Chat as {displayName}
    </div>
  );
};

export default Chat;

const styles = {
  container: {
    textAlign: 'center',
  },
  chatWindow: {
    border: "1px solid #ccc",
    height: "400px",
    width: "300px",
    margin: "0 auto",
    overflowY: "scroll",
    padding: 10,
    display: "flex",
    flexDirection: "column",
  },
  sendMsgForm: {
    display: "flex",
    justifyContent: "center",
  },
  msgInput: {
    padding: 10,
  },
  sendBtn: {
    padding: 10,
  },
  message: {
    width: "fit-content",
    padding: 5,
  },
};
