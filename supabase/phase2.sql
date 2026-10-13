-- Run this in Supabase SQL Editor after creating your own AGED account.
-- Then replace YOUR_EMAIL below with the email you used to sign up.

update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'YOUR_EMAIL');

create policy "Admins can create predictions"
on public.predictions for insert
to authenticated
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

create policy "Admins can update predictions"
on public.predictions for update
to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
)
with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true)
);

create or replace function public.get_school_leaderboard(p_school_id uuid)
returns table (
  user_id uuid,
  username text,
  correct_count bigint,
  resolved_count bigint,
  accuracy numeric
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.username,
    count(*) filter (where pr.status = 'resolved' and v.choice = pr.correct_answer) as correct_count,
    count(*) filter (where pr.status = 'resolved' and pr.correct_answer is not null) as resolved_count,
    case
      when count(*) filter (where pr.status = 'resolved' and pr.correct_answer is not null) = 0 then 0
      else round(
        100.0 * count(*) filter (where pr.status = 'resolved' and v.choice = pr.correct_answer)
        / count(*) filter (where pr.status = 'resolved' and pr.correct_answer is not null),
        1
      )
    end as accuracy
  from profiles p
  left join votes v on v.user_id = p.id
  left join predictions pr on pr.id = v.prediction_id
  where p.school_id = p_school_id
  group by p.id, p.username
  order by correct_count desc, accuracy desc, username asc
  limit 100;
$$;

grant execute on function public.get_school_leaderboard(uuid) to authenticated;
