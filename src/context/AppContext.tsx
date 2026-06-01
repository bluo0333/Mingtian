import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

export interface TaskStep {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  name: string;
  steps: TaskStep[];
  xp: number;
  isDone: boolean;
  isInProgress: boolean;
  isPlanned: boolean;
  deadline?: string;
  deadlineTime?: string;
  alarmTimestamp?: number;
  createdAt: number;
  completedAt?: number;
}

export interface Thought {
  id: string;
  text: string;
  createdAt: number;
  resurfacedAt?: number;
  resurfaceCount: number;
  convertedToTask: boolean;
}

export interface User {
  name: string;
  dailyCapacity: number;
  onboarded: boolean;
  birthday?: string;
}

export interface AppState {
  user: User;
  tasks: Task[];
  thoughts: Thought[];
  xp: number;
  streak: number;
  lastActiveDate: string;
  darkMode: boolean;
  apiKey?: string;
}

type Action =
  | {
      type: 'COMPLETE_ONBOARDING';
      payload: { name: string; dailyCapacity: number; darkMode: boolean; birthday?: string };
    }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'COMPLETE_TASK'; payload: { taskId: string } }
  | { type: 'COMPLETE_STEP'; payload: { taskId: string; stepId: string } }
  | { type: 'ADD_STEP'; payload: { taskId: string; step: TaskStep } }
  | { type: 'UPDATE_TASK_SCHEDULE'; payload: { taskId: string; deadline?: string; deadlineTime?: string } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } }
  | { type: 'SET_TASK_PLANNED'; payload: { taskId: string; isPlanned: boolean } }
  | { type: 'ADD_THOUGHT'; payload: Thought }
  | { type: 'DELETE_THOUGHT'; payload: { thoughtId: string } }
  | { type: 'RESURFACE_THOUGHT'; payload: { thoughtId: string } }
  | { type: 'CONVERT_THOUGHT_TO_TASK'; payload: { thoughtId: string; task: Task } }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'UPDATE_STREAK' }
  | { type: 'UPDATE_PROFILE'; payload: { name: string; birthday?: string; dailyCapacity: number } }
  | { type: 'SET_API_KEY'; payload: { apiKey: string } }
  | { type: 'CLEAR_TASKS' }
  | { type: 'RESET_PROGRESS' }
  | { type: 'RESET_ALL' };

const STORAGE_KEY = 'mingtian_app_state_v1';
const XP_PER_LEVEL = 100;
export const TASK_NAME_MAX_LENGTH = 80;

const limitTaskName = (name: string): string =>
  name.trim().slice(0, TASK_NAME_MAX_LENGTH);

const initialState: AppState = {
  user: {
    name: '',
    dailyCapacity: 2,
    onboarded: false,
  },
  tasks: [],
  thoughts: [],
  xp: 0,
  streak: 0,
  lastActiveDate: '',
  darkMode: true,
};

const dayStamp = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createId = (): string =>
  `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const parseSteps = (rawSteps: string): TaskStep[] =>
  rawSteps
    .split('\n')
    .map((step) => step.trim())
    .filter(Boolean)
    .map((text) => ({
      id: createId(),
      text,
      done: false,
    }));

const extendStreakForToday = (state: AppState): AppState => {
  const today = dayStamp();
  if (state.lastActiveDate === today) {
    return state;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStamp = dayStamp(yesterday);
  const nextStreak = state.lastActiveDate === yesterdayStamp ? state.streak + 1 : 1;

  return {
    ...state,
    streak: nextStreak,
    lastActiveDate: today,
  };
};

const hasCompletedTaskToday = (tasks: Task[]): boolean => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return tasks.some(
    (task) => task.isDone && typeof task.completedAt === 'number' && task.completedAt >= todayStart.getTime(),
  );
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        user: {
          name: action.payload.name.trim(),
          dailyCapacity: action.payload.dailyCapacity,
          onboarded: true,
          birthday: action.payload.birthday,
        },
        darkMode: action.payload.darkMode,
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks],
      };

    case 'COMPLETE_TASK': {
      const targetTask = state.tasks.find((task) => task.id === action.payload.taskId);
      if (!targetTask) {
        return state;
      }

      const hadCompletedTaskToday = hasCompletedTaskToday(state.tasks);
      const nextDone = !targetTask.isDone;
      const updatedTasks = state.tasks.map((task) => {
        if (task.id !== action.payload.taskId) {
          return task;
        }

        return {
          ...task,
          isDone: nextDone,
          isInProgress: false,
          completedAt: nextDone ? Date.now() : undefined,
          steps: task.steps.map((step) => ({ ...step, done: nextDone })),
        };
      });

      const nextState = {
        ...state,
        tasks: updatedTasks,
        xp: nextDone ? state.xp + targetTask.xp : Math.max(0, state.xp - targetTask.xp),
      };

      return nextDone && !hadCompletedTaskToday ? extendStreakForToday(nextState) : nextState;
    }

    case 'COMPLETE_STEP': {
      const targetTask = state.tasks.find((task) => task.id === action.payload.taskId);
      if (!targetTask) {
        return state;
      }

      const targetStep = targetTask.steps.find((step) => step.id === action.payload.stepId);
      if (!targetStep) {
        return state;
      }

      const hadCompletedTaskToday = hasCompletedTaskToday(state.tasks);
      let nextTaskDone = targetTask.isDone;
      const updatedTasks = state.tasks.map((task) => {
        if (task.id !== action.payload.taskId) {
          return task;
        }

        const updatedSteps = task.steps.map((step) =>
          step.id === action.payload.stepId ? { ...step, done: !step.done } : step,
        );
        const allDone = updatedSteps.length > 0 && updatedSteps.every((step) => step.done);
        nextTaskDone = allDone;

        return {
          ...task,
          steps: updatedSteps,
          isDone: allDone,
          isInProgress: !allDone,
          completedAt: allDone ? Date.now() : undefined,
        };
      });
      const xpDelta =
        !targetTask.isDone && nextTaskDone
          ? targetTask.xp
          : targetTask.isDone && !nextTaskDone
          ? -targetTask.xp
          : 0;

      const nextState = {
        ...state,
        tasks: updatedTasks,
        xp: Math.max(0, state.xp + xpDelta),
      };

      return !targetTask.isDone && nextTaskDone && !hadCompletedTaskToday
        ? extendStreakForToday(nextState)
        : nextState;
    }

    case 'ADD_STEP':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, steps: [...task.steps, action.payload.step] }
            : task,
        ),
      };

    case 'UPDATE_TASK_SCHEDULE':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? {
                ...task,
                deadline: action.payload.deadline || undefined,
                deadlineTime: action.payload.deadlineTime || undefined,
              }
            : task,
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.taskId),
      };

    case 'SET_TASK_PLANNED':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, isPlanned: action.payload.isPlanned }
            : task,
        ),
      };

    case 'ADD_THOUGHT':
      return {
        ...state,
        thoughts: [action.payload, ...state.thoughts],
      };

    case 'DELETE_THOUGHT':
      return {
        ...state,
        thoughts: state.thoughts.filter((thought) => thought.id !== action.payload.thoughtId),
      };

    case 'RESURFACE_THOUGHT':
      return {
        ...state,
        thoughts: state.thoughts.map((thought) =>
          thought.id === action.payload.thoughtId
            ? {
                ...thought,
                resurfacedAt: Date.now(),
                resurfaceCount: thought.resurfaceCount + 1,
              }
            : thought,
        ),
      };

    case 'CONVERT_THOUGHT_TO_TASK':
      return {
        ...state,
        thoughts: state.thoughts.map((thought) =>
          thought.id === action.payload.thoughtId
            ? { ...thought, convertedToTask: true }
            : thought,
        ),
        tasks: [action.payload.task, ...state.tasks],
      };

    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };

    case 'UPDATE_STREAK': {
      return extendStreakForToday(state);
    }

    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: {
          ...state.user,
          name: action.payload.name,
          birthday: action.payload.birthday,
          dailyCapacity: action.payload.dailyCapacity,
        },
      };

    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload.apiKey };

    case 'CLEAR_TASKS':
      return { ...state, tasks: [] };

    case 'RESET_PROGRESS':
      return { ...state, xp: 0, streak: 0, lastActiveDate: '' };

    case 'RESET_ALL':
      return { ...initialState };

    default:
      return state;
  }
}

const loadState = (): AppState => {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return initialState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...initialState,
      ...parsed,
      user: {
        ...initialState.user,
        ...parsed.user,
      },
    };
  } catch {
    return initialState;
  }
};

const saveState = (state: AppState): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // no-op
  }
};

interface AppContextValue {
  state: AppState;
  completeOnboarding: (payload: {
    name: string;
    dailyCapacity: number;
    darkMode: boolean;
    birthday?: string;
  }) => void;
  addTask: (payload: { name: string; stepsText?: string; xp?: number; isPlanned?: boolean; deadline?: string; deadlineTime?: string; alarmTimestamp?: number }) => void;
  completeTask: (taskId: string) => void;
  completeStep: (taskId: string, stepId: string) => void;
  addStep: (taskId: string, stepText: string) => void;
  updateTaskSchedule: (taskId: string, deadline?: string, deadlineTime?: string) => void;
  deleteTask: (taskId: string) => void;
  setTaskPlanned: (taskId: string, isPlanned: boolean) => void;
  addThought: (text: string) => void;
  deleteThought: (thoughtId: string) => void;
  resurfaceThought: (thoughtId: string) => void;
  convertThoughtToTask: (thoughtId: string, taskName?: string) => void;
  toggleDarkMode: () => void;
  updateProfile: (payload: { name: string; birthday?: string; dailyCapacity: number }) => void;
  setApiKey: (apiKey: string) => void;
  clearTasks: () => void;
  resetProgress: () => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
      return;
    }

    document.documentElement.classList.remove('dark');
  }, [state.darkMode]);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      completeOnboarding: (payload) => {
        dispatch({ type: 'COMPLETE_ONBOARDING', payload });
      },
      addTask: (payload) => {
        const name = limitTaskName(payload.name);
        if (!name) {
          return;
        }

        const steps = parseSteps(payload.stepsText ?? '');
        const task: Task = {
          id: createId(),
          name,
          steps,
          xp: payload.xp && payload.xp > 0 ? payload.xp : 30,
          isDone: false,
          isInProgress: false,
          isPlanned: Boolean(payload.isPlanned),
          deadline: payload.deadline || undefined,
          deadlineTime: payload.deadlineTime || undefined,
          alarmTimestamp: payload.alarmTimestamp || undefined,
          createdAt: Date.now(),
        };

        dispatch({ type: 'ADD_TASK', payload: task });
      },
      completeTask: (taskId) => {
        dispatch({ type: 'COMPLETE_TASK', payload: { taskId } });
      },
      completeStep: (taskId, stepId) => {
        dispatch({ type: 'COMPLETE_STEP', payload: { taskId, stepId } });
      },
      addStep: (taskId, stepText) => {
        const text = stepText.trim();
        if (!text) return;
        dispatch({
          type: 'ADD_STEP',
          payload: { taskId, step: { id: createId(), text, done: false } },
        });
      },
      updateTaskSchedule: (taskId, deadline, deadlineTime) => {
        dispatch({ type: 'UPDATE_TASK_SCHEDULE', payload: { taskId, deadline, deadlineTime } });
      },
      deleteTask: (taskId) => {
        dispatch({ type: 'DELETE_TASK', payload: { taskId } });
      },
      setTaskPlanned: (taskId, isPlanned) => {
        dispatch({ type: 'SET_TASK_PLANNED', payload: { taskId, isPlanned } });
      },
      addThought: (text) => {
        const nextText = text.trim();
        if (!nextText) {
          return;
        }

        dispatch({
          type: 'ADD_THOUGHT',
          payload: {
            id: createId(),
            text: nextText,
            createdAt: Date.now(),
            resurfaceCount: 0,
            convertedToTask: false,
          },
        });
      },
      deleteThought: (thoughtId) => {
        dispatch({ type: 'DELETE_THOUGHT', payload: { thoughtId } });
      },
      resurfaceThought: (thoughtId) => {
        dispatch({ type: 'RESURFACE_THOUGHT', payload: { thoughtId } });
      },
      convertThoughtToTask: (thoughtId, taskName) => {
        const thought = state.thoughts.find((item) => item.id === thoughtId);
        if (!thought) {
          return;
        }

        const task: Task = {
          id: createId(),
          name: limitTaskName(taskName || thought.text),
          steps: [],
          xp: 30,
          isDone: false,
          isInProgress: false,
          isPlanned: true,
          createdAt: Date.now(),
        };

        dispatch({
          type: 'CONVERT_THOUGHT_TO_TASK',
          payload: { thoughtId, task },
        });
      },
      toggleDarkMode: () => {
        dispatch({ type: 'TOGGLE_DARK_MODE' });
      },
      updateProfile: (payload) => {
        dispatch({ type: 'UPDATE_PROFILE', payload });
      },
      setApiKey: (apiKey) => {
        dispatch({ type: 'SET_API_KEY', payload: { apiKey } });
      },
      clearTasks: () => {
        dispatch({ type: 'CLEAR_TASKS' });
      },
      resetProgress: () => {
        window.localStorage.removeItem('mingtian_last_celebrated_streak_date');
        dispatch({ type: 'RESET_PROGRESS' });
      },
      resetAll: () => {
        window.localStorage.removeItem('mingtian_last_celebrated_streak_date');
        dispatch({ type: 'RESET_ALL' });
      },
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }

  return context;
};

export const getLevel = (xp: number): number => Math.floor(xp / XP_PER_LEVEL) + 1;

export const getLevelProgress = (xp: number): number => xp % XP_PER_LEVEL;

export const getLevelMax = (): number => XP_PER_LEVEL;

const getTodayStart = (): number => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  return todayStart.getTime();
};

export const getTodaysTasks = (tasks: Task[]): Task[] => {
  const todayStart = getTodayStart();
  return tasks.filter((task) => {
    if (task.isPlanned) {
      return false;
    }

    if (!task.isDone) {
      return true;
    }

    return typeof task.completedAt === 'number' && task.completedAt >= todayStart;
  });
};

export const getPlannedTasks = (tasks: Task[]): Task[] => tasks.filter((task) => task.isPlanned);

export const getResurfaceThoughts = (thoughts: Thought[]): Thought[] => {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - oneDayMs;

  return thoughts
    .filter((thought) => {
      if (thought.convertedToTask) {
        return false;
      }
      const oldEnough = thought.createdAt <= cutoff;
      const notRecentlyResurfaced = !thought.resurfacedAt || thought.resurfacedAt <= cutoff;
      return oldEnough && notRecentlyResurfaced;
    })
    .slice(0, 3);
};
