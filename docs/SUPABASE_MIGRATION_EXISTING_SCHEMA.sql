-- VulnWiz AI: non-destructive migration for the EXISTING legacy schema.
-- Applies to the tables shown in the supplied schema report.
-- Review in a staging project and back up production before running.
-- This migration DOES NOT drop tables, Auth users, or legacy rows.

create extension if not exists pgcrypto;

-- 1. Link the legacy public.users rows to Supabase Auth. Password hashes remain
-- legacy-only data and are never read by the application after this migration.
alter table public.users
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

alter table public.vulnerabilities
  add column if not exists remediation_evidence text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists users_auth_user_id_unique_idx
  on public.users(auth_user_id) where auth_user_id is not null;

-- 2. Safe browser-facing identity data. Do not expose the legacy users table:
-- it contains password_hash and Stripe customer identifiers.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(255) not null default '',
  company_name varchar(255),
  phone varchar(50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- One Auth user can be a member of more than one tenant. This is the sole
-- source of browser authorization; client-provided tenant IDs are not trusted.
create table if not exists public.tenant_memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role varchar(50) not null check (role in ('Super Admin', 'Client Admin', 'Security Analyst', 'Developer', 'Executive Viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create index if not exists tenant_memberships_user_id_idx
  on public.tenant_memberships(user_id);

-- 3. Backfill links only where an existing legacy email matches an Auth email.
-- This does not create accounts or recover/migrate legacy password_hash values.
update public.users legacy_user
set auth_user_id = auth_user.id
from auth.users auth_user
where legacy_user.auth_user_id is null
  and lower(legacy_user.email) = lower(auth_user.email);

insert into public.profiles (id, full_name, company_name, phone)
select
  auth_user.id,
  coalesce(legacy_user.full_name, auth_user.raw_user_meta_data ->> 'full_name', ''),
  coalesce(legacy_user.company_name, nullif(auth_user.raw_user_meta_data ->> 'company_name', '')),
  legacy_user.phone
from auth.users auth_user
left join public.users legacy_user on legacy_user.auth_user_id = auth_user.id
on conflict (id) do nothing;

insert into public.tenant_memberships (tenant_id, user_id, role)
select
  legacy_user.tenant_id,
  legacy_user.auth_user_id,
  case
    when legacy_user.role in ('Super Admin', 'Client Admin', 'Security Analyst', 'Developer', 'Executive Viewer')
      then legacy_user.role
    else 'Executive Viewer'
  end
from public.users legacy_user
where legacy_user.tenant_id is not null
  and legacy_user.auth_user_id is not null
on conflict (tenant_id, user_id) do nothing;

-- 4. Auth trigger: creates only a profile. Tenant membership is provisioned by
-- an administrator/server-side invitation flow, never by user metadata.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_tenant_memberships_updated_at on public.tenant_memberships;
create trigger set_tenant_memberships_updated_at before update on public.tenant_memberships
for each row execute procedure public.set_updated_at();

-- 5. SECURITY DEFINER policy helpers. Fixed search_path prevents object-name
-- hijacking; auth.uid() always comes from the caller's verified JWT.
create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_platform_admin() or exists (
    select 1 from public.tenant_memberships
    where tenant_id = target_tenant_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_tenant_role(target_tenant_id uuid, allowed_roles varchar[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_platform_admin() or exists (
    select 1 from public.tenant_memberships
    where tenant_id = target_tenant_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_tenant_member(uuid) from public;
revoke all on function public.has_tenant_role(uuid, varchar[]) from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.has_tenant_role(uuid, varchar[]) to authenticated;

-- 6. Replace current_setting('app.current_tenant_id') policies. A browser
-- cannot securely set that variable, so these policies prevent real access.
alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.tenants enable row level security;
alter table public.assets enable row level security;
alter table public.vulnerabilities enable row level security;
alter table public.audit_logs enable row level security;
alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- Explicit grants. RLS still decides which rows a signed-in user can use.
revoke all on all tables in schema public from anon;
revoke all on public.users, public.subscriptions, public.payments, public.audit_logs from authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.platform_admins, public.tenant_memberships, public.tenants, public.vulnerabilities, public.audit_logs to authenticated;
grant select, insert, update, delete on public.assets to authenticated;

-- Profile and membership policies.
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists platform_admins_select_self on public.platform_admins;
create policy platform_admins_select_self on public.platform_admins for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists memberships_select_authorized on public.tenant_memberships;
create policy memberships_select_authorized on public.tenant_memberships for select to authenticated
using ((select auth.uid()) = user_id or (select public.is_platform_admin()));

-- Tenant-owned data policies.
drop policy if exists tenants_select_member on public.tenants;
create policy tenants_select_member on public.tenants for select to authenticated
using ((select public.is_tenant_member(id)));

drop policy if exists tenant_isolation_policy_assets on public.assets;
drop policy if exists assets_select_member on public.assets;
create policy assets_select_member on public.assets for select to authenticated
using ((select public.is_tenant_member(tenant_id)));

drop policy if exists assets_insert_manager on public.assets;
create policy assets_insert_manager on public.assets for insert to authenticated
with check ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst'])));

drop policy if exists assets_update_manager on public.assets;
create policy assets_update_manager on public.assets for update to authenticated
using ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst'])))
with check ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst'])));

drop policy if exists assets_delete_manager on public.assets;
create policy assets_delete_manager on public.assets for delete to authenticated
using ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin'])));

drop policy if exists tenant_isolation_policy_vulns on public.vulnerabilities;
drop policy if exists vulnerabilities_select_member on public.vulnerabilities;
create policy vulnerabilities_select_member on public.vulnerabilities for select to authenticated
using ((select public.is_tenant_member(tenant_id)));

drop policy if exists tenant_isolation_policy_audit on public.audit_logs;
drop policy if exists audit_logs_select_member on public.audit_logs;
create policy audit_logs_select_member on public.audit_logs for select to authenticated
using ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst'])));

-- No browser policies are created for users, subscriptions, or payments.
-- Vercel server functions using the service-role key own their mutations.

-- 7. Restrict client-side vulnerability updates to the allowed fields via RPC.
create or replace function public.update_vulnerability_status(
  vulnerability_id uuid,
  next_status varchar,
  evidence text default null
) returns public.vulnerabilities
language plpgsql
security definer
set search_path = ''
as $$
declare result public.vulnerabilities;
begin
  if next_status not in ('new', 'confirmed', 'assigned', 'in_progress', 'fixed', 'verified', 'closed') then
    raise exception 'invalid vulnerability status';
  end if;
  update public.vulnerabilities
  set status = next_status,
      remediation_evidence = coalesce(evidence, remediation_evidence),
      last_verification_date = case when next_status = 'verified' then now() else last_verification_date end
  where id = vulnerability_id
    and public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst', 'Developer'])
  returning * into result;
  if result.id is null then raise exception 'not authorized or vulnerability not found'; end if;
  return result;
end;
$$;

revoke all on function public.update_vulnerability_status(uuid, varchar, text) from public;
grant execute on function public.update_vulnerability_status(uuid, varchar, text) to authenticated;

-- 8. Post-migration checks. Run these after the migration, then test with two
-- normal signed-in users from different tenants using the anon/publishable key.
-- select id, email, auth_user_id, tenant_id, role from public.users order by email;
-- select tenant_id, user_id, role from public.tenant_memberships order by tenant_id, user_id;
-- select tablename, policyname, cmd from pg_policies where schemaname = 'public' order by tablename, policyname;
