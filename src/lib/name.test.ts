import { describe, it, expect } from 'vitest';
import { nameFromEmail, resolveDisplayName } from './name';

describe('nameFromEmail', () => {
  it('humanizes a dotted email local part', () => {
    expect(nameFromEmail('jane.doe@example.com')).toBe('Jane Doe');
  });

  it('handles underscores, hyphens, and plus separators', () => {
    expect(nameFromEmail('jane_doe@x.com')).toBe('Jane Doe');
    expect(nameFromEmail('jane-doe@x.com')).toBe('Jane Doe');
    expect(nameFromEmail('jane+tag@x.com')).toBe('Jane Tag');
  });

  it('title-cases a single token', () => {
    expect(nameFromEmail('rohan@x.com')).toBe('Rohan');
  });

  it('returns an empty string for null/empty input', () => {
    expect(nameFromEmail()).toBe('');
    expect(nameFromEmail(null)).toBe('');
    expect(nameFromEmail('')).toBe('');
  });
});

describe('resolveDisplayName', () => {
  it('prefers a real display name', () => {
    expect(
      resolveDisplayName({ displayName: 'Ada Lovelace', email: 'ada@x.com' }),
    ).toBe('Ada Lovelace');
  });

  it('humanizes the email when the stored name is just the email prefix', () => {
    expect(
      resolveDisplayName({ displayName: 'jane.doe', email: 'jane.doe@x.com' }),
    ).toBe('Jane Doe');
  });

  it('derives from email when no display name is given', () => {
    expect(resolveDisplayName({ email: 'jane.doe@x.com' })).toBe('Jane Doe');
  });

  it('falls back to "Learner" when nothing is available', () => {
    expect(resolveDisplayName({})).toBe('Learner');
    expect(resolveDisplayName({ displayName: '   ' })).toBe('Learner');
  });
});
