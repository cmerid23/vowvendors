-- ============================================================
-- 0007_storage.sql  R2 media storage + couple quota system
-- ============================================================

-- Storage plans -----------------------------------------------

create table if not exists storage_plans (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null unique,
  price_monthly           decimal(10,2),
  storage_limit_bytes     bigint,
  download_limit_monthly  integer,
  features                jsonb,
  is_active               boolean default true
);

insert into storage_plans (name, price_monthly, storage_limit_bytes, download_limit_monthly, features)
values
  ('free',     0.00, 5368709120, 50,   '["5 GB storage","50 downloads/month","View unlimited"]'),
  ('standard', 5.00, null,       null, '["Unlimited storage","Unlimited downloads","Google Drive sync","Dropbox sync"]')
on conflict (name) do nothing;

-- Storage usage per user ---------------------------------------

create table if not exists storage_usage (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references profiles(id) on delete cascade unique,
  used_bytes   bigint default 0,
  file_count   integer default 0,
  last_updated timestamptz default now()
);

-- User subscriptions -------------------------------------------

create table if not exists storage_subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid references profiles(id) on delete cascade unique,
  plan_id                uuid references storage_plans(id),
  status                 text default 'active',
  stripe_subscription_id text,
  current_period_start   timestamptz,
  current_period_end     timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

-- Media files (all versions tracked per file) ------------------

create table if not exists media_files (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid references profiles(id) on delete cascade,
  owner_type            text check (owner_type in ('vendor','couple','guest')),
  context               text check (context in ('gallery','portfolio','guest_upload','wedpose','profile','contract')),
  context_id            uuid,
  original_filename     text not null,
  file_type             text check (file_type in ('photo','video')),
  mime_type             text,
  width                 integer,
  height                integer,
  duration_seconds      integer,
  exif_data             jsonb,
  r2_original_key       text,
  r2_compressed_key     text,
  r2_medium_key         text,
  r2_thumbnail_key      text,
  original_size_bytes   bigint,
  compressed_size_bytes bigint,
  medium_size_bytes     bigint,
  thumbnail_size_bytes  bigint,
  total_size_bytes      bigint,
  upload_status         text default 'pending'
    check (upload_status in ('pending','uploaded','processing','ready','error')),
  error_message         text,
  is_hero_shot          boolean default false,
  is_guest_approved     boolean default true,
  is_deleted            boolean default false,
  deleted_at            timestamptz,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Monthly download tracking ------------------------------------

create table if not exists download_tracking (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references profiles(id) on delete cascade,
  media_id       uuid references media_files(id) on delete cascade,
  downloaded_at  timestamptz default now(),
  month_year     text generated always as (to_char(downloaded_at, 'YYYY-MM')) stored
);

-- Indexes ------------------------------------------------------

create index if not exists idx_media_files_owner      on media_files(owner_id);
create index if not exists idx_media_files_context    on media_files(context, context_id);
create index if not exists idx_media_files_status     on media_files(upload_status);
create index if not exists idx_storage_usage_user     on storage_usage(user_id);
create index if not exists idx_download_tracking_user on download_tracking(user_id, month_year);

-- Atomic storage usage update (prevents race conditions) -------

create or replace function update_storage_usage(
  p_user_id    uuid,
  p_delta_bytes bigint,
  p_delta_files integer
) returns void as $$
begin
  insert into storage_usage (user_id, used_bytes, file_count, last_updated)
  values (p_user_id, greatest(0, p_delta_bytes), greatest(0, p_delta_files), now())
  on conflict (user_id) do update set
    used_bytes   = greatest(0, storage_usage.used_bytes + p_delta_bytes),
    file_count   = greatest(0, storage_usage.file_count + p_delta_files),
    last_updated = now();
end;
$$ language plpgsql;

-- RLS ----------------------------------------------------------

alter table storage_plans          enable row level security;
alter table storage_usage          enable row level security;
alter table storage_subscriptions  enable row level security;
alter table media_files            enable row level security;
alter table download_tracking      enable row level security;

-- Plans: public read
drop policy if exists "plans_public_read" on storage_plans;
create policy "plans_public_read" on storage_plans for select using (is_active = true);

-- Storage usage: own row only
drop policy if exists "storage_usage_own" on storage_usage;
create policy "storage_usage_own" on storage_usage
  for all using (user_id = auth.uid());

-- Subscriptions: own row
drop policy if exists "subscriptions_own" on storage_subscriptions;
create policy "subscriptions_own" on storage_subscriptions
  for all using (user_id = auth.uid());

-- Media files: owner manages their files
drop policy if exists "media_owner_all" on media_files;
create policy "media_owner_all" on media_files
  for all using (owner_id = auth.uid());

-- Media files: vendor can read gallery files in their galleries
drop policy if exists "media_vendor_gallery_read" on media_files;
create policy "media_vendor_gallery_read" on media_files
  for select using (
    context = 'gallery'
    and context_id in (
      select id from galleries
      where vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
    )
  );

-- Media files: public can read ready gallery photos in active galleries
drop policy if exists "media_public_gallery_read" on media_files;
create policy "media_public_gallery_read" on media_files
  for select using (
    context = 'gallery'
    and upload_status = 'ready'
    and is_deleted = false
    and is_guest_approved = true
    and context_id in (select id from galleries where is_active = true)
  );

-- Media files: service role insert (Edge Functions)
drop policy if exists "media_service_insert" on media_files;
create policy "media_service_insert" on media_files
  for insert with check (true);

-- Media files: service role update (Edge Functions for processing)
drop policy if exists "media_service_update" on media_files;
create policy "media_service_update" on media_files
  for update using (true);

-- Download tracking: own rows
drop policy if exists "downloads_own" on download_tracking;
create policy "downloads_own" on download_tracking
  for all using (user_id = auth.uid());
