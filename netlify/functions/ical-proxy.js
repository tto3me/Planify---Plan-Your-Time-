export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/plain; charset=utf-8',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    // Validate it looks like a calendar URL
    const parsed = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return new Response(JSON.stringify({ error: 'Invalid URL protocol' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Planify-Calendar/1.0',
        'Accept': 'text/calendar, text/plain, */*',
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Remote server returned ${response.status}` }), {
        status: 502,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    const text = await response.text();

    if (!text.includes('BEGIN:VCALENDAR')) {
      return new Response(JSON.stringify({ error: 'Response is not a valid iCal file' }), {
        status: 422,
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
    }

    return new Response(text, { status: 200, headers });
  } catch (error) {
    const msg = error.name === 'AbortError' ? 'Request timed out' : error.message;
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
};
