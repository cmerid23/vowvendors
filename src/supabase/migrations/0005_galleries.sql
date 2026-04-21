-- ============================================================
-- 0005_galleries.sql  –  Client photo gallery & proofing
-- ============================================================

-- Galleries (one per wedding)
create table if not exists galleries (
  id             uuid primary key default gen_random_uuid(),
  vendor_id      uuid references vendors(id) on delete cascade not null,
  slug           text not null unique,
  title          text not null,
  couple_names   text,
  wedding_date   date,
  cover_photo_url text,
  password_hash  text,        -- SHA-256 hex; null = no password
  is_active      boolean default true,
  allow_downloads  boolean default true,
  allow_favourites boolean default true,
  allow_guest_uploads boolean default false,
  watermark_enabled boolean default false,
  watermark_text text,
  total_photos   integer default 0,
  total_videos   integer default 0,
  total_size_bytes bigint default 0,
  view_count     integer default 0,
  download_count integer default 0,
  created_at     timestamptz default now(),
  expires_at     timestamptz,
  notified_at    timestamptz
);

-- Albums (folders inside a gallery)
create table if not exists gallery_albums (
  id            uuid primary key default gen_random_uuid(),
  gallery_id    uuid references galleries(id) on delete cascade not null,
  name          text not null,
  display_order integer default 0,
  cover_photo_url text,
  photo_count   integer default 0,
  is_guest_album boolean default false,
  created_at    timestamptz default now()
);

-- Photos & videos
create table if not exists gallery_media (
  id             uuid primary key default gen_random_uuid(),
  gallery_id     uuid references galleries(id) on delete cascade not null,
  album_id       uuid references gallery_albums(id) on delete set null,
  vendor_id      uuid references vendors(id) on delete cascade not null,
  file_name      text not null,
  file_type      text check (file_type in ('photo','video')) default 'photo',
  mime_type      text,
  storage_path   text not null unique,   -- Supabase Storage path
  thumb_path     text,
  medium_path    text,
  original_size_bytes bigint,
  compressed_size_bytes bigint,
  width          integer,
  height         integer,
  display_order  integer default 0,
  is_hero_shot   boolean default false,
  is_guest_upload boolean default false,
  guest_uploader_name text,
  guest_approved boolean default true,
  uploaded_by    uuid references profiles(id),
  created_at     timestamptz default now()
);

-- Favourites (by couple/guests)
create table if not exists gallery_favourites (
  id          uuid primary key default gen_random_uuid(),
  gallery_id  uuid references galleries(id) on delete cascade not null,
  media_id    uuid references gallery_media(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  created_at  timestamptz default now(),
  unique(media_id, user_id)
);

-- Access log
create table if not exists gallery_access (
  id         uuid primary key default gen_random_uuid(),
  gallery_id uuid references galleries(id) on delete cascade not null,
  user_id    uuid references profiles(id),
  accessed_at timestamptz default now(),
  user_agent text
);

-- Indexes
create index if not exists idx_galleries_vendor     on galleries(vendor_id);
create index if not exists idx_galleries_slug       on galleries(slug);
create index if not exists idx_gallery_media_gallery on gallery_media(gallery_id);
create index if not exists idx_gallery_media_album   on gallery_media(album_id);
create index if not exists idx_gallery_favs_gallery  on gallery_favourites(gallery_id);

-- ============================================================
-- RLS
-- ============================================================
alter table galleries          enable row level security;
alter table gallery_albums     enable row level security;
alter table gallery_media      enable row level security;
alter table gallery_favourites enable row level security;
alter table gallery_access     enable row level security;

-- galleries: vendor owns their own
drop policy if exists "galleries_vendor_all"  on galleries;
create policy "galleries_vendor_all" on galleries
  for all using (
    vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
  );

-- galleries: public can read active galleries by slug
drop policy if exists "galleries_public_read" on galleries;
create policy "galleries_public_read" on galleries
  for select using (is_active = true);

-- albums: vendor owns
drop policy if exists "albums_vendor_all" on gallery_albums;
create policy "albums_vendor_all" on gallery_albums
  for all using (
    gallery_id in (
      select id from galleries
      where vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
    )
  );

drop policy if exists "albums_public_read" on gallery_albums;
create policy "albums_public_read" on gallery_albums
  for select using (
    gallery_id in (select id from galleries where is_active = true)
  );

-- media: vendor owns
drop policy if exists "media_vendor_all" on gallery_media;
create policy "media_vendor_all" on gallery_media
  for all using (
    vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
  );

drop policy if exists "media_public_read" on gallery_media;
create policy "media_public_read" on gallery_media
  for select using (
    gallery_id in (select id from galleries where is_active = true)
    and guest_approved = true
  );

-- favourites: user owns
drop policy if exists "favs_user_all" on gallery_favourites;
create policy "favs_user_all" on gallery_favourites
  for all using (user_id = auth.uid());

drop policy if exists "favs_vendor_read" on gallery_favourites;
create policy "favs_vendor_read" on gallery_favourites
  for select using (
    gallery_id in (
      select id from galleries
      where vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
    )
  );

-- access log: insert allowed for anyone, vendor can read their galleries
drop policy if exists "access_insert" on gallery_access;
create policy "access_insert" on gallery_access for insert with check (true);

drop policy if exists "access_vendor_read" on gallery_access;
create policy "access_vendor_read" on gallery_access
  for select using (
    gallery_id in (
      select id from galleries
      where vendor_id = (select id from vendors where user_id = auth.uid() limit 1)
    )
  );
