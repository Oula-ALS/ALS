import { table } from "./db";

export type WritingRow = {
  id: string;
  student_id: string;
  topic_id: string;
  text: string;
  status: "new" | "reviewed";
  feedback: string | null;
  stars: number | null;
  created_at: string;
  reviewed_at: string | null;
};

export const writingsTable = () => table<WritingRow>("writings");

export const WRITING_MAX = 5000;
