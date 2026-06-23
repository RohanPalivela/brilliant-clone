/** Turn an email local part into a human-friendly name, e.g. "jane.doe" -> "Jane Doe". */
export function nameFromEmail(email?: string | null): string {
  if (!email) return '';
  const local = email.split('@')[0] ?? '';
  return local
    .split(/[._\-+]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Best display name for a user: prefer a real name, otherwise derive one from
 * the email. Stored names that are just the raw email prefix (e.g. "jane.doe")
 * are treated as not-a-real-name and humanized.
 */
export function resolveDisplayName(opts: {
  displayName?: string | null;
  email?: string | null;
}): string {
  const name = opts.displayName?.trim() ?? '';
  const local = opts.email ? (opts.email.split('@')[0] ?? '') : '';
  const looksLikeEmailPrefix =
    name !== '' && local !== '' && name.toLowerCase() === local.toLowerCase();

  if (name && !looksLikeEmailPrefix) return name;
  return nameFromEmail(opts.email) || 'Learner';
}
