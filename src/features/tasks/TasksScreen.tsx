import { motion } from 'framer-motion';
import { Battery, Plus, Wifi } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import LatticeFade from '../../components/ui/LatticeFade';
import SectionHeader from '../../components/ui/SectionHeader';
import TaskCard from '../../components/ui/TaskCard';
import { getPlannedTasks, getTodaysTasks, type Task, useApp } from '../../context/AppContext';

export default function TasksScreen() {
  const {
    state: { tasks, darkMode },
    addTask,
    completeStep,
    completeTask,
    deleteTask,
  } = useApp();

  const [name, setName] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [xp, setXp] = useState('30');
  const [isPlanned, setIsPlanned] = useState(false);

  const todayTasks = useMemo(() => getTodaysTasks(tasks), [tasks]);
  const plannedTasks = useMemo(() => getPlannedTasks(tasks), [tasks]);

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedXp = Number.parseInt(xp, 10);
    addTask({
      name,
      stepsText,
      xp: Number.isNaN(parsedXp) ? 30 : parsedXp,
      isPlanned,
    });

    setName('');
    setStepsText('');
    setXp('30');
    setIsPlanned(false);
  };

  const summarizeTask = (task: Task): string => {
    if (task.deadline) {
      return `Due ${task.deadline}`;
    }

    if (task.steps.length === 0) {
      return task.isDone ? 'Task complete' : 'No steps';
    }

    const doneSteps = task.steps.filter((step) => step.done).length;
    if (task.isDone) {
      return `${task.steps.length}/${task.steps.length} steps done`;
    }

    if (doneSteps === 0) {
      return `${task.steps.length} steps`;
    }

    return `${doneSteps} of ${task.steps.length} steps`;
  };

  const completeNextStep = (task: Task): void => {
    const nextStep = task.steps.find((step) => !step.done);
    if (nextStep) {
      completeStep(task.id, nextStep.id);
      return;
    }

    completeTask(task.id);
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
            <p className="text-base font-semibold text-white/85 dark:text-dark-300">Mingtian</p>
            <h1 className="text-4xl font-medium leading-none mt-2">Tasks</h1>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-4 pb-4 space-y-5">
        <form onSubmit={handleAddTask} className="card-soft p-5 space-y-3.5">
          <div className="text-sm font-semibold uppercase tracking-[0.11em] text-jade-600 dark:text-dark-300">
            Add task
          </div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="What do you need to do?"
            className="w-full rounded-2xl border border-jade-200 dark:border-dark-700/45 bg-cream-50 dark:bg-charcoal-900 px-4 py-3 text-base"
          />
          <textarea
            value={stepsText}
            onChange={(event) => setStepsText(event.target.value)}
            placeholder="Optional steps (one per line)"
            rows={3}
            className="w-full rounded-2xl border border-jade-200 dark:border-dark-700/45 bg-cream-50 dark:bg-charcoal-900 px-4 py-3 text-base"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={xp}
              onChange={(event) => setXp(event.target.value)}
              placeholder="XP"
              className="rounded-2xl border border-jade-200 dark:border-dark-700/45 bg-cream-50 dark:bg-charcoal-900 px-4 py-3 text-base"
            />
            <label className="rounded-2xl border border-jade-200 dark:border-dark-700/45 px-4 py-3 text-sm flex items-center gap-2 text-muted dark:text-charcoal-200">
              <input
                type="checkbox"
                checked={isPlanned}
                onChange={(event) => setIsPlanned(event.target.checked)}
              />
              Planned task
            </label>
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-jade-700 text-white py-3 text-base font-semibold hover:bg-jade-800 transition-colors"
          >
            <Plus size={16} />
            Add task
          </button>
        </form>

        <section>
          <SectionHeader title="Today" />
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <TaskCard
                    name={task.name}
                    steps={summarizeTask(task)}
                    xp={task.xp}
                    isDone={task.isDone}
                    isInProgress={task.isInProgress}
                    onToggleDone={() => completeTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                  />
                  {!task.isDone && task.steps.length > 0 && (
                    <button
                      type="button"
                      onClick={() => completeNextStep(task)}
                      className="text-xs font-semibold tracking-wide text-jade-600 dark:text-dark-300 hover:text-jade-700"
                    >
                      Complete next step
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
              No tasks scheduled for today.
            </div>
          )}
        </section>

        <section>
          <SectionHeader title="Planned ahead" />
          {plannedTasks.length > 0 ? (
            <div className="space-y-3">
              {plannedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  name={task.name}
                  steps={summarizeTask(task)}
                  xp={task.xp}
                  isDone={task.isDone}
                  isInProgress={task.isInProgress}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
              No planned tasks yet.
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
