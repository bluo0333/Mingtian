import Layout from '../components/layout/Layout';
import SectionHeader from '../components/ui/SectionHeader';
import StatCard from '../components/ui/StatCard';
import {
  getLevel,
  getPlannedTasks,
  getTodaysTasks,
  useApp,
} from '../context/AppContext';

const asPercent = (value: number): string => `${Math.round(value)}%`;

export default function Stats() {
  const {
    state: { tasks, thoughts, xp, streak },
  } = useApp();

  const todays = getTodaysTasks(tasks);
  const planned = getPlannedTasks(tasks);
  const completed = tasks.filter((task) => task.isDone);
  const activeThoughts = thoughts.filter((thought) => !thought.convertedToTask);
  const convertedThoughts = thoughts.filter((thought) => thought.convertedToTask);

  const completionRate = tasks.length ? (completed.length / tasks.length) * 100 : 0;
  const todayCompletionRate = todays.length
    ? (todays.filter((task) => task.isDone).length / todays.length) * 100
    : 0;

  return (
    <Layout>
      <div className="px-4 sm:px-5 pt-7 pb-4 space-y-5">
        <div>
          <h1 className="text-4xl font-semibold jade-text dark:text-dark-100">Stats</h1>
          <p className="text-base text-muted dark:text-charcoal-200 mt-2">
            Track your rhythm across tasks, streak, and thought conversion.
          </p>
        </div>

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
      </div>
    </Layout>
  );
}
