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

export async function chatCompletionStream(
  model: string,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  maxTokens: number = 300,
  temperature: number = 0.7,
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data) as {
            choices: { delta: { content?: string } }[];
          };
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) {
            full += chunk;
            onChunk(full);
          }
        } catch { /* skip malformed chunks */ }
      }
    }

    if (full) return full.trim();
    throw new Error('Empty stream response');
  } catch {
    // Fallback to non-streaming if streaming fails
    const result = await chatCompletion(model, messages, maxTokens, temperature);
    onChunk(result);
    return result;
  }
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
