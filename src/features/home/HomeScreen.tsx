import { motion } from 'framer-motion';
import { Wifi, Battery, Star } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import XPCard from '../../components/ui/XPCard';
import FocusCard from '../../components/ui/FocusCard';
import TaskCard from '../../components/ui/TaskCard';
import SectionHeader from '../../components/ui/SectionHeader';

export default function HomeScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      {/* Status Bar */}
      <div className="bg-jade-600 dark:bg-charcoal-900 px-5 py-3 flex justify-between items-center">
        <div className="text-sm font-medium text-white">9:41</div>
        <div className="flex gap-1 text-white">
          <Wifi size={14} />
          <Battery size={14} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-jade-600 dark:bg-charcoal-900 px-5 pb-6 relative overflow-hidden">
        {/* Lattice background for dark mode */}
        <div className="absolute top-0 right-0 w-32 h-20 opacity-10 dark:opacity-20">
          <svg viewBox="0 0 130 80" className="w-full h-full">
            <defs>
              <pattern id="lattice" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <rect width="18" height="18" fill="none" stroke="white" strokeWidth="0.8"/>
                <line x1="0" y1="9" x2="18" y2="9" stroke="white" strokeWidth="0.3"/>
                <line x1="9" y1="0" x2="9" y2="18" stroke="white" strokeWidth="0.3"/>
              </pattern>
              <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                <stop offset="45%" stopColor="currentColor" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect width="130" height="80" fill="url(#lattice)" opacity="0.6"/>
            <rect width="130" height="80" fill="url(#fade)"/>
          </svg>
        </div>
        <div className="text-sm text-white/70 mb-1 relative z-10">Good morning</div>
        <div className="text-2xl font-medium text-white mb-3 relative z-10">明天</div>
        <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1.5 text-sm text-white relative z-10">
          <Star size={12} />
          Level 4 · 340 XP
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard value="5 🔥" label="Day streak" isAccent />
          <StatCard value="2/5" label="Tasks today" />
        </div>

        {/* XP Card */}
        <XPCard label="Level 5 progress" current={340} total={500} />

        {/* Focus Card */}
        <FocusCard
          eyebrow="Focus now"
          task="Reply to emails"
          sub="Step 2 of 4 · Draft replies"
          onStart={() => console.log('Start timer')}
        />

        {/* Today's Tasks */}
        <SectionHeader title="Today's tasks" />
        <div className="space-y-3">
          <TaskCard name="Morning review" steps="4/4 steps done" xp={20} isDone />
          <TaskCard name="Reply to emails" steps="2 of 4 steps" xp={40} isInProgress />
          <TaskCard name="Finish project report" steps="not started · 4 steps" xp={80} />
        </div>
      </div>
    </motion.div>
  );
}