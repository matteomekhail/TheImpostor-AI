export type GamePhase =
  | 'lobby'
  | 'setup'
  | 'clue_round'
  | 'discussion'
  | 'voting'
  | 'reveal'
  | 'final_guess'
  | 'round_result'
  | 'game_over';

export type PlayerRole = 'civilian' | 'impostor';

export interface PlayerConfig {
  name: string;
  modelId: string;
  color: string;
}

export interface Player extends PlayerConfig {
  role: PlayerRole;
  isEliminated: boolean;
  score: number;
}

export interface WordEntry {
  word: string;
  hint: string;
  category: string;
}

export interface Clue {
  playerName: string;
  word: string;
}

export interface DiscussionMessage {
  playerName: string;
  message: string;
}

export interface Vote {
  voter: string;
  target: string;
}

export interface RoundResult {
  roundNumber: number;
  wordEntry: WordEntry;
  impostorName: string;
  clues: Clue[];
  discussion: DiscussionMessage[];
  votes: Vote[];
  accusedName: string;
  impostorCaught: boolean;
  impostorGuess: string | null;
  impostorGuessCorrect: boolean;
  winner: 'impostor' | 'civilians';
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  currentWord: WordEntry | null;
  impostorName: string | null;
  clues: Clue[];
  discussion: DiscussionMessage[];
  votes: Vote[];
  accusedName: string | null;
  impostorGuess: string | null;
  roundResults: RoundResult[];
  thinkingPlayer: string | null;
  waitingForNext: boolean;
  error: string | null;
}

export interface CompletedGame {
  id: string;
  timestamp: number;
  players: Player[];
  rounds: RoundResult[];
}
