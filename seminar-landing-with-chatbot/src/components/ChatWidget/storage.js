const CONV_KEY = "chat_conversations_v1";
const ACTIVE_KEY = "chat_active_id_v1";

let idCounter = 0;
export const nextId = () => `${Date.now()}-${(idCounter += 1)}`;

export function loadConversations() {
  try {
    const raw = localStorage.getItem(CONV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations) {
  localStorage.setItem(CONV_KEY, JSON.stringify(conversations));
}

export function loadActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || null;
}

export function saveActiveId(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export function makeTitle(firstMessage) {
  const clean = firstMessage.trim().replace(/\s+/g, " ");
  return clean.length > 38 ? clean.slice(0, 38) + "…" : clean || "New chat";
}
