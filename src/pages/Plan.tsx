import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Bell, Check, Plus } from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type RefObject } from 'react';
import BottomNavigation from '../components/layout/BottomNavigation';
import LatticeFade from '../components/ui/LatticeFade';
import SectionHeader from '../components/ui/SectionHeader';
import TaskCard from '../components/ui/TaskCard';
import TaskScheduleEditor from '../components/ui/TaskScheduleEditor';
import { getPlannedTasks, TASK_NAME_MAX_LENGTH, type Task, useApp } from '../context/AppContext';

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

const pad2 = (value: number): string => value.toString().padStart(2, '0');

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const normalizeCompleteDate = (day: string, month: string, year: string): string => {
  const today = startOfLocalDay(new Date());
  let dayNum = Number(day);
  let monthNum = Number(month);
  const yearNum = Number(year);

  if (!Number.isFinite(yearNum) || yearNum < 1) {
    return formatDateForDisplay(today);
  }

  dayNum = Math.min(Math.max(dayNum, 1), 31);
  monthNum = Math.min(Math.max(monthNum, 1), 12);
  dayNum = Math.min(dayNum, new Date(yearNum, monthNum, 0).getDate());

  const candidate = startOfLocalDay(new Date(yearNum, monthNum - 1, dayNum));
  if (candidate < today) {
    return formatDateForDisplay(today);
  }

  return `${pad2(dayNum)}/${pad2(monthNum)}/${yearNum.toString().padStart(4, '0')}`;
};

const formatDate = (value: string): string => {
  let digits = value.replace(/\D/g, '');

  // Validate first digit of day (can only be 0-3)
  if (digits.length >= 1) {
    const firstDayDigit = parseInt(digits[0]);
    if (firstDayDigit > 3) {
      digits = '3' + digits.slice(1);
    }
  }

  // Validate first digit of month (can only be 0-1)
  if (digits.length >= 3) {
    const firstMonthDigit = parseInt(digits[2]);
    if (firstMonthDigit > 1) {
      digits = digits.slice(0, 2) + '1' + digits.slice(3);
    }
  }

  if (digits.length === 0) return '';

  // Extract components
  let day = digits.slice(0, 2);
  let month = digits.slice(2, 4);
  let year = digits.slice(4, 8);

  // Validate and cap day at 31
  if (day.length === 2) {
    const dayNum = parseInt(day);
    if (dayNum === 0) {
      day = '01';
    } else if (dayNum > 31) {
      day = '31';
    }
  }

  // Validate and cap month at 12
  if (month.length === 2) {
    const monthNum = parseInt(month);
    if (monthNum === 0) {
      month = '01';
    } else if (monthNum > 12) {
      month = '12';
    }
  }

  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}/${month}`;
  if (digits.length === 8) return normalizeCompleteDate(day, month, year);

  return `${day}/${month}/${year}`;
};

const displayDateTemplate = (value: string): string => {
  const [day = '', month = '', year = ''] = value.split('/');
  return `${day.padEnd(2, 'D')}/${month.padEnd(2, 'M')}/${year.padEnd(4, 'Y')}`;
};

const dateTemplateHighlightIndex = (value: string): number => {
  const digitCount = value.replace(/\D/g, '').length;
  if (digitCount >= 8) return displayDateTemplate(value).length - 1;
  if (digitCount < 2) return digitCount;
  if (digitCount < 4) return digitCount + 1;
  return digitCount + 2;
};

const isCompleteDate = (value: string): boolean => value.replace(/\D/g, '').length === 8;

const getTimePeriod = (value: string): 'AM' | 'PM' | '' => {
  const normalized = value.toUpperCase();
  if (normalized.includes('P')) return 'PM';
  if (normalized.includes('A')) return 'AM';
  return '';
};

type TimeParts = {
  hour: string;
  minute: string;
};

const parseTimeDigits = (digits: string): TimeParts => {
  const clipped = digits.slice(0, 4);

  if (clipped.length === 0) {
    return { hour: '', minute: '' };
  }

  let hour = clipped.slice(0, 2);
  let minute = clipped.slice(2, 4);

  if (hour.length === 1 && Number(hour) > 1) {
    hour = '1';
  }

  if (hour.length === 2) {
    const hourNum = Number(hour);
    if (hourNum === 0) {
      hour = '01';
    } else if (hourNum > 12) {
      hour = '12';
    }
  }

  if (minute.length >= 1 && Number(minute[0]) > 5) {
    minute = `5${minute.slice(1)}`;
  }

  if (minute.length === 2 && Number(minute) > 59) {
    minute = '59';
  }

  return { hour, minute };
};

const formatTime = (value: string): string => {
  const period = getTimePeriod(value);
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return period;

  const { hour, minute } = parseTimeDigits(digits);
  const time = digits.length <= 2 ? hour : `${hour}:${minute}`;
  return period ? `${time} ${period}` : time;
};

const displayTimeTemplate = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const { hour, minute } = parseTimeDigits(digits);
  const period = getTimePeriod(value);
  return `${hour.padEnd(2, '-')}:${minute.padEnd(2, '-')} ${period || '--'}`;
};

const timeTemplateHighlightIndex = (value: string): number => {
  const digitCount = value.replace(/\D/g, '').length;
  if (digitCount >= 4) return getTimePeriod(value) ? -1 : 6;
  if (digitCount < 2) return digitCount;
  return digitCount + 1;
};

const isCompleteTime = (value: string): boolean =>
  value.replace(/\D/g, '').length === 4 && Boolean(getTimePeriod(value));

const toTwentyFourHourTime = (value: string): string => {
  if (!isCompleteTime(value)) return '';

  const { hour, minute } = parseTimeDigits(value.replace(/\D/g, ''));
  const hourNum = Number(hour);
  const minuteNum = Number(minute);
  const period = getTimePeriod(value);
  const hour24 = period === 'AM'
    ? hourNum === 12 ? 0 : hourNum
    : hourNum === 12 ? 12 : hourNum + 12;

  return `${pad2(hour24)}:${pad2(minuteNum)}`;
};

const convertDDMMYYYYtoYYYYMMDD = (ddmmyyyy: string): string => {
  if (!isCompleteDate(ddmmyyyy)) return '';
  const parts = ddmmyyyy.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

const formatDateForDisplay = (date: Date): string =>
  `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;

const formatDateForApi = (date: Date): string =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const resolveDeadlineDate = (deadline: string, time: string): { display: string; api: string } => {
  if (isCompleteDate(deadline)) {
    return {
      display: deadline,
      api: convertDDMMYYYYtoYYYYMMDD(deadline),
    };
  }

  const targetDate = new Date();
  const [hour, minute] = time.split(':').map(Number);
  if (Number.isFinite(hour) && Number.isFinite(minute)) {
    const nowMinutes = targetDate.getHours() * 60 + targetDate.getMinutes();
    const dueMinutes = hour * 60 + minute;
    if (nowMinutes > dueMinutes) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
  }

  return {
    display: formatDateForDisplay(targetDate),
    api: formatDateForApi(targetDate),
  };
};

const parseDisplayDate = (value: string): Date | null => {
  if (!isCompleteDate(value)) return null;
  const [day, month, year] = value.split('/').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
};

const isPastDueTimeForSelectedDate = (deadline: string, time: string): boolean => {
  const selectedDate = parseDisplayDate(deadline);
  const time24 = toTwentyFourHourTime(time);
  if (!selectedDate || !time24) return false;
  const [hour, minute] = time24.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
  const dueAt = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    hour,
    minute,
  );
  return startOfLocalDay(selectedDate).getTime() === startOfLocalDay(new Date()).getTime() && dueAt < new Date();
};

const DateInput = ({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  onComplete: () => void;
  disabled: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = formatDate(event.target.value);
    const wasComplete = isCompleteDate(value);
    onChange(nextValue);

    if (!wasComplete && isCompleteDate(nextValue)) {
      requestAnimationFrame(onComplete);
    }
  };

  const displayValue = displayDateTemplate(value);
  const highlightIndex = isFocused && !disabled ? dateTemplateHighlightIndex(value) : -1;

  return (
    <div className="relative flex-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center font-mono text-sm jade-text dark:text-dark-100"
      >
        {displayValue.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={`inline-block w-[1ch] text-center ${
              index === highlightIndex ? 'bg-jade-300 dark:bg-[#b8962a] animate-pulse' : ''
            }`}
          >
            {char}
          </span>
        ))}
      </div>
      <input
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        aria-label="Deadline date"
        inputMode="numeric"
        maxLength={10}
        className="relative z-10 w-full bg-transparent font-mono text-sm text-transparent caret-transparent focus:outline-none disabled:opacity-70"
      />
    </div>
  );
};

const TimeInput = ({
  value,
  onChange,
  disabled,
  inputRef,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  inputRef: RefObject<HTMLInputElement>;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(formatTime(event.target.value));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (getTimePeriod(value)) {
        onChange(formatTime(value.replace(/\s?[AP]M$/, '')));
        return;
      }

      onChange(formatTime(value.replace(/\D/g, '').slice(0, -1)));
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const period = getTimePeriod(value);
      const digits = value.replace(/\D/g, '');
      if (parseTimeDigits(digits).minute.length < 2) {
        onChange(formatTime(`${digits}${event.key}${period}`));
      }
      return;
    }

    if (/^[ap]$/i.test(event.key)) {
      event.preventDefault();
      onChange(formatTime(`${value}${event.key}`));
    }
  };

  const displayValue = displayTimeTemplate(value);
  const highlightIndex = isFocused && !disabled ? timeTemplateHighlightIndex(value) : -1;

  return (
    <div className="relative w-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center font-mono text-sm jade-text dark:text-dark-100"
      >
        {displayValue.split('').map((char, index) => (
          <span
            key={`${char}-${index}`}
            className={`inline-block w-[1ch] text-center ${
              index === highlightIndex ? 'bg-jade-300 dark:bg-[#b8962a] animate-pulse' : ''
            }`}
          >
            {char}
          </span>
        ))}
      </div>
      <input
        value={value}
        ref={inputRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
        aria-label="Deadline time"
        autoCapitalize="characters"
        maxLength={8}
        className="relative z-10 w-full bg-transparent font-mono text-sm text-transparent caret-transparent focus:outline-none disabled:opacity-40"
      />
    </div>
  );
};

export default function Plan() {
  const {
    state: { tasks, darkMode, user, apiKey: storedApiKey },
    addTask,
    setTaskPlanned,
    completeStep,
    addStep,
    updateTaskSchedule,
    completeTask,
    deleteTask,
  } = useApp();

  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('');
  const [alarmOffsetMin, setAlarmOffsetMin] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newStepInputs, setNewStepInputs] = useState<Record<string, string>>({});
  const timeInputRef = useRef<HTMLInputElement>(null);

  const plannedTasks = useMemo(() => getPlannedTasks(tasks), [tasks]);
  const hasPastDueTime = useMemo(() => isPastDueTimeForSelectedDate(deadline, time), [deadline, time]);
  const isGoalAtLimit = goal.length >= TASK_NAME_MAX_LENGTH;

  const toggleExpanded = (taskId: string): void => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAddStep = (taskId: string): void => {
    const text = newStepInputs[taskId]?.trim();
    if (!text) return;
    addStep(taskId, text);
    setNewStepInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleAddPlannedTask = async (): Promise<void> => {
    const name = goal.trim();
    if (!name || isGenerating || hasPastDueTime) return;

    const hasCompleteDeadline = isCompleteDate(deadline);
    const completeTime = isCompleteTime(time) ? time : '';
    const completeTime24 = toTwentyFourHourTime(completeTime);
    const deadlineFormatted = resolveDeadlineDate(deadline, completeTime24);

    const alarmTimestamp = (() => {
      if (alarmOffsetMin === 0) return undefined;
      const deadlineMs = new Date(`${deadlineFormatted.api}T${completeTime24 || '23:59'}`).getTime();
      const ts = deadlineMs - alarmOffsetMin * 60 * 1000;
      return ts > Date.now() ? ts : undefined;
    })();

    setIsGenerating(true);
    try {
      const activeKey = storedApiKey || ENV_API_KEY;
      const base = {
        name,
        isPlanned: true as const,
        deadline: deadlineFormatted.display,
        deadlineTime: completeTime || undefined,
        alarmTimestamp,
      };
      if (!hasCompleteDeadline || !activeKey) {
        addTask({ ...base, stepsText: '', xp: 30 });
      } else {
        const generated = await generatePlan(name, deadlineFormatted.api, user.dailyCapacity, activeKey);
        addTask({ ...base, stepsText: generated.steps, xp: generated.xp });
      }
      if (alarmTimestamp) void scheduleNotification(name, alarmTimestamp);
      setGoal('');
      setDeadline('');
      setTime('');
      setAlarmOffsetMin(0);
    } catch {
      const completeTime = isCompleteTime(time) ? time : '';
      const completeTime24 = toTwentyFourHourTime(completeTime);
      const deadlineFormatted = resolveDeadlineDate(deadline, completeTime24);
      addTask({ name, deadline: deadlineFormatted.display, deadlineTime: completeTime || undefined, isPlanned: true, stepsText: '', xp: 30 });
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

    return (
      <div className="ml-8 space-y-2">
        {task.steps.length === 0 && (
          <div className="text-sm text-muted dark:text-charcoal-200">No steps added yet.</div>
        )}
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
        {!task.isDone && (
          <div className="flex items-center gap-2 pt-1">
            <input
              value={newStepInputs[task.id] ?? ''}
              onChange={(event) => setNewStepInputs((prev) => ({ ...prev, [task.id]: event.target.value }))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddStep(task.id);
                }
              }}
              placeholder="Add a step..."
              className="flex-1 bg-transparent text-sm jade-text dark:text-dark-100 placeholder:text-muted dark:placeholder:text-charcoal-300 focus:outline-none border-b border-jade-200 dark:border-dark-500/40 pb-0.5"
            />
            <button
              type="button"
              onClick={() => handleAddStep(task.id)}
              className="h-6 w-6 shrink-0 rounded-full bg-jade-600 dark:bg-dark-500 text-white inline-flex items-center justify-center"
              aria-label="Add step"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
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
          <div
            className={`flex items-center gap-2 rounded-2xl border bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2 transition-colors ${
              isGoalAtLimit
                ? 'border-[#c0392b] dark:border-[#d35d6e]'
                : 'border-jade-200 dark:border-dark-500/40'
            }`}
          >
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
              maxLength={TASK_NAME_MAX_LENGTH}
              disabled={isGenerating}
              className="w-full bg-transparent text-base jade-text dark:text-dark-100 placeholder:text-muted dark:placeholder:text-charcoal-300 focus:outline-none disabled:opacity-70"
            />
            {isGoalAtLimit && (
              <span className="shrink-0 text-[11px] font-medium tabular-nums text-[#c0392b] dark:text-[#d35d6e]">
                {TASK_NAME_MAX_LENGTH}/{TASK_NAME_MAX_LENGTH}
              </span>
            )}
          </div>

          {/* Date + Time row */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2">
              <DateInput
                value={deadline}
                onChange={setDeadline}
                onComplete={() => timeInputRef.current?.focus()}
                disabled={isGenerating}
              />
            </div>
            <div
              className={`flex items-center gap-2 rounded-2xl border bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2 transition-colors ${
                hasPastDueTime
                  ? 'border-[#c0392b] ring-2 ring-[#c0392b]/20 dark:border-[#d35d6e] dark:ring-[#d35d6e]/20'
                  : 'border-jade-200 dark:border-dark-500/40'
              }`}
            >
              <TimeInput
                value={time}
                onChange={setTime}
                disabled={isGenerating}
                inputRef={timeInputRef}
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
                disabled={isGenerating || hasPastDueTime}
                className={`h-9 w-9 shrink-0 rounded-full text-white inline-flex items-center justify-center transition-colors disabled:opacity-65 ${
                  hasPastDueTime
                    ? 'bg-[#c0392b]/55 dark:bg-[#9b2335]/55 ring-2 ring-[#c0392b]/25'
                    : 'bg-[#c0392b] dark:bg-[#9b2335]'
                }`}
                aria-label="Create planned task"
              >
                <ArrowUp size={15} />
              </button>
            )}
          </div>

          {/* Alarm offset — only when deadline is set */}
          <AnimatePresence initial={false}>
            {(deadline.replace(/\D/g, '').length > 0 || time) && (
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
                  {expanded[task.id] && (
                    <TaskScheduleEditor
                      deadline={task.deadline}
                      deadlineTime={task.deadlineTime}
                      onChange={(deadline, deadlineTime) => updateTaskSchedule(task.id, deadline, deadlineTime)}
                    />
                  )}
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
