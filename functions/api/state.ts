interface Env {
  GAME_STATE: KVNamespace;
}

const KV_KEY = 'current_game';
const BUILD_KEY = 'deploy_commit';

const ALLOWED_ORIGINS = [
  'http://localhost',
  'https://theimpostor-ai.pages.dev',
  'https://impostor.matteomekhail.dev',
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return true; // same-origin requests may omit Origin
  return ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed));
}

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : '',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';

  // Auto-reset state on new deploy
  const currentCommit = (context.env as Record<string, string>).CF_PAGES_COMMIT_SHA || '';
  if (currentCommit) {
    const lastCommit = await context.env.GAME_STATE.get(BUILD_KEY);
    if (lastCommit !== currentCommit) {
      await context.env.GAME_STATE.put(BUILD_KEY, currentCommit);
      await context.env.GAME_STATE.delete(KV_KEY);
      return Response.json({ state: null }, { headers: corsHeaders(origin) });
    }
  }

  const data = await context.env.GAME_STATE.get(KV_KEY);

  return Response.json(
    { state: data ? JSON.parse(data) : null },
    { headers: corsHeaders(origin) }
  );
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const origin = context.request.headers.get('Origin') || '';
  if (!isAllowedOrigin(origin)) {
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
