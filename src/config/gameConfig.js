// SonicWall "Cyber Memory Challenge" - GovWare 2026 Game Configuration
export const GAME_CONFIG = {
  eventName: 'GovWare 2026',
  gameTitle: 'CYBER MEMORY CHALLENGE',
  brand: 'SonicWall',

  // Progressive difficulty scaling (No static presets)
  progression: {
    cols: 4, // 4 by 4 grid (16 cards)
    rows: 4,
    pairs: 8,
    baseDuration: 20, // 20 seconds arcade rush
    minDuration: 10,
    timeReductionPerRound: 2, // 20s -> 18s -> 16s -> 14s...
    timeBonusPerMatch: 1.0,
    previewDuration: 1.2,
    pointsPerMatch: 150,
    comboMultiplierStep: 0.5
  },

  // In-Booth Prize Milestones
  prizes: {
    GRAND: {
      minPairs: 8,
      tierName: 'GRAND PRIZE',
      prizeItem: 'Multifunction Storage Pouch / Laptop Sleeve',
      badge: 'TOP PRIZE'
    },
    TIER_2: {
      minPairs: 6,
      tierName: 'TIER 2 PRIZE',
      prizeItem: 'Multiheaded Cable',
      badge: 'TIER 2'
    },
    CONSOLATION: {
      minPairs: 0,
      tierName: 'CONSOLATION PRIZE',
      prizeItem: 'SonicWall Pen & Canvas Bag',
      badge: 'CONSOLATION'
    }
  },

  // SonicWall Brand Theme & Colors
  theme: {
    sonicOrange: 0xF05423,
    sonicOrangeHex: '#F05423',
    sonicOrangeGlow: '#FF6B35',
    cyberCyan: 0x00D8F6,
    cyberCyanHex: '#00D8F6',
    darkBgTop: '#060913',
    darkBgBottom: '#0D1424',
    accentSuccess: 0x10B981,
    accentWarning: 0xF59E0B,
    accentDanger: 0xEF4444,

    // Card styling: Sleek dark cards with refined slate borders and pristine white front
    card: {
      backColor: 0x0A1326,
      backBorder: 0x1E355B,
      frontColor: 0xFFFFFF,
      frontBorder: 0xE2E8F0,
      matchedColor: 0x10B981,
      borderRadius: 18,
      borderWidth: 2
    }
  },

  // 8 SonicWall Official Cybersecurity Card Items (High Quality PNGs)
  cardItems: [
    {
      id: 'university',
      name: 'SonicWall University',
      color: 0xF05423,
      textureKey: 'sw-university',
      imagePath: '/assets/images/sonicwall-university.png'
    },
    {
      id: 'cloud',
      name: 'Cloud Edge',
      color: 0x00D8F6,
      textureKey: 'sw-cloud',
      imagePath: '/assets/images/icon-cloud.png'
    },
    {
      id: 'nsa',
      name: 'NSA Firewall',
      color: 0x3B82F6,
      textureKey: 'sw-nsa',
      imagePath: '/assets/images/icon-nsa.png'
    },
    {
      id: 'cse',
      name: 'Cloud Secure Edge',
      color: 0x00D8F6,
      textureKey: 'sw-cse',
      imagePath: '/assets/images/icon-cse.png'
    },
    {
      id: 'endpoint',
      name: 'Endpoint Security',
      color: 0x8B5CF6,
      textureKey: 'sw-endpoint',
      imagePath: '/assets/images/icon-endpoint.png'
    },
    {
      id: 'analytics',
      name: 'Analytics & Reporting',
      color: 0x10B981,
      textureKey: 'sw-analytics',
      imagePath: '/assets/images/icon-analytics.png'
    },
    {
      id: 'securefirst_shield',
      name: 'SecureFirst Shield',
      color: 0xF59E0B,
      textureKey: 'sw-securefirst-shield',
      imagePath: '/assets/images/icon-securefirst-shield.png'
    },
    {
      id: 'wit',
      name: 'Women in Tech',
      color: 0xEC4899,
      textureKey: 'sw-wit',
      imagePath: '/assets/images/icon-wit.png'
    },
    {
      id: 'securefirst_partner',
      name: 'SecureFirst Partner',
      color: 0xF05423,
      textureKey: 'sw-untitled-transparent',
      imagePath: '/assets/images/Untitled-transparent.png'
    }
  ]
};
