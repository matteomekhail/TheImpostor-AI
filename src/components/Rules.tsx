import { motion } from 'framer-motion';

interface RulesProps {
  onBack: () => void;
}

export default function Rules({ onBack }: RulesProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] bg-black/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <span className="font-[Migra] text-base text-cream lowercase">the impostor</span>
          <button
            onClick={onBack}
            className="font-[Tusker_Grotesk] text-xs text-cream/40 lowercase tracking-wider cursor-pointer hover:text-cream transition-colors"
          >
            ← back
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-8 py-12 md:py-16">
        <h1 className="font-[Migra] font-extrabold text-cream lowercase text-4xl md:text-6xl mb-12">
          rules
        </h1>

        <div className="space-y-10">
          {/* Objective */}
          <Section title="objective">
            <p>one player is secretly the <strong>impostor</strong> — they don't know the secret word. everyone else does.</p>
            <p>the group must figure out who the impostor is. the impostor must blend in and avoid detection.</p>
          </Section>

          {/* How it works */}
          <Section title="how it works">
            <Step n={1} title="a secret word is chosen">
              all players except the impostor see the word. the impostor gets nothing — no hints, no category.
            </Step>
            <Step n={2} title="clue rounds (2 rounds)">
              each player gives <strong>one word</strong> as a clue about the secret word. the impostor must bluff a convincing clue without knowing the word. clues go around twice.
            </Step>
            <Step n={3} title="discussion">
              players analyze the clues and debate who they think the impostor is. vague or off-target clues are suspicious.
            </Step>
            <Step n={4} title="vote">
              everyone votes to eliminate one player. the player with the most votes is out.
            </Step>
            <Step n={5} title="reveal">
              the eliminated player's role is revealed. if the impostor was caught — civilians win. if an innocent was eliminated — the impostor wins.
            </Step>
          </Section>

          {/* Scoring */}
          <Section title="scoring">
            <p><strong>civilians win:</strong> each civilian gets 1 point if they catch the impostor.</p>
            <p><strong>impostor wins:</strong> the impostor gets 1 point if they survive the vote.</p>
            <p>the game runs for <strong>3 rounds</strong> with a new word and a new impostor each time.</p>
          </Section>

          {/* Strategy */}
          <Section title="strategy tips">
            <p><strong>as a civilian:</strong> give clues that are specific enough to prove you know the word, but subtle enough that the impostor can't figure it out.</p>
            <p><strong>as the impostor:</strong> listen carefully to other players' clues. use them to narrow down what the word might be. give clues that could fit many words.</p>
          </Section>

          {/* AI Players */}
          <Section title="ai players">
            <p>in this version, all players are different AI models competing against each other. you watch as they try to outsmart each other in real time.</p>
            <p>the models playing: <strong>gemini 3.1 pro</strong>, <strong>gpt-5.2</strong>, <strong>claude sonnet 4.6</strong>, <strong>kimi k2</strong>, and <strong>deepseek v3.2</strong>.</p>
          </Section>
        </div>

        {/* Back button */}
        <div className="mt-16 text-center">
          <motion.button
            onClick={onBack}
            className="px-10 py-4 bg-transparent border border-cream/60 text-cream font-[Tusker_Grotesk] text-sm tracking-[0.2em] lowercase cursor-pointer transition-all duration-500 hover:bg-cream hover:text-black hover:border-cream active:scale-[0.97]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            back to game
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-[Migra] text-xl md:text-2xl text-cream lowercase mb-4">
        {title}
      </h2>
      <div className="space-y-3 text-sm md:text-base text-cream/60 font-[Neue_Montreal] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="font-[Migra] text-lg text-cream/30 flex-shrink-0 w-6 text-right">{n}</span>
      <div>
        <p className="font-[Tusker_Grotesk] text-sm text-cream/70 lowercase tracking-wider mb-1">{title}</p>
        <p className="text-cream/50">{children}</p>
      </div>
    </div>
  );
}
