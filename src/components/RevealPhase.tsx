import { motion } from 'framer-motion';
import type { GameState } from '../types';
import PhaseHeader from './PhaseHeader';

interface RevealPhaseProps {
  state: GameState;
}

export default function RevealPhase({ state }: RevealPhaseProps) {
  const { players, accusedName, impostorName, currentWord } = state;

  const impostor = players.find((p) => p.name === impostorName);
  const impostorColor = impostor?.color || '#e8d8cc';
  const caught = accusedName === impostorName;

  return (
    <div>
      <PhaseHeader phase="reveal" />

      <div className="flex flex-col items-center py-6 gap-6">
        <motion.div
          className="relative w-full max-w-md rounded-3xl bg-cream/[0.06] border border-cream/[0.12] p-8 text-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative z-10">
            {caught ? (
              <>
                <motion.p
                  className="font-[Migra] text-red-400 text-4xl lowercase mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  caught!
                </motion.p>

                <p className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider mb-2">
                  the impostor was
                </p>
                <p className="font-[Migra] text-3xl lowercase mb-4" style={{ color: impostorColor }}>
                  {impostorName}
                </p>

                <div className="border-t border-cream/10 pt-4">
                  <p className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider mb-1">
                    the word was
                  </p>
                  <p className="font-[Migra] text-2xl text-cream lowercase">
                    "{currentWord?.word}"
                  </p>
                </div>

                <motion.p
                  className="mt-4 inline-block px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 font-[Tusker_Grotesk] text-sm lowercase tracking-wider"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  civilians win!
                </motion.p>
              </>
            ) : (
              <>
                <motion.p
                  className="font-[Migra] text-green-400 text-4xl lowercase mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  wrong!
                </motion.p>

                <p className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider mb-2">
                  {accusedName} was innocent
                </p>
                <p className="font-[Tusker_Grotesk] text-sm text-cream/70 lowercase tracking-wider mb-4">
                  the impostor{' '}
                  <span style={{ color: impostorColor }} className="font-[Migra] text-lg">
                    {impostorName}
                  </span>{' '}
                  escapes!
                </p>

                <div className="border-t border-cream/10 pt-4">
                  <p className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider mb-1">
                    the word was
                  </p>
                  <p className="font-[Migra] text-2xl text-cream lowercase">
                    "{currentWord?.word}"
                  </p>
                </div>

                <motion.p
                  className="mt-4 inline-block px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 font-[Tusker_Grotesk] text-sm lowercase tracking-wider"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  impostor wins!
                </motion.p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
