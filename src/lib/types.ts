export interface PluginCSVRow {
  name: string;
  description: string;
  version: string;
  downloads: string;
  rating: string;
  github_url: string;
  wordpress_url: string;
  slug: string;
}

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  openIssues: number;
  lastPush: string;
  createdAt: string;
  topics: string[];
  license: string | null;
  language: string | null;
  defaultBranch: string;
}

export interface Plugin {
  slug: string;
  name: string;
  description: string;
  version: string;
  downloads: string;
  rating: string;
  githubUrl: string;
  wordpressUrl: string;
  stars: number;
  forks: number;
  openIssues: number;
  lastPush: string;
  createdAt: string;
  topics: string[];
  license: string | null;
  language: string | null;
  defaultBranch: string;
  readmeHtml: string;
}
