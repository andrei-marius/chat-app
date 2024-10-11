import { useState, useEffect } from "react";
import { useContextCustom } from "../contexts/Context";
import NavBar from "../components/NavBar";
import { 
  encryptMessage,
  decryptMessage,
} from "../cryptography";

function Chat() {
  const { socket, displayName, sharedSecret } = useContextCustom();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("chatMessage", async (encryptedMsg, displayName) => {
      chatMessage(encryptedMsg, displayName);
    });
    
    return () => {
      socket.off("chatMessage");
      socket.off("connect");
    };
  }, [sharedSecret]);

  const chatMessage = async (encryptedMsg, latestSenderDisplayName) => {
    const { ciphertext, iv } = encryptedMsg;

    try {
      console.log(sharedSecret, iv, ciphertext);
      const decryptedMsg = await decryptMessage(sharedSecret, iv, ciphertext);
      const newMsg = { msg: decryptedMsg, displayName: latestSenderDisplayName };
      setChat((prevChat) => [...prevChat, newMsg]);
    } catch (err) {
      console.error("Decryption failed:", err);
    }
  };
    
  const sendMessage = async (e) => {
    e.preventDefault();

    if (message.trim()) {
      console.log(sharedSecret, message);
      const encryptedMsg = await encryptMessage(sharedSecret, message);
      socket.emit("chatMessage", encryptedMsg, displayName);
      setMessage("");
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
