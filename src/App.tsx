import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from './hooks/useGame';
import GameBoard from './components/GameBoard';
import Rules from './components/Rules';
import History from './components/History';
import Leaderboard from './components/Leaderboard';

type Page = 'game' | 'rules' | 'history' | 'leaderboard';

export default function App() {
  const { state, history, refreshHistory } = useGame();
  const [page, setPage] = useState<Page>('game');

  return (
    <AnimatePresence mode="wait">
      {page === 'rules' && (
        <motion.div key="rules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <Rules onBack={() => setPage('game')} />
        </motion.div>
      )}

      {page === 'history' && (
        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <History history={history} onBack={() => setPage('game')} onRefresh={refreshHistory} />
        </motion.div>
      )}

      {page === 'leaderboard' && (
        <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <Leaderboard history={history} onBack={() => setPage('game')} onRefresh={refreshHistory} />
        </motion.div>
      )}

      {page === 'game' && (
        <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <GameBoard
            state={state}
            onRules={() => setPage('rules')}
            onHistory={() => setPage('history')}
            onLeaderboard={() => setPage('leaderboard')}
          />

          {state.error && (
            <motion.div
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/40 backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-[Neue_Montreal] text-sm text-red-300">{state.error}</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
