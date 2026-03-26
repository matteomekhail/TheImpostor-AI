import { motion, AnimatePresence } from 'framer-motion';
import type { Vote, Player } from '../types';
import ThinkingIndicator from './ThinkingIndicator';
import PhaseHeader from './PhaseHeader';

interface VotingPhaseProps {
  votes: Vote[];
  players: Player[];
  accusedName: string | null;
  thinkingPlayer: string | null;
}

export default function VotingPhase({ votes, players, accusedName, thinkingPlayer }: VotingPhaseProps) {
  const getPlayerColor = (name: string) =>
    players.find((p) => p.name === name)?.color || '#e8d8cc';

  const tally = new Map<string, number>();
  for (const v of votes) {
    tally.set(v.target, (tally.get(v.target) || 0) + 1);
  }

  return (
    <div>
      <PhaseHeader phase="voting" />

      <div className="space-y-6">
        {/* Votes — appear one by one */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {votes.map((vote, i) => (
              <motion.div
                key={vote.voter}
                className="flex items-center gap-3 rounded-2xl bg-cream/[0.08] border border-cream/[0.08] p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPlayerColor(vote.voter) }}
                  />
                  <span className="font-[Migra] text-sm text-cream lowercase">
                    {vote.voter}
                  </span>
                </div>

                <span className="text-cream/40 font-[Tusker_Grotesk] text-lg px-2">
                  →
                </span>

                <div className="flex items-center gap-2 flex-1 justify-end">
                  <span className="font-[Migra] text-sm text-cream lowercase">
                    {vote.target}
                  </span>
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getPlayerColor(vote.target) }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking indicator for current voter */}
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

        {/* Tally & Result — appears after all votes are in */}
        {accusedName && (
          <motion.div
            className="rounded-3xl bg-cream/[0.06] border border-cream/[0.12] p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h4 className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-[0.12em] mb-4">
              vote tally
            </h4>

            <div className="space-y-2 mb-5">
              {[...tally.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-24">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPlayerColor(name) }}
                      />
                      <span className="font-[Migra] text-sm text-cream lowercase">{name}</span>
                    </div>
                    <div className="flex-1 h-2 bg-cream/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getPlayerColor(name) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / players.length) * 100}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="font-[Tusker_Grotesk] text-sm text-cream/40 w-6 text-right tabular-nums">
                      {count}
                    </span>
                  </div>
                ))}
            </div>

            <div className="border-t border-cream/10 pt-4 text-center">
              <span className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider">
                the verdict:{' '}
              </span>
              <span
                className="font-[Migra] text-xl lowercase"
                style={{ color: getPlayerColor(accusedName) }}
              >
                {accusedName}
              </span>
              <span className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase">
                {' '}is eliminated
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
