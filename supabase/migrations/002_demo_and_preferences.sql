-- SpendWise: demo-data flag and monthly budget preference.
-- Run this after 001_initial_schema.sql. It is safe to run more than once.

alter table public.transactions  add column if not exists is_demo boolean not null default false;
alter table public.budgets       add column if not exists is_demo boolean not null default false;
alter table public.savings_goals add column if not exists is_demo boolean not null default false;

alter table public.profiles
  add column if not exists default_monthly_budget numeric(14, 2)
  check (default_monthly_budget is null or default_monthly_budget > 0);
