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
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="chat-fab-pulse"></span>
        </button>
      )}
      {isOpen && <ChatPage onClose={() => setIsOpen(false)} />}
    </>
  );
}
