export function hasValidRequestOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  let originHost: string;
  try {
    const parsedOrigin = new URL(origin);
    if (!["http:", "https:"].includes(parsedOrigin.protocol)) return false;
    originHost = parsedOrigin.host.toLowerCase();
  } catch {
    return false;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim().toLowerCase();
  const host = request.headers.get("host")?.toLowerCase();
  return [forwardedHost, host].some((candidate) => candidate === originHost);
}
