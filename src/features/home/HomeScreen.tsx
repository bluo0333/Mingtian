import { AnimatePresence, motion } from 'framer-motion';
import { Check, Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../../components/layout/BottomNavigation';
import LatticeFade from '../../components/ui/LatticeFade';
import FocusCard from '../../components/ui/FocusCard';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import StreakTrail from '../../components/ui/StreakTrail';
import TaskCard from '../../components/ui/TaskCard';
import XPCard from '../../components/ui/XPCard';
import {
  getLevel,
  getLevelMax,
  getLevelProgress,
  getTodaysTasks,
  type Task,
  useApp,
} from '../../context/AppContext';

const APP_MARK = '\u660e\u5929';
const LEVEL_MESSAGES = [
  'Proud of this one',
  'You made it happen',
  'Look at you go',
  'You came back today',
  'One step lighter',
  'You kept the promise',
  'Keep being kind to you',
];

const randomLevelMessage = (): string =>
  LEVEL_MESSAGES[Math.floor(Math.random() * LEVEL_MESSAGES.length)];

export default function HomeScreen() {
  const {
    state: { tasks, xp, streak, user, darkMode },
    completeStep,
    completeTask,
  } = useApp();
  const [showSteps, setShowSteps] = useState(false);
  const [selectedFocusId, setSelectedFocusId] = useState<string | null>(null);
  const [levelMessage] = useState(randomLevelMessage);

  const todaysTasks = getTodaysTasks(tasks);
  const sortedTodaysTasks = useMemo(
    () =>
      [...todaysTasks].sort((a, b) => {
        if (a.isDone !== b.isDone) {
          return a.isDone ? 1 : -1;
        }

        if (a.isDone && b.isDone) {
          return (b.completedAt ?? 0) - (a.completedAt ?? 0);
        }

        return b.createdAt - a.createdAt;
      }),
    [todaysTasks],
  );
  const completedToday = todaysTasks.filter((task) => task.isDone).length;
  const totalToday = todaysTasks.length;
  const incompleteTasks = todaysTasks.filter((task) => !task.isDone);

  const focusTask = (() => {
    if (selectedFocusId) {
      const sel = incompleteTasks.find((t) => t.id === selectedFocusId);
      if (sel) return sel;
    }
    return incompleteTasks[0] ?? undefined;
  })();

  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const levelMax = getLevelMax();
  const completedDates = useMemo(
    () =>
      new Set(
        tasks
          .filter((task): task is Task & { completedAt: number } => task.isDone && typeof task.completedAt === 'number')
          .map((task) => {
            const date = new Date(task.completedAt);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          }),
      ),
    [tasks],
  );

  useEffect(() => {
    if (selectedFocusId && !incompleteTasks.find((t) => t.id === selectedFocusId)) {
      setSelectedFocusId(null);
    }
  }, [tasks]);

  useEffect(() => {
    setShowSteps(false);
  }, [focusTask?.id]);

  const handleSwitchFocus = () => {
    if (incompleteTasks.length <= 1) return;
    const currentIndex = incompleteTasks.findIndex((t) => t.id === focusTask?.id);
    const next = incompleteTasks[(currentIndex + 1) % incompleteTasks.length];
    setSelectedFocusId(next.id);
  };

  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const historyByDate = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const completed = tasks
      .filter((t): t is Task & { completedAt: number } =>
        t.isDone && typeof t.completedAt === 'number' && t.completedAt < todayStart.getTime(),
      )
      .sort((a, b) => b.completedAt - a.completedAt);

    const groupMap = new Map<string, { label: string; items: typeof completed }>();
    const yesterday = new Date(todayStart);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    for (const task of completed) {
      const d = new Date(task.completedAt);
      const key = d.toISOString().slice(0, 10);
      if (!groupMap.has(key)) {
        const diffDays = Math.round((todayStart.getTime() - d.setHours(0, 0, 0, 0)) / 86400000);
        const label =
          key === yesterdayKey
            ? 'Yesterday'
            : diffDays < 7
            ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
            : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        groupMap.set(key, { label, items: [] });
      }
      groupMap.get(key)!.items.push(task);
    }

    return Array.from(groupMap.values());
  }, [tasks]);

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
    <div className="min-h-screen">
      <div className="hero-gradient text-white dark:text-dark-200 rounded-b-[2rem] overflow-hidden">
        <div className="px-5 pt-6 pb-8 relative">
          <LatticeFade dark={darkMode} />

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div>
              <p className="text-base font-semibold text-white/85 dark:text-dark-300">
                Good morning, {user.name}
              </p>
              <h1 className="text-5xl font-medium leading-none mt-2">{APP_MARK}</h1>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/18 px-2 py-1.5 pr-3.5 text-sm font-semibold backdrop-blur-sm dark:border-dark-300/45 dark:bg-dark-300/10 dark:text-dark-200">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-white text-lg font-black leading-none text-jade-800 dark:bg-dark-200 dark:text-charcoal-900">
                  {level}
                </span>
                <span>Level · {xp} XP</span>
              </div>
            </div>
            <Link
              to="/settings"
              className="relative z-20 mt-1 flex items-center justify-center h-9 w-9 shrink-0 rounded-full border border-white/50 dark:border-dark-300/50 bg-white/28 dark:bg-dark-300/22 hover:bg-white/40 dark:hover:bg-dark-300/35 backdrop-blur-md transition-colors text-white dark:text-dark-200"
              aria-label="Settings"
            >
              <Settings size={17} />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-24 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StreakTrail streak={streak} completedDates={completedDates} />
          <div className="col-span-2">
            <StatCard value={`${completedToday}/${totalToday}`} label="Tasks today" />
          </div>
        </div>

        <XPCard
          level={level}
          message={levelMessage}
          current={levelProgress}
          total={levelMax}
          totalXp={xp}
        />

        {focusTask ? (
          <FocusCard
            eyebrow="Focus now"
            task={focusTask.name}
            sub={(() => {
              if (!focusTask.steps.length) return `Worth ${focusTask.xp} XP`;
              const doneCount = focusTask.steps.filter((s) => s.done).length;
              const currentStep = focusTask.steps.find((s) => !s.done);
              const stepLabel = currentStep?.text ? ` · ${currentStep.text}` : '';
              return `Step ${doneCount + 1} of ${focusTask.steps.length}${stepLabel}`;
            })()}
            isExpanded={showSteps}
            onStart={() => setShowSteps((value) => !value)}
            onSwitch={incompleteTasks.length > 1 ? handleSwitchFocus : undefined}
          />
        ) : (
          <FocusCard eyebrow="Focus now" task="No open tasks" sub="Add a task on the Tasks page" />
        )}

        <AnimatePresence initial={false}>
          {focusTask && showSteps && (
            <motion.div
              key="steps-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
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
                        className={`h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center ${
                          step.done ? 'bg-success border-success' : 'border-jade-300 dark:border-dark-500'
                        }`}
                      >
                        {step.done && <Check size={11} className="text-white" />}
                      </span>
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
            </motion.div>
          )}
        </AnimatePresence>

        <section className="space-y-3">
          <SectionHeader title="Today's tasks" />
          {todaysTasks.length > 0 ? (
            <motion.div layout className="space-y-3">
              {sortedTodaysTasks.map((task) => {
                const doneSteps = task.steps.filter((step) => step.done).length;
                return (
                  <motion.div
                    layout
                    key={task.id}
                    onClick={() => {
                      if (!task.isDone) setSelectedFocusId(task.id);
                    }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    className={!task.isDone ? 'cursor-pointer' : undefined}
                  >
                    <TaskCard
                      name={task.name}
                      steps={summarizeSteps(doneSteps, task.steps.length, task.isDone)}
                      xp={task.xp}
                      isDone={task.isDone}
                      isInProgress={task.isInProgress}
                      isFocus={focusTask?.id === task.id && !task.isDone}
                      onToggleDone={() => completeTask(task.id)}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
              No tasks yet. Add one from the Tasks page.
            </div>
          )}
        </section>

        {historyByDate.length > 0 && (
          <section className="space-y-4 pb-4">
            <SectionHeader title="Completed" />
            {historyByDate.map(({ label, items }) => (
              <div key={label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted dark:text-charcoal-400 px-1">
                  {label}
                </p>
                <div className="space-y-2">
                  {items.map((task) => (
                    <div key={task.id} className="space-y-2">
                      <div
                        onClick={() =>
                          setExpandedHistory((prev) => ({ ...prev, [task.id]: !prev[task.id] }))
                        }
                        className="cursor-pointer"
                      >
                        <TaskCard
                          name={task.name}
                          steps={`${task.steps.length} steps · ${task.xp} XP earned`}
                          xp={task.xp}
                          isDone
                        />
                      </div>
                      {expandedHistory[task.id] && task.steps.length > 0 && (
                        <div className="ml-9 space-y-2">
                          {task.steps.map((step) => (
                            <div key={step.id} className="flex items-center gap-2.5">
                              <span className="h-[18px] w-[18px] shrink-0 rounded-full border-2 bg-success border-success flex items-center justify-center">
                                <Check size={10} className="text-white" />
                              </span>
                              <span className="text-sm line-through text-muted dark:text-charcoal-300">
                                {step.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
