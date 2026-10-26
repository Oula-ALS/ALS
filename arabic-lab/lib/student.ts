// The student's own copy of their details, kept on this device so the app
// can greet them. The server copy (for the teacher) arrives in Stage 3.
export type LocalStudent = {
  id: string;
  name: string;
};

const KEY = "alsama-lab:student";

export function readLocalStudent(): LocalStudent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data?.name === "string" && data.name ? data : null;
  } catch {
    return null;
  }
}

export function saveLocalStudent(student: LocalStudent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(student));
  } catch {}
}
