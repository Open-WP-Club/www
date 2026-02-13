import type { APIRoute } from 'astro';
import { GITHUB_ORG_URL } from '../../lib/config';

export const GET: APIRoute = async () => {
  const lines = [
    `Contact: ${GITHUB_ORG_URL}/.github/security/advisories`,
    `Contact: https://discord.gg/ESTDmmjj`,
    `Preferred-Languages: en, bg`,
    `Canonical: https://openwpclub.com/.well-known/security.txt`,
    `Policy: ${GITHUB_ORG_URL}/.github/blob/main/SECURITY.md`,
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
