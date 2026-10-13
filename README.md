# AGED

Make a take. See how it ages.

## Local setup

1. Clone this repo.
2. Run `npm install`.
3. Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://baqrivzcwbwgexwstvau.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

4. Run `npm run dev`.

## One-time Supabase setup

The base schema should already exist in the AGED Supabase project.

After you create your own account in AGED, open `supabase/phase2.sql`, replace `YOUR_EMAIL` with your signup email, and run it in Supabase SQL Editor. This enables admin prediction creation/resolution and the leaderboard RPC.

## Current product

- email/password signup + login
- campus onboarding
- Stanford / Berkeley support
- real persistent YEAH / NAH votes
- LEAN / LOCK confidence
- consensus hidden until vote
- Daily 5 feed
- profile + resolved record
- campus leaderboard
- admin create/resolve dashboard
