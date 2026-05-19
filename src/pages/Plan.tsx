import { FormEvent, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import SectionHeader from '../components/ui/SectionHeader';
import TaskCard from '../components/ui/TaskCard';
import { getPlannedTasks, type Task, useApp } from '../context/AppContext';

const summarizeTask = (task: Task): string => {
  if (task.deadline) {
    return `Due ${task.deadline}`;
  }

  if (task.steps.length === 0) {
    return 'No steps';
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

export default function Plan() {
  const {
    state: { tasks },
    addTask,
    setTaskPlanned,
    completeTask,
    deleteTask,
  } = useApp();

  const [name, setName] = useState('');
  const [deadline, setDeadline] = useState('');

  const plannedTasks = useMemo(() => getPlannedTasks(tasks), [tasks]);

  const handleAddPlannedTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addTask({
      name,
      deadline,
      isPlanned: true,
      xp: 35,
    });
    setName('');
    setDeadline('');
  };

  return (
    <Layout>
      <div className="px-4 sm:px-5 pt-7 pb-4 space-y-5">
        <div>
          <h1 className="text-4xl font-semibold jade-text dark:text-dark-100">Plan</h1>
          <p className="text-base text-muted dark:text-charcoal-200 mt-2">
            Organize future tasks and pull them into today when ready.
          </p>
        </div>

        <form onSubmit={handleAddPlannedTask} className="card-soft p-5 space-y-3.5">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Planned task"
            className="w-full rounded-2xl border border-jade-200 dark:border-dark-700/45 bg-cream-50 dark:bg-charcoal-900 px-4 py-3 text-base"
          />
          <input
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className="w-full rounded-2xl border border-jade-200 dark:border-dark-700/45 bg-cream-50 dark:bg-charcoal-900 px-4 py-3 text-base"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-jade-700 text-white py-3 text-base font-semibold hover:bg-jade-800 transition-colors"
          >
            Add to plan
          </button>
        </form>

        <section>
          <SectionHeader title="Planned tasks" />
          {plannedTasks.length > 0 ? (
            <div className="space-y-3">
              {plannedTasks.map((task) => (
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
                  {!task.isDone && (
                    <button
                      type="button"
                      onClick={() => setTaskPlanned(task.id, false)}
                      className="text-xs font-semibold tracking-wide text-jade-600 dark:text-dark-300 hover:text-jade-700"
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
    </Layout>
  );
}
