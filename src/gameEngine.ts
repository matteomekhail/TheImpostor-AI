import type {
  ChatMessage,
  Clue,
  DiscussionMessage,
  GameState,
  Player,
  PlayerConfig,
  RoundResult,
  Vote,
  WordEntry,
} from './types';
import { chatCompletion, chatCompletionStream } from './api';
import { wordBank } from './wordBank';
import {
  systemPromptCivilian,
  systemPromptImpostor,
  cluePrompt,
  discussionPrompt,
  votePrompt,
} from './prompts';
import {
  API_TEMPERATURE,
  API_MAX_TOKENS,
  VOTE_MAX_TOKENS,
} from './config';

const CLUE_ROUNDS = 3; // 3 rounds of clues before discussion/vote

type StateUpdater = (updater: (prev: GameState) => GameState) => void;


const playerHistories = new Map<string, ChatMessage[]>();

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickWord(usedWords: Set<string>): WordEntry {
  const available = wordBank.filter((w) => !usedWords.has(w.word));
  if (available.length === 0) {
    usedWords.clear();
    return wordBank[Math.floor(Math.random() * wordBank.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

function extractSingleWord(raw: string): string {
  // Strip <think> blocks and markdown
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '').trim();

  // Try to find a word after common patterns like "My clue is: X" or "Clue: X"
  const colonMatch = cleaned.match(/(?:clue|word|answer|hint|is|be)[:\s]+\**([a-zA-ZÀ-ÿ]{2,})\**/i);
  if (colonMatch) return colonMatch[1].toLowerCase();

  // Try to find a bold/quoted word: **word** or "word"
  const boldMatch = cleaned.match(/\*\*([a-zA-ZÀ-ÿ]{2,})\*\*/);
  if (boldMatch) return boldMatch[1].toLowerCase();
  const quotedMatch = cleaned.match(/["'""]([a-zA-ZÀ-ÿ]{2,})["'""]/);
  if (quotedMatch) return quotedMatch[1].toLowerCase();

  // Strip all punctuation and split
  cleaned = cleaned.replace(/[*_`"'""''()[\]{}<>:.!?,;#\-—\/\\|]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(w => /^[a-zA-ZÀ-ÿ]{2,}$/.test(w));

  if (words.length === 0) return '';
  if (words.length === 1) return words[0].toLowerCase();

  // If it's a sentence, take the last word (most models put the answer at the end)
  // But skip common filler words
  const skip = new Set(['the', 'is', 'my', 'clue', 'word', 'here', 'answer', 'would', 'be', 'it', 'this', 'that', 'an', 'of', 'for', 'to', 'as', 'so', 'and', 'or', 'in', 'on', 'at']);
  const meaningful = words.filter(w => !skip.has(w.toLowerCase()));
  if (meaningful.length > 0) {
    return meaningful[meaningful.length - 1].toLowerCase();
  }

  return words[words.length - 1].toLowerCase();
}


function extractPlayerName(raw: string, validNames: string[]): string {
  const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const lower = cleaned.toLowerCase();
  for (const name of validNames) {
    if (lower.includes(name.toLowerCase())) {
      return name;
    }
  }
  return validNames[0];
}

async function sendToPlayer(
  player: Player,
  userMessage: string,
  maxTokens: number = API_MAX_TOKENS,
): Promise<string> {
  const history = playerHistories.get(player.name) || [];
  history.push({ role: 'user', content: userMessage });
  playerHistories.set(player.name, history);

  const response = await chatCompletion(
    player.modelId,
    history,
    maxTokens,
    API_TEMPERATURE,
  );

  history.push({ role: 'assistant', content: response });
  return response;
}

function addContext(playerName: string, content: string) {
  const history = playerHistories.get(playerName) || [];
  history.push({ role: 'user', content });
  playerHistories.set(playerName, history);
}

export async function runGame(
  playerConfigs: PlayerConfig[],
  totalRounds: number,
  setState: StateUpdater,
): Promise<void> {
  const players: Player[] = playerConfigs.map((config) => ({
    ...config,
    role: 'civilian' as const,
    isEliminated: false,
    score: 0,
  }));

  const usedWords = new Set<string>();
  const allResults: RoundResult[] = [];

  setState((prev) => ({
    ...prev,
    phase: 'setup',
    players: [...players],
    totalRounds,
    currentRound: 0,
    roundResults: [],
    error: null,
  }));

  for (let round = 1; round <= totalRounds; round++) {
    const result = await runRound(round, players, usedWords, totalRounds, setState);
    allResults.push(result);

    // Scoring: 1 point to each civilian if caught, 1 point to impostor if not caught
    for (const p of players) {
      if (result.winner === 'civilians' && p.name !== result.impostorName) {
        p.score += 1;
      }
      if (result.winner === 'impostor' && p.name === result.impostorName) {
        p.score += 1;
      }
    }

    setState((prev) => ({
      ...prev,
      phase: 'round_result',
      players: [...players],
      roundResults: [...allResults],
    }));

  }

  setState((prev) => ({
    ...prev,
    phase: 'game_over',
    players: [...players],
    roundResults: [...allResults],
  }));
}

async function runRound(
  roundNumber: number,
  players: Player[],
  usedWords: Set<string>,
  totalRounds: number,
  setState: StateUpdater,
): Promise<RoundResult> {
  const wordEntry = pickWord(usedWords);
  usedWords.add(wordEntry.word);

  const impostorIndex = Math.floor(Math.random() * players.length);
  const allNames = players.map((p) => p.name);

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    player.isEliminated = false;

    if (i === impostorIndex) {
      player.role = 'impostor';
      const sysPrompt = systemPromptImpostor(player.name, allNames);
      playerHistories.set(player.name, [{ role: 'system', content: sysPrompt }]);
    } else {
      player.role = 'civilian';
      const sysPrompt = systemPromptCivilian(player.name, wordEntry.word, allNames);
      playerHistories.set(player.name, [{ role: 'system', content: sysPrompt }]);
    }
  }

  const impostorName = players[impostorIndex].name;

  setState((prev) => ({
    ...prev,
    phase: 'setup',
    currentRound: roundNumber,
    totalRounds,
    currentWord: wordEntry,
    impostorName,
    players: [...players],
    clues: [],
    discussion: [],
    votes: [],
    accusedName: null,
    impostorGuess: null,
    thinkingPlayer: null,
    error: null,
  }));

  // --- CLUE PHASE (multiple rounds) ---
  setState((prev) => ({ ...prev, phase: 'clue_round', clues: [] }));
  const allClues: Clue[] = [];

  for (let clueRound = 1; clueRound <= CLUE_ROUNDS; clueRound++) {
    const order = shuffle(players);

    for (const player of order) {
      setState((prev) => ({ ...prev, thinkingPlayer: player.name }));

      const previousClues: [string, string][] = allClues.map((c) => [c.playerName, c.word]);
      const prompt = cluePrompt(player.name, clueRound, previousClues);

      let clueWord = '';
      for (let attempt = 0; attempt < 3; attempt++) {
        const retryPrompt = attempt === 0
          ? prompt
          : 'Reply with ONLY a single word — your clue. Nothing else.';
        const raw = await sendToPlayer(player, retryPrompt, 100);
        clueWord = extractSingleWord(raw);

        // Reject if empty or is the secret word itself
        if (clueWord && clueWord !== wordEntry.word.toLowerCase()) break;
        if (clueWord === wordEntry.word.toLowerCase()) {
          addContext(player.name, 'You cannot use the secret word as a clue. Give a different word.');
          clueWord = '';
        }
      }
      if (!clueWord) clueWord = '---';

      const clue: Clue = { playerName: player.name, word: clueWord };
      allClues.push(clue);

      setState((prev) => ({
        ...prev,
        clues: [...allClues],
        thinkingPlayer: null,
      }));

    }
  }

  // Wait for "next" before discussion

  // --- DISCUSSION PHASE ---
  setState((prev) => ({ ...prev, phase: 'discussion', discussion: [] }));
  const discussionOrder = shuffle(players);
  const discussion: DiscussionMessage[] = [];
  const cluePairs: [string, string][] = allClues.map((c) => [c.playerName, c.word]);

  for (const player of discussionOrder) {
    setState((prev) => ({ ...prev, thinkingPlayer: player.name }));

    const prompt = discussionPrompt(player.name, cluePairs);

    // Stream discussion messages for live text display
    const history = playerHistories.get(player.name) || [];
    history.push({ role: 'user', content: prompt });
    playerHistories.set(player.name, history);

    const streamingMsg: DiscussionMessage = { playerName: player.name, message: '' };
    discussion.push(streamingMsg);

    const raw = await chatCompletionStream(
      player.modelId,
      history,
      (textSoFar) => {
        const cleaned = textSoFar.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        streamingMsg.message = cleaned;
        setState((prev) => ({
          ...prev,
          discussion: [...discussion],
        }));
      },
      API_MAX_TOKENS,
      API_TEMPERATURE,
    );

    history.push({ role: 'assistant', content: raw });

    const message = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    streamingMsg.message = message;

    for (const other of players) {
      if (other.name !== player.name) {
        addContext(other.name, `${player.name} said: "${message}"`);
      }
    }

    setState((prev) => ({
      ...prev,
      discussion: [...discussion],
      thinkingPlayer: null,
    }));

  }

  // Wait for "next" before voting

  // --- VOTING PHASE (sequential — show each vote in real time) ---
  setState((prev) => ({ ...prev, phase: 'voting', votes: [] }));
  const discPairs: [string, string][] = discussion.map((d) => [d.playerName, d.message]);
  const voteOrder = shuffle(players);
  const votes: Vote[] = [];

  for (const player of voteOrder) {
    setState((prev) => ({ ...prev, thinkingPlayer: player.name }));

    const targets = allNames.filter((n) => n !== player.name);
    const prompt = votePrompt(player.name, targets, cluePairs, discPairs);
    const raw = await sendToPlayer(player, prompt, VOTE_MAX_TOKENS);
    const target = extractPlayerName(raw, targets);
    const vote: Vote = { voter: player.name, target };
    votes.push(vote);

    setState((prev) => ({
      ...prev,
      votes: [...votes],
      thinkingPlayer: null,
    }));

  }

  // Tally
  const tally = new Map<string, number>();
  for (const v of votes) {
    tally.set(v.target, (tally.get(v.target) || 0) + 1);
  }
  const maxVotes = Math.max(...tally.values());
  const topVoted = [...tally.entries()].filter(([, count]) => count === maxVotes).map(([name]) => name);
  const accusedName = topVoted[Math.floor(Math.random() * topVoted.length)];

  setState((prev) => ({
    ...prev,
    accusedName,
  }));


  // Wait for "next" before reveal

  // --- REVEAL ---
  const impostorCaught = accusedName === impostorName;
  setState((prev) => ({ ...prev, phase: 'reveal' }));


  // Winner: impostor wins if not caught, civilians win if caught
  const impostorGuess: string | null = null;
  const impostorGuessCorrect = false;
  const winner: 'impostor' | 'civilians' = impostorCaught ? 'civilians' : 'impostor';

  return {
    roundNumber,
    wordEntry,
    impostorName,
    clues: allClues,
    discussion,
    votes,
    accusedName,
    impostorCaught,
    impostorGuess,
    impostorGuessCorrect,
    winner,
  };
}

