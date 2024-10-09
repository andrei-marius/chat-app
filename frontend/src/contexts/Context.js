import { createContext, useContext, useState, useMemo } from "react";

const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [displayName, setDisplayName] = useState(null);

  const contextValue = useMemo(
    () => ({
      socket,
      setSocket,
      displayName,
      setDisplayName,
    }),
    [socket, displayName]
  );

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useContextCustom = () => {
  return useContext(Context);
};
