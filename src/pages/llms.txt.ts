import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const plugins = await getCollection('plugins');

  const sorted = plugins.sort((a, b) => {
    if (!a.data.lastPush || !b.data.lastPush) return 0;
    return new Date(b.data.lastPush).getTime() - new Date(a.data.lastPush).getTime();
  });

  const lines: string[] = [
    '# Open WP Club',
    '',
    '> A community of WordPress developers sharing knowledge, collaborating on open source projects, and building better solutions for the WordPress ecosystem.',
    '',
    '## Links',
    '',
    '- Website: https://openwpclub.com',
    '- GitHub: https://github.com/Open-WP-Club',
    '- Discord: https://discord.gg/ESTDmmjj',
    '',
    '## Pages',
    '',
    '- [Home](https://openwpclub.com/)',
    '- [All Plugins](https://openwpclub.com/plugins/)',
    '- [Apps](https://openwpclub.com/apps/)',
    '',
    `## Plugins (${sorted.length})`,
    '',
  ];

  for (const plugin of sorted) {
    const d = plugin.data;
    const meta: string[] = [];
    if (d.version) meta.push(`v${d.version}`);
    if (d.language) meta.push(d.language);
    if (d.stars > 0) meta.push(`${d.stars} stars`);
    if (d.license) meta.push(d.license);

    lines.push(`- [${d.name}](https://openwpclub.com/plugins/${plugin.id}/): ${d.description}${meta.length ? ' (' + meta.join(', ') + ')' : ''}`);
  }

  lines.push('');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
