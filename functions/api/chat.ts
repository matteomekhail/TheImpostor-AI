interface Env {
  OPENROUTER_API_KEY: string;
}

interface ChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

// Only allow our own models to prevent abuse
const ALLOWED_MODELS = new Set([
  'google/gemini-3.1-pro-preview',
  'openai/gpt-5.2',
  'anthropic/claude-sonnet-4.6',
  'moonshotai/kimi-k2',
  'deepseek/deepseek-v3.2',
]);

// Simple in-memory rate limiter (per-deployment, resets on redeploy)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // max requests per minute
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { OPENROUTER_API_KEY } = context.env;

  if (!OPENROUTER_API_KEY) {
    return Response.json(
      { error: 'OPENROUTER_API_KEY not configured' },
      { status: 500 }
    );
  }

  // Check origin — reject requests without a valid origin
  const origin = context.request.headers.get('Origin') || '';
  const ALLOWED_ORIGINS = [
    'http://localhost',
    'https://theimpostor-ai.pages.dev',
    'https://impostor.matteomekhail.dev',
  ];
  const isAllowed = ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
  if (!isAllowed) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Rate limit
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  if (isRateLimited(ip)) {
    return Response.json({ error: 'Rate limited' }, { status: 429 });
  }

  const body = (await context.request.json()) as ChatRequest;

  // Validate model
  if (!ALLOWED_MODELS.has(body.model)) {
    return Response.json({ error: 'Model not allowed' }, { status: 400 });
  }

  // Cap max_tokens to prevent abuse
  const maxTokens = Math.min(body.max_tokens ?? 300, 500);

  const stream = body.stream === true;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://impostor.matteomekhail.dev',
    },
    body: JSON.stringify({
      model: body.model,
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      max_tokens: maxTokens,
      stream,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return Response.json(
      { error: `OpenRouter API error: ${response.status}`, details: errorText },
      { status: response.status }
    );
  }

  if (stream) {
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim() ?? '';

  return Response.json({ content });
};
