-- ============================================
-- CrowdVolt Supabase Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Clean slate
drop view if exists events_with_pricing cascade;
drop table if exists listings cascade;
drop table if exists events cascade;

-- 1. EVENTS TABLE
create table events (
  id bigint primary key generated always as identity,
  name text not null,
  date timestamptz not null,
  venue text not null,
  image_url text,
  is_trending boolean default false,
  created_at timestamptz default now()
);

-- 2. LISTINGS TABLE
create table listings (
  id bigint primary key generated always as identity,
  event_id bigint not null references events(id) on delete cascade,
  seller_id uuid references auth.users(id),
  price numeric not null check (price > 0),
  currency text not null default 'PEN',
  quantity int not null default 1 check (quantity > 0),
  status text not null default 'active' check (status in ('active', 'sold', 'cancelled')),
  created_at timestamptz default now()
);

-- 3. VIEW: events with min price from active listings
create or replace view events_with_pricing as
select
  e.*,
  min(l.price) as min_price,
  count(l.id)::int as listing_count
from events e
left join listings l on l.event_id = e.id and l.status = 'active'
group by e.id;

-- 4. Row Level Security
alter table events enable row level security;
alter table listings enable row level security;

create policy "Events are viewable by everyone"
  on events for select using (true);

create policy "Listings are viewable by everyone"
  on listings for select using (true);

create policy "Authenticated users can create listings"
  on listings for insert with check (auth.uid() = seller_id);

-- 5. Indexes
create index idx_listings_event_id on listings(event_id);
create index idx_listings_status on listings(status);

-- ============================================
-- EVENTS DATA
-- ============================================

insert into events (name, date, venue, image_url, is_trending) values
  ('Circoloco', '2026-03-20 20:00:00-05', 'Fundo Mamacona',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/circoloco.jpg', true),

  ('Rio Electronic Music', '2026-04-04 17:00:00-05', 'Paradiso Lima',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/rio.png', false),

  ('Porter Robinson', '2026-05-01 19:00:00-05', 'Centro de Convenciones Barranco',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/poter.jpg', false),

  ('Maddix', '2026-04-18 21:00:00-05', 'Paradiso Lima',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/maddix_396803.png', true),

  ('Flower Power', '2026-04-02 22:00:00-05', 'Joia',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/sasha.jpg', false),

  ('Anjunadeep', '2026-04-17 12:00:00-05', 'Open Air Lima',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/anjunadeep.jpg', false),

  ('Fabric', '2026-04-25 21:00:00-05', 'Villa',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/fabric.jpg', true),

  ('Ultra Peru', '2026-05-02 12:00:00-05', 'Cultural Lima',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/ULTRA-BUENOS-AIRES-2026-SHARE-IMAGE.png', true),

  ('Motion', '2026-05-31 21:00:00-05', 'Lurin Live',
   'https://ymtoyhtqvnalqlezadly.supabase.co/storage/v1/object/public/event-images/motion.jpg', false);
