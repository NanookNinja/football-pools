// No API key is needed. A replacement endpoint must return ESPN-compatible JSON.
// For a paid provider, keep its secret on a server/proxy, never in these public files.
window.POOL_CONFIG = {
  season: 2026,
  refreshMs: 30000,
  endpoint: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
};
