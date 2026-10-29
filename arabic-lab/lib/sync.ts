// Sends the student's XP and streak to Alsama (shown in the teacher's table).
// Only these two numbers are sent, a few seconds after they change.
import { readLocalStudent } from "./student";

let timer: ReturnType<typeof setTimeout> | null = null;
let pending: { xp: number; streak: number } | null = null;

function send(useBeacon = false) {
  timer = null;
  const student = readLocalStudent();
  if (!pending || !student) return;
  const body = JSON.stringify({ id: student.id, token: student.token, ...pending });
  pending = null;
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon("/api/students/activity", new Blob([body], { type: "application/json" }));
    return;
  }
  fetch("/api/students/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}

export function queueActivitySync(xp: number, streak: number) {
  if (typeof window === "undefined") return;
  pending = { xp, streak };
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => send(), 4000);
}

if (typeof window !== "undefined") {
  // Don't lose the last update when the student closes the tab.
  window.addEventListener("pagehide", () => pending && send(true));
}
