export function hasAllowedAuthOrigin(request: Request, configuredOrigin?: string) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try {
    // Next.js can expose its loopback address behind Nginx. Use the configured public origin,
    // never client-supplied Host / forwarding headers, for the production origin check.
    const expected = new URL(configuredOrigin ?? request.url).origin;
    return request.headers.get('origin') === expected;
  } catch {
    return false;
  }
}
