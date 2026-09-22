// Storage utility for SonicWall GovWare 2026 Leaderboard & Settings persistence
const SETTINGS_KEY = 'sw_govware_settings';
const LEADERBOARD_KEY = 'sw_govware_leaderboard';

const DEFAULT_SETTINGS = {
  musicVolume: 0.5,
  sfxVolume: 0.8,
  musicMuted: false,
  sfxMuted: false,
  previewEnabled: true
};

export const Storage = {
  getSettings() {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    try {
      const current = this.getSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('Failed to save settings to localStorage:', e);
      return settings;
    }
  },

  getLeaderboard() {
    try {
      const data = localStorage.getItem(LEADERBOARD_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to read leaderboard:', e);
    }
    // Default placeholder scores for exciting booth atmosphere
    return [
      { name: 'SEC_DIRECTOR', score: 3200, pairs: 16, stage: 2, moves: 18, date: 'GovWare Day 1' },
      { name: 'CYBER_NINJA', score: 2450, pairs: 12, stage: 2, moves: 15, date: 'GovWare Day 1' },
      { name: 'NET_ARCHITECT', score: 1800, pairs: 8, stage: 1, moves: 10, date: 'GovWare Day 1' },
      { name: 'INFOSEC_PRO', score: 1550, pairs: 8, stage: 1, moves: 11, date: 'GovWare Day 1' },
      { name: 'BOOTH_RUNNER', score: 1100, pairs: 6, stage: 1, moves: 9, date: 'GovWare Day 1' }
    ];
  },

  isHighScore(score) {
    const list = this.getLeaderboard();
    if (list.length < 10) return true;
    return score > (list[list.length - 1].score || 0);
  },

  saveScore(entry) {
    try {
      const list = this.getLeaderboard();
      const newEntry = {
        name: (entry.name || 'ATTENDEE').substring(0, 10).toUpperCase(),
        score: Number(entry.score || 0),
        pairs: Number(entry.pairs || 0),
        stage: Number(entry.stage || 1),
        moves: Number(entry.moves || 0),
        date: new Date().toLocaleDateString()
      };

      list.push(newEntry);
      // Sort by highest score first, then highest pairs, then lowest moves
      list.sort((a, b) => b.score - a.score || b.pairs - a.pairs || a.moves - b.moves);
      const top10 = list.slice(0, 10);

      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top10));
      return {
        rank: top10.findIndex(item => item === newEntry) + 1,
        top10
      };
    } catch (e) {
      console.warn('Failed to save score:', e);
      return { rank: 1, top10: [] };
    }
  },

  clearLeaderboard() {
    try {
      localStorage.removeItem(LEADERBOARD_KEY);
    } catch (e) {
      console.warn('Failed to clear leaderboard:', e);
    }
  }
};
