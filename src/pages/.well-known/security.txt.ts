import type { APIRoute } from 'astro';
import { GITHUB_ORG_URL } from '../../lib/config';

export const GET: APIRoute = async () => {
  // Expires 1 year from build time (RFC 9116 requires this field)
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const lines = [
    `Contact: ${GITHUB_ORG_URL}/.github/security/advisories`,
    `Contact: https://discord.gg/ESTDmmjj`,
    `Expires: ${expires}`,
    `Preferred-Languages: en, bg`,
    `Canonical: https://openwpclub.com/.well-known/security.txt`,
    `Policy: ${GITHUB_ORG_URL}/.github/blob/main/SECURITY.md`,
  ];

  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
