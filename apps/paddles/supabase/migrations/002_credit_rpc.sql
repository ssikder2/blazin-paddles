-- Server-side credit balance: ensures a row exists, reads balance, and deducts atomically.
-- Requires public.profiles from 001_profiles.sql — run that migration first.

create or replace function public.get_my_credits()
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  bal numeric;
begin
  insert into public.profiles (id, credits)
  values (auth.uid(), 10)
  on conflict (id) do nothing;

  select credits into strict bal from public.profiles where id = auth.uid();
  return bal;
end;
$$;

create or replace function public.consume_credits(p_amount numeric)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  new_bal numeric;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'invalid amount';
  end if;

  insert into public.profiles (id, credits)
  values (auth.uid(), 10)
  on conflict (id) do nothing;

  update public.profiles
  set credits = credits - p_amount, updated_at = now()
  where id = auth.uid() and credits >= p_amount
  returning credits into new_bal;

  if new_bal is null then
    raise exception 'insufficient_credits';
  end if;

  return new_bal;
end;
$$;

revoke all on function public.get_my_credits() from public;
revoke all on function public.consume_credits(numeric) from public;
grant execute on function public.get_my_credits() to authenticated;
grant execute on function public.consume_credits(numeric) to authenticated;
