# VulnWiz AI

React/Vite frontend for the VulnWiz AI security-platform preview.

## Local development

1. Copy `.env.example` to `.env.local` and set the public Supabase URL and anon/publishable key.
2. Run `npm install`, then `npm run dev`.
3. Validate with `npm run build` and `npm run lint`.

## Vercel deployment

`vercel.json` defines SPA rewrites and browser-security headers. Configure
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel for every environment.

Do not use `VITE_*` for service-role keys, Stripe secrets, webhook signing secrets,
or LLM-provider keys. Keep them only in Vercel's encrypted server-side environment
variables and access them only from server-side functions.

See `docs/REMEDIATION_STATUS.md` for the production launch checklist.
