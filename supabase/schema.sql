create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  min_order_quantity integer not null default 1 check (min_order_quantity > 0),
  image_url text,
  stock_status text not null default 'available' check (stock_status in ('available', 'limited', 'unavailable')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bulk_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text,
  admin_email text,
  notifications_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.feedback enable row level security;
alter table public.bulk_inquiries enable row level security;
alter table public.site_settings enable row level security;

create policy "Profiles are readable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Categories are public" on public.categories
  for select using (true);

create policy "Products are public" on public.products
  for select using (is_active = true);

create policy "Authenticated users can create products" on public.products
  for insert with check (auth.uid() = seller_id);

create policy "Sellers can update own products" on public.products
  for update using (auth.uid() = seller_id);

create policy "Feedback is public" on public.feedback
  for select using (true);

create policy "Authenticated users can add feedback" on public.feedback
  for insert with check (auth.uid() = user_id);

create policy "Anyone can create bulk inquiries" on public.bulk_inquiries
  for insert with check (true);

create policy "Site settings are public" on public.site_settings
  for select using (true);

insert into public.categories (name, slug) values
  ('Stationery', 'stationery'),
  ('Packaging', 'packaging'),
  ('Cleaning Supplies', 'cleaning-supplies')
on conflict (slug) do nothing;
