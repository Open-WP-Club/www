import { describe, it, expect } from 'vitest';
import { categorize } from '../categorize';

describe('categorize', () => {
  it('returns "app" for electron topic', () => {
    expect(categorize(['electron'], 'TypeScript', 'my-app')).toBe('app');
  });

  it('returns "app" for mobile topic', () => {
    expect(categorize(['mobile', 'android'], null, 'my-app')).toBe('app');
  });

  it('returns "website" for astro topic', () => {
    expect(categorize(['astro'], 'TypeScript', 'my-site')).toBe('website');
  });

  it('returns "website" for known website slugs', () => {
    expect(categorize([], null, 'openwpclub.com')).toBe('website');
    expect(categorize([], null, 'www')).toBe('website');
  });

  it('returns "plugin" for wordpress-plugin topic', () => {
    expect(categorize(['wordpress-plugin'], 'PHP', 'my-plugin')).toBe('plugin');
  });

  it('returns "plugin" for PHP language without specific tags', () => {
    expect(categorize([], 'PHP', 'some-plugin')).toBe('plugin');
  });

  it('returns "app" for TypeScript language without specific tags', () => {
    expect(categorize([], 'TypeScript', 'some-tool')).toBe('app');
  });

  it('returns "app" for JavaScript language without specific tags', () => {
    expect(categorize([], 'JavaScript', 'some-tool')).toBe('app');
  });

  it('defaults to "plugin" when no language or topics match', () => {
    expect(categorize([], null, 'unknown-repo')).toBe('plugin');
    expect(categorize([], 'Ruby', 'some-thing')).toBe('plugin');
  });

  it('prefers app tags over plugin tags when both are present', () => {
    expect(categorize(['electron', 'wordpress-plugin'], 'PHP', 'hybrid')).toBe('app');
  });

  it('is case-insensitive for topic matching', () => {
    expect(categorize(['WordPress-Plugin'], 'PHP', 'my-plugin')).toBe('plugin');
    expect(categorize(['Electron'], null, 'my-app')).toBe('app');
  });
});
