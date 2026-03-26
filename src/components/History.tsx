import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompletedGame } from '../types';
import CluePhase from './CluePhase';
import DiscussionPhase from './DiscussionPhase';
import VotingPhase from './VotingPhase';

interface HistoryProps {
  history: CompletedGame[];
  onBack: () => void;
  onRefresh: () => void;
}

export default function History({ history, onBack, onRefresh }: HistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] bg-black/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <span className="font-[Migra] text-base text-cream lowercase">the impostor</span>
          <div className="flex items-center gap-4">
            <button
              onClick={onRefresh}
              className="font-[Tusker_Grotesk] text-xs text-cream/30 lowercase tracking-wider cursor-pointer hover:text-cream/60 transition-colors"
            >
              refresh
            </button>
            <button
              onClick={onBack}
              className="font-[Tusker_Grotesk] text-xs text-cream/40 lowercase tracking-wider cursor-pointer hover:text-cream transition-colors"
            >
              ← live game
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-8 py-12">
        <h1 className="font-[Migra] font-extrabold text-cream lowercase text-4xl md:text-5xl mb-8">
          history
        </h1>

        {history.length === 0 ? (
          <p className="text-cream/40 font-[Neue_Montreal] text-sm">
            no games played yet. games are saved automatically as they finish.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((game) => {
              const isExpanded = expandedId === game.id;
              const round = game.rounds[0];
              if (!round) return null;

              const date = new Date(game.timestamp);
              const timeStr = date.toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              }).toLowerCase();

              const impostorPlayer = game.players.find(p => p.name === round.impostorName);

              return (
                <div key={game.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : game.id)}
                    className="w-full text-left rounded-2xl bg-cream/[0.04] border border-cream/[0.08] p-4 cursor-pointer hover:bg-cream/[0.06] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="font-[Migra] text-base text-cream lowercase">
                          "{round.wordEntry.word}"
                        </span>
                        <span className="font-[Tusker_Grotesk] text-xs text-cream/30 lowercase tracking-wider">
                          {round.wordEntry.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-[Tusker_Grotesk] tracking-wider ${
                          round.winner === 'civilians' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {round.winner === 'civilians' ? 'caught' : 'escaped'}
                        </span>
                        <span className="font-[Neue_Montreal] text-[11px] text-cream/20">
                          {timeStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="font-[Tusker_Grotesk] text-[10px] text-cream/30 lowercase tracking-wider">
                        spy:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: impostorPlayer?.color }} />
                        <span className="font-[Migra] text-xs lowercase" style={{ color: impostorPlayer?.color }}>
                          {round.impostorName}
                        </span>
                      </div>
                      <span className="text-cream/20 text-xs">|</span>
                      <span className="font-[Tusker_Grotesk] text-[10px] text-cream/30 lowercase tracking-wider">
                        accused: {round.accusedName}
                      </span>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          <CluePhase clues={round.clues} players={game.players} thinkingPlayer={null} />
                          <DiscussionPhase discussion={round.discussion} players={game.players} thinkingPlayer={null} />
                          <VotingPhase votes={round.votes} players={game.players} accusedName={round.accusedName} thinkingPlayer={null} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
