# MISS ZERO website

Buildless HTML, CSS and JavaScript. Static output lives in `dist/`.

Preview: `python -m http.server 4173 --bind 127.0.0.1 --directory dist`

Six examples use final collection artwork: 1703, 1132, 3201, 0484, 2999 and 0254. Metadata is embedded in `dist/app.js`. Images are optimized WebP copies; collection masters are unchanged. The film is the approved `miss-zero-night-drive-new-prints.mp4` export.

The presentation site links to a giveaway demo at `/giveaway/`. The demo uses the pinned introduction on [@MISSZERO_NFT](https://x.com/MISSZERO_NFT/status/2124765886305161381). Replies and progress are kept in the current tab.

The Vercel configuration publishes `dist/` as static files. The intended production domain is `misszero.xyz`.

The GitHub Pages workflow publishes only `dist/`. It runs once the repository variable `WALLET_API_URL` points to the project's `save-wallet` Supabase Edge Function. The URL is public. Database credentials stay in Supabase.

Apply the migration in `supabase/migrations/` before deploying `save-wallet`. The table contains one normalized public EVM address per row. The function accepts submissions from the project site and gives visitors no read access. The local preview runs in demo mode with an empty wallet API URL.
