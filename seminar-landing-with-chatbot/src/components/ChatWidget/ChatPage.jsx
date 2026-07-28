import { useState, useRef, useEffect } from "react";
import { getAIResponse } from "./mockApi";
import {
  loadConversations,
  saveConversations,
  loadActiveId,
  saveActiveId,
  nextId,
  makeTitle,
} from "./storage";
import "./ChatPage.css";

export default function ChatPage({ onClose }) {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => loadActiveId() || null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typeTimerRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;

  // persist conversations + active id
  useEffect(() => saveConversations(conversations), [conversations]);
  useEffect(() => saveActiveId(activeId), [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages, isThinking]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  useEffect(() => () => clearInterval(typeTimerRef.current), []);

  function updateConversation(id, updater) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...updater(c), updatedAt: Date.now() } : c,
      ),
    );
  }

  function typeAssistantMessage(convId, msgId, fullText) {
    let i = 0;
    clearInterval(typeTimerRef.current);
    typeTimerRef.current = setInterval(() => {
      i += 3;
      updateConversation(convId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === msgId
            ? {
                ...m,
                content: fullText.slice(0, i),
                typing: i < fullText.length,
              }
            : m,
        ),
      }));
      if (i >= fullText.length) clearInterval(typeTimerRef.current);
    }, 16);
  }

  function handleNewChat() {
    clearInterval(typeTimerRef.current);
    const conv = {
      id: nextId(),
      title: "New chat",
      messages: [],
      updatedAt: Date.now(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setInput("");
  }

  function handleDeleteConversation(id, e) {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isThinking) return;

    let convId = activeId;
    const userMsg = { id: nextId(), role: "user", content: text };

    if (!convId) {
      const conv = {
        id: nextId(),
        title: makeTitle(text),
        messages: [userMsg],
        updatedAt: Date.now(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      convId = conv.id;
    } else {
      updateConversation(convId, (c) => ({
        ...c,
        title: c.messages.length === 0 ? makeTitle(text) : c.title,
        messages: [...c.messages, userMsg],
      }));
    }

    setInput("");
    setIsThinking(true);

    const history = (
      conversations.find((c) => c.id === convId)?.messages || []
    ).concat(userMsg);

    try {
      const reply = await getAIResponse(text, history);
      const assistantId = nextId();
      updateConversation(convId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          { id: assistantId, role: "assistant", content: "", typing: true },
        ],
      }));
      setIsThinking(false);
      typeAssistantMessage(convId, assistantId, reply);
    } catch {
      setIsThinking(false);
      updateConversation(convId, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            id: nextId(),
            role: "assistant",
            content: "Something went wrong. Please try again.",
            typing: false,
          },
        ],
      }));
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="chat-page">
      {/* ---------------- Sidebar ---------------- */}
      <aside className={`chat-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="chat-sidebar-top">
          <button className="chat-newchat-btn" onClick={handleNewChat}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New chat
          </button>
        </div>

        <div className="chat-history-list">
          {sorted.length === 0 && (
            <div className="chat-history-empty">No conversations yet</div>
          )}
          {sorted.map((c) => (
            <div
              key={c.id}
              className={`chat-history-item ${c.id === activeId ? "is-active" : ""}`}
              onClick={() => setActiveId(c.id)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="chat-history-icon"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="chat-history-title">{c.title}</span>
              <button
                className="chat-history-delete"
                onClick={(e) => handleDeleteConversation(c.id, e)}
                title="Delete"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="chat-sidebar-bottom">
          <button className="chat-backsite-btn" onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to website
          </button>
        </div>
      </aside>

      {/* ---------------- Main chat area ---------------- */}
      <main className="chat-main">
        <header className="chat-main-header">
          <button
            className="chat-icon-btn chat-sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="chat-main-title">
            {active ? active.title : "Factory AI Assistant"}
          </div>
          <button className="chat-icon-btn" onClick={onClose} title="Close">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="chat-messages">
          {(!active || active.messages.length === 0) && !isThinking && (
            <div className="chat-empty">
              <span className="chat-empty-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <h2>Factory AI Assistant</h2>
              <p>
                Ask about ERP, SoundCam, Vision Inspection, Predictive
                Maintenance and more.
              </p>
            </div>
          )}

          <div className="chat-messages-inner">
            {active?.messages.map((m) => (
              <div key={m.id} className={`chat-row chat-row-${m.role}`}>
                {m.role === "assistant" && (
                  <span className="chat-avatar">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </span>
                )}
                <div className="chat-text">
                  {m.content}
                  {m.typing && <span className="chat-caret"></span>}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="chat-row chat-row-assistant">
                <span className="chat-avatar">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </span>
                <div className="chat-typing">
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chat-input-area">
          <div className="chat-input-inner">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Factory AI Assistant..."
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              aria-label="Send message"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </div>
          <div className="chat-input-hint">
            AI responses may be inaccurate — verify important details.
          </div>
        </div>
      </main>
    </div>
  );
}
