create table if not exists public.storefront_payment_settings (
  singleton boolean primary key default true check (singleton),
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.storefront_payment_settings enable row level security;
revoke all on public.storefront_payment_settings from anon, authenticated;
grant select on public.storefront_payment_settings to anon, authenticated;

create policy storefront_payment_settings_public_read
  on public.storefront_payment_settings
  for select
  to anon, authenticated
  using (true);

grant all on public.storefront_payment_settings to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'storefront_payment_settings'
  ) then
    alter publication supabase_realtime add table public.storefront_payment_settings;
  end if;
end;
$$;