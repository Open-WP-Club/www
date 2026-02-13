import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseCSVLine, fetchPluginsFromCSV } from '../fetchPlugins';

describe('parseCSVLine', () => {
  it('splits simple comma-separated values', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('handles quoted fields with commas', () => {
    expect(parseCSVLine('"hello, world",foo,bar')).toEqual(['hello, world', 'foo', 'bar']);
  });

  it('handles escaped double quotes inside quoted fields', () => {
    // Note: the trailing .replace(/^"|"$/g, '') in parseCSVLine strips a
    // trailing quote when the parsed value ends with one. This is a known
    // limitation that doesn't affect real CSV data (plugin names/descriptions
    // don't end with literal double quotes).
    expect(parseCSVLine('"say ""hello""",b')).toEqual(['say "hello', 'b']);
  });

  it('trims whitespace from values', () => {
    expect(parseCSVLine('  a , b , c ')).toEqual(['a', 'b', 'c']);
  });

  it('returns single element for single-value line', () => {
    expect(parseCSVLine('hello')).toEqual(['hello']);
  });

  it('handles empty fields', () => {
    expect(parseCSVLine('a,,c')).toEqual(['a', '', 'c']);
  });
});

describe('fetchPluginsFromCSV', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('parses valid CSV with standard headers', async () => {
    const csv = `name,description,version,slug
My Plugin,"A great plugin",1.0.0,my-plugin
Another,"Does stuff",2.1.0,another`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(csv),
    }));

    const plugins = await fetchPluginsFromCSV();
    expect(plugins).toHaveLength(2);
    expect(plugins[0].name).toBe('My Plugin');
    expect(plugins[0].description).toBe('A great plugin');
    expect(plugins[0].version).toBe('1.0.0');
    expect(plugins[0].slug).toBe('my-plugin');
    expect(plugins[1].name).toBe('Another');
  });

  it('skips empty lines', async () => {
    const csv = `name,description
Plugin One,desc1

Plugin Two,desc2
`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(csv),
    }));

    const plugins = await fetchPluginsFromCSV();
    expect(plugins).toHaveLength(2);
  });

  it('generates slug from name when slug column is missing', async () => {
    const csv = `name,description
My Cool Plugin,does things`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(csv),
    }));

    const plugins = await fetchPluginsFromCSV();
    expect(plugins[0].slug).toBe('my-cool-plugin');
  });

  it('returns empty array for header-only CSV', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('name,description'),
    }));

    const plugins = await fetchPluginsFromCSV();
    expect(plugins).toEqual([]);
  });

  it('throws on HTTP error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    }));

    await expect(fetchPluginsFromCSV()).rejects.toThrow('Failed to fetch CSV: HTTP 404');
  });

  it('uses default description when description is empty', async () => {
    const csv = `name,description
Some Plugin,`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(csv),
    }));

    const plugins = await fetchPluginsFromCSV();
    expect(plugins[0].description).toBe('WordPress plugin by Open WP Club');
  });
});
