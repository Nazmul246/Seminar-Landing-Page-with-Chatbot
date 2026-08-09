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

const SUGGESTIONS = [
  "What is ThaiBiz360 ERP?",
  "How does SoundCam AI detect failures?",
  "Tell me about AI Vision Inspection",
  "Can I book a live demo?",
];

const SUBTITLES = [
  "Ask about any of the 8 product channels from today's seminar.",
  "From ThaiBiz360 ERP to Industrial IoT — what's on your line?",
  "Ask me anything you saw on stage today, in more detail.",
  "Which system fits your factory — ERP, SoundCam, or Vision?",
  "I can also help you book a free demo before you leave.",
];

const GREETINGS_BY_TIME = {
  night: [
    "Still exploring the seminar?",
    "Late-night deep dive",
    "The floor's yours",
  ],
  morning: [
    "Welcome to the seminar",
    "Good morning, explore the channels",
    "8 systems, one morning",
  ],
  afternoon: [
    "Welcome to the seminar",
    "Exploring the product channels?",
    "Let's find your fit",
  ],
  evening: [
    "Welcome to the seminar",
    "Wrapping up today's sessions?",
    "Still time to explore",
  ],
};

function getTimeBucketKey() {
  const h = new Date().getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

// Same 2-minute window -> same pick, always. New window -> next pick in rotation.
function pickFromWindow(list) {
  const WINDOW_MS = 2 * 60 * 1000;
  const bucket = Math.floor(Date.now() / WINDOW_MS);
  return list[bucket % list.length];
}

function getGreeting() {
  return pickFromWindow(GREETINGS_BY_TIME[getTimeBucketKey()]);
}

function getSubtitle() {
  return pickFromWindow(SUBTITLES);
}

export default function ChatPage({ onClose }) {
  const [conversations, setConversations] = useState(loadConversations);
  const [activeId, setActiveId] = useState(() => loadActiveId() || null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth > 780,
  );

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typeTimerRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;
  const hasMessages = !!(active && active.messages.length > 0);
  const showLanding = !hasMessages && !isThinking;
  const [subtitle] = useState(getSubtitle);
  const [greeting] = useState(getGreeting);

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

  function handleSuggestionClick(text) {
    setInput(text);
    textareaRef.current?.focus();
  }

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  function renderInputBar() {
    return (
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
    );
  }

  return (
    <div className="chat-page">
      {/* ---------------- Sidebar ---------------- */}
      {sidebarOpen && (
        <div
          className="chat-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside className={`chat-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="chat-sidebar-brand">
          <span className="chat-sidebar-logo">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          <div className="chat-sidebar-brand-text">
            <div className="chat-sidebar-brand-name">Factory AI</div>
            <div className="chat-sidebar-status">
              <i className="chat-status-dot"></i>
              System Online
            </div>
          </div>
        </div>

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
              onClick={() => {
                setActiveId(c.id);
                if (window.innerWidth <= 780) setSidebarOpen(false);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="chat-history-icon"
              >
                <path d="M3 3v5h5" />
                <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                <path d="M12 7v5l4 2" />
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
            {hasMessages ? active.title : "Factory AI Assistant"}
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

        {showLanding ? (
          <div className="chat-landing">
            <div className="chat-grid-bg"></div>
            <div className="chat-landing-inner">
              <h1 className="chat-landing-title">
                {greeting}
                <span className="chat-landing-accent">.</span>
              </h1>
              <p className="chat-landing-subtitle">{subtitle}</p>

              <div className="chat-landing-input">{renderInputBar()}</div>

              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="chat-suggestion-chip"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="chat-messages">
              <div className="chat-grid-bg"></div>
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
              {renderInputBar()}
              <div className="chat-input-hint">
                AI responses may be inaccurate — verify important details.
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
