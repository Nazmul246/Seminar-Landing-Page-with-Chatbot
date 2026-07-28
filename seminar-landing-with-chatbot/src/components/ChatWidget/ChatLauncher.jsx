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
            strokeWidth="2"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="chat-fab-pulse"></span>
        </button>
      )}
      {isOpen && <ChatPage onClose={() => setIsOpen(false)} />}
    </>
  );
}
