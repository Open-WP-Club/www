import { describe, it, expect } from 'vitest';
import { parseCSVLine } from '../csv';

describe('parseCSVLine', () => {
  it('splits simple comma-separated values', () => {
    expect(parseCSVLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });

  it('handles quoted fields with commas', () => {
    expect(parseCSVLine('"hello, world",foo,bar')).toEqual(['hello, world', 'foo', 'bar']);
  });

  it('handles escaped double quotes inside quoted fields', () => {
    expect(parseCSVLine('"say ""hello""",b')).toEqual(['say "hello"', 'b']);
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

  it('handles empty string', () => {
    expect(parseCSVLine('')).toEqual(['']);
  });

  it('handles quoted field containing newline-like characters', () => {
    expect(parseCSVLine('"a,b","c,d"')).toEqual(['a,b', 'c,d']);
  });
});
