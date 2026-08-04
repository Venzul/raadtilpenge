const VISITOR_KEY = "rtp_visitor_id";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = createId();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return createId();
  }
}
