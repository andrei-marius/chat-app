import { createContext, useContext, useState, useMemo } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [ECDHKeyPair, setECDHKeyPair] = useState(null);
  const [ECDSAKeyPair, setECDSAKeyPair] = useState(null);
  const [sharedSecret, setSharedSecret] = useState(null);
  const [client2ECDSAPublicKey, setClient2ECDSAPublicKey] = useState(null);

  const contextValue = useMemo(
    () => ({
      socket,
      setSocket,
      displayName,
      setDisplayName,
      ECDHKeyPair,
      ECDSAKeyPair,
      setECDHKeyPair,
      setECDSAKeyPair,
      sharedSecret,
      setSharedSecret,
      client2ECDSAPublicKey,
      setClient2ECDSAPublicKey,
    }),
    [socket, displayName, ECDHKeyPair, ECDSAKeyPair, sharedSecret, client2ECDSAPublicKey]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useContextCustom = () => {
  return useContext(Context);
};
