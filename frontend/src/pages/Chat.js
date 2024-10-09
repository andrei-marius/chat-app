import { useState, useEffect } from "react";
import { useContextCustom } from "../contexts/Context";
import NavBar from "../components/NavBar";
import { aesEncrypt, aesDecrypt, importKey } from "../cryptography";

const Chat = () => {
  const { socket, displayName } = useContextCustom();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.displayName = displayName;

    socket.on("chatMessage", async (encryptedMsg, displayName) => {
      console.log(encryptedMsg)
      const { ciphertext, iv, key } = encryptedMsg;
      const keyNew = await importKey(key);
      const decryptedMsg = await aesDecrypt(ciphertext, keyNew, iv);
      const newMsg = { msg: decryptedMsg, displayName };
      console.log(newMsg)
      setChat((prevChat) => [...prevChat, newMsg]);
    });

    return () => {
      socket.off("chatMessage");
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (message.trim()) {
      const encryptedMsg = await aesEncrypt(message);
      console.log(encryptedMsg)
      socket.emit("chatMessage", encryptedMsg, displayName);
      setMessage("");
    }
  };

  return (
    <div>
      <NavBar />
      <div style={styles.chatWindow}>
        {chat.map((msg, index) => (
          <div
            key={index}
            style={{
              backgroundColor:
                socket.displayName === msg.displayName ? "gainsboro" : "unset",
              alignSelf:
                socket.displayName === msg.displayName ? "end" : "start",
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
    </div>
  );
};

export default Chat;

const styles = {
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
