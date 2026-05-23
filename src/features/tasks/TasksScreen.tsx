import { ArrowUp, Check, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import BottomNavigation from '../../components/layout/BottomNavigation';
import LatticeFade from '../../components/ui/LatticeFade';
import SectionHeader from '../../components/ui/SectionHeader';
import TaskCard from '../../components/ui/TaskCard';
import { getPlannedTasks, getTodaysTasks, type Task, useApp } from '../../context/AppContext';

const ENV_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

type GenerateResult = {
  steps: string;
  xp: number;
};

const parseXp = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const generateSteps = async (taskName: string, key: string): Promise<GenerateResult> => {
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
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content:
            'You are a productivity assistant for someone with ADHD. Break this task into 3-5 concrete, small, actionable steps. Reply ONLY with a JSON object with two fields: "steps" (array of short step strings, max 8 words each) and "xp" (integer, estimate based on total time and difficulty: 10-20 for under 15 min, 25-45 for 15-45 min, 50-80 for 1-2 hours, 85-130 for 2-4 hours, 140-200 for 4+ hours or high cognitive load). No markdown, no explanation.\n\nTask: ' +
            taskName,
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
    xp: parseXp(parsed.xp, 30),
  };
};

export default function TasksScreen() {
  const {
    state: { tasks, darkMode, apiKey: storedApiKey },
    addTask,
    completeStep,
    addStep,
    completeTask,
    deleteTask,
  } = useApp();

  const [prompt, setPrompt] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [newStepInputs, setNewStepInputs] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const todayTasks = useMemo(() => getTodaysTasks(tasks), [tasks]);
  const plannedTasks = useMemo(() => getPlannedTasks(tasks), [tasks]);

  const toggleExpanded = (taskId: string): void => {
    setExpanded((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAddStep = (taskId: string): void => {
    const text = newStepInputs[taskId]?.trim();
    if (!text) return;
    addStep(taskId, text);
    setNewStepInputs((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleCreateTask = async (): Promise<void> => {
    const name = prompt.trim();
    if (!name || isGenerating) {
      return;
    }

    const activeKey = storedApiKey || ENV_API_KEY;
    setIsGenerating(true);
    try {
      if (!activeKey) {
        addTask({ name, stepsText: '', xp: 30 });
      } else {
        const generated = await generateSteps(name, activeKey);
        addTask({ name, stepsText: generated.steps, xp: generated.xp });
      }
      setPrompt('');
    } catch {
      addTask({ name, stepsText: '', xp: 30 });
      setPrompt('');
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
          <div className="text-sm text-muted dark:text-charcoal-200">No steps yet.</div>
        )}
        {task.steps.map((step) => (
          <button
            key={step.id}
            type="button"
            onClick={() => completeStep(task.id, step.id)}
            className="w-full flex items-center gap-2.5 text-left"
          >
            <span
              className={`h-[18px] w-[18px] shrink-0 rounded-full border-2 flex items-center justify-center ${
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
              onChange={(e) => setNewStepInputs((prev) => ({ ...prev, [task.id]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
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

  const renderTaskList = (list: Task[]): JSX.Element => {
    if (list.length === 0) {
      return <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">No tasks yet.</div>;
    }

    return (
      <div className="space-y-3">
        {list.map((task) => (
          <div key={task.id} className="space-y-2">
            <div onClick={() => toggleExpanded(task.id)} role="button" tabIndex={0} onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleExpanded(task.id);
              }
            }}>
              <TaskCard
                name={task.name}
                steps={`${task.steps.filter((step) => step.done).length}/${task.steps.length} steps`}
                xp={task.xp}
                isDone={task.isDone}
                isInProgress={task.isInProgress}
                onToggleDone={() => completeTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            </div>
            {renderExpandedSteps(task)}
          </div>
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
            <h1 className="text-4xl font-medium leading-none mt-2">Tasks</h1>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-24 space-y-5">
        <div className="card-soft p-3">
          <div className="flex items-center gap-2 rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2">
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleCreateTask();
                }
              }}
              disabled={isGenerating}
              placeholder="What do you need to do?"
              className="w-full bg-transparent text-base jade-text dark:text-dark-100 placeholder:text-muted dark:placeholder:text-charcoal-300 focus:outline-none disabled:opacity-70"
            />
            {isGenerating && (
              <div className="flex items-center gap-1 px-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-jade-500 dark:bg-dark-300 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-jade-500 dark:bg-dark-300 animate-pulse [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-jade-500 dark:bg-dark-300 animate-pulse [animation-delay:240ms]" />
              </div>
            )}
            <button
              type="button"
              onClick={() => void handleCreateTask()}
              disabled={isGenerating}
              className="h-9 w-9 shrink-0 rounded-full bg-[#c0392b] dark:bg-[#9b2335] text-white inline-flex items-center justify-center disabled:opacity-65"
              aria-label="Generate task steps"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>

        <section>
          <SectionHeader title="Today" />
          {renderTaskList(todayTasks)}
        </section>

        <section>
          <SectionHeader title="Planned ahead" />
          {plannedTasks.length > 0 ? (
            renderTaskList(plannedTasks)
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
              No planned tasks yet.
            </div>
          )}
        </section>
      </div>
      <BottomNavigation />
    </div>
  );
}
