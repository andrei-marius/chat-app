import { useNavigate } from "react-router-dom";
import { useContextCustom } from "../contexts/Context";

const NavBar = () => {
  const navigate = useNavigate();
  const { setSocket, setDisplayName } = useContextCustom();

  const handleLogout = () => {
    setSocket(null);
    setDisplayName(null);
    navigate("/");
  };

  return (
    <div style={styles.navbar}>
      <button style={styles.logoutBtn} onClick={handleLogout}>LOG OUT</button>
    </div>
  );
};

export default NavBar;

const styles = {
  navbar: {
    width: "100%",
    height: "100px",
    backgroundColor: "gray",
    display: "flex",
    alignItems: "center",
    justifyContent: "end",
  },
  logoutBtn: {
    padding: 10,
  }
};
