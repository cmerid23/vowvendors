-- ============================================================
-- VowVendors Initial Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role text check (role in ('customer', 'vendor', 'admin')) default 'customer',
  phone text,
  state text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Vendors
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  business_name text not null,
  category text check (category in ('photographer', 'videographer', 'decor', 'music')) not null,
  bio text,
  state text not null,
  city text,
  phone text,
  website text,
  instagram_handle text,
  instagram_access_token text,
  starting_price integer,
  price_unit text default 'event',
  is_featured boolean default false,
  is_verified boolean default false,
  is_active boolean default true,
  avg_rating decimal(3,2) default 0,
  review_count integer default 0,
  created_at timestamptz default now()
);
alter table public.vendors enable row level security;
create policy "Anyone can view active vendors" on public.vendors for select using (is_active = true);
create policy "Vendors can insert own record" on public.vendors for insert with check (auth.uid() = user_id);
create policy "Vendors can update own record" on public.vendors for update using (auth.uid() = user_id);

-- Portfolio images
create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  image_url text not null,
  caption text,
  source text check (source in ('upload', 'instagram', 'unsplash')),
  display_order integer default 0,
  created_at timestamptz default now()
);
alter table public.portfolio_images enable row level security;
create policy "Anyone can view portfolio images" on public.portfolio_images for select using (true);
create policy "Vendor can manage own images" on public.portfolio_images for all using (
  auth.uid() = (select user_id from public.vendors where id = vendor_id)
);

-- Leads
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  state text,
  event_date date,
  service_interest text[],
  message text,
  source text default 'website',
  vendor_id uuid references public.vendors(id),
  status text default 'new',
  created_at timestamptz default now()
);
alter table public.leads enable row level security;
create policy "Anyone can insert a lead" on public.leads for insert with check (true);
create policy "Vendors can view their leads" on public.leads for select using (
  vendor_id is null or
  auth.uid() = (select user_id from public.vendors where id = vendor_id)
);

-- Contact requests
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  from_name text not null,
  from_email text not null,
  from_phone text,
  vendor_id uuid references public.vendors(id) on delete cascade,
  event_date date,
  message text not null,
  status text default 'pending',
  created_at timestamptz default now()
);
alter table public.contact_requests enable row level security;
create policy "Anyone can insert contact request" on public.contact_requests for insert with check (true);
create policy "Vendors can view their contact requests" on public.contact_requests for select using (
  auth.uid() = (select user_id from public.vendors where id = vendor_id)
);
create policy "Vendors can update status" on public.contact_requests for update using (
  auth.uid() = (select user_id from public.vendors where id = vendor_id)
);

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  contact_request_id uuid references public.contact_requests(id) on delete cascade,
  sender_id uuid references public.profiles(id),
  sender_name text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table public.chat_messages enable row level security;
create policy "Participants can view and insert messages" on public.chat_messages for all using (
  auth.uid() = sender_id or
  auth.uid() = (
    select v.user_id from public.vendors v
    join public.contact_requests cr on cr.vendor_id = v.id
    where cr.id = contact_request_id
  )
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text not null,
  rating integer check (rating between 1 and 5),
  review_text text,
  created_at timestamptz default now()
);
alter table public.reviews enable row level security;
create policy "Anyone can view reviews" on public.reviews for select using (true);
create policy "Authenticated users can insert reviews" on public.reviews for insert with check (auth.role() = 'authenticated');

-- Favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, vendor_id)
);
alter table public.favorites enable row level security;
create policy "Users can manage own favorites" on public.favorites for all using (auth.uid() = user_id);

-- Storage bucket for portfolio images
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;
create policy "Anyone can view portfolio images" on storage.objects for select using (bucket_id = 'portfolio');
create policy "Authenticated vendors can upload" on storage.objects for insert with check (
  bucket_id = 'portfolio' and auth.role() = 'authenticated'
);
create policy "Vendors can delete own images" on storage.objects for delete using (
  bucket_id = 'portfolio' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Update avg_rating trigger
create or replace function public.update_vendor_rating()
returns trigger language plpgsql as $$
begin
  update public.vendors
  set
    avg_rating = (select avg(rating) from public.reviews where vendor_id = coalesce(new.vendor_id, old.vendor_id)),
    review_count = (select count(*) from public.reviews where vendor_id = coalesce(new.vendor_id, old.vendor_id))
  where id = coalesce(new.vendor_id, old.vendor_id);
  return new;
end;
$$;
drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute procedure public.update_vendor_rating();

-- Enable Realtime for chat
alter publication supabase_realtime add table public.chat_messages;
