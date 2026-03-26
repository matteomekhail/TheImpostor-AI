import type { PlayerConfig } from './types';

export const DEFAULT_PLAYERS: PlayerConfig[] = [
  { name: 'Gemini',   modelId: 'google/gemini-3.1-pro-preview',   color: '#4285f4' },
  { name: 'GPT',      modelId: 'openai/gpt-5.2',                 color: '#10a37f' },
  { name: 'Sonnet',   modelId: 'anthropic/claude-sonnet-4.6',     color: '#d97706' },
  { name: 'Kimi',     modelId: 'moonshotai/kimi-k2',              color: '#ef4444' },
  { name: 'DeepSeek', modelId: 'deepseek/deepseek-v3.2',          color: '#6366f1' },
];

export const DEFAULT_ROUNDS = 3;
export const API_TEMPERATURE = 0.7;
export const API_MAX_TOKENS = 500;
export const CLUE_MAX_TOKENS = 50;
export const VOTE_MAX_TOKENS = 50;
export const GUESS_MAX_TOKENS = 30;
