/**
 * Fetches plugin + contributor data from GitHub and prints a summary.
 * Run with: npm run fetch-data
 *
 * Useful to verify your GITHUB_TOKEN works and see current data before building.
 * To actually update the site, run: npm run build
 */

const ORG = 'Open-WP-Club';
const CSV_URL = `https://raw.githubusercontent.com/${ORG}/.github/main/plugins.csv`;
const BATCH_SIZE = 10;
const TOKEN = process.env.GITHUB_TOKEN || '';

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'open-wp-club-site' };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; } else { current += char; }
  }
  result.push(current.trim());
  return result.map((v) => v.replace(/^"|"$/g, ''));
}

async function main() {
  console.log('--- Open WP Club Data Fetch ---\n');

  // 1. Check GitHub API rate limit
  console.log('Checking GitHub API rate limit...');
  const rateRes = await fetch('https://api.github.com/rate_limit', { headers: headers() });
  if (rateRes.ok) {
    const rate = await rateRes.json();
    const { remaining, limit, reset } = rate.resources.core;
    const resetTime = new Date(reset * 1000).toLocaleTimeString();
    console.log(`  API: ${remaining}/${limit} requests remaining (resets at ${resetTime})`);
    if (!TOKEN) console.log('  (no GITHUB_TOKEN set — limited to 60 req/hr)');
    if (remaining < 50) {
      console.log('  WARNING: Low API requests remaining. Consider setting GITHUB_TOKEN.');
    }
  }
  console.log();

  // 2. Fetch CSV
  console.log(`Fetching plugin list from CSV...`);
  const csvRes = await fetch(CSV_URL);
  if (!csvRes.ok) {
    console.error(`  FAILED: HTTP ${csvRes.status}`);
    process.exit(1);
  }
  const text = await csvRes.text();
  const lines = text.trim().split(/\r?\n/);
  const csvHeaders = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());

  const plugins: { name: string; slug: string }[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;
    const row: Record<string, string> = {};
    csvHeaders.forEach((h, idx) => { row[h] = values[idx] || ''; });
    const name = row.name || row.plugin_name || row.title || values[0];
    if (name?.trim()) {
      const slug = row.slug || row.plugin_slug || name.trim().toLowerCase().replace(/\s+/g, '-');
      plugins.push({ name: name.trim(), slug });
    }
  }
  console.log(`  Found ${plugins.length} plugins in CSV\n`);

  // 3. Fetch GitHub stats for each plugin
  console.log('Fetching GitHub stats...');
  let stars = 0, forks = 0, issues = 0, failed = 0;

  for (let i = 0; i < plugins.length; i += BATCH_SIZE) {
    const batch = plugins.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (p) => {
        const res = await fetch(`https://api.github.com/repos/${ORG}/${p.slug}`, { headers: headers() });
        if (!res.ok) { failed++; return null; }
        return res.json();
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        stars += r.value.stargazers_count || 0;
        forks += r.value.forks_count || 0;
        issues += r.value.open_issues_count || 0;
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH_SIZE, plugins.length)}/${plugins.length} repos checked\r`);
  }
  console.log();
  console.log(`  Total stars: ${stars}`);
  console.log(`  Total forks: ${forks}`);
  console.log(`  Open issues: ${issues}`);
  if (failed > 0) console.log(`  Failed: ${failed} repos (probably private or renamed)`);
  console.log();

  // 4. Fetch contributors
  console.log('Fetching contributors...');
  const contributorMap = new Map<string, number>();
  for (let i = 0; i < plugins.length; i += BATCH_SIZE) {
    const batch = plugins.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (p) => {
        const res = await fetch(`https://api.github.com/repos/${ORG}/${p.slug}/contributors?per_page=100`, { headers: headers() });
        if (!res.ok) return [];
        return res.json();
      })
    );
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      for (const c of r.value) {
        if (c.type === 'Bot') continue;
        contributorMap.set(c.login, (contributorMap.get(c.login) || 0) + c.contributions);
      }
    }
  }
  console.log(`  Found ${contributorMap.size} unique contributors\n`);

  // 5. Summary
  console.log('=== Summary ===');
  console.log(`  Plugins:      ${plugins.length}`);
  console.log(`  Stars:        ${stars}`);
  console.log(`  Forks:        ${forks}`);
  console.log(`  Contributors: ${contributorMap.size}`);
  console.log();
  console.log('To update the site with this data, run:');
  console.log('  npm run build');
  console.log();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
