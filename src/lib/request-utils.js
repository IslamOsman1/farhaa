export function getRequestIp(request) {
  const forwarded = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  if (!forwarded) return 'unknown';
  return String(forwarded).split(',')[0].trim();
}

export function getRequestUserAgent(request) {
  return request.headers.get('user-agent') || 'unknown';
}
