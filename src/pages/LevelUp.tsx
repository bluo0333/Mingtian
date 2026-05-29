import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getLevel, getLevelMax, getLevelProgress, useApp } from '../context/AppContext';

type LevelUpState = {
  level?: number;
  from?: string;
};

const burstItems = Array.from({ length: 18 }, (_, index) => index);

export default function LevelUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { xp },
  } = useApp();
  const routeState = (location.state ?? {}) as LevelUpState;
  const level = routeState.level ?? getLevel(xp);
  const progress = getLevelProgress(xp);
  const levelMax = getLevelMax();
  const nextPath = routeState.from && routeState.from !== '/level-up' ? routeState.from : '/';

  return (
    <div className="min-h-screen overflow-hidden bg-[#10231a] text-[#fff6cf]">
      <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2f6f3e_0%,#173725_42%,#10231a_72%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-[#f0bd41]/10 blur-3xl" />

        {burstItems.map((item) => {
          const angle = (item / burstItems.length) * Math.PI * 2;
          const distance = 120 + (item % 4) * 22;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          return (
            <motion.span
              key={item}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-[#f0bd41]"
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ x, y, scale: [0, 1.2, 0.7], opacity: [0, 1, 0.75] }}
              transition={{ delay: 0.08 + item * 0.015, duration: 0.7, ease: 'easeOut' }}
            />
          );
        })}

        <motion.div
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <motion.div
            className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-[#f0bd41] bg-[#54b85c] shadow-[0_18px_0_#2e743a]"
            initial={{ scale: 0.65, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 13 }}
          >
            <motion.div
              className="absolute -right-2 -top-2 rounded-full bg-[#f0bd41] p-2 text-[#173725]"
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.32, type: 'spring', stiffness: 300, damping: 12 }}
            >
              <Sparkles size={20} />
            </motion.div>
            <Trophy size={58} className="text-[#fff6cf]" strokeWidth={2.4} />
          </motion.div>

          <motion.p
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#f0bd41] px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-[#173725]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
          >
            <Star size={14} fill="currentColor" />
            Level up
          </motion.p>

          <motion.h1
            className="mt-4 text-6xl font-black leading-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 16 }}
          >
            Level {level}
          </motion.h1>

          <p className="mt-3 max-w-xs text-base font-semibold text-[#d8e6c8]">
            Nice work. Your progress is stacking up.
          </p>

          <div className="mt-8 w-full max-w-xs rounded-full bg-black/24 p-1">
            <motion.div
              className="h-3 rounded-full bg-[#f0bd41]"
              initial={{ width: 0 }}
              animate={{ width: `${(progress / levelMax) * 100}%` }}
              transition={{ delay: 0.65, duration: 0.55, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-2 text-xs font-bold text-[#d8e6c8]">
            {progress}/{levelMax} XP toward Level {level + 1}
          </p>

          <motion.button
            type="button"
            onClick={() => navigate(nextPath, { replace: true })}
            className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-[#f0bd41] px-7 text-base font-extrabold text-[#173725] shadow-[0_5px_0_#9b6b18] active:translate-y-1 active:shadow-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.78 }}
          >
            Continue
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
