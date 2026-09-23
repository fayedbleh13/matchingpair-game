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
    timeBonusPerMatch: 0,
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

  // 18 Cybersecurity Threat Vectors (Based on Threat Vector Suite)
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
      id: 'data_breach',
      name: 'Data Breach',
      color: 0xF05423,
      textureKey: 'threat-data_breach',
      imagePath: '/assets/images/threats/icon_data_breach.png'
    },
    {
      id: 'cloud_threats',
      name: 'Cloud Threats',
      color: 0xF05423,
      textureKey: 'threat-cloud_threats',
      imagePath: '/assets/images/threats/icon_cloud_threats.png'
    },
    {
      id: 'vulnerabilities',
      name: 'Vulnerabilities',
      color: 0xF05423,
      textureKey: 'threat-vulnerabilities',
      imagePath: '/assets/images/threats/icon_vulnerabilities.png'
    },
    {
      id: 'network_attacks',
      name: 'Network Attacks',
      color: 0xF05423,
      textureKey: 'threat-network_attacks',
      imagePath: '/assets/images/threats/icon_network_attacks.png'
    },
    {
      id: 'zero_day',
      name: 'Zero-Day Exploits',
      color: 0xF05423,
      textureKey: 'threat-zero_day',
      imagePath: '/assets/images/threats/icon_zero_day.png'
    },
    {
      id: 'malicious_files',
      name: 'Malicious Files',
      color: 0xF05423,
      textureKey: 'threat-malicious_files',
      imagePath: '/assets/images/threats/icon_malicious_files.png'
    },
    {
      id: 'insider_threats',
      name: 'Insider Threats',
      color: 0xF05423,
      textureKey: 'threat-insider_threats',
      imagePath: '/assets/images/threats/icon_insider_threats.png'
    },
    {
      id: 'ddos_attacks',
      name: 'DDoS Attacks',
      color: 0xF05423,
      textureKey: 'threat-ddos_attacks',
      imagePath: '/assets/images/threats/icon_ddos_attacks.png'
    },
    {
      id: 'malicious_usb',
      name: 'Malicious USB',
      color: 0xF05423,
      textureKey: 'threat-malicious_usb',
      imagePath: '/assets/images/threats/icon_malicious_usb.png'
    },
    {
      id: 'social_engineering',
      name: 'Social Engineering',
      color: 0xF05423,
      textureKey: 'threat-social_engineering',
      imagePath: '/assets/images/threats/icon_social_engineering.png'
    },
    {
      id: 'mobile_threats',
      name: 'Mobile Threats',
      color: 0xF05423,
      textureKey: 'threat-mobile_threats',
      imagePath: '/assets/images/threats/icon_mobile_threats.png'
    },
    {
      id: 'rogue_wifi',
      name: 'Rogue Wi-Fi',
      color: 0xF05423,
      textureKey: 'threat-rogue_wifi',
      imagePath: '/assets/images/threats/icon_rogue_wifi.png'
    },
    {
      id: 'misconfigurations',
      name: 'Misconfigurations',
      color: 0xF05423,
      textureKey: 'threat-misconfigurations',
      imagePath: '/assets/images/threats/icon_misconfigurations.png'
    },
    {
      id: 'unpatched_systems',
      name: 'Unpatched Systems',
      color: 0xF05423,
      textureKey: 'threat-unpatched_systems',
      imagePath: '/assets/images/threats/icon_unpatched_systems.png'
    }
  ]
};
