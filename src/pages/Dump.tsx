import { ArrowUp, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import LatticeFade from '../components/ui/LatticeFade';
import SectionHeader from '../components/ui/SectionHeader';
import { getResurfaceThoughts, type Thought, useApp } from '../context/AppContext';

const relativeDate = (timestamp: number): string => {
  const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

const canShowTaskAction = (thought: Thought): boolean => {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - oneDayMs;
  const oldEnough = thought.createdAt <= cutoff;
  const notRecentlyResurfaced = !thought.resurfacedAt || thought.resurfacedAt <= cutoff;
  return oldEnough && notRecentlyResurfaced;
};

export default function Dump() {
  const {
    state: { thoughts, darkMode },
    addThought,
    deleteThought,
    convertThoughtToTask,
  } = useApp();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const resurfaced = useMemo(() => getResurfaceThoughts(thoughts), [thoughts]);
  const activeThoughts = useMemo(
    () =>
      thoughts
        .filter((thought) => !thought.convertedToTask)
        .sort((a, b) => b.createdAt - a.createdAt),
    [thoughts],
  );

  const handleSaveThought = (): void => {
    if (!text.trim()) {
      return;
    }
    addThought(text);
    setText('');
  };

  const handleConvertToTask = (thoughtId: string): void => {
    convertThoughtToTask(thoughtId);
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen">
      <div className="hero-gradient text-white dark:text-dark-200 rounded-b-[2rem] overflow-hidden">
        <div className="px-5 pt-6 pb-8 relative">
          <LatticeFade dark={darkMode} />

          <div className="relative z-10">
            <p className="text-base font-semibold text-white/85 dark:text-dark-300">明天</p>
            <h1 className="text-4xl font-medium leading-none mt-2">Thoughts</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-24 space-y-4">
        <div className="card-soft p-3">
          <div className="flex items-center gap-2 rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f7f4ee] dark:bg-[#20201a] px-3 py-2">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleSaveThought();
                }
              }}
              placeholder="What's on your mind..."
              className="w-full bg-transparent text-base jade-text dark:text-dark-100 placeholder:text-muted dark:placeholder:text-charcoal-300 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveThought}
              className="h-9 w-9 shrink-0 rounded-full bg-[#c0392b] dark:bg-[#9b2335] text-white inline-flex items-center justify-center"
              aria-label="Save thought"
            >
              <ArrowUp size={15} />
            </button>
          </div>
        </div>

        {resurfaced.length > 0 && (
          <section className="space-y-3">
            <SectionHeader title="Resurfaced today" />
            {resurfaced.map((thought) => (
              <div
                key={thought.id}
                className="card-soft p-4 space-y-3"
                style={{ borderLeftWidth: '2.5px', borderLeftColor: darkMode ? '#9b2335' : '#c0392b' }}
              >
                <p className="text-base jade-text dark:text-dark-100">{thought.text}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted dark:text-charcoal-200">{relativeDate(thought.createdAt)}</span>
                  <span className="bg-[#f5dbd8] text-[#c0392b] dark:bg-[#9b2335]/15 dark:text-[#9b2335] rounded-full px-2 py-0.5 text-xs font-medium">
                    Resurfaced
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleConvertToTask(thought.id)}
                  className="text-sm font-semibold text-jade-700 dark:text-dark-300"
                >
                  Make into task?
                </button>
              </div>
            ))}
          </section>
        )}

        <section className="space-y-3">
          <SectionHeader title="Recent" />
          {activeThoughts.length > 0 ? (
            activeThoughts.map((thought) => (
              <div
                key={thought.id}
                className="card-soft p-4 space-y-3"
                style={{ borderLeftWidth: '2.5px', borderLeftColor: darkMode ? '#b8962a' : '#4a7c6f' }}
              >
                <p className="text-base jade-text dark:text-dark-100">{thought.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted dark:text-charcoal-200">{relativeDate(thought.createdAt)}</span>
                  <button
                    type="button"
                    onClick={() => deleteThought(thought.id)}
                    className="text-muted dark:text-charcoal-300 hover:text-jade-600 dark:hover:text-dark-300"
                    aria-label="Delete thought"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {canShowTaskAction(thought) && (
                  <button
                    type="button"
                    onClick={() => handleConvertToTask(thought.id)}
                    className="text-sm font-semibold text-jade-700 dark:text-dark-300"
                  >
                    Make into task?
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">No thoughts captured yet.</div>
          )}
        </section>
      </div>
      <BottomNavigation />
    </div>
  );
}
