import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';

type TaskScheduleEditorProps = {
  deadline?: string;
  deadlineTime?: string;
  onChange: (deadline?: string, deadlineTime?: string) => void;
};

type TimeParts = {
  hour: string;
  minute: string;
};

const pad2 = (value: number): string => value.toString().padStart(2, '0');

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDateForDisplay = (date: Date): string =>
  `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;

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
  let digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length >= 1 && Number(digits[0]) > 3) {
    digits = `3${digits.slice(1)}`;
  }

  if (digits.length >= 3 && Number(digits[2]) > 1) {
    digits = `${digits.slice(0, 2)}1${digits.slice(3)}`;
  }

  if (!digits) return '';

  let day = digits.slice(0, 2);
  let month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (day.length === 2) {
    const dayNum = Number(day);
    if (dayNum === 0) day = '01';
    if (dayNum > 31) day = '31';
  }

  if (month.length === 2) {
    const monthNum = Number(month);
    if (monthNum === 0) month = '01';
    if (monthNum > 12) month = '12';
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
    if (hourNum === 0) hour = '01';
    if (hourNum > 12) hour = '12';
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

  if (!digits) return period;

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

const MaskedDateInput = ({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete: () => void;
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
  const highlightIndex = isFocused ? dateTemplateHighlightIndex(value) : -1;

  return (
    <div className="relative w-[9.5rem] rounded-xl border border-jade-200 bg-[#f7f4ee] px-3 py-1.5 dark:border-dark-500/40 dark:bg-[#20201a]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 inset-y-0 flex items-center font-mono text-sm jade-text dark:text-dark-100"
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
        inputMode="numeric"
        maxLength={10}
        className="relative z-10 w-full bg-transparent font-mono text-sm text-transparent caret-transparent focus:outline-none"
        aria-label="Task due date"
      />
    </div>
  );
};

const MaskedTimeInput = ({
  value,
  onChange,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement>;
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(formatTime(event.target.value));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
  const highlightIndex = isFocused ? timeTemplateHighlightIndex(value) : -1;

  return (
    <div className="relative w-[7.5rem] rounded-xl border border-jade-200 bg-[#f7f4ee] px-3 py-1.5 dark:border-dark-500/40 dark:bg-[#20201a]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 inset-y-0 flex items-center font-mono text-sm jade-text dark:text-dark-100"
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
        maxLength={8}
        autoCapitalize="characters"
        className="relative z-10 w-full bg-transparent font-mono text-sm text-transparent caret-transparent focus:outline-none"
        aria-label="Task due time"
      />
    </div>
  );
};

export default function TaskScheduleEditor({
  deadline,
  deadlineTime,
  onChange,
}: TaskScheduleEditorProps) {
  const [draftDate, setDraftDate] = useState(deadline ?? '');
  const [draftTime, setDraftTime] = useState(deadlineTime ?? '');
  const timeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (deadline) {
      setDraftDate(deadline);
    }
  }, [deadline]);

  useEffect(() => {
    if (deadlineTime) {
      setDraftTime(deadlineTime);
    }
  }, [deadlineTime]);

  const handleDateChange = (nextDate: string) => {
    setDraftDate(nextDate);

    if (isCompleteDate(nextDate)) {
      onChange(nextDate, isCompleteTime(draftTime) ? draftTime : deadlineTime);
      return;
    }

    onChange(undefined, isCompleteTime(draftTime) ? draftTime : undefined);
  };

  const handleTimeChange = (nextTime: string) => {
    setDraftTime(nextTime);

    if (isCompleteTime(nextTime)) {
      onChange(isCompleteDate(draftDate) ? draftDate : deadline, nextTime);
      return;
    }

    onChange(isCompleteDate(draftDate) ? draftDate : deadline, undefined);
  };

  return (
    <div className="ml-8 flex flex-wrap items-center gap-2">
      <MaskedDateInput
        value={draftDate}
        onChange={handleDateChange}
        onComplete={() => timeInputRef.current?.focus()}
      />
      <MaskedTimeInput
        value={draftTime}
        onChange={handleTimeChange}
        inputRef={timeInputRef}
      />
      {(draftDate || draftTime || deadline || deadlineTime) && (
        <button
          type="button"
          onClick={() => {
            setDraftDate('');
            setDraftTime('');
            onChange(undefined, undefined);
          }}
          className="text-xs font-semibold text-jade-600 hover:text-jade-700 dark:text-dark-300"
        >
          Clear
        </button>
      )}
    </div>
  );
}
