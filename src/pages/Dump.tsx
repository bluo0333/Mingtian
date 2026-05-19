import { FormEvent, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import SectionHeader from '../components/ui/SectionHeader';
import { getResurfaceThoughts, useApp } from '../context/AppContext';

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

export default function Dump() {
  const {
    state: { thoughts },
    addThought,
    deleteThought,
    resurfaceThought,
    convertThoughtToTask,
  } = useApp();

  const [text, setText] = useState('');

  const resurfaced = useMemo(() => getResurfaceThoughts(thoughts), [thoughts]);
  const activeThoughts = thoughts.filter((thought) => !thought.convertedToTask);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addThought(text);
    setText('');
  };

  return (
    <Layout>
      <div className="px-4 sm:px-5 pt-7 pb-4 space-y-5">
        <div>
          <h1 className="text-4xl font-semibold jade-text dark:text-dark-100">Brain Dump</h1>
          <p className="text-base text-muted dark:text-charcoal-200 mt-2">
            Capture ideas quickly, then convert the useful ones into planned tasks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-soft p-5 space-y-3.5">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            placeholder="What's on your mind?"
            className="w-full rounded-2xl border border-jade-200 dark:border-dark-700/45 bg-cream-50 dark:bg-charcoal-900 px-4 py-3 text-base"
          />
          <button
            type="submit"
            className="rounded-2xl bg-jade-700 text-white px-5 py-2.5 text-sm font-semibold hover:bg-jade-800 transition-colors"
          >
            Save thought
          </button>
        </form>

        <section className="space-y-3">
          <SectionHeader title="Resurfaced" />
          {resurfaced.length > 0 ? (
            resurfaced.map((thought) => (
              <div key={thought.id} className="card-soft p-5 space-y-3">
                <p className="text-base jade-text dark:text-dark-100">{thought.text}</p>
                <div className="text-sm text-muted dark:text-charcoal-200">Added {formatDate(thought.createdAt)}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => convertThoughtToTask(thought.id)}
                    className="text-xs rounded-xl bg-jade-700 text-white px-3 py-1.5 font-semibold"
                  >
                    Convert to task
                  </button>
                  <button
                    type="button"
                    onClick={() => resurfaceThought(thought.id)}
                    className="text-xs rounded-xl border border-jade-300 dark:border-dark-600 px-3 py-1.5 text-jade-700 dark:text-dark-300 font-semibold"
                  >
                    Snooze 1 day
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
              No resurfaced thoughts right now.
            </div>
          )}
        </section>

        <section className="space-y-3">
          <SectionHeader title="All thoughts" />
          {activeThoughts.length > 0 ? (
            activeThoughts.map((thought) => (
              <div key={thought.id} className="card-soft p-5">
                <p className="text-base jade-text dark:text-dark-100">{thought.text}</p>
                <div className="mt-2 text-sm text-muted dark:text-charcoal-200">Added {formatDate(thought.createdAt)}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => convertThoughtToTask(thought.id)}
                    className="text-xs rounded-xl bg-jade-700 text-white px-3 py-1.5 font-semibold"
                  >
                    Convert to task
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteThought(thought.id)}
                    className="text-xs rounded-xl border border-jade-300 dark:border-dark-600 px-3 py-1.5 text-jade-700 dark:text-dark-300 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="card-soft p-5 text-sm text-muted dark:text-charcoal-200">
              No thoughts captured yet.
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
