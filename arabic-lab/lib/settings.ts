// Settings the teacher controls, shared with every student's app.
import type { LevelId } from "./content/types";

export type SessionPin = { unitId: string | null; note: string };
export type SessionSettings = Partial<Record<LevelId, SessionPin>>;

/** Teacher review of a writing model text: approved, and/or edited. */
export type ContentReview = { approved: boolean; model?: { ar: string; chat: string; en: string } };
export type ContentSettings = Record<string, ContentReview>;

export type Settings = { session: SessionSettings; content: ContentSettings };

export const emptySettings: Settings = { session: {}, content: {} };
