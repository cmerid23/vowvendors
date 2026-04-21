-- Wedding hub extensions: Travel, Things To Do, FAQ

-- Extend wedding_hubs with new columns
alter table wedding_hubs
  add column if not exists show_travel boolean default true,
  add column if not exists show_things_to_do boolean default true,
  add column if not exists show_faq boolean default true,
  add column if not exists venue_city text,
  add column if not exists venue_state text;

-- Travel section (one row per hub)
create table hub_travel (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade unique,
  nearest_airport_name text,
  nearest_airport_code text,
  airport_distance_text text,
  airport_notes text,
  transport_notes text,
  parking_notes text,
  recommended_area text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Hotels recommended by couple
create table hub_hotels (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  name text not null,
  address text,
  distance_from_venue text,
  price_range text,
  booking_link text,
  notes text,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- Things to Do
create table hub_things_to_do (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  name text not null,
  category text default 'general'
    check (category in ('food','outdoors','shopping','culture','entertainment','general')),
  description text,
  address text,
  distance_from_venue text,
  website_url text,
  google_maps_url text,
  is_ai_generated boolean default false,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- FAQ entries
create table hub_faq (
  id uuid primary key default gen_random_uuid(),
  hub_id uuid references wedding_hubs(id) on delete cascade,
  category text default 'general'
    check (category in ('schedule','attire','food','logistics','gifts','children','photos','general')),
  question text not null,
  answer text not null,
  display_order integer default 0,
  is_from_template boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index on hub_travel(hub_id);
create index on hub_hotels(hub_id, display_order);
create index on hub_things_to_do(hub_id, display_order);
create index on hub_faq(hub_id, category, display_order);

-- RLS
alter table hub_travel enable row level security;
alter table hub_hotels enable row level security;
alter table hub_things_to_do enable row level security;
alter table hub_faq enable row level security;

-- hub_travel
create policy "Travel viewable on active hub"
  on hub_travel for select
  using (exists (select 1 from wedding_hubs h where h.id = hub_id and h.is_active));

create policy "Hub managers can manage travel"
  on hub_travel for all
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_hotels
create policy "Hotels viewable on active hub"
  on hub_hotels for select
  using (exists (select 1 from wedding_hubs h where h.id = hub_id and h.is_active));

create policy "Hub managers can manage hotels"
  on hub_hotels for all
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_things_to_do
create policy "Things to do viewable on active hub"
  on hub_things_to_do for select
  using (exists (select 1 from wedding_hubs h where h.id = hub_id and h.is_active));

create policy "Hub managers can manage things to do"
  on hub_things_to_do for all
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- hub_faq
create policy "FAQ viewable on active hub"
  on hub_faq for select
  using (exists (select 1 from wedding_hubs h where h.id = hub_id and h.is_active));

create policy "Hub managers can manage FAQ"
  on hub_faq for all
  using (exists (
    select 1 from wedding_hubs h
    where h.id = hub_id and (h.couple_id = auth.uid() or h.created_by = auth.uid())
  ));

-- updated_at trigger for hub_travel
create or replace function update_hub_travel_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_hub_travel_updated_at
  before update on hub_travel
  for each row execute function update_hub_travel_updated_at();
