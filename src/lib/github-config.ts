export const GITHUB_CONFIG = {
    owner: "Setorator",
    repo: "digrone",
    branch: "main",
    dataPath: "data"
};

export const getGitHubToken = (): string | null => {
    return localStorage.getItem('github_token');
};

export const setGitHubToken = (token: string): void => {
    localStorage.setItem('github_token', token);
};