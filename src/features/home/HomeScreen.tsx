import { motion } from 'framer-motion';
import { Battery, Star, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../../components/layout/BottomNavigation';
import LatticeFade from '../../components/ui/LatticeFade';
import FocusCard from '../../components/ui/FocusCard';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import TaskCard from '../../components/ui/TaskCard';
import XPCard from '../../components/ui/XPCard';
import {
  getLevel,
  getLevelMax,
  getLevelProgress,
  getTodaysTasks,
  useApp,
} from '../../context/AppContext';

const APP_MARK = '\u660e\u5929';

export default function HomeScreen() {
  const {
    state: { tasks, xp, streak, user, darkMode },
    completeStep,
    completeTask,
  } = useApp();
  const [showSteps, setShowSteps] = useState(false);

  const todaysTasks = getTodaysTasks(tasks);
  const completedToday = todaysTasks.filter((task) => task.isDone).length;
  const totalToday = todaysTasks.length;
  const focusTask = todaysTasks.find((task) => !task.isDone);
  const visibleTasks = todaysTasks.slice(0, 4);

  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const levelMax = getLevelMax();

  useEffect(() => {
    setShowSteps(false);
  }, [focusTask?.id]);

  const summarizeSteps = (doneSteps: number, totalSteps: number, isDone: boolean): string => {
    if (totalSteps === 0) {
      return isDone ? 'Task complete' : 'No steps added yet';
    }

    if (isDone) {
      return `${totalSteps}/${totalSteps} steps done`;
    }

    if (doneSteps === 0) {
      return `${totalSteps} steps`;
    }

    return `${doneSteps} of ${totalSteps} steps`;
  };

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
            <p className="text-base font-semibold text-white/85 dark:text-dark-300">
              Good morning, {user.name}
            </p>
            <h1 className="text-5xl font-medium leading-none mt-2">{APP_MARK}</h1>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/18 px-3.5 py-1.5 text-sm font-semibold backdrop-blur-sm dark:border-dark-300/45 dark:bg-dark-300/10 dark:text-dark-200">
              <Star size={13} />
              Level {level} - {xp} XP
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-24 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCard value={`${streak}`} label="Day streak" isAccent isStreakCard />
          <StatCard value={`${completedToday}/${totalToday}`} label="Tasks today" />
        </div>

        <XPCard label={`Level ${level + 1} progress`} current={levelProgress} total={levelMax} />

        {focusTask ? (
          <FocusCard
            eyebrow="Focus now"
            task={focusTask.name}
            sub={
              focusTask.steps.length
                ? `Step ${focusTask.steps.filter((step) => step.done).length + 1} of ${focusTask.steps.length}`
                : `Worth ${focusTask.xp} XP`
            }
            onStart={() => setShowSteps((value) => !value)}
          />
        ) : (
          <FocusCard eyebrow="Focus now" task="No open tasks" sub="Add a task on the Tasks page" />
        )}

        {focusTask && showSteps && (
          <div className="card-soft p-4 space-y-2.5">
            {focusTask.steps.length > 0 ? (
              focusTask.steps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => completeStep(focusTask.id, step.id)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <span
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      step.done
                        ? 'bg-success border-success'
                        : 'border-jade-300 dark:border-dark-500'
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      step.done
                        ? 'line-through text-muted dark:text-charcoal-300'
                        : 'jade-text dark:text-dark-100'
                    }`}
                  >
                    {step.text}
                  </span>
                </button>
              ))
            ) : (
              <div className="text-sm text-muted dark:text-charcoal-200">No steps added yet for this task.</div>
            )}
          </div>
        )}

        <section className="space-y-3 pb-4">
          <SectionHeader title="Today's tasks" />
          {todaysTasks.length > 0 ? (
            <div className="space-y-3">
              {visibleTasks.map((task) => {
                const doneSteps = task.steps.filter((step) => step.done).length;
                return (
                  <TaskCard
                    key={task.id}
                    name={task.name}
                    steps={summarizeSteps(doneSteps, task.steps.length, task.isDone)}
                    xp={task.xp}
                    isDone={task.isDone}
                    isInProgress={task.isInProgress}
                    onToggleDone={() => completeTask(task.id)}
                  />
                );
              })}
              {todaysTasks.length > 4 && (
                <Link
                  to="/tasks"
                  className="inline-flex text-sm font-semibold text-jade-700 dark:text-dark-300 hover:opacity-90"
                >
                  See all →
                </Link>
              )}
            </div>
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
              No tasks yet. Add one from the Tasks page.
            </div>
          )}
        </section>
      </div>
      <BottomNavigation />
    </motion.div>
  );
}
