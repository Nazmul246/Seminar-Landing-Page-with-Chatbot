import { useState } from "react";
import ChatPage from "./ChatPage";
import "./ChatLauncher.css";

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          className="chat-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat assistant"
        >
          <img src="/Favicon.png" alt="Chat icon" className="chat-fab-icon" />
          <span className="chat-fab-pulse"></span>
        </button>
      )}
      {isOpen && <ChatPage onClose={() => setIsOpen(false)} />}
    </>
  );
}
