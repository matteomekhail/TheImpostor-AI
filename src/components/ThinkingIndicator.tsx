import { motion } from 'framer-motion';

interface ThinkingIndicatorProps {
  color: string;
  playerName?: string;
}

export default function ThinkingIndicator({ color, playerName }: ThinkingIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      {playerName && (
        <span className="font-[Migra] text-sm text-cream-70 lowercase">
          {playerName} is thinking
        </span>
      )}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
            animate={{
              y: [0, -8, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
