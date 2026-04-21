-- Wedding Hub: guest experience QR code landing pages

create table wedding_hubs (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references profiles(id) on delete cascade,
  created_by uuid references profiles(id),

  access_code text not null unique,
  is_active boolean default true,
  is_public boolean default true,

  partner_one_name text not null,
  partner_two_name text not null,
  wedding_date date not null,
  venue_name text,
  venue_address text,
  cover_photo_url text,
  welcome_message text,
  accent_color text default '#B8860B',
  theme text default 'romantic'
    check (theme in ('romantic','modern','rustic','garden','minimal')),

  show_timeline boolean default true,
  show_photo_wall boolean default true,
  show_seating boolean default false,
  show_song_requests boolean default false,
  show_vendors boolean default true,

  total_scans integer default 0,
  total_guest_accounts integer default 0,
  total_photos_uploaded integer default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table hub_timeline_events (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  time text not null,
  title text not null,
  description text,
  icon text default 'heart',
  is_current boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table hub_photos (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  uploader_id uuid references profiles(id),
  uploader_name text,
  uploader_email text,
  r2_original_key text not null,
  r2_thumbnail_key text,
  r2_medium_key text,
  file_size_bytes bigint,
  is_approved boolean default true,
  is_featured boolean default false,
  caption text,
  like_count integer default 0,
  created_at timestamptz default now()
);

create table hub_photo_likes (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid references hub_photos(id) on delete cascade,
  user_id uuid references profiles(id),
  session_id text,
  created_at timestamptz default now(),
  unique(photo_id, user_id),
  unique(photo_id, session_id)
);

create table hub_vendors (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete set null,
  vendor_name text not null,
  vendor_category text,
  vendor_instagram text,
  vendor_website text,
  vendor_vowvendors_slug text,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table hub_song_requests (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  requester_id uuid references profiles(id),
  requester_name text,
  song_title text not null,
  artist text,
  message text,
  vote_count integer default 0,
  is_played boolean default false,
  created_at timestamptz default now()
);

create table hub_song_votes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references hub_song_requests(id) on delete cascade,
  user_id uuid references profiles(id),
  session_id text,
  created_at timestamptz default now(),
  unique(request_id, user_id),
  unique(request_id, session_id)
);

create table hub_seating_tables (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  table_name text not null,
  seats jsonb not null default '[]',
  display_order integer default 0
);

create table hub_scans (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  user_id uuid references profiles(id),
  session_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- Indexes
create index on wedding_hubs(access_code);
create index on wedding_hubs(couple_id);
create index on wedding_hubs(created_by);
create index on hub_photos(hub_id, created_at desc);
create index on hub_photos(hub_id, is_featured);
create index on hub_timeline_events(hub_id, display_order);
create index on hub_song_requests(hub_id, vote_count desc);
create index on hub_vendors(hub_id, display_order);
create index on hub_scans(hub_id);

-- RLS
alter table wedding_hubs enable row level security;
alter table hub_timeline_events enable row level security;
alter table hub_photos enable row level security;
alter table hub_photo_likes enable row level security;
alter table hub_vendors enable row level security;
alter table hub_song_requests enable row level security;
alter table hub_song_votes enable row level security;
alter table hub_seating_tables enable row level security;
alter table hub_scans enable row level security;

-- wedding_hubs policies
create policy "Public hubs are viewable by all"
  on wedding_hubs for select
  using (is_active = true and is_public = true);

create policy "Hub owners and creators can view their hubs"
  on wedding_hubs for select
  using (auth.uid() = couple_id or auth.uid() = created_by);

create policy "Authenticated users can create hubs"
  on wedding_hubs for insert
  with check (auth.uid() = created_by);

create policy "Hub owners and creators can update"
  on wedding_hubs for update
  using (auth.uid() = couple_id or auth.uid() = created_by);

create policy "Hub owners and creators can delete"
  on wedding_hubs for delete
  using (auth.uid() = couple_id or auth.uid() = created_by);

-- hub_timeline_events policies
create policy "Timeline events viewable with hub"
  on hub_timeline_events for select
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.is_active or h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

create policy "Hub managers can manage timeline"
  on hub_timeline_events for all
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_photos policies
create policy "Approved photos viewable by all"
  on hub_photos for select
  using (is_approved = true);

create policy "Authenticated users can upload photos"
  on hub_photos for insert
  with check (auth.uid() is not null or uploader_email is not null);

create policy "Hub managers can manage photos"
  on hub_photos for update
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_photo_likes policies
create policy "Likes are viewable by all"
  on hub_photo_likes for select using (true);

create policy "Anyone can like"
  on hub_photo_likes for insert
  with check (true);

-- hub_vendors policies
create policy "Vendors viewable by all on active hub"
  on hub_vendors for select
  using (exists (
    select 1 from wedding_hubs h where h.id = hub_id and h.is_active
  ));

create policy "Hub managers can manage vendors"
  on hub_vendors for all
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_song_requests policies
create policy "Song requests viewable by all"
  on hub_song_requests for select
  using (exists (
    select 1 from wedding_hubs h where h.id = hub_id and h.is_active
  ));

create policy "Anyone can request songs"
  on hub_song_requests for insert
  with check (true);

create policy "Hub managers can update songs"
  on hub_song_requests for update
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_song_votes policies
create policy "Song votes viewable by all"
  on hub_song_votes for select using (true);

create policy "Anyone can vote"
  on hub_song_votes for insert with check (true);

-- hub_seating_tables policies
create policy "Seating viewable on active hub"
  on hub_seating_tables for select
  using (exists (
    select 1 from wedding_hubs h where h.id = hub_id and h.is_active
  ));

create policy "Hub managers can manage seating"
  on hub_seating_tables for all
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_scans policies
create policy "Hub managers can view scans"
  on hub_scans for select
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

create policy "Anyone can log a scan"
  on hub_scans for insert with check (true);

-- Function to increment photo like count safely
create or replace function increment_photo_like(p_photo_id uuid)
returns void language plpgsql security definer as $$
begin
  update hub_photos set like_count = like_count + 1 where id = p_photo_id;
end;
$$;

-- Function to increment song vote count safely
create or replace function increment_song_vote(p_request_id uuid)
returns void language plpgsql security definer as $$
begin
  update hub_song_requests set vote_count = vote_count + 1 where id = p_request_id;
end;
$$;

-- Function to increment hub scan count
create or replace function increment_hub_scan(p_hub_id uuid)
returns void language plpgsql security definer as $$
begin
  update wedding_hubs set total_scans = total_scans + 1 where id = p_hub_id;
end;
$$;

-- Function to increment photo upload count
create or replace function increment_hub_photos(p_hub_id uuid)
returns void language plpgsql security definer as $$
begin
  update wedding_hubs set total_photos_uploaded = total_photos_uploaded + 1 where id = p_hub_id;
end;
$$;

-- updated_at trigger
create or replace function update_hub_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_hub_updated_at
  before update on wedding_hubs
  for each row execute function update_hub_updated_at();
