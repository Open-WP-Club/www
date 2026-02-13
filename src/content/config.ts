import { defineCollection, z } from 'astro:content';
import { fetchPluginsFromCSV } from '../lib/fetchPlugins';
import { fetchAllGitHubData } from '../lib/fetchGitHubData';

const plugins = defineCollection({
  loader: async () => {
    console.log('[plugins] Fetching plugin data from CSV...');
    const csvPlugins = await fetchPluginsFromCSV();
    console.log(`[plugins] Found ${csvPlugins.length} plugins in CSV`);

    const repoNames = csvPlugins.map((p) => p.slug);
    console.log('[plugins] Fetching GitHub data...');
    const githubData = await fetchAllGitHubData(repoNames);
    console.log(`[plugins] Got GitHub data for ${githubData.size} repos`);

    return csvPlugins.map((plugin) => {
      const gh = githubData.get(plugin.slug);
      return {
        id: plugin.slug,
        name: plugin.name,
        description: plugin.description,
        version: plugin.version,
        downloads: plugin.downloads,
        rating: plugin.rating,
        githubUrl:
          plugin.github_url || `https://github.com/Open-WP-Club/${plugin.slug}`,
        wordpressUrl: plugin.wordpress_url,
        stars: gh?.stats.stars ?? 0,
        forks: gh?.stats.forks ?? 0,
        openIssues: gh?.stats.openIssues ?? 0,
        lastPush: gh?.stats.lastPush ?? '',
        createdAt: gh?.stats.createdAt ?? '',
        topics: gh?.stats.topics ?? [],
        license: gh?.stats.license ?? null,
        language: gh?.stats.language ?? null,
        defaultBranch: gh?.stats.defaultBranch ?? 'main',
        readmeHtml: gh?.readmeHtml ?? '',
      };
    });
  },
  schema: z.object({
    name: z.string(),
    description: z.string(),
    version: z.string(),
    downloads: z.string(),
    rating: z.string(),
    githubUrl: z.string(),
    wordpressUrl: z.string(),
    stars: z.number(),
    forks: z.number(),
    openIssues: z.number(),
    lastPush: z.string(),
    createdAt: z.string(),
    topics: z.array(z.string()),
    license: z.string().nullable(),
    language: z.string().nullable(),
    defaultBranch: z.string(),
    readmeHtml: z.string(),
  }),
});

export const collections = { plugins };
