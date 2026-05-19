export interface Task {
  id: string;
  name: string;
  steps?: string;
  xp: number;
  isDone: boolean;
  isInProgress?: boolean;
}

export interface User {
  name: string;
  level: number;
  xp: number;
  streak: number;
}