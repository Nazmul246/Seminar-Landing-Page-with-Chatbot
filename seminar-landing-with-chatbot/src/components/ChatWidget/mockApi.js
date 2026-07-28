const CANNED = [
  "Great question — our ThaiBiz360 ERP unifies sales, inventory and accounting into one live system.",
  "SoundCam AI listens to machine sound signatures and flags anomalies days before failure.",
  "I can walk you through any of our 8 product channels — ERP, SoundCam, Counting, Vision, Sealing, Maintenance, Dashboard or IoT.",
  "Would you like me to help you book a free demo?",
];

export async function getAIResponse(userMessage, history) {
  // ============================================================
  // BACKEND INTEGRATION POINT — replace this block with:
  //
  // const res = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message: userMessage, history }),
  // })
  // const data = await res.json()
  // return data.reply
  // ============================================================
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));
  return CANNED[Math.floor(Math.random() * CANNED.length)];
}
