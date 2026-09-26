create table if not exists public.customer_email_otps (
  email text not null,
  purpose text not null check (purpose in ('signup', 'login', 'password_reset')),
  code_hash text not null,
  attempts integer not null default 0 check (attempts between 0 and 5),
  sent_at timestamptz not null,
  expires_at timestamptz not null,
  primary key (email, purpose)
);

alter table public.customer_email_otps enable row level security;
revoke all on public.customer_email_otps from anon, authenticated;
grant all on public.customer_email_otps to service_role;
