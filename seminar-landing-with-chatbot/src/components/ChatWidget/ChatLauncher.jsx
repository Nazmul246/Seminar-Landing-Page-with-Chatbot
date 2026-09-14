import { useState, useEffect } from "react";
import ChatPage from "./ChatPage";
import "./ChatLauncher.css";

export default function ChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

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
