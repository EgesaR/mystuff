export function isLegacyIOSUserAgent(userAgent: string): boolean {
  if (!userAgent) {
    return false;
  }

  const isIPad =
    /iPad/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent));

  if (!isIPad) {
    return false;
  }

  const match = userAgent.match(/OS (\d+)[._]/i);

  if (!match) {
    return false;
  }

  const version = Number(match[1]);

  return Number.isFinite(version) && version <= 12;
}
