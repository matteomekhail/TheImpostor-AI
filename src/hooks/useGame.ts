import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameState, CompletedGame } from '../types';
import { DEFAULT_PLAYERS } from '../config';
import { runGame } from '../gameEngine';
import { pushState, fetchState, saveToHistory, fetchHistory } from '../api';

const initialState: GameState = {
  phase: 'lobby',
  players: [],
  currentRound: 0,
  totalRounds: 1, // Each "game" is 1 round (1 word)
  currentWord: null,
  impostorName: null,
  clues: [],
  discussion: [],
  votes: [],
  accusedName: null,
  impostorGuess: null,
  roundResults: [],
  thinkingPlayer: null,
  waitingForNext: false,
  error: null,
};

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);
  const [history, setHistory] = useState<CompletedGame[]>([]);
  const isHostRef = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loopRunningRef = useRef(false);

  // On mount: check server state and load history
  useEffect(() => {
    init();
    return () => stopPolling();
  }, []);

  async function init() {
    // Load history
    try {
      const h = await fetchHistory();
      setHistory(h);
    } catch { /* ignore */ }

    // Check for active game
    const serverState = await fetchState().catch(() => null);
    if (serverState && serverState.phase !== 'lobby') {
      // Game already running — become viewer
      setState(serverState);
      startPolling();
    } else {
      // No game — become host, start the loop
      becomeHost();
    }
  }

  function startPolling() {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const serverState = await fetchState();
        if (serverState) {
          setState(serverState);
        }
      } catch { /* ignore */ }
    }, 1500);
  }

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  // Host's state updater
  const updateState = useCallback((updater: (prev: GameState) => GameState) => {
    setState((prev) => {
      const next = updater(prev);
      pushState(next).catch(() => {});
      return next;
    });
  }, []);

  function becomeHost() {
    if (loopRunningRef.current) return;
    isHostRef.current = true;
    loopRunningRef.current = true;
    stopPolling();
    runGameLoop();
  }

  async function runGameLoop() {
    while (loopRunningRef.current) {
      try {
        // Run one game (1 round = 1 word, 3 clue rounds, discussion, vote, reveal)
        await runGame(DEFAULT_PLAYERS, 1, updateState);

        // Save completed game to history
        // We need to read current state to get the results
        const currentState = await fetchState();
        if (currentState && currentState.roundResults.length > 0) {
          const completed: CompletedGame = {
            id: `game_${Date.now()}`,
            timestamp: Date.now(),
            players: currentState.players,
            rounds: currentState.roundResults,
          };
          await saveToHistory(completed);
          setHistory((prev) => [completed, ...prev].slice(0, 50));
        }

        // Show results for 8 seconds before starting next game
        await delay(8000);
      } catch (err) {
        // On error, wait and retry
        updateState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Unknown error',
        }));
        await delay(5000);
      }
    }
  }

  const refreshHistory = useCallback(async () => {
    try {
      const h = await fetchHistory();
      setHistory(h);
    } catch { /* ignore */ }
  }, []);

  return {
    state,
    history,
    refreshHistory,
    isHost: isHostRef.current,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
