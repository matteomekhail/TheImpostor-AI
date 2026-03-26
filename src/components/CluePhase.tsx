import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Clue, Player } from '../types';
import ThinkingIndicator from './ThinkingIndicator';
import PhaseHeader from './PhaseHeader';

interface CluePhaseProps {
  clues: Clue[];
  players: Player[];
  thinkingPlayer: string | null;
}

export default function CluePhase({ clues, players, thinkingPlayer }: CluePhaseProps) {
  const getPlayerColor = (name: string) =>
    players.find((p) => p.name === name)?.color || '#e8d8cc';

  const playerCount = players.length;

  const rounds: Clue[][] = [];
  for (let i = 0; i < clues.length; i++) {
    const roundIdx = Math.floor(i / playerCount);
    if (!rounds[roundIdx]) rounds[roundIdx] = [];
    rounds[roundIdx].push(clues[i]);
  }

  const latestRound = rounds.length > 0 ? rounds.length - 1 : 0;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setActiveSlide(latestRound);
  }, [latestRound]);

  return (
    <div>
      <PhaseHeader phase="clue round" />

      {rounds.length >= 1 && (
        <div className="flex items-center gap-2 mb-4">
          {rounds.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`px-3 py-1 rounded-full font-[Tusker_Grotesk] text-xs lowercase tracking-wider cursor-pointer transition-all duration-300 border ${
                activeSlide === idx
                  ? 'border-cream/30 bg-cream/10 text-cream/70'
                  : 'border-white/[0.06] text-cream/30 hover:border-white/[0.12]'
              }`}
            >
              round {idx + 1}
            </button>
          ))}
        </div>
      )}

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {rounds[activeSlide]?.map((clue, i) => (
              <motion.div
                key={`${clue.playerName}-${activeSlide}-${i}`}
                className="relative overflow-hidden rounded-2xl bg-cream/[0.08] backdrop-blur-sm border border-cream/[0.08] p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: getPlayerColor(clue.playerName) }}
                />
                <div className="pl-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getPlayerColor(clue.playerName) }}
                    />
                    <span className="font-[Migra] text-sm text-cream/70 lowercase">
                      {clue.playerName}
                    </span>
                  </div>
                  <span className="font-[Migra] text-2xl md:text-3xl text-cream lowercase tracking-wide">
                    "{clue.word}"
                  </span>
                </div>
              </motion.div>
            ))}

            {activeSlide === latestRound && thinkingPlayer && thinkingPlayer !== 'everyone' && (
              <motion.div
                className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-cream/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ThinkingIndicator
                  color={getPlayerColor(thinkingPlayer)}
                  playerName={thinkingPlayer}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
