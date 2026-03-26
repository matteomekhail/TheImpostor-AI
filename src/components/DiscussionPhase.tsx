import { motion, AnimatePresence } from 'framer-motion';
import type { DiscussionMessage, Player } from '../types';
import ThinkingIndicator from './ThinkingIndicator';
import PhaseHeader from './PhaseHeader';

interface DiscussionPhaseProps {
  discussion: DiscussionMessage[];
  players: Player[];
  thinkingPlayer: string | null;
}

export default function DiscussionPhase({ discussion, players, thinkingPlayer }: DiscussionPhaseProps) {
  const getPlayerColor = (name: string) =>
    players.find((p) => p.name === name)?.color || '#e8d8cc';

  return (
    <div>
      <PhaseHeader phase="discussion" />

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {discussion.map((msg, i) => (
            <motion.div
              key={`${msg.playerName}-${i}`}
              className="relative overflow-hidden rounded-2xl bg-cream/[0.08] backdrop-blur-sm border border-cream/[0.08] p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: getPlayerColor(msg.playerName) }}
              />

              <div className="pl-4 mb-2 flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getPlayerColor(msg.playerName) }}
                />
                <span className="font-[Migra] text-sm text-cream lowercase">
                  {msg.playerName}
                </span>
              </div>

              <p className="pl-4 text-sm text-cream/70 leading-relaxed font-[Neue_Montreal]">
                {msg.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinkingPlayer && thinkingPlayer !== 'everyone' && (
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
      </div>
    </div>
  );
}
