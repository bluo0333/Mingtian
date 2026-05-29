import { type ChangeEvent, type KeyboardEvent } from 'react';

type TaskScheduleEditorProps = {
  deadline?: string;
  deadlineTime?: string;
  onChange: (deadline?: string, deadlineTime?: string) => void;
};

const formatDate = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
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
  return `${day}/${month}/${year}`;
};

const getTimePeriod = (value: string): 'AM' | 'PM' | '' => {
  const normalized = value.toUpperCase();
  if (normalized.includes('P')) return 'PM';
  if (normalized.includes('A')) return 'AM';
  return '';
};

const formatTime = (value: string): string => {
  const period = getTimePeriod(value);
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (!digits) return period;

  let hour = digits.slice(0, 2);
  let minute = digits.slice(2, 4);

  if (hour.length === 1 && Number(hour) > 1) hour = '1';
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

  const time = digits.length <= 2 ? hour : `${hour}:${minute}`;
  return period ? `${time} ${period}` : time;
};

const isCompleteDate = (value: string): boolean => value.replace(/\D/g, '').length === 8;

const isCompleteTime = (value: string): boolean =>
  value.replace(/\D/g, '').length === 4 && Boolean(getTimePeriod(value));

export default function TaskScheduleEditor({
  deadline,
  deadlineTime,
  onChange,
}: TaskScheduleEditorProps) {
  const dateValue = deadline ?? '';
  const timeValue = deadlineTime ?? '';

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextDate = formatDate(event.target.value);
    onChange(isCompleteDate(nextDate) ? nextDate : nextDate || undefined, timeValue || undefined);
  };

  const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = formatTime(event.target.value);
    onChange(dateValue || undefined, isCompleteTime(nextTime) ? nextTime : nextTime || undefined);
  };

  const handleTimeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (getTimePeriod(timeValue)) {
        onChange(dateValue || undefined, formatTime(timeValue.replace(/\s?[AP]M$/, '')) || undefined);
        return;
      }

      onChange(dateValue || undefined, formatTime(timeValue.replace(/\D/g, '').slice(0, -1)) || undefined);
      return;
    }

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      const digits = timeValue.replace(/\D/g, '');
      if (digits.length < 4) {
        onChange(dateValue || undefined, formatTime(`${digits}${event.key}${getTimePeriod(timeValue)}`));
      }
      return;
    }

    if (/^[ap]$/i.test(event.key)) {
      event.preventDefault();
      onChange(dateValue || undefined, formatTime(`${timeValue}${event.key}`));
    }
  };

  return (
    <div className="ml-8 flex flex-wrap items-center gap-2">
      <input
        value={dateValue}
        onChange={handleDateChange}
        placeholder="DD/MM/YYYY"
        inputMode="numeric"
        maxLength={10}
        className="w-[9.5rem] rounded-xl border border-jade-200 bg-[#f7f4ee] px-3 py-1.5 text-sm jade-text placeholder:text-muted focus:outline-none dark:border-dark-500/40 dark:bg-[#20201a] dark:text-dark-100 dark:placeholder:text-charcoal-300"
        aria-label="Task due date"
      />
      <input
        value={timeValue}
        onChange={handleTimeChange}
        onKeyDown={handleTimeKeyDown}
        placeholder="--:-- --"
        maxLength={8}
        autoCapitalize="characters"
        className="w-[7.5rem] rounded-xl border border-jade-200 bg-[#f7f4ee] px-3 py-1.5 text-sm jade-text placeholder:text-muted focus:outline-none dark:border-dark-500/40 dark:bg-[#20201a] dark:text-dark-100 dark:placeholder:text-charcoal-300"
        aria-label="Task due time"
      />
      {(dateValue || timeValue) && (
        <button
          type="button"
          onClick={() => onChange(undefined, undefined)}
          className="text-xs font-semibold text-jade-600 hover:text-jade-700 dark:text-dark-300"
        >
          Clear
        </button>
      )}
    </div>
  );
}
