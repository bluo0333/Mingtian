import { useEffect, useMemo, useState } from 'react';
import { Battery, Check, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

type CapacityOption = {
  label: string;
  value: number;
};

const APP_MARK = '\u660e\u5929';

const capacityOptions: CapacityOption[] = [
  { label: 'Under 1 hour', value: 1 },
  { label: '1 - 2 hours', value: 2 },
  { label: '2 - 4 hours', value: 4 },
  { label: '4+ hours', value: 6 },
];

export default function Onboarding() {
  const {
    state: { user, darkMode },
    completeOnboarding,
  } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user.name);
  const [birthday, setBirthday] = useState(user.birthday ?? '');
  const [dailyCapacity, setDailyCapacity] = useState(user.dailyCapacity || 2);
  const [useDarkMode, setUseDarkMode] = useState(darkMode);

  useEffect(() => {
    if (user.onboarded) {
      navigate('/', { replace: true });
    }
  }, [navigate, user.onboarded]);

  const steps = ['About you', 'Your focus', 'Theme', 'Review'];
  const canContinue = useMemo(() => {
    if (step === 0) {
      return name.trim().length > 0;
    }
    return true;
  }, [name, step]);

  const isDark = useDarkMode;
  const palette = {
    outerBg: isDark ? 'bg-[#16171b]' : 'bg-[#1f2026]',
    cardBg: isDark ? 'bg-[#11120f]' : 'bg-[#edeae4]',
    cardBorder: isDark ? 'border-[#7f6a20]/60' : 'border-[#b6cec8]',
    topBg: isDark ? 'bg-black' : 'bg-jade-600',
    primary: isDark ? 'text-[#cfae2e]' : 'text-white',
    heading: isDark ? 'text-[#e4d280]' : 'text-jade-700',
    body: isDark ? 'text-[#7f7a55]' : 'text-[#98958d]',
    inputBg: isDark ? 'bg-[#1a1d16]' : 'bg-[#e7e8e8]',
    inputBorder: isDark ? 'border-[#7f6a20]/40' : 'border-[#afc8c2]',
    surface: isDark ? 'bg-[#171a13]' : 'bg-transparent',
    buttonBg: isDark ? 'bg-[#0f110d]' : 'bg-white/30',
    buttonBorder: isDark ? 'border-[#8b7220]/60' : 'border-[#c8d7d4]',
    buttonText: isDark ? 'text-[#f0e4b8]' : 'text-jade-700',
  };

  const continueFlow = () => {
    if (!canContinue) {
      return;
    }

    if (step < 3) {
      setStep((value) => value + 1);
      return;
    }

    completeOnboarding({
      name: name.trim(),
      dailyCapacity,
      darkMode: useDarkMode,
      birthday: birthday || undefined,
    });
    navigate('/', { replace: true });
  };

  return (
    <div className={`min-h-screen ${palette.outerBg} flex items-center justify-center p-3 sm:p-6`}>
      <div
        className={`w-full max-w-[370px] min-h-[760px] rounded-[38px] border ${palette.cardBorder} ${palette.cardBg} overflow-hidden shadow-2xl`}
      >
        <div className={`${palette.topBg} px-5 py-3 flex justify-between items-center`}>
          <div className={`text-sm font-semibold ${palette.primary}`}>9:41</div>
          <div className={`flex gap-1 ${palette.primary}`}>
            <Wifi size={14} />
            <Battery size={14} />
          </div>
        </div>

        <div className="px-6 py-7">
          <div className="text-center">
            <div className={`text-5xl leading-none mb-1 ${palette.heading}`}>{APP_MARK}</div>
            <h1 className={`text-4xl font-semibold ${palette.heading}`}>Mingtian</h1>
            <p className={`mt-2 text-base ${palette.body}`}>your mindful productivity companion</p>
          </div>

          <div className="mt-6 mb-5 flex justify-center gap-2">
            {steps.map((item, index) => (
              <span
                key={item}
                className={`h-2.5 w-2.5 rounded-full ${
                  index <= step
                    ? isDark
                      ? 'bg-[#b8962a]'
                      : 'bg-jade-400'
                    : isDark
                      ? 'bg-[#4b4629]'
                      : 'bg-[#c3c7c0]'
                }`}
              />
            ))}
          </div>

          <div className="text-center mb-6">
            <div className={`text-xs tracking-[0.12em] uppercase ${palette.body}`}>
              Step {step + 1} of 4 - {steps[step]}
            </div>
          </div>

          <div className="space-y-5">
            {step === 0 && (
              <>
                <div>
                  <label className={`block text-3xl font-medium mb-3 ${palette.heading}`}>
                    What should we call you?
                  </label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your first name or nickname..."
                    className={`w-full rounded-2xl border ${palette.inputBorder} ${palette.inputBg} px-4 py-3 text-lg ${palette.heading} placeholder:opacity-70`}
                  />
                  <p className={`mt-2 text-sm ${palette.body}`}>
                    This is how the app will greet you each day.
                  </p>
                </div>
                <div>
                  <label className={`block text-3xl font-medium mb-3 ${palette.heading}`}>
                    When is your birthday?
                  </label>
                  <input
                    value={birthday}
                    onChange={(event) => setBirthday(event.target.value)}
                    placeholder="DD / MM / YYYY"
                    className={`w-full rounded-2xl border ${palette.inputBorder} ${palette.inputBg} px-4 py-3 text-lg ${palette.heading} placeholder:opacity-70`}
                  />
                  <p className={`mt-2 text-sm ${palette.body}`}>
                    Used to celebrate with you - nothing else.
                  </p>
                </div>
              </>
            )}

            {step === 1 && (
              <div>
                <div className={`text-3xl font-medium leading-tight mb-4 ${palette.heading}`}>
                  How much focus time do you have each day?
                </div>
                <div className="space-y-3">
                  {capacityOptions.map((option) => {
                    const selected = dailyCapacity === option.value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setDailyCapacity(option.value)}
                        className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between ${
                          selected
                            ? isDark
                              ? 'border-[#d2b840] bg-[#1a1d16]'
                              : 'border-jade-500 bg-jade-50'
                            : `${palette.inputBorder} ${palette.surface}`
                        }`}
                      >
                        <span className={`text-2xl font-medium ${palette.heading}`}>{option.label}</span>
                        <span
                          className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                            selected
                              ? isDark
                                ? 'border-[#d2b840] bg-[#d2b840]'
                                : 'border-jade-600 bg-jade-600'
                              : isDark
                                ? 'border-[#7b6733]'
                                : 'border-jade-300'
                          }`}
                        >
                          {selected && <Check size={13} className={isDark ? 'text-[#12140f]' : 'text-white'} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className={`text-3xl font-medium leading-tight mb-4 ${palette.heading}`}>
                  Choose your look
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setUseDarkMode(false)}
                    className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between ${
                      !useDarkMode
                        ? 'border-jade-500 bg-jade-50 text-jade-700'
                        : `${palette.inputBorder} ${palette.surface} ${palette.heading}`
                    }`}
                  >
                    <span className="text-2xl font-medium">Light mode</span>
                    {!useDarkMode && <Check size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseDarkMode(true)}
                    className={`w-full rounded-2xl border px-4 py-3 flex items-center justify-between ${
                      useDarkMode
                        ? 'border-[#d2b840] bg-[#1a1d16] text-[#e4d280]'
                        : `${palette.inputBorder} ${palette.surface} ${palette.heading}`
                    }`}
                  >
                    <span className="text-2xl font-medium">Dark mode</span>
                    {useDarkMode && <Check size={16} />}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={`rounded-2xl border ${palette.inputBorder} ${palette.surface} p-5 space-y-2`}>
                <div className={`text-sm ${palette.body}`}>Ready to start</div>
                <div className={`text-2xl font-semibold ${palette.heading}`}>{name || 'You'}</div>
                <div className={`text-base ${palette.body}`}>Focus capacity: {dailyCapacity}h/day</div>
                <div className={`text-base ${palette.body}`}>Theme: {useDarkMode ? 'Dark' : 'Light'}</div>
              </div>
            )}
          </div>

          <div className="mt-7 flex gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((value) => Math.max(0, value - 1))}
                className={`flex-1 rounded-2xl border ${palette.buttonBorder} ${palette.buttonBg} ${palette.buttonText} py-3 text-xl font-semibold`}
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={continueFlow}
              disabled={!canContinue}
              className={`rounded-2xl border ${palette.buttonBorder} ${palette.buttonBg} ${palette.buttonText} py-3 text-xl font-semibold disabled:opacity-40 ${
                step > 0 ? 'flex-1' : 'w-full'
              }`}
            >
              {step === 3 ? 'Continue' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
