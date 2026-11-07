-- SpendWise: initial database schema.
-- Paste this whole file into the Supabase SQL Editor and press "Run".
-- It is safe to run more than once.

-- 1. TABLES ---------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text not null,
  avatar_url  text,
  currency    text not null default 'PKR' check (currency ~ '^[A-Z]{3}$'),
  date_format text not null default 'DD/MM/YYYY'
              check (date_format in ('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD')),
  created_at  timestamptz not null default now()
);

create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  title            text not null check (char_length(trim(title)) > 0),
  amount           numeric(14, 2) not null check (amount > 0),
  type             text not null check (type in ('income', 'expense')),
  category         text not null,
  payment_method   text not null
                   check (payment_method in ('Cash', 'Debit Card', 'Credit Card', 'Bank Transfer', 'Mobile Wallet', 'Other')),
  transaction_date date not null default current_date,
  description      text,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- category = 'Overall' means the total monthly budget.
create table if not exists public.budgets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  category   text not null,
  amount     numeric(14, 2) not null check (amount > 0),
  month      smallint not null check (month between 1 and 12),
  year       smallint not null check (year between 2000 and 2100),
  created_at timestamptz not null default now(),
  unique (user_id, category, month, year)
);

create table if not exists public.savings_goals (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  title          text not null check (char_length(trim(title)) > 0),
  target_amount  numeric(14, 2) not null check (target_amount > 0),
  current_amount numeric(14, 2) not null default 0 check (current_amount >= 0),
  target_date    date,
  description    text,
  created_at     timestamptz not null default now()
);

-- 2. INDEXES --------------------------------------------------------------

create index if not exists transactions_user_date_idx     on public.transactions (user_id, transaction_date desc);
create index if not exists transactions_user_type_idx     on public.transactions (user_id, type);
create index if not exists transactions_user_category_idx on public.transactions (user_id, category);
create index if not exists budgets_user_period_idx        on public.budgets (user_id, year, month);
create index if not exists savings_goals_user_idx         on public.savings_goals (user_id);

-- 3. AUTOMATIC BEHAVIOUR --------------------------------------------------

-- Keep transactions.updated_at current.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

-- Create a profile row whenever someone registers.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets a signed-in user delete their own account (used by Settings, Stage 4).
-- Their rows in every table are removed automatically (on delete cascade).
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'You must be signed in.';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 4. ROW LEVEL SECURITY ---------------------------------------------------
-- Every user can only see and change their own rows.

alter table public.profiles      enable row level security;
alter table public.transactions  enable row level security;
alter table public.budgets       enable row level security;
alter table public.savings_goals enable row level security;

drop policy if exists "Read own profile"   on public.profiles;
drop policy if exists "Update own profile" on public.profiles;
create policy "Read own profile"   on public.profiles for select using (auth.uid() = id);
create policy "Update own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Manage own transactions" on public.transactions;
create policy "Manage own transactions" on public.transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Manage own budgets" on public.budgets;
create policy "Manage own budgets" on public.budgets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Manage own savings goals" on public.savings_goals;
create policy "Manage own savings goals" on public.savings_goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
