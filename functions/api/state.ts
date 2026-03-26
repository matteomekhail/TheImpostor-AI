interface Env {
  GAME_STATE: KVNamespace;
}

const KV_KEY = 'current_game';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET /api/state — get current game state
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const data = await context.env.GAME_STATE.get(KV_KEY);

  if (!data) {
    return Response.json({ state: null }, { headers: CORS_HEADERS });
  }

  return Response.json({ state: JSON.parse(data) }, { headers: CORS_HEADERS });
};

// PUT /api/state — update game state (from host only)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const body = await context.request.json() as { state: unknown };

  // Store with 1 hour TTL (auto-cleanup old games)
  await context.env.GAME_STATE.put(KV_KEY, JSON.stringify(body.state), {
    expirationTtl: 3600,
  });

  return Response.json({ ok: true }, { headers: CORS_HEADERS });
};

// OPTIONS for CORS
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};
