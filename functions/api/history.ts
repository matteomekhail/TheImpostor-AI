interface Env {
  GAME_STATE: KVNamespace;
}

const HISTORY_KEY = 'game_history';

// GET /api/history — get all past games
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const data = await context.env.GAME_STATE.get(HISTORY_KEY);
  const history = data ? JSON.parse(data) : [];
  return Response.json({ history });
};

// POST /api/history — save a completed game
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = (await context.request.json()) as { game: unknown };

  const data = await context.env.GAME_STATE.get(HISTORY_KEY);
  const history = data ? JSON.parse(data) : [];

  // Keep last 50 games
  history.unshift(body.game);
  if (history.length > 50) history.length = 50;

  await context.env.GAME_STATE.put(HISTORY_KEY, JSON.stringify(history));

  return Response.json({ ok: true });
};
