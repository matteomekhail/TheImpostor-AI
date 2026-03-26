export function systemPromptCivilian(
  playerName: string,
  word: string,
  allPlayerNames: string[],
): string {
  const others = allPlayerNames.filter((n) => n !== playerName).join(', ');
  return `You are ${playerName}, playing the Impostor Word Game with: ${others}.

THE SECRET WORD IS: "${word}"

GAME:
- One player is the Impostor who does NOT know the secret word.
- Each round, every player gives ONE WORD clue related to the secret word.
- After 2 rounds, the group discusses and votes.
- NEVER say the secret word itself or an obvious synonym.

YOUR GOAL: Give clues that prove you know the word, but are subtle enough the Impostor can't guess it.

IMPORTANT FORMAT RULES:
- When asked for a clue: reply with EXACTLY one word. No quotes, no punctuation, no explanation.
- When discussing: write 2-3 short sentences analyzing clues and accusing someone.
- When voting: reply with ONLY a player name.`;
}

export function systemPromptImpostor(
  playerName: string,
  allPlayerNames: string[],
): string {
  const others = allPlayerNames.filter((n) => n !== playerName).join(', ');
  return `You are ${playerName}, playing the Impostor Word Game with: ${others}.

YOU ARE THE IMPOSTOR. You do NOT know the secret word.

GAME:
- Everyone else knows a secret word. You must pretend you know it too.
- Each round, every player gives ONE WORD clue. You must bluff.
- After 2 rounds, the group discusses and votes to eliminate someone.
- If you survive the vote, you win.

YOUR GOAL: Blend in. Pay attention to other players' clues to figure out the word, then give clues that fit.

IMPORTANT FORMAT RULES:
- When asked for a clue: reply with EXACTLY one word. No quotes, no punctuation, no explanation. Pick a real, concrete word that could relate to many topics.
- When discussing: write 2-3 short sentences. Act confident and deflect suspicion.
- When voting: reply with ONLY a player name.`;
}

export function cluePrompt(
  playerName: string,
  roundNumber: number,
  previousClues: [string, string][],
): string {
  if (previousClues.length === 0) {
    return `ROUND ${roundNumber}. ${playerName}, give your one-word clue now. Just the word, nothing else.`;
  }
  const clueList = previousClues.map(([name, clue]) => `${name}: ${clue}`).join(', ');
  return `ROUND ${roundNumber}. Previous clues: ${clueList}. ${playerName}, give your one-word clue now. Don't repeat an existing clue. Just the word, nothing else.`;
}

export function discussionPrompt(
  playerName: string,
  allClues: [string, string][],
): string {
  const clueList = allClues.map(([name, clue]) => `${name}: "${clue}"`).join(', ');
  return `DISCUSSION. All clues: ${clueList}. ${playerName}, who is the Impostor? Analyze the clues and explain in 2-3 sentences.`;
}

export function votePrompt(
  playerName: string,
  eligibleNames: string[],
  allClues: [string, string][],
  discussionLog: [string, string][],
): string {
  const clueList = allClues.map(([name, clue]) => `${name}: "${clue}"`).join(', ');
  const discList = discussionLog.map(([name, msg]) => `${name}: "${msg}"`).join(' | ');
  const eligible = eligibleNames.join(', ');
  return `VOTE. Clues: ${clueList}. Discussion: ${discList}. ${playerName}, vote to eliminate one player from: ${eligible}. Reply with ONLY the name.`;
}
