import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../types';
import CluePhase from './CluePhase';
import DiscussionPhase from './DiscussionPhase';
import VotingPhase from './VotingPhase';
import RevealPhase from './RevealPhase';
import Scoreboard from './Scoreboard';

interface GameBoardProps {
  state: GameState;
  onRules?: () => void;
  onHistory?: () => void;
  onLeaderboard?: () => void;
}



// Tabs available during gameplay
type Tab = 'clues' | 'discussion' | 'voting' | 'reveal';

const tabOrder: Tab[] = ['clues', 'discussion', 'voting', 'reveal'];

// Map game phase to corresponding tab
function phaseToTab(phase: string): Tab | null {
  if (phase === 'clue_round') return 'clues';
  if (phase === 'discussion') return 'discussion';
  if (phase === 'voting') return 'voting';
  if (phase === 'reveal') return 'reveal';
  return null;
}

// Which tabs have data
function availableTabs(state: GameState): Tab[] {
  const tabs: Tab[] = [];
  if (state.clues.length > 0) tabs.push('clues');
  if (state.discussion.length > 0) tabs.push('discussion');
  if (state.votes.length > 0 || state.phase === 'voting') tabs.push('voting');
  if (state.phase === 'reveal' || state.accusedName) tabs.push('reveal');
  return tabs;
}

export default function GameBoard({ state, onRules, onHistory, onLeaderboard }: GameBoardProps) {
  const { phase, players, currentWord, impostorName, thinkingPlayer } = state;
  const impostorColor = players.find(p => p.name === impostorName)?.color;

  // Active tab — auto-follows the current phase
  const [activeTab, setActiveTab] = useState<Tab>('clues');
  const [reviewingRound, setReviewingRound] = useState<number | null>(null);

  const showingReview = reviewingRound !== null && state.roundResults[reviewingRound - 1];
  const reviewResult = showingReview ? state.roundResults[reviewingRound - 1] : null;

  // Auto-follow current phase
  useEffect(() => {
    if (showingReview) return;
    const tab = phaseToTab(phase);
    if (tab) setActiveTab(tab);
  }, [phase, showingReview]);

  // Clear review when a new round starts
  useEffect(() => {
    setReviewingRound(null);
  }, [state.currentRound]);

  const tabs = showingReview
    ? (['clues', 'discussion', 'voting', 'reveal'] as Tab[])
    : availableTabs(state);

  const isSpecialPhase = phase === 'setup' || phase === 'round_result' || phase === 'game_over';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 border-b border-cream/10 bg-black/95 backdrop-blur-xl">
        {/* Main nav row */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="font-[Migra] text-xl text-cream lowercase">the impostor</span>
            <div className="flex items-center gap-4">
              {onRules && (
                <button onClick={onRules} className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider cursor-pointer hover:text-cream transition-colors">rules</button>
              )}
              {onHistory && (
                <button onClick={onHistory} className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider cursor-pointer hover:text-cream transition-colors">history</button>
              )}
              {onLeaderboard && (
                <button onClick={onLeaderboard} className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider cursor-pointer hover:text-cream transition-colors">leaderboard</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-5">
            {impostorName && !showingReview && (
              <span className="font-[Tusker_Grotesk] text-sm text-cream/50 lowercase tracking-wider">
                spy:{' '}
                <span className="font-[Migra] text-base" style={{ color: impostorColor }}>{impostorName}</span>
              </span>
            )}
            {currentWord && !showingReview && (
              <span className="font-[Migra] text-base text-cream lowercase">
                "{currentWord.word}"
              </span>
            )}
            {showingReview && reviewResult && (
              <span className="font-[Migra] text-base text-cream lowercase">
                "{reviewResult.wordEntry.word}"
                <span className="font-[Tusker_Grotesk] text-sm text-cream/40 ml-2">
                  spy: <span style={{ color: players.find(p => p.name === reviewResult.impostorName)?.color }}>{reviewResult.impostorName}</span>
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Phase tabs — slider navigation */}
        {tabs.length > 0 && !isSpecialPhase && (
          <div className="border-t border-white/[0.04]">
            <div className="max-w-5xl mx-auto px-4 md:px-8 flex items-center gap-1">
              {tabOrder.map((tab) => {
                const isAvailable = tabs.includes(tab);
                const isActive = activeTab === tab;
                const currentTab = phaseToTab(phase);
                const isLive = tab === currentTab && !showingReview;

                if (!isAvailable && !showingReview) return null;

                return (
                  <button
                    key={tab}
                    onClick={() => isAvailable && setActiveTab(tab)}
                    className={`relative px-4 py-2.5 font-[Tusker_Grotesk] text-xs lowercase tracking-wider cursor-pointer transition-all duration-300 ${
                      isActive ? 'text-cream' : isAvailable ? 'text-cream/30 hover:text-cream/50' : 'text-cream/10 cursor-default'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {tab}
                      {isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cream animate-pulse" />
                      )}
                    </span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-px bg-cream"
                        layoutId="phase-tab-indicator"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6">
        {/* Special phases (no tabs) */}
        {!showingReview && phase === 'setup' && (
          <motion.div className="flex flex-col items-center justify-center py-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="w-8 h-8 border-2 border-cream/20 border-t-cream rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="mt-4 font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider">assigning roles...</p>
          </motion.div>
        )}

        {!showingReview && phase === 'round_result' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Scoreboard players={players} roundResults={state.roundResults} />
          </motion.div>
        )}

        {!showingReview && phase === 'game_over' && (
          <motion.div className="flex flex-col items-center gap-8 py-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Scoreboard players={players} roundResults={state.roundResults} isFinal />
            <p className="font-[Tusker_Grotesk] text-sm text-cream/30 lowercase tracking-wider animate-pulse">
              next game starting soon...
            </p>
          </motion.div>
        )}

        {/* Tab content — slider */}
        {!isSpecialPhase && (
          <AnimatePresence mode="wait">
            {/* CLUES tab */}
            {activeTab === 'clues' && (
              <motion.div key="tab-clues" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {showingReview && reviewResult ? (
                  <CluePhase clues={reviewResult.clues} players={players} thinkingPlayer={null} />
                ) : (
                  <CluePhase clues={state.clues} players={players} thinkingPlayer={phase === 'clue_round' ? thinkingPlayer : null} />
                )}
              </motion.div>
            )}

            {/* DISCUSSION tab */}
            {activeTab === 'discussion' && (
              <motion.div key="tab-discussion" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {showingReview && reviewResult ? (
                  <DiscussionPhase discussion={reviewResult.discussion} players={players} thinkingPlayer={null} />
                ) : (
                  <DiscussionPhase discussion={state.discussion} players={players} thinkingPlayer={phase === 'discussion' ? thinkingPlayer : null} />
                )}
              </motion.div>
            )}

            {/* VOTING tab */}
            {activeTab === 'voting' && (
              <motion.div key="tab-voting" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {showingReview && reviewResult ? (
                  <VotingPhase votes={reviewResult.votes} players={players} accusedName={reviewResult.accusedName} thinkingPlayer={null} />
                ) : (
                  <VotingPhase votes={state.votes} players={players} accusedName={state.accusedName} thinkingPlayer={phase === 'voting' ? thinkingPlayer : null} />
                )}
              </motion.div>
            )}

            {/* REVEAL tab */}
            {activeTab === 'reveal' && (
              <motion.div key="tab-reveal" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                {showingReview && reviewResult ? (
                  <div className="text-center py-12">
                    <span className={`inline-block px-4 py-1.5 rounded-full font-[Tusker_Grotesk] text-sm lowercase tracking-wider ${
                      reviewResult.winner === 'civilians' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {reviewResult.winner === 'civilians' ? 'civilians won' : 'impostor won'}
                    </span>
                  </div>
                ) : (
                  <RevealPhase state={state} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* "Go back to live" when reviewing a past round */}
        {showingReview && (
          <div className="flex justify-center py-6">
            <button
              onClick={() => setReviewingRound(null)}
              className="font-[Tusker_Grotesk] text-sm text-cream/40 lowercase tracking-wider cursor-pointer hover:text-cream transition-colors"
            >
              go back to live →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
