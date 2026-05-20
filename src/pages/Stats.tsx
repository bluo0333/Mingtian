import { motion } from 'framer-motion';
import { Battery, Wifi } from 'lucide-react';
import BottomNavigation from '../components/layout/BottomNavigation';
import LatticeFade from '../components/ui/LatticeFade';
import SectionHeader from '../components/ui/SectionHeader';
import StatCard from '../components/ui/StatCard';
import {
  getLevel,
  getPlannedTasks,
  getTodaysTasks,
  type Task,
  useApp,
} from '../context/AppContext';

const asPercent = (value: number): string => `${Math.round(value)}%`;

const getWeekDays = (tasks: Task[]): Array<{ label: string; filled: boolean; isToday: boolean; isFuture: boolean }> => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const dayStart = day.setHours(0, 0, 0, 0);
    const dayEnd = dayStart + 86400000;
    const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const filled = tasks.some((task) => task.completedAt && task.completedAt >= dayStart && task.completedAt < dayEnd);
    const isToday = todayStart.getTime() === dayStart;
    const isFuture = dayStart > todayStart.getTime();
    return { label: labels[i], filled, isToday, isFuture };
  });
};

export default function Stats() {
  const {
    state: { tasks, thoughts, xp, streak, darkMode },
  } = useApp();

  const todays = getTodaysTasks(tasks);
  const planned = getPlannedTasks(tasks);
  const completed = tasks.filter((task) => task.isDone);
  const activeThoughts = thoughts.filter((thought) => !thought.convertedToTask);
  const convertedThoughts = thoughts.filter((thought) => thought.convertedToTask);
  const weekDays = getWeekDays(tasks);

  const completionRate = tasks.length ? (completed.length / tasks.length) * 100 : 0;
  const todayCompletionRate = todays.length
    ? (todays.filter((task) => task.isDone).length / todays.length) * 100
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen cream-bg dark:bg-charcoal-900">
      <div className="hero-gradient text-white dark:text-dark-200 rounded-b-[2rem] overflow-hidden">
        <div className="px-5 pt-3 pb-8 relative">
          <div className="flex items-center justify-between text-sm font-semibold opacity-95">
            <div>9:41</div>
            <div className="flex items-center gap-1">
              <Wifi size={14} />
              <Battery size={14} />
            </div>
          </div>

          <LatticeFade dark={darkMode} className="top-5 h-[85%]" />

          <div className="relative z-10 mt-5">
            <p className="text-base font-semibold text-white/85 dark:text-dark-300">Mingtian</p>
            <h1 className="text-4xl font-medium leading-none mt-2">Stats</h1>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-24 space-y-5">
        <SectionHeader title="Overview" />
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={`${xp}`} label={`XP (Level ${getLevel(xp)})`} isAccent />
          <StatCard value={`${streak} days`} label="Current streak" />
          <StatCard value={`${completed.length}/${tasks.length}`} label="All tasks done" />
          <StatCard value={asPercent(completionRate)} label="Completion rate" />
          <StatCard value={asPercent(todayCompletionRate)} label="Today completion" />
          <StatCard value={`${planned.length}`} label="Planned tasks" />
          <StatCard value={`${activeThoughts.length}`} label="Active thoughts" />
          <StatCard value={`${convertedThoughts.length}`} label="Thoughts converted" />
        </div>

        <section className="space-y-3">
          <SectionHeader title="This week" />
          <div className="card-soft p-5">
            <div className="flex items-center justify-center gap-2">
              {weekDays.map((day, index) => {
                const base = 'h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center';
                let classes = 'bg-jade-100/70 text-jade-700 dark:bg-charcoal-700/60 dark:text-charcoal-200';
                if (day.filled) {
                  classes = 'bg-jade-600 text-white dark:bg-dark-500 dark:text-charcoal-900';
                } else if (day.isToday) {
                  classes = 'border-2 border-jade-600 text-jade-700 dark:border-dark-500 dark:text-dark-300';
                } else if (day.isFuture) {
                  classes = 'bg-jade-100/60 text-jade-400 dark:bg-charcoal-700/40 dark:text-charcoal-400';
                }
                return (
                  <div key={`${day.label}-${index}`} className={`${base} ${classes}`}>
                    {day.label}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader title="XP history" />
          <div className="space-y-2">
            <div className="card-soft p-4 text-sm text-muted dark:text-charcoal-200">Total XP earned: {xp}</div>
            <div className="card-soft p-4 text-sm text-muted dark:text-charcoal-200">
              Tasks completed: {completed.length}
            </div>
          </div>
        </section>
      </div>
      <BottomNavigation />
    </motion.div>
  );
}
