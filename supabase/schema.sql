-- Alsama Arabic: learner registrations.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
--
-- Security: Row Level Security is ON and there are NO policies, so the public
-- (anon) key cannot read or write anything. Only the Vercel server functions,
-- using the secret service-role key stored in Vercel, can add or delete rows.
-- You (the owner) see everything in Dashboard → Table Editor → registrations.

create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id                uuid primary key default gen_random_uuid(),
  device_learner_id text not null unique,          -- the app's learner id; stops duplicate sign-ups on retry
  first_name        text not null check (char_length(first_name) between 1 and 40),
  nickname          text check (char_length(nickname) <= 40),
  age_group         text not null check (age_group in ('under13', '13-17', '18plus')),
  country           text check (char_length(country) <= 60),
  native_language   text check (char_length(native_language) <= 60),
  arabic_level      text check (arabic_level in ('new', 'some-letters', 'read-a-little', 'speak-a-little', 'not-sure')),
  email             text check (email is null or (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  parent_consent    boolean not null default false,
  delete_token_hash text not null,                 -- lets the learner delete their own record from the app
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint under13_needs_parent_consent check (age_group <> 'under13' or parent_consent)
);

-- One registration per email address (when an email is given).
create unique index if not exists registrations_email_unique
  on public.registrations (lower(email)) where email is not null;

alter table public.registrations enable row level security;
revoke all on table public.registrations from anon, authenticated;
