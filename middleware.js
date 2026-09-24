// Access control for the dashboard, enforced at the edge — runs before any
// request reaches index.html, so no password logic lives in the page itself
// (see the comment near the top of index.html).
//
// Checks HTTP Basic Auth against the DASH_PASSWORD environment variable set
// in the Vercel project (Settings -> Environment Variables). The username is
// not checked — only the password.

export const config = {
  matcher: '/((?!api).*)',
};

export default function middleware(request) {
  const authHeader = request.headers.get('authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(':');
      const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : '';
      if (password === process.env.DASH_PASSWORD) {
        return;
      }
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Release Performance Dashboard"',
    },
  });
}
