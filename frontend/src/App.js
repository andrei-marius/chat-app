// import React from 'react';
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import { ContextProvider } from "./contexts/Context";

function App() {
  return (
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Router>
    </ContextProvider>
  );
}

export default App;
