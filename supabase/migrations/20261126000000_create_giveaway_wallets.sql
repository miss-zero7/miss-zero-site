create table public.giveaway_wallets (
  wallet text primary key check (wallet ~ '^0x[0-9a-f]{40}$')
);

alter table public.giveaway_wallets enable row level security;
revoke all on table public.giveaway_wallets from public, anon, authenticated, service_role;
grant insert on table public.giveaway_wallets to service_role;
