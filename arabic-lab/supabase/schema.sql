-- Alsama Arabic Lab: students.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- Security: Row Level Security is ON with NO policies, so the public (anon) key
-- cannot read or write anything. Only the app's server (Vercel), using the secret
-- service-role key, can. You see everything in Dashboard → Table Editor → students.

create extension if not exists pgcrypto;

create table if not exists public.students (
  id              uuid primary key default gen_random_uuid(),
  edit_token_hash text not null,          -- lets the student edit/delete from their device
  name            text not null check (char_length(name) between 1 and 60),
  email           text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  gender          text not null check (gender in ('male', 'female')),
  from_place      text not null check (char_length(from_place) between 1 and 60),
  level           text not null check (level in ('book1', 'b1', 'advanced')),
  travel          jsonb,                  -- {id, en, ar, chat} or {id: "other", text}
  hobby           jsonb,
  animal          jsonb,
  dream           jsonb,
  xp              integer not null default 0,
  streak          integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  last_active     timestamptz not null default now()
);

create index if not exists students_email_idx on public.students (lower(email));

alter table public.students enable row level security;
revoke all on table public.students from anon, authenticated;
