import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Bell, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import BottomNavigation from '../components/layout/BottomNavigation';
import LatticeFade from '../components/ui/LatticeFade';
import SectionHeader from '../components/ui/SectionHeader';
import TaskCard from '../components/ui/TaskCard';
import { getPlannedTasks, type Task, useApp } from '../context/AppContext';

const ENV_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

const ALARM_OPTIONS: Array<{ label: string; minutes: number }> = [
  { label: 'No alarm', minutes: 0 },
  { label: '15 min before', minutes: 15 },
  { label: '30 min before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '2 hours before', minutes: 120 },
  { label: '1 day before', minutes: 1440 },
];

const scheduleNotification = async (taskName: string, alarmTimestamp: number): Promise<void> => {
  if (!('Notification' in window)) return;
  const delay = alarmTimestamp - Date.now();
  if (delay <= 0) return;
  try {
    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
    if (permission !== 'granted') return;
    setTimeout(() => {
      new Notification('明天 · Deadline approaching', { body: taskName });
    }, delay);
  } catch {
    // not supported
  }
};

type GenerateResult = {
  steps: string;
  xp: number;
};

const parseXp = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const generatePlan = async (goal: string, deadline: string, dailyCapacity: number, key: string): Promise<GenerateResult> => {
  const today = new Date().toISOString().slice(0, 10);
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content:
            `You are a productivity planner for someone with ADHD who has ${dailyCapacity} hours of focus time per day. Today is ${today}. The deadline is ${deadline}.\n\nCreate a realistic step-by-step plan for this goal. Each step should be achievable in one focused session. Reply ONLY with a JSON object: {"steps": ["step 1", "step 2", ...], "xp": number}. Max 8 steps, each max 10 words. XP should reflect the total effort: 25-50 for a simple goal completable in one session, 55-100 for a multi-session goal, 110-160 for a project spanning several days, 170-250 for a large or high-stakes goal.\n\nGoal: ${goal}`,
        },
      ],
    }),
  });

  const data = (await response.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text ?? '{}';
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) as {
    steps?: unknown;
    xp?: unknown;
  };

  return {
    steps: Array.isArray(parsed.steps) ? parsed.steps.map(String).join('\n') : '',
    xp: parseXp(parsed.xp, 35),
  };
};

export default function Plan() {
  const {
    state: { tasks, darkMode, user, apiKey: storedApiKey },
    addTask,
    setTaskPlanned,
    completeStep,
    completeTask,
    deleteTask,
  } = useApp();

  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('');
  const [alarmOffsetMin, setAlarmOffsetMin] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const plannedTasks = useMemo(() => getPlannedTasks(tasks), [tasks]);

  const toggleExpanded = (taskId: string): void => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAddPlannedTask = async (): Promise<void> => {
    const name = goal.trim();
    if (!name || isGenerating) return;

    const alarmTimestamp = (() => {
      if (!deadline || alarmOffsetMin === 0) return undefined;
      const deadlineMs = new Date(`${deadline}T${time || '23:59'}`).getTime();
      const ts = deadlineMs - alarmOffsetMin * 60 * 1000;
      return ts > Date.now() ? ts : undefined;
    })();

    setIsGenerating(true);
    try {
      const activeKey = storedApiKey || ENV_API_KEY;
      const base = {
        name,
        isPlanned: true as const,
        deadline: deadline || undefined,
        deadlineTime: time || undefined,
        alarmTimestamp,
      };
      if (!deadline || !activeKey) {
        addTask({ ...base, stepsText: '', xp: 30 });
      } else {
        const generated = await generatePlan(name, deadline, user.dailyCapacity, activeKey);
        addTask({ ...base, stepsText: generated.steps, xp: generated.xp });
      }
      if (alarmTimestamp) void scheduleNotification(name, alarmTimestamp);
      setGoal('');
      setDeadline('');
      setTime('');
      setAlarmOffsetMin(0);
    } catch {
      addTask({ name, deadline: deadline || undefined, deadlineTime: time || undefined, isPlanned: true, stepsText: '', xp: 30 });
      setGoal('');
      setDeadline('');
      setTime('');
      setAlarmOffsetMin(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderExpandedSteps = (task: Task): JSX.Element | null => {
    if (!expanded[task.id]) {
      return null;
    }

    if (task.steps.length === 0) {
      return <div className="ml-8 text-sm text-muted dark:text-charcoal-200">No steps added yet.</div>;
    }

    return (
      <div className="ml-8 space-y-2">
        {task.steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => completeStep(task.id, step.id)}
            className="w-full flex items-center gap-2.5 text-left"
          >
            <span
              className={`h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center ${
                step.done ? 'border-success bg-success' : 'border-jade-300 dark:border-dark-500'
              }`}
            >
              {step.done && <Check size={10} className="text-white" />}
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
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="hero-gradient text-white dark:text-dark-200 rounded-b-[2rem] overflow-hidden">
        <div className="px-5 pt-6 pb-8 relative">
          <LatticeFade dark={darkMode} />

          <div className="relative z-10">
            <p className="text-base font-semibold text-white/85 dark:text-dark-300">明天</p>
            <h1 className="text-4xl font-medium leading-none mt-2">Plan</h1>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-24 space-y-5">
        <div className="card-soft p-3 space-y-2.5">
          {/* Goal name */}
          <div className="flex items-center gap-2 rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2">
            <input
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleAddPlannedTask();
                }
              }}
              placeholder="Goal or task name"
              disabled={isGenerating}
              className="w-full bg-transparent text-base jade-text dark:text-dark-100 placeholder:text-muted dark:placeholder:text-charcoal-300 focus:outline-none disabled:opacity-70"
            />
          </div>

          {/* Date + Time row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2">
              <input
                type="date"
                value={deadline}
                onChange={(event) => { setDeadline(event.target.value); if (!event.target.value) { setTime(''); setAlarmOffsetMin(0); } }}
                disabled={isGenerating}
                className="w-full bg-transparent text-sm jade-text dark:text-dark-100 focus:outline-none disabled:opacity-70"
              />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2">
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                disabled={isGenerating || !deadline}
                className="w-24 bg-transparent text-sm jade-text dark:text-dark-100 focus:outline-none disabled:opacity-40"
              />
            </div>
            {isGenerating ? (
              <div className="h-9 w-9 shrink-0 flex items-center justify-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-jade-500 dark:bg-dark-300 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-jade-500 dark:bg-dark-300 animate-pulse [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-jade-500 dark:bg-dark-300 animate-pulse [animation-delay:240ms]" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleAddPlannedTask()}
                disabled={isGenerating}
                className="h-9 w-9 shrink-0 rounded-full bg-[#c0392b] dark:bg-[#9b2335] text-white inline-flex items-center justify-center disabled:opacity-65"
                aria-label="Create planned task"
              >
                <ArrowUp size={15} />
              </button>
            )}
          </div>

          {/* Alarm offset — only when deadline is set */}
          <AnimatePresence initial={false}>
            {deadline && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div className="flex items-center gap-2 pt-0.5">
                  <Bell size={13} className="shrink-0 text-muted dark:text-charcoal-400" />
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                    {ALARM_OPTIONS.map((opt) => (
                      <button
                        key={opt.minutes}
                        type="button"
                        onClick={() => setAlarmOffsetMin(opt.minutes)}
                        className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1 transition-colors ${
                          alarmOffsetMin === opt.minutes
                            ? 'bg-jade-700 dark:bg-dark-500 text-white'
                            : 'bg-jade-100/80 dark:bg-charcoal-700/60 text-jade-700 dark:text-charcoal-200 hover:bg-jade-200 dark:hover:bg-charcoal-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <section>
          <SectionHeader title="Planned tasks" />
          {plannedTasks.length > 0 ? (
            <div className="space-y-3">
              {plannedTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <div
                    onClick={() => toggleExpanded(task.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleExpanded(task.id);
                      }
                    }}
                  >
                    <TaskCard
                      name={task.name}
                      steps={[
                        `${task.steps.filter((s) => s.done).length}/${task.steps.length} steps`,
                        task.deadline && `Due ${task.deadline}${task.deadlineTime ? ` at ${task.deadlineTime}` : ''}`,
                        task.alarmTimestamp && task.alarmTimestamp > Date.now() ? '🔔' : null,
                      ].filter(Boolean).join(' · ')}
                      xp={task.xp}
                      isDone={task.isDone}
                      isInProgress={task.isInProgress}
                      onToggleDone={() => completeTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  </div>
                  {renderExpandedSteps(task)}
                  {!task.isDone && (
                    <button
                      type="button"
                      onClick={() => setTaskPlanned(task.id, false)}
                      className="ml-8 text-xs font-semibold tracking-wide text-jade-600 dark:text-dark-300 hover:text-jade-700"
                    >
                      Move to today
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">No planned tasks yet.</div>
          )}
        </section>
      </div>
      <BottomNavigation />
    </div>
  );
}
