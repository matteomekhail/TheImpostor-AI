import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { CompletedGame } from '../types';
import { DEFAULT_PLAYERS } from '../config';

interface LeaderboardProps {
  history: CompletedGame[];
  onBack: () => void;
  onRefresh: () => void;
}

interface ModelStats {
  name: string;
  color: string;
  gamesPlayed: number;
  civilianWins: number;
  impostorWins: number;
  timesImpostor: number;
  timesCivilian: number;
  timesAccused: number;
  winRate: number;
}

export default function Leaderboard({ history, onBack, onRefresh }: LeaderboardProps) {
  const stats = useMemo(() => {
    const map = new Map<string, ModelStats>();

    // Init from default players
    for (const p of DEFAULT_PLAYERS) {
      map.set(p.name, {
        name: p.name,
        color: p.color,
        gamesPlayed: 0,
        civilianWins: 0,
        impostorWins: 0,
        timesImpostor: 0,
        timesCivilian: 0,
        timesAccused: 0,
        winRate: 0,
      });
    }

    for (const game of history) {
      for (const round of game.rounds) {
        for (const player of game.players) {
          const s = map.get(player.name);
          if (!s) continue;

          s.gamesPlayed++;

          const isImpostor = player.name === round.impostorName;
          if (isImpostor) {
            s.timesImpostor++;
            if (round.winner === 'impostor') s.impostorWins++;
          } else {
            s.timesCivilian++;
            if (round.winner === 'civilians') s.civilianWins++;
          }

          if (player.name === round.accusedName) {
            s.timesAccused++;
          }
        }
      }
    }

    // Calculate win rates
    for (const s of map.values()) {
      if (s.gamesPlayed > 0) {
        s.winRate = ((s.civilianWins + s.impostorWins) / s.gamesPlayed) * 100;
      }
    }

    return [...map.values()].sort((a, b) => b.winRate - a.winRate || b.gamesPlayed - a.gamesPlayed);
  }, [history]);

  const maxWinRate = stats[0]?.winRate || 1;
  const totalGames = history.length;

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
              &larr; live game
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-8 py-12">
        <h1 className="font-[Migra] font-extrabold text-cream lowercase text-4xl md:text-5xl mb-2">
          leaderboard
        </h1>
        <p className="font-[Neue_Montreal] text-sm text-cream/30 mb-10">
          {totalGames} {totalGames === 1 ? 'game' : 'games'} played
        </p>

        {totalGames === 0 ? (
          <p className="text-cream/40 font-[Neue_Montreal] text-sm">
            no games played yet. stats will appear as games finish.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Rankings */}
            <div className="rounded-3xl bg-cream/[0.04] border border-cream/[0.08] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-cream/[0.08]">
                <span className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-[0.12em]">
                  win rate
                </span>
              </div>

              <div className="divide-y divide-cream/[0.06]">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.name}
                    className="flex items-center gap-4 px-6 py-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.1 }}
                  >
                    <span className="font-[Migra] text-lg text-cream/40 w-6 text-center">
                      {i + 1}
                    </span>

                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />

                    <span className="font-[Migra] text-base text-cream lowercase flex-shrink-0 w-20">
                      {s.name}
                    </span>

                    <div className="flex-1 h-2 bg-cream/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: s.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.winRate / maxWinRate) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 + 0.3 }}
                      />
                    </div>

                    <span className="font-[Tusker_Grotesk] text-base text-cream tabular-nums w-14 text-right">
                      {s.winRate.toFixed(0)}%
                    </span>

                    {i === 0 && (
                      <motion.span
                        className="text-yellow-400 text-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring' }}
                      >
                        ★
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Detailed stats */}
            <div className="rounded-3xl bg-cream/[0.04] border border-cream/[0.08] overflow-hidden">
              <div className="px-6 py-4 border-b border-cream/[0.08]">
                <span className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-[0.12em]">
                  detailed stats
                </span>
              </div>

              <div className="divide-y divide-cream/[0.06]">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.name}
                    className="px-6 py-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 + 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="font-[Migra] text-base text-cream lowercase">
                        {s.name}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <StatBox label="civilian wins" value={s.civilianWins} sub={`/ ${s.timesCivilian}`} />
                      <StatBox label="impostor wins" value={s.impostorWins} sub={`/ ${s.timesImpostor}`} />
                      <StatBox
                        label="impostor escape%"
                        value={s.timesImpostor > 0 ? `${((s.impostorWins / s.timesImpostor) * 100).toFixed(0)}%` : '-'}
                      />
                      <StatBox
                        label="times accused"
                        value={s.timesAccused}
                        sub={`/ ${s.gamesPlayed}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-cream/[0.04] border border-cream/[0.06] px-3 py-2.5">
      <p className="font-[Tusker_Grotesk] text-[10px] text-cream/30 lowercase tracking-wider mb-1">
        {label}
      </p>
      <p className="font-[Migra] text-lg text-cream">
        {value}
        {sub && <span className="text-cream/30 text-sm ml-1">{sub}</span>}
      </p>
    </div>
  );
}
