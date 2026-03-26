import { motion } from 'framer-motion';
import type { Player } from '../types';
import ThinkingIndicator from './ThinkingIndicator';

interface PlayerCardProps {
  player: Player;
  isThinking?: boolean;
  showRole?: boolean;
  compact?: boolean;
}

export default function PlayerCard({ player, isThinking, showRole, compact }: PlayerCardProps) {
  const modelShort = player.modelId.split('/').pop()?.replace(':free', '') || player.modelId;

  return (
    <motion.div
      layout
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-gray-900/80 to-gray-800/60
        backdrop-blur-xl border border-gray-700/50
        transition-all duration-500
        ${player.isEliminated ? 'opacity-40' : 'hover:border-cream-20'}
        ${compact ? 'p-3' : 'p-4'}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Accent glow */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ backgroundColor: player.color }}
      />
      <div
        className="absolute top-0 left-0 w-8 h-full opacity-10 blur-xl"
        style={{ backgroundColor: player.color }}
      />

      <div className="relative flex items-center gap-3 pl-3">
        {/* Status dot */}
        <div className="relative flex-shrink-0">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: player.color }}
          />
          {!player.isEliminated && !isThinking && (
            <div
              className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: player.color }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-[Migra] text-base text-cream lowercase leading-tight ${
                player.isEliminated ? 'line-through' : ''
              }`}
            >
              {player.name}
            </span>
            {showRole && (
              <span
                className={`text-[10px] font-[Tusker_Grotesk] tracking-wider uppercase px-1.5 py-0.5 rounded-full ${
                  player.role === 'impostor'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {player.role}
              </span>
            )}
          </div>

          {!compact && (
            <p className="text-[11px] text-cream-40 truncate mt-0.5 font-[Neue_Montreal]">
              {modelShort}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isThinking && <ThinkingIndicator color={player.color} />}
          {!compact && (
            <span className="font-[Tusker_Grotesk] text-sm text-cream-40 tabular-nums">
              {player.score} pts
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
