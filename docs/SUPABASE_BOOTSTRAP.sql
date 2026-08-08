-- VulnWiz AI: secure Supabase bootstrap migration
-- Run this ONCE in the Supabase SQL Editor for a new project, or convert it
-- into a timestamped Supabase migration before applying to an existing project.
-- Never run destructive changes against a production project without backup and review.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('Super Admin', 'Client Admin', 'Security Analyst', 'Developer', 'Executive Viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.account_status as enum ('PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED', 'CANCELED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.asset_type as enum ('web', 'infrastructure', 'api', 'cloud');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.risk_level as enum ('critical', 'high', 'medium', 'low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.vulnerability_status as enum ('new', 'confirmed', 'assigned', 'in_progress', 'fixed', 'verified', 'closed');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  company_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 255),
  domain text not null unique check (domain = lower(domain) and domain !~ '[[:space:]]'),
  industry text,
  plan text not null default 'Standard Pro',
  security_score integer not null default 0 check (security_score between 0 and 100),
  previous_score integer not null default 0 check (previous_score between 0 and 100),
  account_status public.account_status not null default 'PENDING_PAYMENT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.user_role not null default 'Executive Viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 255),
  target text not null check (char_length(target) between 1 and 500),
  type public.asset_type not null,
  owner text not null,
  tech_stack text[] not null default '{}',
  criticality public.risk_level not null default 'medium',
  last_scan_at timestamptz,
  status text not null default 'active' check (status in ('active', 'scanning', 'decommissioned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, target)
);

create table if not exists public.scan_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  requested_by uuid not null references auth.users(id),
  scan_type text not null check (scan_type in ('passive_posture', 'active_owasp', 'infra_port_ssl', 'api_security', 'cloud_iam')),
  authorization_reference text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'canceled')),
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  error_code text,
  error_message text,
  check (completed_at is null or started_at is null or completed_at >= started_at)
);

create table if not exists public.vulnerabilities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  scan_job_id uuid references public.scan_jobs(id) on delete set null,
  cve_id text,
  cwe_id text,
  title text not null check (char_length(title) between 1 and 500),
  severity public.risk_level not null,
  cvss_score numeric(3,1) not null check (cvss_score between 0 and 10),
  cvss_vector text,
  category text not null check (category in ('owasp', 'infrastructure', 'api', 'cloud', 'crypto')),
  owasp_category text,
  mitre_technique text,
  status public.vulnerability_status not null default 'new',
  assigned_to uuid references auth.users(id) on delete set null,
  affected_location text,
  description text not null,
  technical_recommendation text,
  executive_summary text,
  remediation_evidence text,
  verification_status text not null default 'UNVERIFIED' check (verification_status in ('UNVERIFIED', 'VERIFICATION_PASSED', 'VERIFICATION_FAILED')),
  discovered_at timestamptz not null default now(),
  remediation_deadline timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  requested_by uuid not null references auth.users(id),
  report_type text not null check (report_type in ('executive', 'technical')),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null,
  status text not null check (status in ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  stripe_payment_intent_id text unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'usd' check (currency = lower(currency)),
  status text not null check (status in ('succeeded', 'failed', 'processing', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  invitee_email text not null check (invitee_email = lower(invitee_email)),
  role public.user_role not null,
  token_hash bytea not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  outcome text not null check (outcome in ('SUCCESS', 'DENIED', 'FAILURE')),
  created_at timestamptz not null default now()
);

create index if not exists assets_tenant_id_idx on public.assets(tenant_id);
create index if not exists scan_jobs_tenant_requested_at_idx on public.scan_jobs(tenant_id, requested_at desc);
create index if not exists vulnerabilities_tenant_severity_idx on public.vulnerabilities(tenant_id, severity, status, discovered_at desc);
create index if not exists vulnerabilities_asset_id_idx on public.vulnerabilities(asset_id);
create index if not exists reports_tenant_id_idx on public.reports(tenant_id, created_at desc);
create index if not exists payments_tenant_id_idx on public.payments(tenant_id, created_at desc);
create index if not exists audit_logs_tenant_id_idx on public.audit_logs(tenant_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', '')
  ) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

do $$ declare target_table text;
begin
  foreach target_table in array array['profiles', 'tenants', 'tenant_memberships', 'assets', 'vulnerabilities', 'subscriptions'] loop
    execute format('drop trigger if exists set_%1$s_updated_at on public.%1$s', target_table);
    execute format('create trigger set_%1$s_updated_at before update on public.%1$s for each row execute procedure public.set_updated_at()', target_table);
  end loop;
end $$;

-- SECURITY DEFINER helpers deliberately live behind a fixed search_path.
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_platform_admin() or exists (
    select 1 from public.tenant_memberships
    where tenant_id = target_tenant_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_tenant_role(target_tenant_id uuid, allowed_roles public.user_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_platform_admin() or exists (
    select 1 from public.tenant_memberships
    where tenant_id = target_tenant_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
$$;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.is_tenant_member(uuid) from public;
revoke all on function public.has_tenant_role(uuid, public.user_role[]) from public;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.has_tenant_role(uuid, public.user_role[]) to authenticated;

-- RLS: no table is browser-accessible until a policy explicitly permits it.
alter table public.profiles enable row level security;
alter table public.platform_admins enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.assets enable row level security;
alter table public.scan_jobs enable row level security;
alter table public.vulnerabilities enable row level security;
alter table public.reports enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_logs enable row level security;

revoke all on all tables in schema public from anon;
revoke all on public.subscriptions, public.payments, public.invitations, public.audit_logs from authenticated;
grant select, insert, update, delete on public.profiles, public.platform_admins, public.tenants, public.tenant_memberships, public.assets, public.scan_jobs, public.vulnerabilities, public.reports to authenticated;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles for select to authenticated using ((select auth.uid()) = id);
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists platform_admins_select_self on public.platform_admins;
create policy platform_admins_select_self on public.platform_admins for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists tenants_select_member on public.tenants;
create policy tenants_select_member on public.tenants for select to authenticated using ((select public.is_tenant_member(id)));

drop policy if exists memberships_select_member on public.tenant_memberships;
create policy memberships_select_member on public.tenant_memberships for select to authenticated using ((select auth.uid()) = user_id or (select public.is_platform_admin()));

drop policy if exists assets_select_member on public.assets;
create policy assets_select_member on public.assets for select to authenticated using ((select public.is_tenant_member(tenant_id)));
drop policy if exists assets_insert_manager on public.assets;
create policy assets_insert_manager on public.assets for insert to authenticated with check ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst']::public.user_role[])));
drop policy if exists assets_update_manager on public.assets;
create policy assets_update_manager on public.assets for update to authenticated using ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst']::public.user_role[]))) with check ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst']::public.user_role[])));
drop policy if exists assets_delete_manager on public.assets;
create policy assets_delete_manager on public.assets for delete to authenticated using ((select public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin']::public.user_role[])));

drop policy if exists scan_jobs_select_member on public.scan_jobs;
create policy scan_jobs_select_member on public.scan_jobs for select to authenticated using ((select public.is_tenant_member(tenant_id)));
drop policy if exists scan_jobs_request_scanner on public.scan_jobs;
create policy scan_jobs_request_scanner on public.scan_jobs for insert to authenticated with check (
  requested_by = (select auth.uid()) and
  (select public.has_tenant_role(tenant_id, array['Super Admin', 'Security Analyst']::public.user_role[]))
);

drop policy if exists vulnerabilities_select_member on public.vulnerabilities;
create policy vulnerabilities_select_member on public.vulnerabilities for select to authenticated using ((select public.is_tenant_member(tenant_id)));

drop policy if exists reports_select_member on public.reports;
create policy reports_select_member on public.reports for select to authenticated using ((select public.is_tenant_member(tenant_id)));

-- Server-side functions (Vercel with service-role credentials) own billing,
-- invitations, audit writes, scan execution, and full vulnerability updates.
-- Authenticated users may update only approved remediation fields through this RPC.
create or replace function public.update_vulnerability_status(
  vulnerability_id uuid,
  next_status public.vulnerability_status,
  evidence text default null
) returns public.vulnerabilities
language plpgsql security definer set search_path = '' as $$
declare updated_row public.vulnerabilities;
begin
  update public.vulnerabilities
  set status = next_status,
      remediation_evidence = coalesce(evidence, remediation_evidence),
      updated_at = now()
  where id = vulnerability_id
    and public.has_tenant_role(tenant_id, array['Super Admin', 'Client Admin', 'Security Analyst', 'Developer']::public.user_role[])
  returning * into updated_row;
  if updated_row.id is null then raise exception 'not authorized or vulnerability not found'; end if;
  return updated_row;
end;
$$;

revoke all on function public.update_vulnerability_status(uuid, public.vulnerability_status, text) from public;
grant execute on function public.update_vulnerability_status(uuid, public.vulnerability_status, text) to authenticated;

-- Invitation tokens are generated by a Vercel server function using 32+ random
-- bytes; persist only digest(raw_token, 'sha256'). This function consumes a token.
create or replace function public.accept_invitation(raw_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare invite public.invitations;
begin
  select * into invite from public.invitations
  where token_hash = digest(raw_token, 'sha256')
    and accepted_at is null
    and expires_at > now()
    and invitee_email = lower(coalesce(auth.jwt() ->> 'email', ''))
  for update;
  if invite.id is null then raise exception 'invalid or expired invitation'; end if;
  insert into public.tenant_memberships (tenant_id, user_id, role)
  values (invite.tenant_id, auth.uid(), invite.role)
  on conflict (tenant_id, user_id) do nothing;
  update public.invitations set accepted_at = now() where id = invite.id;
  return invite.tenant_id;
end;
$$;

revoke all on function public.accept_invitation(text) from public;
grant execute on function public.accept_invitation(text) to authenticated;

-- Private report bucket. Vercel worker/service-role code writes reports under
-- "<tenant-uuid>/<report-uuid>.pdf". Browser users can only read their tenant.
insert into storage.buckets (id, name, public) values ('reports', 'reports', false)
on conflict (id) do update set public = false;

drop policy if exists reports_read_tenant_member on storage.objects;
create policy reports_read_tenant_member on storage.objects for select to authenticated using (
  bucket_id = 'reports'
  and (select public.is_tenant_member((storage.foldername(name))[1]::uuid))
);

-- Verification queries (run after seeding users/tenants):
-- select tablename, policyname, cmd from pg_policies where schemaname = 'public' order by tablename, policyname;
-- select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r';
