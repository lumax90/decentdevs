export function allowedOrigin(request: Request, publicUrl?: string) {
  const value = request.headers.get('origin');
  if (!value) return false;
  try {
    const origin = new URL(value);
    if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== value) return false;
    const internal = new URL(request.url);
    if (origin.origin === internal.origin) return true;
    if (publicUrl && origin.origin === new URL(publicUrl).origin) return true;
    // Next's internal URL can use a bind address instead of the browser's host.
    const host = request.headers.get('host')?.toLowerCase();
    return origin.protocol === internal.protocol && origin.host.toLowerCase() === host;
  } catch { return false; }
}
