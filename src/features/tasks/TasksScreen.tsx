import { motion } from 'framer-motion';
import { Wifi, Battery, Plus } from 'lucide-react';
import TaskCard from '../../components/ui/TaskCard';
import SectionHeader from '../../components/ui/SectionHeader';

export default function TasksScreen() {
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
        <div className="absolute top-0 right-0 w-32 h-20 opacity-10 dark:opacity-20">
          <svg viewBox="0 0 130 80" className="w-full h-full">
            <defs>
              <pattern id="lattice2" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                <rect width="18" height="18" fill="none" stroke="white" strokeWidth="0.8"/>
                <line x1="0" y1="9" x2="18" y2="9" stroke="white" strokeWidth="0.3"/>
                <line x1="9" y1="0" x2="9" y2="18" stroke="white" strokeWidth="0.3"/>
              </pattern>
              <linearGradient id="fade2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                <stop offset="45%" stopColor="currentColor" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <rect width="130" height="80" fill="url(#lattice2)" opacity="0.6"/>
            <rect width="130" height="80" fill="url(#fade2)"/>
          </svg>
        </div>
        <div className="text-sm text-white/70 mb-1 relative z-10">明天 · Tasks</div>
        <div className="text-2xl font-medium text-white mb-3 relative z-10">My tasks</div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Prompt Box */}
        <div className="bg-white dark:bg-charcoal-800 border border-jade-200 dark:border-dark-700/20 rounded-xl p-4 flex items-center gap-3">
          <div className="flex-1 text-sm text-jade-500 dark:text-charcoal-400">What do you need to do?</div>
          <button className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
            <Plus size={16} />
          </button>
        </div>

        {/* Today's Tasks */}
        <SectionHeader title="Today" />
        <div className="space-y-3">
          <TaskCard name="Morning review" steps="4/4 steps done" xp={20} isDone />
          <TaskCard name="Reply to emails" steps="2 of 4 steps · in progress" xp={40} isInProgress />
          <TaskCard name="Finish project report" steps="not started · 4 steps" xp={80} />
        </div>

        {/* Planned Ahead */}
        <SectionHeader title="Planned ahead" />
        <div className="space-y-3">
          <TaskCard name="5K run prep" steps="Starts May 16 · 8 week plan" xp={0} />
          <TaskCard name="Work presentation" steps="Due Jun 3 · step 1 of 5 today" xp={0} />
        </div>
      </div>
    </motion.div>
  );
}