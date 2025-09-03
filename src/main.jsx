import { StrictMode } from "react";
import '@mantine/core/styles.css';
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router";
import Chat from "./Components/Chat.jsx";
import { ChatProvider } from "./Context/Context.jsx";
import { MantineProvider } from "@mantine/core";
createRoot(document.getElementById("root")).render(

    <BrowserRouter>
    <MantineProvider >
      <Toaster />
      <ChatProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </ChatProvider>
      </MantineProvider>
    </BrowserRouter>
);
