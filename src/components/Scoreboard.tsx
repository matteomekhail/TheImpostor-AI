import { motion } from 'framer-motion';
import type { Player, RoundResult } from '../types';

interface ScoreboardProps {
  players: Player[];
  roundResults: RoundResult[];
  isFinal?: boolean;
}

export default function Scoreboard({ players, roundResults, isFinal }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score || 1;

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {isFinal && (
        <motion.h2
          className="font-[Migra] text-4xl md:text-5xl text-cream lowercase text-center mb-8 leading-tight"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          game over
        </motion.h2>
      )}

      <div className="rounded-3xl bg-cream/[0.04] border border-cream/[0.08] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream/[0.08]">
          <span className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-[0.12em]">
            {isFinal ? 'final scores' : 'scoreboard'}
          </span>
          <span className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider">
            {roundResults.length} {roundResults.length === 1 ? 'round' : 'rounds'} played
          </span>
        </div>

        {/* Players */}
        <div className="divide-y divide-cream/[0.06]">
          {sorted.map((player, i) => (
            <motion.div
              key={player.name}
              className="flex items-center gap-4 px-6 py-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.3 }}
            >
              <span className="font-[Migra] text-lg text-cream/40 w-6 text-center">
                {i + 1}
              </span>

              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: player.color }}
              />

              <span className="font-[Migra] text-base text-cream lowercase flex-shrink-0 w-20">
                {player.name}
              </span>

              <div className="flex-1 h-2 bg-cream/[0.06] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: player.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(player.score / maxScore) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 + 0.5 }}
                />
              </div>

              <span className="font-[Tusker_Grotesk] text-base text-cream tabular-nums w-12 text-right">
                {player.score}
              </span>

              {isFinal && i === 0 && (
                <motion.span
                  className="text-yellow-400 text-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring' }}
                >
                  ★
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Round history */}
        {roundResults.length > 0 && (
          <div className="border-t border-cream/[0.08] px-6 py-4">
            <p className="font-[Tusker_Grotesk] text-xs text-cream/40 lowercase tracking-wider mb-3">
              round history
            </p>
            <div className="flex flex-wrap gap-2">
              {roundResults.map((result) => (
                <div
                  key={result.roundNumber}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cream/[0.04] border border-cream/[0.06]"
                >
                  <span className="font-[Tusker_Grotesk] text-[11px] text-cream/40">
                    r{result.roundNumber}
                  </span>
                  <span className="font-[Migra] text-xs text-cream lowercase">
                    {result.wordEntry.word}
                  </span>
                  <span className={`text-[10px] font-[Tusker_Grotesk] tracking-wider ${
                    result.winner === 'impostor' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {result.winner === 'impostor' ? 'spy' : 'civ'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
