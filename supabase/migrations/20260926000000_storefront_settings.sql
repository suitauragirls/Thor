create table if not exists public.storefront_settings (
  setting_key text primary key check (
    setting_key in ('homepageSections', 'heroConfig', 'storeSettings', 'banners', 'dealOfTheDay')
  ),
  setting_value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.storefront_settings enable row level security;
revoke all on public.storefront_settings from anon, authenticated;
grant select on public.storefront_settings to anon, authenticated;

create policy storefront_settings_public_read
  on public.storefront_settings
  for select
  to anon, authenticated
  using (true);

grant all on public.storefront_settings to service_role;

create table if not exists public.admin_credentials (
  singleton boolean primary key default true check (singleton),
  username text not null,
  password_hash text not null,
  pin_hash text not null,
  require_pin boolean not null default true,
  secret_path_slug text not null default 'sag-vault',
  allow_direct_admin_route boolean not null default false,
  session_version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.admin_credentials enable row level security;
revoke all on public.admin_credentials from anon, authenticated;
grant all on public.admin_credentials to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'storefront_settings'
  ) then
    alter publication supabase_realtime add table public.storefront_settings;
  end if;
end;
$$;
