import io from "socket.io-client";
import { useContextCustom } from "../contexts/Context";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { setSocket, setDisplayName } = useContextCustom();
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    if (name.trim()) {
      setSocket(io("http://localhost:5000"));
      setDisplayName(name);
      navigate("/chat");
    }
  };

  return (
    <div>
      <form style={styles.loginForm} onSubmit={handleLogin}>
        <input
          style={styles.nameInput}
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button style={styles.submitBtn} type="submit">ENTER</button>
      </form>
    </div>
  );
};

export default Login;

const styles = {
  loginForm: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  nameInput: {
    padding: 10,
    border: '1px solid #000',
  },
  submitBtn: {
    padding: 10,
  }
}
