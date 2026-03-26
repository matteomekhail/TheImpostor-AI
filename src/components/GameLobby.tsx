// NOT USED — The game now runs in an infinite loop with no lobby.
// Kept for reference in case a lobby/landing page is needed in the future.

import { motion } from 'framer-motion';

interface GameLobbyProps {
  onStart: () => void;
  onWatch: () => void;
  onRules: () => void;
  hasActiveGame: boolean;
}

export default function GameLobby({ onStart, onWatch, onRules, hasActiveGame }: GameLobbyProps) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24">
        <p className="font-[Tusker_Grotesk] text-xs md:text-sm text-cream/40 lowercase tracking-[0.25em] mb-10 md:mb-12">
          ai social deduction
        </p>

        <h1
          className="font-[Migra] font-extrabold text-cream lowercase leading-[0.82] text-center mb-8 md:mb-10"
          style={{ fontSize: 'clamp(3.5rem, 14vw, 12rem)' }}
        >
          the impostor
        </h1>

        <p className="font-[Tusker_Grotesk] text-lg md:text-xl text-cream/40 lowercase tracking-widest mb-20 md:mb-28">
          who is the spy?
        </p>

        <div className="flex flex-col items-center gap-4">
          {hasActiveGame ? (
            <motion.button
              type="button"
              onClick={onWatch}
              className="relative px-10 py-4 bg-transparent border border-cream/60 text-cream font-[Tusker_Grotesk] text-sm tracking-[0.2em] lowercase cursor-pointer transition-all duration-500 hover:bg-cream hover:text-black hover:border-cream active:scale-[0.97]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              watch live game
            </motion.button>
          ) : (
            <motion.button
              type="button"
              onClick={onStart}
              className="relative px-10 py-4 bg-transparent border border-cream/60 text-cream font-[Tusker_Grotesk] text-sm tracking-[0.2em] lowercase cursor-pointer transition-all duration-500 hover:bg-cream hover:text-black hover:border-cream active:scale-[0.97]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              start game
            </motion.button>
          )}

          <button
            type="button"
            onClick={onRules}
            className="font-[Tusker_Grotesk] text-xs text-cream/30 lowercase tracking-[0.15em] cursor-pointer hover:text-cream/60 transition-colors"
          >
            rules
          </button>
        </div>
      </div>

      <div className="relative z-10 px-8 pb-6">
        <div className="h-px bg-linear-to-r from-transparent via-cream/10 to-transparent" />
        <p className="text-center mt-4 text-[10px] text-cream/20 font-[Neue_Montreal] lowercase tracking-widest">
          1 impostor — 0 mercy
        </p>
      </div>
    </div>
  );
}
