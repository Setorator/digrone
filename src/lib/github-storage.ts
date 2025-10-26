import { GITHUB_CONFIG, getGitHubToken } from './github-config';
import type { Player, Match, Goal } from './storage';
const BASE_URL = 'https://api.github.com';
const RAW_URL = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}`;
// Fallback to local URLs in development
const isDevelopment = import.meta.env.DEV;
// Read functions (public, no auth needed)
export const fetchPlayers = async (): Promise<Player[]> => {
  const url = isDevelopment 
    ? `${import.meta.env.BASE_URL}data/players.json`
    : `${RAW_URL}/${GITHUB_CONFIG.dataPath}/players.json`;
  
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
};
export const fetchMatches = async (): Promise<Match[]> => {
  const url = isDevelopment 
    ? `${import.meta.env.BASE_URL}data/matches.json`
    : `${RAW_URL}/${GITHUB_CONFIG.dataPath}/matches.json`;
  
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
};
export const fetchGoals = async (): Promise<Goal[]> => {
  const url = isDevelopment 
    ? `${import.meta.env.BASE_URL}data/goals.json`
    : `${RAW_URL}/${GITHUB_CONFIG.dataPath}/goals.json`;
  
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
};
// Write functions (require GitHub token)
const updateFile = async (path: string, content: string, message: string) => {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token not configured');
  }
  // Get current file SHA
  const getResponse = await fetch(
    `${BASE_URL}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );
  let sha: string | undefined;
  if (getResponse.ok) {
    const data = await getResponse.json();
    sha = data.sha;
  }
  // Update file
  const response = await fetch(
    `${BASE_URL}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message,
        content: btoa(content), // Base64 encode
        sha,
        branch: GITHUB_CONFIG.branch,
      }),
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to update file: ${response.statusText}`);
  }
  return response.json();
};
export const savePlayers = async (players: Player[]): Promise<void> => {
  if (isDevelopment) {
    localStorage.setItem('digrone_players', JSON.stringify(players));
    return;
  }
  
  const content = JSON.stringify(players, null, 2);
  await updateFile(
    `${GITHUB_CONFIG.dataPath}/players.json`,
    content,
    'Update players data'
  );
};
export const saveMatches = async (matches: Match[]): Promise<void> => {
  if (isDevelopment) {
    localStorage.setItem('digrone_matches', JSON.stringify(matches));
    return;
  }
  
  const content = JSON.stringify(matches, null, 2);
  await updateFile(
    `${GITHUB_CONFIG.dataPath}/matches.json`,
    content,
    'Update matches data'
  );
};
export const saveGoals = async (goals: Goal[]): Promise<void> => {
  if (isDevelopment) {
    localStorage.setItem('digrone_goals', JSON.stringify(goals));
    return;
  }
  
  const content = JSON.stringify(goals, null, 2);
  await updateFile(
    `${GITHUB_CONFIG.dataPath}/goals.json`,
    content,
    'Update goals data'
  );
};
