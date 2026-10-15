/**
 * Cloudflare Worker: WHMCS SSO proxy
 *
 * This worker receives POST requests from your site and calls the WHMCS API
 * to create a one-time client login link (CreateClientLoginLink or similar).
 *
 * SECURITY: Store the WHMCS credentials and a worker secret token in the
 * Worker environment variables (see README.md). Do NOT hardcode secrets here.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Only allow POST
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    // Basic auth using a secret token to avoid public abuse. Set WORKER_SECRET_TOKEN in env.
    const authHeader = request.headers.get('authorization') || '';
    const expectedToken = env.WORKER_SECRET_TOKEN || '';
    if (!authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== expectedToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const identifier = (body.identifier || '').trim();
    if (!identifier) return new Response(JSON.stringify({ error: 'missing identifier' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    // Build WHMCS API request
    const WHMCS_API_IDENTIFIER = env.WHMCS_API_IDENTIFIER;
    const WHMCS_API_SECRET = env.WHMCS_API_SECRET;
    const WHMCS_BASE_URL = env.WHMCS_BASE_URL; // e.g. https://billing.example.com

    if (!WHMCS_API_IDENTIFIER || !WHMCS_API_SECRET || !WHMCS_BASE_URL) {
      return new Response(JSON.stringify({ error: 'server misconfigured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Prepare form data for WHMCS API. The exact action name may vary by WHMCS version.
    // Common action: CreateClientLoginLink (response: loginlink). If your WHMCS uses a different API,
    // adjust accordingly.
    const params = new URLSearchParams();
    params.set('action', 'CreateClientLoginLink');
    // WHMCS API accepts clientid OR email in some builds — try both if needed.
    if (/^\d+$/.test(identifier)) params.set('clientid', identifier); else params.set('email', identifier);
    params.set('responsetype', 'json');
    params.set('identifier', WHMCS_API_IDENTIFIER);
    params.set('secret', WHMCS_API_SECRET);

    const apiUrl = WHMCS_BASE_URL.replace(/\/$/, '') + '/includes/api.php';

    try {
      const whmcsResp = await fetch(apiUrl, {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        // Do not follow automatic redirects
        redirect: 'manual'
      });

      const json = await whmcsResp.json().catch(() => null);
      if (!whmcsResp.ok) {
        return new Response(JSON.stringify({ error: 'WHMCS API error', status: whmcsResp.status, body: json || await whmcsResp.text() }), { status: 502, headers: { 'Content-Type': 'application/json' } });
      }

      // Typical response contains 'loginlink' or 'url' — inspect and return to frontend
      // Example expected json: { result: "success", loginlink: "https://..." }
      if (json && (json.loginlink || json.url || json.result === 'success')) {
        return new Response(JSON.stringify({ success: true, ...json }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ error: 'unexpected response from WHMCS', body: json }), { status: 502, headers: { 'Content-Type': 'application/json' } });

    } catch (err) {
      return new Response(JSON.stringify({ error: 'fetch failed', details: err.message }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }
  }
}
