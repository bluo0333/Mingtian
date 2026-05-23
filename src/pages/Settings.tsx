import { ArrowLeft, Check, Eye, EyeOff, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/layout/BottomNavigation';
import LatticeFade from '../components/ui/LatticeFade';
import SectionHeader from '../components/ui/SectionHeader';
import { useApp } from '../context/AppContext';

const CAPACITY_OPTIONS = [
  { label: 'Under 1h', value: 1 },
  { label: '1 – 2h', value: 2 },
  { label: '2 – 4h', value: 4 },
  { label: '4h+', value: 6 },
];

export default function Settings() {
  const {
    state: { user, darkMode, apiKey: savedApiKey },
    updateProfile,
    toggleDarkMode,
    setApiKey,
    clearTasks,
    resetProgress,
    resetAll,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [birthday, setBirthday] = useState(user.birthday ?? '');
  const [dailyCapacity, setDailyCapacity] = useState(user.dailyCapacity);
  const [apiKey, setApiKeyLocal] = useState(savedApiKey ?? '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const handleSaveProfile = () => {
    updateProfile({
      name: name.trim() || user.name,
      birthday: birthday.trim() || undefined,
      dailyCapacity,
    });
    setApiKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openConfirm = (key: string) => {
    setConfirmingKey(key);
    setConfirmInput('');
  };

  const closeConfirm = () => {
    setConfirmingKey(null);
    setConfirmInput('');
  };

  const handleDangerous = (action: () => void, phrase: string) => {
    if (confirmInput.trim().toLowerCase() === phrase.toLowerCase()) {
      action();
      closeConfirm();
    }
  };

  const input = `w-full rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f0f0ea] dark:bg-[#1e201a] px-4 py-3 text-base jade-text dark:text-dark-100 placeholder:text-muted dark:placeholder:text-charcoal-400 focus:outline-none focus:border-jade-400 dark:focus:border-dark-400 transition-colors`;

  return (
    <div className="min-h-screen">
      <div className="hero-gradient text-white dark:text-dark-200 rounded-b-[2rem] overflow-hidden">
        <div className="px-5 pt-6 pb-8 relative">
          <LatticeFade dark={darkMode} />
          <div className="relative z-10 flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center justify-center h-9 w-9 rounded-full bg-white/15 dark:bg-dark-300/10 hover:bg-white/25 dark:hover:bg-dark-300/20 transition-colors shrink-0"
              aria-label="Back"
            >
              <ArrowLeft size={17} />
            </Link>
            <div>
              <p className="text-base font-semibold text-white/85 dark:text-dark-300">明天</p>
              <h1 className="text-4xl font-medium leading-none mt-2">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pt-5 pb-28 space-y-6">

        {/* Profile */}
        <section className="space-y-3">
          <SectionHeader title="Profile" />
          <div className="card-soft p-4 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-jade-700 dark:text-dark-200 mb-1.5">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={input}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-jade-700 dark:text-dark-200 mb-1.5">
                Birthday
              </label>
              <input
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                placeholder="DD / MM / YYYY"
                className={input}
              />
              <p className="mt-1.5 text-xs text-muted dark:text-charcoal-300">
                Let us celebrate you.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-jade-700 dark:text-dark-200 mb-2">
                Daily focus capacity
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CAPACITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDailyCapacity(opt.value)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                      dailyCapacity === opt.value
                        ? 'border-jade-500 bg-jade-50 text-jade-700 dark:border-dark-400 dark:bg-dark-500/20 dark:text-dark-200'
                        : 'border-jade-200/80 dark:border-charcoal-600/50 text-muted dark:text-charcoal-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-3">
          <SectionHeader title="Appearance" />
          <div className="card-soft p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-semibold jade-text dark:text-dark-100">Theme</div>
                <div className="text-sm text-muted dark:text-charcoal-300 mt-0.5">
                  {darkMode ? 'Dark mode' : 'Light mode'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                  darkMode ? 'bg-dark-400' : 'bg-jade-500'
                }`}
                aria-label="Toggle theme"
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    darkMode ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* AI */}
        <section className="space-y-3">
          <SectionHeader title="AI" />
          <div className="card-soft p-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-jade-700 dark:text-dark-200 mb-1.5">
                Anthropic API key
              </label>
              <div className="relative">
                <input
                  value={apiKey}
                  onChange={(e) => setApiKeyLocal(e.target.value)}
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-ant-..."
                  className={`${input} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted dark:text-charcoal-300 hover:text-jade-600 dark:hover:text-dark-300 transition-colors"
                  aria-label={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-muted dark:text-charcoal-300">
                Powers AI step generation and planning. Stored locally on your device.
              </p>
            </div>
          </div>
        </section>

        {/* Save */}
        <button
          type="button"
          onClick={handleSaveProfile}
          className="w-full rounded-2xl bg-jade-700 dark:bg-dark-500 text-white py-3.5 text-base font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-jade-800 dark:hover:bg-dark-400 active:scale-[0.98]"
        >
          {saved ? (
            <>
              <Check size={15} />
              Saved
            </>
          ) : (
            'Save changes'
          )}
        </button>

        {/* Data */}
        <section className="space-y-3">
          <SectionHeader title="Data" />
          <div className="card-soft p-4 space-y-2.5">
            {(
              [
                { key: 'tasks', label: 'Clear all tasks', phrase: 'I want to clear all tasks', action: clearTasks },
                { key: 'progress', label: 'Reset XP & streak', phrase: 'I want to reset XP & streak', action: resetProgress },
                { key: 'all', label: 'Start over', phrase: 'I want to start over', action: resetAll },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => openConfirm(key)}
                className="w-full rounded-2xl border border-jade-200/70 dark:border-charcoal-600/50 py-3 px-4 text-sm font-semibold text-left text-muted dark:text-charcoal-300 hover:border-red-300/70 dark:hover:border-red-500/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Confirmation modal */}
        {confirmingKey && (() => {
          const items = [
            { key: 'tasks', label: 'Clear all tasks', phrase: 'I want to clear all tasks', action: clearTasks },
            { key: 'progress', label: 'Reset XP & streak', phrase: 'I want to reset XP & streak', action: resetProgress },
            { key: 'all', label: 'Start over', phrase: 'I want to start over', action: resetAll },
          ] as const;
          const item = items.find((i) => i.key === confirmingKey);
          if (!item) return null;
          const match = confirmInput.trim().toLowerCase() === item.phrase.toLowerCase();
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={closeConfirm}>
              <div className="w-full max-w-sm rounded-3xl card-soft p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold jade-text dark:text-dark-100">{item.label}</p>
                    <p className="mt-1 text-sm text-muted dark:text-charcoal-300">Type the phrase below to confirm.</p>
                  </div>
                  <button type="button" onClick={closeConfirm} className="shrink-0 text-muted dark:text-charcoal-300 hover:text-ink-900 dark:hover:text-dark-100 transition-colors mt-0.5">
                    <X size={18} />
                  </button>
                </div>
                <p className="rounded-xl bg-jade-50 dark:bg-charcoal-800 px-3 py-2 text-sm font-mono text-jade-700 dark:text-dark-200 select-all">
                  {item.phrase}
                </p>
                <input
                  autoFocus
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDangerous(item.action, item.phrase);
                  }}
                  placeholder="Type here…"
                  className="w-full rounded-2xl border border-jade-200 dark:border-dark-500/40 bg-[#f0f0ea] dark:bg-[#1e201a] px-4 py-3 text-base jade-text dark:text-dark-100 placeholder:text-muted dark:placeholder:text-charcoal-400 focus:outline-none focus:border-red-400 dark:focus:border-red-500/60 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleDangerous(item.action, item.phrase)}
                  disabled={!match}
                  className="w-full rounded-2xl py-3 text-sm font-semibold transition-colors disabled:opacity-40 bg-red-500 dark:bg-red-700 text-white hover:bg-red-600 dark:hover:bg-red-600 disabled:cursor-not-allowed"
                >
                  {item.label}
                </button>
              </div>
            </div>
          );
        })()}

      </div>
      <BottomNavigation />
    </div>
  );
}
