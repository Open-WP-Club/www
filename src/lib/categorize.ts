const PLUGIN_TAGS = ['wordpress', 'wordpress-plugin', 'wp-plugin', 'woocommerce', 'woocommerce-plugin', 'php'];
const APP_TAGS = ['electron', 'desktop', 'mobile', 'android', 'ios', 'tauri', 'react-native', 'flutter'];
const WEBSITE_TAGS = ['astro', 'website'];

export function categorize(topics: string[], language: string | null, slug: string): string {
  const t = topics.map((s) => s.toLowerCase());
  const lang = (language || '').toLowerCase();

  if (t.some((tag) => APP_TAGS.includes(tag))) return 'app';
  if (t.some((tag) => WEBSITE_TAGS.includes(tag)) || slug === 'openwpclub.com' || slug === 'www') return 'website';
  if (t.some((tag) => PLUGIN_TAGS.includes(tag))) return 'plugin';
  if (lang === 'php') return 'plugin';
  if (lang === 'typescript' || lang === 'javascript') return 'app';
  return 'plugin';
}
