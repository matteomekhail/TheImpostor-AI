interface Env {
  OPENROUTER_API_KEY: string;
}

interface ChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { OPENROUTER_API_KEY } = context.env;

  if (!OPENROUTER_API_KEY) {
    return Response.json(
      { error: 'OPENROUTER_API_KEY not configured' },
      { status: 500 }
    );
  }

  const body = (await context.request.json()) as ChatRequest;

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
      max_tokens: body.max_tokens ?? 300,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return Response.json(
      { error: `OpenRouter API error: ${response.status}`, details: errorText },
      { status: response.status }
    );
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim() ?? '';

  return Response.json({ content });
};
