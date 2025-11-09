// Local storage utilities for team data management

export interface Player {
  id: string;
  name: string;
  number: number;
  goals: number;
  assists: number;
  penaltyMins: number;
  matches: number;
  currentTab: number;
  paidOffTab: number;
}

export interface Goal {
  id: string;
  playerId: string;
  assistId?: string;
  matchId: string;
  period: number;
  time: string;
}

export interface Match {
  id: string;
  date: string;
  opponent: string;
  homeGame: boolean;
  goalsFor: number;
  goalsAgainst: number;
  lineup: string[];
}

const STORAGE_KEYS = {
  PLAYERS: 'digrone_players',
  MATCHES: 'digrone_matches',
  GOALS: 'digrone_goals',
};

// Initialize with sample data if empty
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
  }
};

export const getPlayers = (): Player[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || '[]');
};

export const savePlayers = (players: Player[]) => {
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
};

export const getMatches = (): Match[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCHES) || '[]');
};

export const saveMatches = (matches: Match[]) => {
  localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
};

export const getGoals = (): Goal[] => {
  initializeData();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.GOALS) || '[]');
};

export const saveGoals = (goals: Goal[]) => {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
};
