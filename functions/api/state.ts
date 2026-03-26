interface Env {
  GAME_STATE: KVNamespace;
}

const KV_KEY = 'current_game';

function getAllowedOrigins(origin: string): boolean {
  return !origin || origin.includes('localhost') || origin.includes('matteomekhail') || origin.includes('pages.dev');
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigins(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const data = await context.env.GAME_STATE.get(KV_KEY);

  return Response.json(
    { state: data ? JSON.parse(data) : null },
    { headers: corsHeaders(origin) }
  );
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  if (!getAllowedOrigins(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await context.request.json() as { state: unknown };

  await context.env.GAME_STATE.put(KV_KEY, JSON.stringify(body.state), {
    expirationTtl: 3600,
  });

  return Response.json({ ok: true }, { headers: corsHeaders(origin) });
};

export const onRequestOptions: PagesFunction = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
};
