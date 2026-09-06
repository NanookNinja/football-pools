# Tim G.’s 2026 Football Pool

A standalone HTML/CSS/JavaScript app. Both supplied 18-week assignment lists are included. No installation, build tools, paid subscription, or API key is required to host it.

## Put it on your phone with GitHub Pages

1. Create a public GitHub repository, for example `football-pool`.
2. Choose **Add file → Upload files**. Upload the contents of this folder to the repository root, including `index.html`, the CSS and JS files, manifest, service worker, and all icons. Do not upload `.git`, `.openai`, or `dist`. You can omit this README and the build script.
3. Open **Settings → Pages**. Under Source, choose **Deploy from a branch**, then **main**, **/(root)**, and Save.
4. Open the address GitHub shows when publishing finishes (usually `https://YOUR-USERNAME.github.io/football-pool/`). Allow several minutes for the first publish.
5. On iPhone, open that link in Safari → Share → **Add to Home Screen**. On Android, use Chrome’s **Install app** or **Add to Home screen** menu. An install button also appears when supported.

Official instructions: https://docs.github.com/en/pages/quickstart

Alternatively, upload the same files to any HTTPS static host. All asset paths are relative, so subfolder hosting works. Double-clicking index.html is not sufficient for installation or offline support; use an HTTPS host or a localhost web server.

## Live scores and results

- Uses ESPN’s public scoreboard endpoint: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&seasontype=2&week=1&limit=100`.
- Verified on September 6, 2026: returned HTTP 200, season 2026, regular season, week 1, and `Access-Control-Allow-Origin: *`. This is an unofficial public endpoint with no guaranteed availability or update interval.
- Refreshes the selected week every 30 seconds while visible. Other weeks refresh hourly (every 30 seconds if an assigned game is live). Up to three background week requests run together. Requests time out after 12 seconds. Results carry retrieval times and connection errors.
- The feed’s season and week are validated, including January 2027 games that belong to the 2026 regular season. Unknown games remain unconfirmed rather than being labeled a bye.
- 39 Exact highlights a current score of exactly 39. A confirmed win requires a final score of 39. Passing 39 removes the highlight. 50+ highlights any current score of 50 or more; the final score confirms the result. History counts only confirmed final wins.
- Cached feed responses, selected pool, and selected week are saved only in this browser. Fresh reads update past results, including score corrections. Clearing site data removes the cache. Data is not shared across devices.
- Live means periodically retrieved provider scores, not an instantaneous feed. The app must stay open and visible to refresh. It does **not** send push notifications, texts, or lock-screen alerts while closed.

## Change score providers

Edit `config.js` to change `endpoint` or `refreshMs`. A replacement endpoint must accept `dates`, `seasontype`, `week`, and `limit` parameters and return ESPN-compatible JSON (top-level `season.year`, `season.type`, `week.number`, and `events`; each event’s competition has teams, numeric score strings, dates, and status). Otherwise adapt `valid()` in app.js and `gameFor()` in core.js.

If a provider requires a secret API key, create a server-side proxy (for example a Cloudflare Worker), save the key in that service’s secret/environment settings, and put the **proxy URL** in config.js. Do not put a secret key in this public app or GitHub repository. Enable CORS for your app’s origin on that proxy. GitHub Pages itself cannot keep server-side secrets.

## Maintenance

Team numbers are transcribed from the original team key: #4 = Detroit, #14 = San Francisco. The app displays Week and Team # separately. Edit `assignmentNumbers` in `core.js` to change weekly picks; `teamKey` maps all 32 sheet numbers to teams. Per Tim’s correction, Detroit is Week 2 / Team #4 in 39 Exact. Detroit is also Week 10 / Team #4 in 50+. The app is intentionally fixed to the supplied 2026 lists; changing the year requires updating the assignments and cache version. When changing offline assets, bump the cache version in `sw.js`.

For a Sites static build only, run `node build.cjs` to copy public assets to `dist`. GitHub Pages needs no build step.
The original uploaded team-number sheet is included as team-number-sheet.jpg and can be opened full-size inside the app. Include this image when uploading to GitHub Pages.

All three distinct originals are included, unchanged: original-39-pool.jpg (Tim G., row 32), original-50-pool.jpg (Tim G., row 31), and team-number-sheet.jpg. Repeated identical uploads are shown once. Include all three JPG files when hosting. The Original sheets button opens this reference section in the app.
