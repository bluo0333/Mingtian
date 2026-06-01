import { motion } from 'framer-motion';
import { ArrowRight, Flame, Sun, Sunrise } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

type StreakUpState = {
  streak?: number;
  from?: string;
};

const rayItems = Array.from({ length: 17 }, (_, index) => index);
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    state: { streak },
  } = useApp();
  const routeState = (location.state ?? {}) as StreakUpState;
  const currentStreak = routeState.streak ?? streak;
  const nextPath = routeState.from && routeState.from !== '/streak-up' ? routeState.from : '/';
  const streakUnit = currentStreak === 1 ? 'day' : 'days';
  const streakAction = currentStreak === 1 ? 'Streak started' : 'Streak extended';
  const todayIndex = new Date().getDay();
  const litDaysThisWeek = Math.min(currentStreak, todayIndex + 1);

  return (
    <div className="min-h-screen overflow-hidden bg-[#14221e] text-[#fff4d4]">
      <div className="relative min-h-screen flex flex-col items-center justify-center px-5 py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_62%,#d4a95a_0%,#8a6a34_18%,#254a3f_46%,#14221e_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[#0b1513]/55" />

        {rayItems.map((item) => {
          const rotation = -76 + item * 9.5;
          const height = 118 + (item % 3) * 18;
          return (
            <motion.span
              key={item}
              className="absolute bottom-[31%] left-1/2 w-1 origin-bottom rounded-full bg-[#f5cf78]/55"
              style={{ height }}
              initial={{ scaleY: 0, opacity: 0, rotate: 0 }}
              animate={{ scaleY: [0, 1, 0.9], opacity: [0, 0.82, 0.48], rotate: rotation }}
              transition={{ delay: 0.06 + item * 0.012, duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
            />
          );
        })}

        <motion.div
          className="absolute bottom-[31%] left-1/2 h-28 w-56 -translate-x-1/2 overflow-hidden"
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="h-56 w-56 rounded-full border border-[#f5cf78]/35 bg-[#f5cf78]/10" />
        </motion.div>

        <motion.div
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: 'easeOut' }}
        >
          <motion.div
            className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-[#f5cf78] bg-[#e1aa43] shadow-[0_16px_0_#725124]"
            initial={{ y: 34, scale: 0.82 }}
            animate={{ y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 210, damping: 16 }}
          >
            <motion.div
              className="absolute -left-1 -top-1 rounded-full bg-[#18352e] p-2 text-[#f5cf78]"
              initial={{ scale: 0, rotate: 18 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 14 }}
            >
              <Flame size={20} fill="currentColor" />
            </motion.div>
            <Sunrise size={64} className="text-[#fff4d4]" strokeWidth={2.4} />
          </motion.div>

          <motion.p
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#f5cf78] px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-[#18352e]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Sun size={14} fill="currentColor" />
            {streakAction}
          </motion.p>

          <motion.h1
            className="mt-4 text-6xl font-black leading-none"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.36, type: 'spring', stiffness: 210, damping: 17 }}
          >
            {currentStreak} {streakUnit}
          </motion.h1>

          <p className="mt-3 max-w-xs text-base font-semibold text-[#d9e9d2]">
            The chain is alive. Come back tomorrow to keep the light moving.
          </p>

          <div className="mt-8 grid w-full max-w-xs grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, index) => {
              const isLit = index <= todayIndex && index > todayIndex - litDaysThisWeek;
              return (
                <motion.div
                  key={index}
                  className="flex flex-col items-center gap-1.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.48 + index * 0.035, duration: 0.2, ease: 'easeOut' }}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                      isLit
                        ? 'border-[#f5cf78] bg-[#f5cf78] text-[#18352e]'
                        : 'border-white/24 bg-white/10 text-white/36'
                    }`}
                  >
                    <Sun size={15} fill={isLit ? 'currentColor' : 'none'} />
                  </div>
                  <span className={`text-[10px] font-extrabold ${isLit ? 'text-[#f5cf78]' : 'text-white/35'}`}>
                    {weekDays[index]}
                  </span>
                </motion.div>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-bold text-[#d9e9d2]">
            {Math.min(currentStreak, 7)}/7 days lit this week
          </p>

          <motion.button
            type="button"
            onClick={() => navigate(nextPath, { replace: true })}
            className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-[#f5cf78] px-7 text-base font-extrabold text-[#18352e] shadow-[0_5px_0_#8d6828] active:translate-y-1 active:shadow-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
          >
            Continue
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
