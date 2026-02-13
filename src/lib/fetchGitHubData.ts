import { marked } from 'marked';
import type { GitHubRepoStats } from './types';

const ORG = 'Open-WP-Club';
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'open-wp-club-site',
  };
  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchRepoStats(repoName: string): Promise<GitHubRepoStats> {
  const url = `https://api.github.com/repos/${ORG}/${repoName}`;
  const res = await fetch(url, { headers: githubHeaders() });

  if (!res.ok) {
    console.warn(`Failed to fetch stats for ${repoName}: ${res.status}`);
    return {
      stars: 0,
      forks: 0,
      openIssues: 0,
      lastPush: '',
      createdAt: '',
      topics: [],
      license: null,
      language: null,
      defaultBranch: 'main',
    };
  }

  const data = await res.json();
  return {
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    lastPush: data.pushed_at ?? '',
    createdAt: data.created_at ?? '',
    topics: data.topics ?? [],
    license: data.license?.spdx_id ?? null,
    language: data.language ?? null,
    defaultBranch: data.default_branch ?? 'main',
  };
}

export async function fetchReadme(repoName: string, defaultBranch: string = 'main'): Promise<string> {
  const url = `https://api.github.com/repos/${ORG}/${repoName}/readme`;
  const res = await fetch(url, { headers: githubHeaders() });

  if (!res.ok) {
    return '<p class="text-gray-500 italic">No README available for this plugin.</p>';
  }

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  let html = await marked(content);
  html = rewriteImageUrls(html, repoName, defaultBranch);
  return html;
}

function rewriteImageUrls(html: string, repo: string, branch: string): string {
  return html.replace(
    /(<img\s[^>]*src=")(?!https?:\/\/)([^"]+)(")/gi,
    (_, prefix, src, suffix) => {
      const cleanSrc = src.replace(/^\.\//, '');
      return `${prefix}https://raw.githubusercontent.com/${ORG}/${repo}/${branch}/${cleanSrc}${suffix}`;
    }
  );
}

export async function fetchAllGitHubData(
  repoNames: string[]
): Promise<Map<string, { stats: GitHubRepoStats; readmeHtml: string }>> {
  const results = new Map<string, { stats: GitHubRepoStats; readmeHtml: string }>();
  const BATCH_SIZE = 10;

  for (let i = 0; i < repoNames.length; i += BATCH_SIZE) {
    const batch = repoNames.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (name) => {
        const stats = await fetchRepoStats(name);
        const readmeHtml = await fetchReadme(name, stats.defaultBranch);
        return { name, stats, readmeHtml };
      })
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.set(result.value.name, {
          stats: result.value.stats,
          readmeHtml: result.value.readmeHtml,
        });
      }
    }
  }

  return results;
}
