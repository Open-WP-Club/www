import type { PluginCSVRow } from './types';

const CSV_URL = 'https://raw.githubusercontent.com/Open-WP-Club/.github/main/plugins.csv';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map((val) => val.replace(/^"|"$/g, ''));
}

export async function fetchPluginsFromCSV(): Promise<PluginCSVRow[]> {
  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: HTTP ${response.status}`);
  }

  const text = await response.text();
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
  const plugins: PluginCSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 2) continue;

    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    const name = row.name || row.plugin_name || row.title || values[0];
    const description = row.description || row.desc || row.short_description || values[1];

    if (name?.trim()) {
      const slug = row.slug || row.plugin_slug || name.trim().toLowerCase().replace(/\s+/g, '-');
      plugins.push({
        name: name.trim(),
        description: description?.trim() || 'WordPress plugin by Open WP Club',
        version: row.version || row.ver || '',
        downloads: row.downloads || row.download_count || '',
        rating: row.rating || row.stars || '',
        github_url: row.github_url || row.github || row.repo_url || '',
        wordpress_url: row.wordpress_url || row.wp_url || row.plugin_url || '',
        slug,
      });
    }
  }

  return plugins;
}
