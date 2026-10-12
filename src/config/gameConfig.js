// SonicWall "Cyber Memory Challenge" - GovWare 2026 Game Configuration
export const GAME_CONFIG = {
  eventName: 'GovWare 2026',
  gameTitle: 'CYBER MEMORY CHALLENGE',
  brand: 'SonicWall',

  // Progressive difficulty scaling (No static presets)
  progression: {
    cols: 4, // 4 by 3 grid (12 cards)
    rows: 3,
    pairs: 6,
    baseDuration: 20, // 20 seconds arcade rush
    minDuration: 10,
    timeReductionPerRound: 2, // 20s -> 18s -> 16s -> 14s...
    timeBonusPerMatch: 0,
    previewDuration: 1.2,
    pointsPerMatch: 150,
    comboMultiplierStep: 0.5
  },

  // In-Booth Prize Milestones (6 Pairs or Consolation)
  prizes: {
    GRAND: {
      minPairs: 6,
      tierName: 'TOP PRIZE',
      prizeItem: 'Universal Adapter / Laptop Sleeve / Multi-Headed Cable',
      badge: 'TOP PRIZE'
    },
    CONSOLATION: {
      minPairs: 0,
      tierName: 'CONSOLATION PRIZE',
      prizeItem: 'Storage Pouch',
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

  // 8 Specific Cybersecurity Threat Vectors (Client Approved Suite)
  cardItems: [
    {
      id: 'phishing',
      name: 'Phishing',
      color: 0xF05423,
      textureKey: 'threat-phishing',
      imagePath: '/assets/images/threats/icon_phishing.png'
    },
    {
      id: 'malware',
      name: 'Malware',
      color: 0xF05423,
      textureKey: 'threat-malware',
      imagePath: '/assets/images/threats/icon_malware.png'
    },
    {
      id: 'ransomware',
      name: 'Ransomware',
      color: 0xF05423,
      textureKey: 'threat-ransomware',
      imagePath: '/assets/images/threats/icon_ransomware.png'
    },
    {
      id: 'hacking',
      name: 'Hacking',
      color: 0xF05423,
      textureKey: 'threat-hacking',
      imagePath: '/assets/images/threats/icon_hacking.png'
    },
    {
      id: 'zero_day',
      name: 'Zero-Day Exploits',
      color: 0xF05423,
      textureKey: 'threat-zero_day',
      imagePath: '/assets/images/threats/icon_zero_day.png'
    },
    {
      id: 'malicious_usb',
      name: 'Malicious USB',
      color: 0xF05423,
      textureKey: 'threat-malicious_usb',
      imagePath: '/assets/images/threats/icon_malicious_usb.png'
    },
    {
      id: 'network_attacks',
      name: 'Network Attacks',
      color: 0xF05423,
      textureKey: 'threat-network_attacks',
      imagePath: '/assets/images/threats/icon_network_attacks.png'
    },
    {
      id: 'malicious_files',
      name: 'Malicious Files',
      color: 0xF05423,
      textureKey: 'threat-malicious_files',
      imagePath: '/assets/images/threats/icon_malicious_files.png'
    }
  ]
};
