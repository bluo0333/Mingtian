import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import BottomNavigation from '../components/layout/BottomNavigation';
import SectionHeader from '../components/ui/SectionHeader';
import TaskCard from '../components/ui/TaskCard';
import { type Task, useApp } from '../context/AppContext';

type CompletedGroup = {
  key: string;
  label: string;
  weekday: string;
  day: string;
  month: string;
  items: Array<Task & { completedAt: number }>;
};

type CompletedWeek = {
  key: string;
  label: string;
  days: CompletedGroup[];
  count: number;
};

type ArchiveSection =
  | { type: 'day'; day: CompletedGroup }
  | { type: 'week'; week: CompletedWeek };

const dayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart;
};

const formatWeekRange = (weekStart: Date): string => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.toLocaleDateString('en-US', { day: 'numeric' });
  const endDay = weekEnd.toLocaleDateString('en-US', { day: 'numeric' });

  return startMonth === endMonth
    ? `${startMonth} ${startDay} - ${endDay}`
    : `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

export default function Completed() {
  const {
    state: { tasks },
  } = useApp();
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const sections = useMemo<ArchiveSection[]>(() => {
    const completed = tasks
      .filter((task): task is Task & { completedAt: number } =>
        task.isDone && typeof task.completedAt === 'number',
      )
      .sort((a, b) => b.completedAt - a.completedAt);

    const map = new Map<string, CompletedGroup>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWeekStart = getWeekStart(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const todayKey = dayKey(today);
    const yesterdayKey = dayKey(yesterday);

    for (const task of completed) {
      const date = new Date(task.completedAt);
      const key = dayKey(date);

      if (!map.has(key)) {
        const label =
          key === todayKey
            ? 'Today'
            : key === yesterdayKey
            ? 'Yesterday'
            : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        map.set(key, {
          key,
          label,
          weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
          day: date.toLocaleDateString('en-US', { day: 'numeric' }),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          items: [],
        });
      }

      map.get(key)!.items.push(task);
    }

    const days = Array.from(map.values());
    const currentWeekDays: CompletedGroup[] = [];
    const weeks = new Map<string, CompletedWeek>();

    for (const day of days) {
      const date = new Date(`${day.key}T00:00:00`);
      const weekStart = getWeekStart(date);
      const weekKey = dayKey(weekStart);

      if (weekStart.getTime() === currentWeekStart.getTime()) {
        currentWeekDays.push(day);
        continue;
      }

      if (!weeks.has(weekKey)) {
        weeks.set(weekKey, {
          key: weekKey,
          label: formatWeekRange(weekStart),
          days: [],
          count: 0,
        });
      }

      const week = weeks.get(weekKey)!;
      week.days.push(day);
      week.count += day.items.length;
    }

    return [
      ...currentWeekDays.map((day): ArchiveSection => ({ type: 'day', day })),
      ...Array.from(weeks.values()).map((week): ArchiveSection => ({ type: 'week', week })),
    ];
  }, [tasks]);

  const renderTaskList = (items: Array<Task & { completedAt: number }>) => (
    <div className="space-y-2">
      {items.map((task) => {
        const taskExpanded = expandedTasks[task.id] ?? false;
        return (
          <div key={task.id} className="space-y-2">
            <div
              onClick={() =>
                setExpandedTasks((prev) => ({ ...prev, [task.id]: !taskExpanded }))
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
            <AnimatePresence initial={false}>
              {taskExpanded && task.steps.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -6 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="ml-9 space-y-2 pt-1">
                    {task.steps.map((step) => (
                      <div key={step.id} className="flex items-center gap-2.5">
                        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-success bg-success">
                          <Check size={10} className="text-white" />
                        </span>
                        <span className="text-sm line-through text-muted dark:text-charcoal-300">
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );

  const renderDay = (group: CompletedGroup, isNested = false) => {
    const isExpanded = expandedDays[group.key] ?? false;

    return (
      <div
        key={group.key}
        className={isNested ? 'overflow-hidden rounded-2xl border border-jade-100/80 dark:border-charcoal-700/70' : 'card-soft overflow-hidden'}
      >
        <button
          type="button"
          onClick={() =>
            setExpandedDays((prev) => ({ ...prev, [group.key]: !isExpanded }))
          }
          className="flex w-full items-center gap-3 p-4 text-left"
        >
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-jade-100/80 text-jade-700 dark:bg-charcoal-700/70 dark:text-dark-200">
            <span className="text-[10px] font-bold uppercase leading-none">{group.month}</span>
            <span className="mt-1 text-xl font-semibold leading-none">{group.day}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="shrink-0 text-jade-500 dark:text-dark-300" />
              <span className="text-base font-semibold jade-text dark:text-dark-100">
                {group.label}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted dark:text-charcoal-200">
              {group.weekday} · {group.items.length} completed
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`shrink-0 text-jade-500 transition-transform dark:text-charcoal-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-4 pb-4">{renderTaskList(group.items)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="hero-gradient text-white dark:text-dark-200 rounded-b-[2rem] overflow-hidden">
        <div className="px-5 pt-6 pb-8 relative">
          <div className="relative z-10">
            <p className="text-base font-semibold text-white/85 dark:text-dark-300">Archive</p>
            <h1 className="mt-2 text-4xl font-medium leading-none">Completed</h1>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-24 space-y-4">
        <SectionHeader title="Task history" />

        {sections.length > 0 ? (
          <div className="space-y-3">
            {sections.map((section) => {
              if (section.type === 'day') {
                return renderDay(section.day);
              }

              const isExpanded = expandedWeeks[section.week.key] ?? false;

              return (
                <div key={section.week.key} className="card-soft overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedWeeks((prev) => ({ ...prev, [section.week.key]: !isExpanded }))
                    }
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-jade-100/80 text-jade-700 dark:bg-charcoal-700/70 dark:text-dark-200">
                      <span className="text-[10px] font-bold uppercase leading-none">Week</span>
                      <span className="mt-1 text-xl font-semibold leading-none">{section.week.days.length}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={15} className="shrink-0 text-jade-500 dark:text-dark-300" />
                        <span className="text-base font-semibold jade-text dark:text-dark-100">
                          {section.week.label}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted dark:text-charcoal-200">
                        {section.week.days.length} days · {section.week.count} completed
                      </div>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-jade-500 transition-transform dark:text-charcoal-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="space-y-2 px-4 pb-4">
                          {section.week.days.map((day) => renderDay(day, true))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
            Completed tasks will appear here.
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
