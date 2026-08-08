-- VulnWiz AI: one-time migration for automatic workspace provisioning
--
-- Run this ONCE in Supabase SQL Editor if you already ran the bootstrap or an
-- earlier migration. Every FUTURE Auth signup will receive its own tenant and
-- a Super Admin membership; no per-user SQL is necessary.
--
-- This deliberately never accepts a tenant_id from browser metadata. A signup
-- can become an admin only of the tenant created for that same auth user.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_id uuid;
  workspace_name text;
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'company_name', '')
  ) on conflict (id) do nothing;

  workspace_name := left(
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'company_name'), ''), 'My Workspace'),
    255
  );
  insert into public.tenants (name, domain)
  values (workspace_name, 'tenant-' || new.id::text)
  returning id into workspace_id;

  insert into public.tenant_memberships (tenant_id, user_id, role)
  values (workspace_id, new.id, 'Super Admin');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Optional: repair accounts created before this migration. It is intentionally
-- limited to the email below, avoiding bulk provisioning of legacy accounts.
-- Replace the value, run once, and then remove this block if used.
--
-- do $$
-- declare existing_user auth.users;
-- declare workspace_id uuid;
-- begin
--   select * into existing_user from auth.users where email = lower('you@example.com');
--   if existing_user.id is null then raise exception 'Auth user not found'; end if;
--   if exists (select 1 from public.tenant_memberships where user_id = existing_user.id) then return; end if;
--   insert into public.tenants (name, domain)
--   values ('My Workspace', 'tenant-' || existing_user.id::text)
--   returning id into workspace_id;
--   insert into public.tenant_memberships (tenant_id, user_id, role)
--   values (workspace_id, existing_user.id, 'Super Admin');
-- end $$;
