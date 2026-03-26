import { motion } from 'framer-motion';

interface PhaseHeaderProps {
  phase: string;
}

export default function PhaseHeader({ phase }: PhaseHeaderProps) {
  return (
    <motion.div
      className="flex items-center gap-4 my-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-px flex-1 bg-gradient-to-r from-cream-20 to-transparent" />
      <h3 className="font-[Tusker_Grotesk] text-lg tracking-[0.12em] text-cream-70 lowercase whitespace-nowrap">
        {phase}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-l from-cream-20 to-transparent" />
    </motion.div>
  );
}
