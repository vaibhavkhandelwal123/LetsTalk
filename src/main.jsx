import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./Components/Chat.jsx";
import { ChatProvider } from "./Context/Context.jsx";
createRoot(document.getElementById("root")).render(

    <BrowserRouter>
      <Toaster />
      <ChatProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </ChatProvider>
    </BrowserRouter>
);
