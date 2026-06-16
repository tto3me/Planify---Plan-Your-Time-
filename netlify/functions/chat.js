export default async (req, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers, status: 200 });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { headers, status: 405 });
  }

  try {
    const { messages, tools, systemPrompt } = await req.json();
    const apiKey = process.env.MISTRAL_API_KEY || process.env.VITE_MISTRAL_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'MISTRAL_API_KEY is not set on the server.' }), { status: 500, headers });
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        tools: tools,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `Mistral API Error: ${response.status} ${errText}` }), { status: response.status, headers });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Chat proxy error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
};
