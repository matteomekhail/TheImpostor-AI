import type { ChatMessage, GameState, CompletedGame } from './types';

export async function chatCompletion(
  model: string,
  messages: ChatMessage[],
  maxTokens: number = 300,
  temperature: number = 0.7,
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((err as { error: string }).error || `API error: ${response.status}`);
  }

  const data = (await response.json()) as { content: string };
  return data.content;
}

export async function pushState(state: GameState): Promise<void> {
  await fetch('/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
}

export async function fetchState(): Promise<GameState | null> {
  const response = await fetch('/api/state');
  const data = (await response.json()) as { state: GameState | null };
  return data.state;
}

export async function saveToHistory(game: CompletedGame): Promise<void> {
  await fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game }),
  });
}

export async function fetchHistory(): Promise<CompletedGame[]> {
  const response = await fetch('/api/history');
  const data = (await response.json()) as { history: CompletedGame[] };
  return data.history;
}
