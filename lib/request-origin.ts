type OriginConfig = { appUrl?: string; nodeEnv?: string };

/** Accept one HTTP(S) origin, never credentials, paths, lists, or partial matches. */
export function parseOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().replace(/\/+$/, "");
  if (/[\s\\,]/.test(normalized)) return null;
  try {
    const url = new URL(normalized);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}

/** Nginx must overwrite these headers with single values, not append a chain. */
export function forwardedPublicOrigin(request: Request): string | null {
  const proto = request.headers.get("x-forwarded-proto")?.trim() || new URL(request.url).protocol.slice(0, -1);
  const host = request.headers.get("x-forwarded-host")?.trim() || request.headers.get("host")?.trim();
  if (!host || !["http", "https"].includes(proto) || /[\s\\,/@?#]/.test(host)) return null;
  return parseOrigin(`${proto}://${host}`);
}
function isLoopback(origin: string): boolean {
  return ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname);
}

export function isAllowedRequestOrigin(request: Request, config: OriginConfig = {
  appUrl: process.env.APP_URL, nodeEnv: process.env.NODE_ENV,
}): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const rawOrigin = request.headers.get("origin");
  // Same-origin GETs normally omit Origin. They still require an admin session.
  if (rawOrigin === null) return ["GET", "HEAD", "OPTIONS"].includes(request.method);
  const origin = parseOrigin(rawOrigin);
  if (!origin) return false;
  const development = config.nodeEnv === "development";
  if (isLoopback(origin) && !development) return false;
  const configured = parseOrigin(config.appUrl);
  const forwarded = forwardedPublicOrigin(request);
  // Forwarded/Host headers describe the public URL; they cannot expand the allowlist.
  // APP_URL still works when the reverse proxy exposes an internal request URL.
  const publicOrigin = forwarded && forwarded === configured ? forwarded : configured;
  if (publicOrigin && origin === publicOrigin) return true;
  if (development && isLoopback(origin)) {
    return origin === forwarded || origin === parseOrigin(new URL(request.url).origin);
  }
  return false;
}
