import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, List } from 'lucide-react';
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

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Array<Task & { completedAt: number }>>();
    for (const task of tasks) {
      if (!task.isDone || typeof task.completedAt !== 'number') continue;
      const key = dayKey(new Date(task.completedAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task as Task & { completedAt: number });
    }
    return map;
  }, [tasks]);

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

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayKey = dayKey(new Date());
    const monthLabel = calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const raw: (number | null)[] = [
      ...Array(firstDayOfWeek).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    // pad to complete the last row
    const totalCells = Math.ceil(raw.length / 7) * 7;
    const cells: (number | null)[] = [...raw, ...Array(totalCells - raw.length).fill(null)];

    const selectedTasks = selectedDay ? (tasksByDay.get(selectedDay) ?? []) : [];
    const selectedGroup = selectedDay
      ? (() => {
          const date = new Date(`${selectedDay}T00:00:00`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const label =
            selectedDay === dayKey(today)
              ? 'Today'
              : selectedDay === dayKey(yesterday)
              ? 'Yesterday'
              : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          return {
            key: selectedDay,
            label,
            weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
            day: date.toLocaleDateString('en-US', { day: 'numeric' }),
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            items: selectedTasks,
          } as CompletedGroup;
        })()
      : null;

    return (
      <div className="space-y-4">
        <div className="card-soft overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-jade-100/80 dark:border-charcoal-700/60">
            <button
              type="button"
              onClick={() => {
                setCalendarMonth(new Date(year, month - 1, 1));
                setSelectedDay(null);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-jade-600 hover:bg-jade-100/80 dark:text-dark-200 dark:hover:bg-charcoal-700/60 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-bold jade-text dark:text-dark-100">{monthLabel}</span>
            <button
              type="button"
              onClick={() => {
                setCalendarMonth(new Date(year, month + 1, 1));
                setSelectedDay(null);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-jade-600 hover:bg-jade-100/80 dark:text-dark-200 dark:hover:bg-charcoal-700/60 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 border-b border-jade-100/80 dark:border-charcoal-700/60">
            {DAY_HEADERS.map((d, i) => (
              <div
                key={i}
                className={`text-center text-[11px] font-semibold text-muted dark:text-charcoal-300 py-2 ${
                  i < 6 ? 'border-r border-jade-100/80 dark:border-charcoal-700/60' : ''
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const isLastInRow = (i + 1) % 7 === 0;
              const isLastRow = i >= cells.length - 7;
              const borderClasses = [
                !isLastInRow ? 'border-r' : '',
                !isLastRow ? 'border-b' : '',
                'border-jade-100/80 dark:border-charcoal-700/60',
              ].join(' ');

              if (d === null) {
                return <div key={i} className={`h-14 ${borderClasses}`} />;
              }

              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const hasTasks = tasksByDay.has(key);
              const isSelected = selectedDay === key;
              const isToday = key === todayKey;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                  className={`relative h-14 flex flex-col items-center justify-center gap-1 transition-colors ${borderClasses} ${
                    isSelected
                      ? 'bg-jade-600 dark:bg-dark-300'
                      : isToday
                      ? 'bg-jade-100/60 dark:bg-charcoal-700/50'
                      : hasTasks
                      ? 'hover:bg-jade-50 dark:hover:bg-charcoal-700/40'
                      : 'hover:bg-jade-50/40 dark:hover:bg-charcoal-700/20'
                  }`}
                >
                  <span
                    className={`text-sm font-semibold leading-none ${
                      isSelected
                        ? 'text-white dark:text-charcoal-900'
                        : isToday
                        ? 'jade-text dark:text-dark-100'
                        : hasTasks
                        ? 'jade-text dark:text-dark-200'
                        : 'text-muted dark:text-charcoal-400'
                    }`}
                  >
                    {d}
                  </span>
                  {hasTasks && (
                    <span
                      className={`h-1 w-1 rounded-full ${
                        isSelected ? 'bg-white/70 dark:bg-charcoal-900/60' : 'bg-jade-500 dark:bg-dark-300'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day tasks */}
        <AnimatePresence mode="wait">
          {selectedGroup && selectedGroup.items.length > 0 && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            >
              {renderDay(selectedGroup)}
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
        <div className="flex items-center justify-between">
          <SectionHeader title="Task history" />
          <div className="flex items-center gap-1 rounded-xl bg-jade-100/80 p-1 dark:bg-charcoal-700/60">
            <button
              type="button"
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === 'list'
                  ? 'bg-white text-jade-700 shadow-sm dark:bg-charcoal-600 dark:text-dark-100'
                  : 'text-jade-600 dark:text-charcoal-300'
              }`}
            >
              <List size={13} />
              List
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                view === 'calendar'
                  ? 'bg-white text-jade-700 shadow-sm dark:bg-charcoal-600 dark:text-dark-100'
                  : 'text-jade-600 dark:text-charcoal-300'
              }`}
            >
              <CalendarDays size={13} />
              Calendar
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          renderCalendar()
        ) : sections.length > 0 ? (
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
