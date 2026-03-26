interface Env {
  GAME_STATE: KVNamespace;
}

const HISTORY_KEY = 'game_history';

function getAllowedOrigins(origin: string): boolean {
  return !origin || origin.includes('localhost') || origin.includes('matteomekhail') || origin.includes('pages.dev');
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': getAllowedOrigins(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  const data = await context.env.GAME_STATE.get(HISTORY_KEY);
  const history = data ? JSON.parse(data) : [];
  return Response.json({ history }, { headers: corsHeaders(origin) });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  if (!getAllowedOrigins(origin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await context.request.json()) as { game: unknown };
  const data = await context.env.GAME_STATE.get(HISTORY_KEY);
  const history = data ? JSON.parse(data) : [];

  history.unshift(body.game);
  if (history.length > 50) history.length = 50;

  await context.env.GAME_STATE.put(HISTORY_KEY, JSON.stringify(history));
  return Response.json({ ok: true }, { headers: corsHeaders(origin) });
};
