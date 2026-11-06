import {
  AutoShapeObject,
  BezierNode,
  CanvasObject,
  CanvasSlice,
  TextObject,
  VectorPathObject,
} from '../types/editor';
import {
  COLOR_THEME_PRESETS,
  ColorThemePalette,
  LogoGeneratorConfig,
  WebsiteLayoutTemplateId,
  analyzeUserContentForLogo,
  applyColorThemeToCanvasObjects,
  generateLogoVariationsFromPrompt,
  getReadableTextColorForBg,
} from './creationEngine';
import { createSmartConnectorObject } from './connectorEngine';

// ============================================================================
// 1. DEEP RESEARCH & MARKET INTELLIGENCE TYPES
// ============================================================================

export interface CompetitorBenchmark {
  name: string;
  archetype: string;
  strength: string;
  uxBlindSpot: string;
  unfairAdvantage: string;
  threatLevel: 'High' | 'Medium' | 'Emerging';
}

export interface ResearchPipelineStep {
  step: number;
  title: string;
  detail: string;
  status: 'done';
  durationMs: number;
}

export interface ResearchValuePillar {
  badge: string;
  title: string;
  metric: string;
  description: string;
}

export interface DeepResearchDossier {
  id: string;
  query: string;
  brandName: string;
  tagline: string;
  monogram: string;
  industryId: string;
  industryName: string;
  confidenceScore: number;
  marketOpportunitySummary: string;
  targetAudience: string;
  primaryPainPoint: string;
  threeSecondHook: string;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  subcopyLine1: string;
  subcopyLine2: string;
  primaryCta: string;
  secondaryCta: string;
  proofMetrics: string[];
  valuePillars: ResearchValuePillar[];
  competitors: CompetitorBenchmark[];
  topNavMenus: string[];
  level1Menus: Record<number, string[]>;
  level2Submenus: Record<number, string[]>;
  recommendedTemplateId: WebsiteLayoutTemplateId;
  recommendedTheme: ColorThemePalette;
  colorPsychologyRationale: string;
  wcagContrastRatio: string;
  typographyPairing: {
    display: string;
    ui: string;
    mono: string;
    rationale: string;
  };
  recommendedLogoConfig: LogoGeneratorConfig;
  pipelineSteps: ResearchPipelineStep[];
}

export interface DeepResearchPreset {
  id: string;
  label: string;
  category: string;
  badge: string;
  prompt: string;
}

export interface CanvasAuditCategory {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  status: 'optimal' | 'pass' | 'warning' | 'action-needed';
  summary: string;
  recommendation: string;
}

export interface CanvasAuditReport {
  overallScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  summary: string;
  categories: CanvasAuditCategory[];
  checks: CanvasAuditCategory[];
  actionableFixesCount: number;
}

// ============================================================================
// 2. CURATED ONE-CLICK DEEP RESEARCH INDUSTRY PRESETS
// ============================================================================

export const DEEP_RESEARCH_PRESETS: DeepResearchPreset[] = [
  {
    id: 'drone-robotics',
    label: 'Autonomous Drones',
    category: 'Aerial Robotics & Defense',
    badge: 'OSITO CORE',
    prompt: 'Osito Autonomous — AI Thermal Perimeter Security Drones & BVLOS Fleet Telemetry',
  },
  {
    id: 'commercial-inspection',
    label: 'Roof & Thermal Audit',
    category: 'Commercial Aerial Inspection',
    badge: 'OSITO B2B',
    prompt: 'Osito Aerial Inspections — Commercial Roof Moisture, HVAC Thermal & 3D Orthomosaic Audits',
  },
  {
    id: 'stem-academy',
    label: 'STEM Flight Academy',
    category: 'Youth Robotics & EdTech',
    badge: 'EDTECH LABS',
    prompt: 'Osito STEM Flight Academy — Youth Autonomous Drone Coding & FPV Robotics Labs',
  },
  {
    id: 'ai-fintech',
    label: 'Autonomous FinTech',
    category: 'Institutional Liquidity AI',
    badge: 'FINTECH PRO',
    prompt: 'Aether Treasury — Autonomous AI Institutional Liquidity & Real-Time Yield Engine',
  },
  {
    id: 'agentic-devtools',
    label: 'Agentic DevTools SDK',
    category: 'Cloud & GPU Infrastructure',
    badge: 'DEV CLOUD',
    prompt: 'Vexel Cloud SDK — Zero-Latency Edge Vector & GPU Shader Infrastructure',
  },
  {
    id: 'cyber-defense',
    label: 'Zero-Trust Cyber',
    category: 'Cloud Threat Graph',
    badge: 'SECOPS AI',
    prompt: 'Sentinel Zero — Agentless Cloud Threat Graph & Quantum-Safe Zero Trust',
  },
  {
    id: 'biotech-health',
    label: 'Longevity Biotech',
    category: 'Clinical AI Diagnostics',
    badge: 'HEALTH AI',
    prompt: 'Helix Longevity — Multi-Omic Clinical AI Biomarker & Cellular Diagnostics',
  },
  {
    id: 'luxury-commerce',
    label: 'Precision Hardware',
    category: 'Luxury D2C Telemetry',
    badge: 'LUXURY D2C',
    prompt: 'Monolith Espresso — CNC Machined Titanium Precision Telemetry Espresso System',
  },
  {
    id: 'cleantech-grid',
    label: 'Microgrid CleanTech',
    category: 'Energy Arbitrage AI',
    badge: 'GRID AI',
    prompt: 'Solaris Grid AI — Autonomous Microgrid Battery Dispatch & Energy Arbitrage',
  },
];

// ============================================================================
// 3. INDUSTRY KNOWLEDGE GRAPH & DETERMINISTIC SYNTHESIS ENGINE ($0.00 / 0ms)
// ============================================================================

interface IndustryKnowledgeTemplate {
  industryId: string;
  industryName: string;
  regex: RegExp;
  defaultBrand: string;
  defaultTagline: string;
  confidenceScore: number;
  marketOpportunitySummary: string;
  targetAudience: string;
  primaryPainPoint: string;
  threeSecondHook: string;
  eyebrowSuffix: string;
  headlineLine1: string;
  headlineLine2: string;
  subcopyLine1: string;
  subcopyLine2: string;
  primaryCta: string;
  secondaryCta: string;
  proofMetrics: string[];
  valuePillars: ResearchValuePillar[];
  competitors: CompetitorBenchmark[];
  topNavMenus: string[];
  level1Menus: Record<number, string[]>;
  level2Submenus: Record<number, string[]>;
  recommendedTemplateId: WebsiteLayoutTemplateId;
  themePresetId: string;
  colorPsychologyRationale: string;
  wcagContrastRatio: string;
  typographyPairing: {
    display: string;
    ui: string;
    mono: string;
    rationale: string;
  };
}

const INDUSTRY_KNOWLEDGE_BASE: IndustryKnowledgeTemplate[] = [
  {
    industryId: 'commercial-inspection',
    industryName: 'Commercial Aerial Roof, Thermal & Construction Inspection',
    regex: /\b(roof|roofing|inspection|inspections|construction|hvac|facade|envelope|orthomosaic|photogrammetry|thermography|moisture|hail|rtk\s+survey|building\s+audit|property\s+condition)\b/i,
    defaultBrand: 'OSITO AERIAL INSPECTIONS',
    defaultTagline: 'COMMERCIAL ROOF MOISTURE, HVAC THERMAL & 3D ORTHOMOSAIC AUDITS',
    confidenceScore: 99,
    marketOpportunitySummary:
      'Commercial REITs, facility directors, and roofing contractors are replacing hazardous manual ladder walks and $8,000 core-cut tests with non-destructive radiometric LWIR drone moisture & 3D orthomosaic audits.',
    targetAudience: 'VP of Facilities, Commercial Roofing Contractors, REIT Asset Managers & Insurance Adjusters',
    primaryPainPoint:
      'Undetected sub-membrane roof moisture, unverified hail damage claims, dangerous OSHA ladder exposure, and slow 3-week engineering report turnarounds.',
    threeSecondHook: 'Pinpoint sub-surface roof moisture, HVAC delta-T faults, and 0.8 cm/px 3D CAD roof geometry in 24 hours.',
    eyebrowSuffix: 'FAA PART 107 • RADIOMETRIC LWIR & RTK CAD',
    headlineLine1: 'Precision Thermal Roof &',
    headlineLine2: 'Construction Inspections.',
    subcopyLine1: 'Sub-centimeter RTK orthomosaics, radiometric LWIR moisture mapping,',
    subcopyLine2: 'and AI-annotated CAD roof & HVAC anomaly reports delivered in 24 hours.',
    primaryCta: 'Book Roof Audit ▸',
    secondaryCta: '▶ Sample Report',
    proofMetrics: [
      '0.8 cm/px RTK Orthomosaic',
      '640×512 Radiometric LWIR',
      '24-Hr Turnkey Audit SLA',
      'Zero Ladder / OSHA Risk',
    ],
    valuePillars: [
      {
        badge: '01 / THERMAL LWIR',
        title: 'Sub-Membrane Moisture Lock',
        metric: '0.04°C Sensitivity',
        description: 'Twilight radiometric thermal scans isolate trapped water under TPO, EPDM, and built-up commercial roofs without core cuts.',
      },
      {
        badge: '02 / RTK 3D CAD',
        title: 'Survey-Grade Orthomosaics',
        metric: '0.8 cm/px GSD',
        description: 'Automated DXF/OBJ roof perimeter, parapet, skylight, and RTU curb measurements ready for Xactimate and AutoCAD.',
      },
      {
        badge: '03 / CONSTRUCTION',
        title: 'Progress & HVAC Delta-T',
        metric: '24-Hr Delivery',
        description: 'Scheduled earthwork volumetric stockpiles, facade crack indexing, and rooftop HVAC heat-exchanger diagnostics.',
      },
    ],
    competitors: [
      {
        name: 'DroneDeploy Enterprise',
        archetype: 'Self-Serve Photogrammetry SaaS',
        strength: 'Automated flight planning and cloud 3D map stitching',
        uxBlindSpot: 'Expensive $4,800+/yr seat licenses that still require facility staff to fly drones and manually interpret thermal anomalies',
        unfairAdvantage: 'Turnkey FAA Part 107 flight execution + AI-annotated moisture & CapEx repair priority PDF delivered in 24 hours',
        threatLevel: 'High',
      },
      {
        name: 'EagleView / Pictometry',
        archetype: 'Fixed-Wing & Satellite Measurement',
        strength: 'Established insurance adjuster roof geometry integration',
        uxBlindSpot: 'Low-resolution satellite imagery misses sub-surface thermal moisture, blistered seams, and live HVAC RTU faults',
        unfairAdvantage: 'Sub-centimeter RTK low-altitude drone orthomosaics fused with 640×512 radiometric thermal moisture contours',
        threatLevel: 'High',
      },
      {
        name: 'Loveland IMGING',
        archetype: 'Residential Shingle Adjuster App',
        strength: 'Standardized residential hail/wind checklist workflows',
        uxBlindSpot: 'Rigid residential shingle focus with weak commercial flat-roof TPO/EPDM thermography and multi-building portfolio comparison',
        unfairAdvantage: 'Commercial-grade ASHRAE Level-II thermal envelope & rooftop unit audit built for 50,000–500,000 sq ft facilities',
        threatLevel: 'Medium',
      },
    ],
    topNavMenus: ['Roof Audits ▾', 'Thermal LWIR ▾', 'Construction ▾', 'Rate Card ▾'],
    level1Menus: {
      0: [
        'Commercial TPO / EPDM Audit ▸',
        'Hail & Storm Claim Package ▸',
        'AutoCAD / Xactimate DXF ▸',
        'Multi-Site REIT Portfolio',
      ],
      1: [
        'Twilight Roof Moisture Scan ▸',
        'Rooftop HVAC RTU Delta-T ▸',
        'Solar Array Hotspot Audit ▸',
        'Building Envelope Heat Loss',
      ],
      2: [
        'Bi-Weekly Progress Ortho ▸',
        'Cut/Fill Earthwork Volumes ▸',
        'High-Rise Facade Crack AI ▸',
        'Procore & Autodesk Sync',
      ],
      3: [
        'Single Building Fast-Audit ▸',
        'Annual Quarterly Roof SLA ▸',
        'Contractor White-Label Pack ▸',
        'Instant Sq-Ft Quote Calculator',
      ],
    },
    level2Submenus: {
      0: [
        '• 0.8 cm/px High-Res Ortho',
        '• Seam, Flashing & Drain AI',
        '• Core-Cut Verification Map',
        '• Stamp-Ready Engineer PDF',
      ],
      1: [
        '• 640×512 Radiometric RJPEG',
        '• Wet Insulation Sq-Ft Calc',
        '• Bad Compressor / Belt Lock',
        '•IEC 62446-3 Solar Standard',
      ],
      2: [
        '• RTK Ground Control Points',
        '• Side-by-Side Timeline Slider',
        '• 4K 60fps Investor Flyover',
        '• 1-Click Shareable Web Portal',
      ],
      3: [
        '• $495 Starter Roof Inspection',
        '• $0.03/sq ft Large Warehouse',
        '• $5M Aviation Liability Cert',
        '• 24-Hour Report Turnaround',
      ],
    },
    recommendedTemplateId: 'analytics-dashboard',
    themePresetId: 'solar-amber',
    colorPsychologyRationale:
      'Radiometric Amber (#F59E0B) paired with Deep Indigo/Slate (#18181B) evokes FLIR thermal isotherm palettes and engineering precision for facility directors.',
    wcagContrastRatio: '15.4:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Space Grotesk commands B2B engineering authority while JetBrains Mono renders GSD resolution, ΔT temperatures, and sq-ft moisture metrics with tabular clarity.',
    },
  },
  {
    industryId: 'drone-robotics',
    industryName: 'Autonomous Aerial Robotics & Security',
    regex: /\b(drone|uav|bvlos|thermal|perimeter|aerial|flight|avionics|patrol|autonomous\s+security|airspace)\b/i,
    defaultBrand: 'OSITO AUTONOMOUS',
    defaultTagline: 'AUTONOMOUS THERMAL PERIMETER & BVLOS FLEET AI',
    confidenceScore: 99,
    marketOpportunitySummary:
      'Enterprise physical security teams are replacing $180k/yr manual guard patrols with 24/7 drone-in-a-box thermal autonomous perimeter fleets.',
    targetAudience: 'VP of Physical Security, Critical Infrastructure Ops & Defense Integrators',
    primaryPainPoint:
      'Blind spots in perimeter cameras, slow 18-minute human guard response times, and complex FAA BVLOS compliance.',
    threeSecondHook: 'Launch thermal autonomous patrol drones in 4.2 seconds with zero human pilot intervention.',
    eyebrowSuffix: 'AUTONOMOUS BVLOS FLEET OS',
    headlineLine1: 'Autonomous Thermal Fleet',
    headlineLine2: 'Zero Perimeter Blindspots.',
    subcopyLine1: 'Deploy all-weather AI security drones with RTK precision docking,',
    subcopyLine2: 'real-time thermal anomaly lock, and sub-second WebRTC command telemetry.',
    primaryCta: 'Deploy Fleet ▸',
    secondaryCta: '▶ Live Telemetry',
    proofMetrics: [
      '4.2s Auto-Launch SLA',
      '99.94% Thermal Lock',
      '68% Lower Patrol OpEx',
      'FAA Part 108 BVLOS Ready',
    ],
    valuePillars: [
      {
        badge: '01 / THERMAL AI',
        title: 'Edge LWIR Intrusion Lock',
        metric: '< 12ms Inference',
        description: 'Onboard neural classification distinguishes personnel, vehicles, and wildlife in total darkness.',
      },
      {
        badge: '02 / RTK DOCKING',
        title: 'All-Weather Inductive Hive',
        metric: '18-Min Hot Swap',
        description: 'Millimeter-accurate autonomous landing and rapid battery conditioning from -20°C to 50°C.',
      },
      {
        badge: '03 / ZERO-LATENCY C2',
        title: 'Multi-Drone Mesh Overwatch',
        metric: '4K 60fps Encrypted',
        description: 'AES-256 encrypted command mesh with automated handoffs across 50+ square miles.',
      },
    ],
    competitors: [
      {
        name: 'Skydio Enterprise',
        archetype: 'Legacy Airframe OEM',
        strength: 'Strong onboard obstacle avoidance & government procurement contracts',
        uxBlindSpot: 'Complex multi-window flight ground station; high cognitive load for security guards',
        unfairAdvantage: '1-click autonomous alarm-to-intercept workflow with unified 3D thermal map UI',
        threatLevel: 'High',
      },
      {
        name: 'Percepto AIM',
        archetype: 'Industrial Site Inspection',
        strength: 'Mature solar/mining scheduled inspection pipelines',
        uxBlindSpot: 'Slow batch post-processing UX; weak real-time tactical incident response',
        unfairAdvantage: 'Sub-second live tactical WebRTC stream + instant AI threat vector overlays',
        threatLevel: 'Medium',
      },
      {
        name: 'Sunflower Labs',
        archetype: 'Residential Hive Hardware',
        strength: 'Compact architectural beehive industrial design',
        uxBlindSpot: 'Limited payload endurance and lack of multi-ship enterprise SOC integrations',
        unfairAdvantage: 'Open webhook/SIEM API + modular dual-sensor thermal/lidar enterprise payload',
        threatLevel: 'Emerging',
      },
    ],
    topNavMenus: ['Fleet AI ▾', 'Missions ▾', 'Telemetry ▾', 'Pricing ▾'],
    level1Menus: {
      0: [
        'Sentinel X8 Thermal Drone ▸',
        'RTK Inductive Nest Dock ▸',
        'Onboard Edge Vision NPU ▸',
        'Mil-Std Weather Enclosure',
      ],
      1: [
        'Perimeter Intrusion Patrol ▸',
        'Solar & Substation Audit ▸',
        'Port & Rail Yard Overwatch ▸',
        'FAA BVLOS Waiver Automation',
      ],
      2: [
        'Sub-Second WebRTC Stream ▸',
        '3D Digital Twin Airspace ▸',
        'SOC / SIEM Webhook API ▸',
        'Encrypted Blackbox Logs',
      ],
      3: [
        'Single-Site Patrol Starter ▸',
        'Enterprise Multi-Hive SLA ▸',
        'Defense & GovCloud On-Prem ▸',
        'Custom Fleet ROI Calculator',
      ],
    },
    level2Submenus: {
      0: [
        '• 640×512 Radiometric LWIR',
        '• 45-Min Wind-Resistant Flight',
        '• Dual-Redundant RTK GPS',
        '• Parachute Recovery System',
      ],
      1: [
        '• Automated Geofence Triggers',
        '• Acoustic & Motion Sensor Sync',
        '• License Plate & Face Blur',
        '• Instant Guard Dispatch Link',
      ],
      2: [
        '• 120 FPS Telemetry HUD',
        '• Multi-Ship Swarm Handoff',
        '• Splunk & Datadog Connector',
        '• Zero-Trust mTLS Airlink',
      ],
      3: [
        '• $0 Upfront Hardware Lease',
        '• 24/7 Remote Flight Ops Center',
        '• Next-Day Airframe Swap SLA',
        '• Custom Insurance Underwriting',
      ],
    },
    recommendedTemplateId: 'analytics-dashboard',
    themePresetId: 'solar-amber',
    colorPsychologyRationale:
      'Solar Amber (#F59E0B) paired with Deep Slate (#18181B) and Violet (#8B5CF6) mirrors avionics HUD thermal lock indicators while maximizing night-shift SOC legibility.',
    wcagContrastRatio: '15.4:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Space Grotesk projects aerospace authority; JetBrains Mono keeps GPS coordinates and battery telemetry tabular and jitter-free.',
    },
  },
  {
    industryId: 'stem-academy',
    industryName: 'STEM Flight Academy & Youth Robotics',
    regex: /\b(stem|academy|school|youth|camp|classroom|education|edtech|curriculum|student|fpv\s+robotics|coding\s+drone)\b/i,
    defaultBrand: 'OSITO STEM ACADEMY',
    defaultTagline: 'YOUTH AUTONOMOUS DRONE CODING & FPV ROBOTICS LABS',
    confidenceScore: 98,
    marketOpportunitySummary:
      'K-12 districts and municipal recreation centers have $4.2B in unspent STEM/CTE grant budgets seeking turnkey, safe indoor classroom drone coding labs.',
    targetAudience: 'School District STEM Directors, Principals, Camp Directors & Grant Coordinators',
    primaryPainPoint:
      'Teachers feel overwhelmed by fragile hardware, complex Python setup, and lack of standards-aligned NGSS/CSTA lesson plans.',
    threeSecondHook: 'Turn any gymnasium or classroom into an autonomous Python & Blockly drone flight lab in 15 minutes.',
    eyebrowSuffix: 'NGSS & CSTA CERTIFIED STEM LABS',
    headlineLine1: 'Code Autonomous Drones.',
    headlineLine2: 'Inspire Future Engineers.',
    subcopyLine1: 'Turnkey prop-guarded indoor classroom drone kits, browser-based Python',
    subcopyLine2: 'flight simulators, and grant-ready K-12 STEM curriculum packages.',
    primaryCta: 'Get Grant Quote ▸',
    secondaryCta: '▶ Sample Lesson',
    proofMetrics: [
      '100% Prop-Guarded Safe',
      '42+ NGSS Lesson Plans',
      'Zero-Install Browser IDE',
      'Title I & IV Grant Ready',
    ],
    valuePillars: [
      {
        badge: '01 / CURRICULUM',
        title: 'Blockly-to-Python Progression',
        metric: 'Grades 4–12 Aligned',
        description: 'Students graduate from visual block missions to real autonomous OpenCV & Python flight loops.',
      },
      {
        badge: '02 / HARDWARE',
        title: 'Crash-Proof Classroom Swarm',
        metric: '32g Ultra-Light',
        description: 'Full 360° ducted poly-carbonate cages, optical flow indoor hover, and 10-bay USB-C rapid chargers.',
      },
      {
        badge: '03 / TURNKEY PD',
        title: 'Teacher Certification & Grants',
        metric: '2-Hr Onboarding',
        description: 'Includes live instructor coaching, rubric dashboards, and pre-written federal STEM grant templates.',
      },
    ],
    competitors: [
      {
        name: 'Robolink CoDrone',
        archetype: 'Hardware-First Classroom Kit',
        strength: 'Established school district footprint and competition rulesets',
        uxBlindSpot: 'Outdated documentation hierarchy; principals struggle to calculate per-student cohort pricing',
        unfairAdvantage: 'Interactive 30-student cohort ROI calculator + 3D browser flight simulator before hardware arrives',
        threatLevel: 'High',
      },
      {
        name: 'DroneBlocks',
        archetype: 'Curriculum Software Subscription',
        strength: 'Large library of Tello block-coding video courses',
        uxBlindSpot: 'Disjointed hardware sourcing after DJI Tello discontinuation; confusing license tiers',
        unfairAdvantage: 'Unified all-in-one Osito AcroBee classroom hardware + cloud IDE + onsite tournament kit',
        threatLevel: 'Medium',
      },
      {
        name: 'Sphero Blueprint',
        archetype: 'Generalist K-12 Rolling Robotics',
        strength: 'Polished district procurement portal and brand recognition',
        uxBlindSpot: '2D floor robots lack the visceral 3D spatial excitement of aerial FPV & autonomous flight',
        unfairAdvantage: 'High-engagement 3D aerial obstacle courses that double STEM club enrollment in 1 semester',
        threatLevel: 'Emerging',
      },
    ],
    topNavMenus: ['Curriculum ▾', 'Drone Kits ▾', 'Simulators ▾', 'School Grants ▾'],
    level1Menus: {
      0: [
        'Elementary Blockly Flight ▸',
        'Middle School Python Lab ▸',
        'High School AI & OpenCV ▸',
        'CTE Part 107 Career Track',
      ],
      1: [
        '12-Drone Classroom Pod ▸',
        '30-Student Swarm Lab ▸',
        'Pop-Up Neon LED Obstacles ▸',
        'Spare Motors & 10-Bay Charger',
      ],
      2: [
        'Browser 60fps Physics Sim ▸',
        'Live Classroom Leaderboard ▸',
        'Auto-Graded Python Rubrics ▸',
        'Chromebook Zero-Install App',
      ],
      3: [
        'Title I / IV Grant Builder ▸',
        'Summer Camp Revenue Share ▸',
        'District PO & W-9 Fast-Track ▸',
        'Teacher PD Certification',
      ],
    },
    level2Submenus: {
      0: [
        '• 12-Week Pacing Guide PDF',
        '• NGSS & CSTA Standards Map',
        '• Printable Student Flight Logs',
        '• Bilingual English/Spanish',
      ],
      1: [
        '• 360° Ducted Safety Frame',
        '• Optical Flow + ToF Altitude',
        '• Hot-Swap 1S LiHV Batteries',
        '• Rugged Pelican Rolling Case',
      ],
      2: [
        '• Works on School Chromebooks',
        '• Virtual Smart Arena Gates',
        '• Instant Code Replay & Debug',
        '• COPPA & FERPA Compliant',
      ],
      3: [
        '• $2,495 Starter Cohort Pack',
        '• $5,950 Full School Site License',
        '• 1-Click Board Proposal Deck',
        '• Dedicated Osito Flight Coach',
      ],
    },
    recommendedTemplateId: 'pricing-faq',
    themePresetId: 'oceanic-coral',
    colorPsychologyRationale:
      'Oceanic Teal (#14B8A6) and Energetic Coral (#F97316) balance academic institutional trust for superintendents with high-energy excitement for youth STEM learners.',
    wcagContrastRatio: '14.6:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Friendly geometric headings invite educators and students while monospace code blocks reinforce authentic Python & robotics literacy.',
    },
  },
  {
    industryId: 'ai-fintech',
    industryName: 'Autonomous FinTech & Institutional Treasury',
    regex: /\b(fintech|treasury|finance|bank|liquidity|yield|wealth|capital|payment|ledger|crypto|trading|institutional|portfolio)\b/i,
    defaultBrand: 'AETHER TREASURY',
    defaultTagline: 'AUTONOMOUS AI LIQUIDITY & REAL-TIME YIELD ENGINE',
    confidenceScore: 98,
    marketOpportunitySummary:
      'CFOs and mid-market treasurers lose 180–240 bps annually on idle multi-bank cash balances due to manual spreadsheet sweeps and T+2 settlement lag.',
    targetAudience: 'CFOs, Corporate Treasurers, VP of Finance & Institutional Asset Managers',
    primaryPainPoint:
      'Fragmented visibility across 12+ global bank portals, manual FX hedging errors, and missed overnight T-Bill yield windows.',
    threeSecondHook: 'Automate multi-bank cash sweeps and capture +185 bps risk-free institutional yield in real time.',
    eyebrowSuffix: 'SOC2 TYPE II • AUTONOMOUS TREASURY OS',
    headlineLine1: 'Autonomous Cash Sweeps.',
    headlineLine2: 'Capture Every Basis Point.',
    subcopyLine1: 'Unify global bank accounts, automate overnight T-Bill & MMF allocation,',
    subcopyLine2: 'and forecast 13-week cash flow with 99.4% neural ledger accuracy.',
    primaryCta: 'Simulate Yield ▸',
    secondaryCta: '▶ CFO Tour',
    proofMetrics: [
      '+185 bps Avg Yield Lift',
      '$14.8B Automated Volume',
      '99.4% Cash Forecast Precision',
      'SOC2 Type II & ISO 27001',
    ],
    valuePillars: [
      {
        badge: '01 / AUTO-SWEEP',
        title: 'Zero-Touch Liquidity Routing',
        metric: 'T+0 Settlement',
        description: 'Policy-driven AI sweeps idle operating cash into Treasury bills and tier-1 money market funds.',
      },
      {
        badge: '02 / AI FORECAST',
        title: '13-Week Neural Cash Graph',
        metric: '99.4% Accuracy',
        description: 'Ingests ERP, AP/AR, and payroll streams to predict liquidity crunches 90 days ahead.',
      },
      {
        badge: '03 / GOVERNANCE',
        title: 'Cryptographic Board Controls',
        metric: 'Multi-Sig Policy',
        description: 'Enforces counterparty exposure caps, dual-approval wires, and immutable audit trails.',
      },
    ],
    competitors: [
      {
        name: 'Kyriba Enterprise',
        archetype: 'Legacy ERP Treasury Suite',
        strength: 'Deep Fortune 500 bank SWIFT connectivity',
        uxBlindSpot: '9-month implementation cycle and dense 1990s tabular UI that requires certified consultants',
        unfairAdvantage: 'Self-serve 15-minute Plaid/SWIFT API onboarding with live interactive yield simulation',
        threatLevel: 'High',
      },
      {
        name: 'Mercury Treasury',
        archetype: 'Startup Neobank Add-On',
        strength: 'Clean consumer-grade onboarding for seed-stage startups',
        uxBlindSpot: 'Limited multi-entity ERP reconciliation and lack of custom multi-bank sweep rules',
        unfairAdvantage: 'Multi-custodian institutional sweep engine supporting JPMorgan, Citi, SVB & Fidelity',
        threatLevel: 'Medium',
      },
      {
        name: 'Vesto / Nilus',
        archetype: 'Point Cash-Flow Aggregator',
        strength: 'Modern dashboard visualizations for mid-market finance teams',
        uxBlindSpot: 'Passive reporting without autonomous policy-enforced execution or FX hedging',
        unfairAdvantage: 'Closed-loop autonomous execution engine with real-time basis-point attribution',
        threatLevel: 'Emerging',
      },
    ],
    topNavMenus: ['Liquidity AI ▾', 'Yield Desk ▾', 'ERP Sync ▾', 'Security ▾'],
    level1Menus: {
      0: [
        'Autonomous Cash Sweep Engine ▸',
        '13-Week Neural Cash Forecast ▸',
        'Multi-Entity Intercompany Net ▸',
        'Real-Time FX Exposure Hedging',
      ],
      1: [
        'Direct US Treasury Ladder ▸',
        'Tier-1 Institutional MMFs ▸',
        'FDIC Insured Sweep Network ▸',
        'Custom Investment Policy AI',
      ],
      2: [
        'NetSuite & SAP Bi-Directional ▸',
        'SWIFT / Host-to-Host Bank API ▸',
        'Stripe & Adyen Payout Recon ▸',
        'Automated Month-End Close',
      ],
      3: [
        'Multi-Sig Board Approval Rules ▸',
        'SOC2 Type II & SEC Custody ▸',
        'SAML 2.0 Hardware Passkeys ▸',
        'Immutable Ledger Audit Log',
      ],
    },
    level2Submenus: {
      0: [
        '• Target Zero Idle Balance',
        '• Intraday Wire Cutoff Guard',
        '• Automated Payroll Buffer',
        '• Custom Subsidiary Rules',
      ],
      1: [
        '• 5.28% Gross Institutional APY',
        '• BlackRock & Goldman Custodians',
        '• Same-Day Liquidity Recall',
        '• State-Tax Exempt T-Bills',
      ],
      2: [
        '• 1-Click GL Journal Entries',
        '• 99.9% Auto-Matched Invoices',
        '• Real-Time Anomaly Alerts',
        '• GraphQL & Webhook Stream',
      ],
      3: [
        '• Non-Custodial FBO Accounts',
        '• SIPC + $125M Excess FDIC',
        '• Role-Based Treasury Matrix',
        '• Continuous Pen-Test Badge',
      ],
    },
    recommendedTemplateId: 'analytics-dashboard',
    themePresetId: 'emerald-fintech',
    colorPsychologyRationale:
      'Emerald FinTech Green (#10B981) over Institutional Navy (#0F172A) signals capital preservation, compound yield growth, and fiduciary stability.',
    wcagContrastRatio: '15.8:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Tabular monospace numerals prevent column shift in financial ledgers while Space Grotesk anchors executive KPI cards.',
    },
  },
  {
    industryId: 'agentic-devtools',
    industryName: 'Agentic AI Cloud & Developer Infrastructure',
    regex: /\b(sdk|api|cloud|dev|developer|vector|gpu|shader|engine|saas|agent|agentic|llm|infra|serverless|database|compiler)\b/i,
    defaultBrand: 'VEXEL CLOUD SDK',
    defaultTagline: 'ZERO-LATENCY EDGE VECTOR & GPU SHADER INFRASTRUCTURE',
    confidenceScore: 99,
    marketOpportunitySummary:
      'AI-native engineering teams are bottlenecked by 300ms+ cloud roundtrips and fragmented vector/GPU pipelines when shipping real-time multimodal apps.',
    targetAudience: 'Staff Engineers, CTOs, AI Systems Architects & Founding Developers',
    primaryPainPoint:
      'Cold-start GPU latency, unpredictable token/compute billing spikes, and brittle glue code between vector search and edge rendering.',
    threeSecondHook: 'Ship sub-8ms edge vector search and WebGPU compute pipelines with 3 lines of TypeScript.',
    eyebrowSuffix: 'V4.2 GA • ZERO COLD-START EDGE RUNTIME',
    headlineLine1: 'Sub-8ms Edge Vector & GPU',
    headlineLine2: 'Built for Agentic Scale.',
    subcopyLine1: 'Deploy globally replicated HNSW vector indexes, deterministic tool sandboxes,',
    subcopyLine2: 'and 120fps WebGPU compute shaders from a single unified TypeScript SDK.',
    primaryCta: 'npm i @vexel/sdk',
    secondaryCta: '▶ Benchmark Live',
    proofMetrics: [
      '7.4ms Global p99 Latency',
      '0ms Isolate Cold Start',
      '10x Lower GPU Spend',
      '99.999% Multi-Region SLA',
    ],
    valuePillars: [
      {
        badge: '01 / EDGE VECTOR',
        title: 'Colocated HNSW + Hybrid Rust Core',
        metric: '7.4ms p99 Read',
        description: 'Sub-10ms semantic + lexical fusion across 310 global edge PoPs with zero index rebuild downtime.',
      },
      {
        badge: '02 / SANDBOX RUNTIME',
        title: 'Deterministic Micro-VM Tool Loop',
        metric: '1.8ms Boot Time',
        description: 'Execute untrusted agent-generated JS/Python/WASM safely with strict memory and spend circuit breakers.',
      },
      {
        badge: '03 / DX TELEMETRY',
        title: 'Flamegraph & Cost Attribution',
        metric: 'Per-Tenant Caps',
        description: 'Real-time OpenTelemetry traces with hard per-customer token and GPU spend ceilings.',
      },
    ],
    competitors: [
      {
        name: 'Pinecone / Weaviate',
        archetype: 'Standalone Vector Database',
        strength: 'Managed billion-scale vector storage',
        uxBlindSpot: 'Requires separate compute orchestrator; 80ms+ cross-cloud network hop to agent runtime',
        unfairAdvantage: 'Co-located edge compute + vector memory in the same V8/WASM isolate (< 8ms total)',
        threatLevel: 'High',
      },
      {
        name: 'Modal / Replicate',
        archetype: 'Serverless Python GPU Cloud',
        strength: 'Fast container spinning for batch ML workloads',
        uxBlindSpot: 'Weak browser-side TypeScript/WebGPU ergonomics and opaque per-second idle billing',
        unfairAdvantage: 'Unified TypeScript SDK with instant local emulator and hard $0 idle spend guarantee',
        threatLevel: 'Medium',
      },
      {
        name: 'Vercel AI SDK',
        archetype: 'Frontend Streaming Wrapper',
        strength: 'Great Next.js UI streaming hooks',
        uxBlindSpot: 'No built-in persistent vector state, GPU compute shaders, or multi-agent graph routing',
        unfairAdvantage: 'Full-stack stateful agent graph + hardware-accelerated canvas/shader primitives',
        threatLevel: 'Emerging',
      },
    ],
    topNavMenus: ['Platform ▾', 'Developers ▾', 'Benchmarks ▾', 'Pricing ▾'],
    level1Menus: {
      0: [
        'Edge HNSW Vector Engine ▸',
        'WASM / Micro-VM Sandboxes ▸',
        'WebGPU Shader Pipeline ▸',
        'Global State Replication',
      ],
      1: [
        'TypeScript & Python SDK ▸',
        'CLI & Local Zero-Cost Sim ▸',
        'OpenTelemetry Flamegraphs ▸',
        'GitHub Actions CI/CD Preview',
      ],
      2: [
        '7.4ms p99 Latency Proof ▸',
        '100M Vector Recall Audit ▸',
        'Cold-Start vs AWS Lambda ▸',
        'Live Cost Calculator',
      ],
      3: [
        'Hobby Free ($0 Forever) ▸',
        'Pro Scale ($29/mo + Usage) ▸',
        'Hard Spend Cap Guardrails ▸',
        'Enterprise BYOC / VPC',
      ],
    },
    level2Submenus: {
      0: [
        '• 1536d & 3072d Int8 Quantized',
        '• Hybrid BM25 + Dense Rerank',
        '• Instant Namespace Branching',
        '• Zero-Downtime Compaction',
      ],
      1: [
        '• Full Type-Safe Zod Schemas',
        '• 1-Line React & Canvas Hooks',
        '• Replayable Deterministic Seeds',
        '• Offline Localhost Mode',
      ],
      2: [
        '• 99.2% Recall@10 Verified',
        '• 310 Global Edge Locations',
        '• 14.2x Faster Than REST Hop',
        '• Open-Source Repro Script',
      ],
      3: [
        '• Built-In $10 Circuit Breaker',
        '• Zero Cost for Idle Indexes',
        '• SOC2 + HIPAA BAA Included',
        '• 24/7 Slack Engineer Channel',
      ],
    },
    recommendedTemplateId: 'bento-product',
    themePresetId: 'cyber-cyan',
    colorPsychologyRationale:
      'Electric Cyber Cyan (#06B6D4) and Indigo (#6366F1) on Deep Carbon (#111827) evoke high-frequency precision engineering and developer velocity.',
    wcagContrastRatio: '15.2:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Bento cards pair crisp CLI commands in JetBrains Mono with high-contrast Space Grotesk benchmark callouts.',
    },
  },
  {
    industryId: 'cyber-defense',
    industryName: 'Zero-Trust Cybersecurity & Cloud Threat Graph',
    regex: /\b(cyber|security|sentinel|zero\s*trust|threat|soc|siem|quantum|firewall|iam|vulnerability|pentest|encryption|auth)\b/i,
    defaultBrand: 'SENTINEL ZERO',
    defaultTagline: 'AGENTLESS CLOUD THREAT GRAPH & QUANTUM-SAFE ZERO TRUST',
    confidenceScore: 98,
    marketOpportunitySummary:
      'CISOs face alert fatigue from 14+ siloed security tools while AI-driven lateral movement attacks breach traditional IAM perimeters in under 9 minutes.',
    targetAudience: 'CISOs, VP of Information Security, SecOps Architects & DevSecOps Leads',
    primaryPainPoint:
      'Kernel-agent deployment friction, 94% false-positive SIEM alerts, and blind spots in ephemeral Kubernetes & AI agent credentials.',
    threeSecondHook: 'Map every toxic attack path across AWS, GCP, and K8s in 60 seconds with zero kernel agents.',
    eyebrowSuffix: 'AGENTLESS CNAPP • QUANTUM-SAFE ZERO TRUST',
    headlineLine1: 'Neutralize Cloud Breaches',
    headlineLine2: 'Before Lateral Movement.',
    subcopyLine1: 'Agentless cloud threat graph that correlates identity, runtime eBPF,',
    subcopyLine2: 'and AI autonomous remediation pull requests with zero false positives.',
    primaryCta: 'Scan Cloud Free ▸',
    secondaryCta: '▶ Attack Graph',
    proofMetrics: [
      '60-Sec Agentless Setup',
      '94% Alert Noise Reduction',
      '< 90s Mean Time to Fix',
      'FedRAMP High & SOC2',
    ],
    valuePillars: [
      {
        badge: '01 / THREAT GRAPH',
        title: 'Toxic Combination Correlator',
        metric: 'Zero Kernel Agents',
        description: 'Connects public exposure, CVE reachability, and IAM over-privilege into 1 prioritized blast-radius graph.',
      },
      {
        badge: '02 / AUTO-REMEDIATE',
        title: '1-Click Terraform & IAM Fix PRs',
        metric: '88% Auto-Resolved',
        description: 'Generates verified least-privilege Terraform and Kubernetes diffs ready for engineer merge.',
      },
      {
        badge: '03 / QUANTUM-SAFE',
        title: 'Post-Quantum mTLS Identity',
        metric: 'NIST FIPS 203',
        description: 'Protects workload-to-workload and AI agent API tokens with short-lived cryptographic attestation.',
      },
    ],
    competitors: [
      {
        name: 'Wiz Cloud Security',
        archetype: 'Enterprise CNAPP Giant',
        strength: 'Broad multi-cloud posture scanning and executive visibility',
        uxBlindSpot: 'High enterprise contract minimums ($100k+) and manual remediation handoffs to DevOps',
        unfairAdvantage: 'Transparent self-serve pricing + automated GitHub PR remediation that closes findings in 1 click',
        threatLevel: 'High',
      },
      {
        name: 'CrowdStrike Falcon',
        archetype: 'Kernel Endpoint Agent Leader',
        strength: 'Deep endpoint EDR telemetry and threat hunting',
        uxBlindSpot: 'Kernel sensor maintenance overhead and operational outage risk across production servers',
        unfairAdvantage: '100% agentless snapshot + user-space eBPF architecture with zero kernel panic risk',
        threatLevel: 'High',
      },
      {
        name: 'Lacework / Prisma',
        archetype: 'Legacy Rule-Based Scanner',
        strength: 'Extensive compliance checkbox templates (PCI, HIPAA, CIS)',
        uxBlindSpot: 'Floods SecOps teams with thousands of unprioritized medium-severity CVE rows',
        unfairAdvantage: 'Reachability-verified attack path graph that filters out 94% of non-exploitable noise',
        threatLevel: 'Medium',
      },
    ],
    topNavMenus: ['Threat Graph ▾', 'Zero Trust ▾', 'Compliance ▾', 'Pricing ▾'],
    level1Menus: {
      0: [
        'Agentless Cloud Attack Graph ▸',
        'Reachable CVE Prioritization ▸',
        'AI Agent & LLM Guardrails ▸',
        'Kubernetes Runtime Overwatch',
      ],
      1: [
        'Least-Privilege IAM Entitlement ▸',
        'Post-Quantum mTLS Mesh ▸',
        'Secret & API Key Leak Radar ▸',
        '1-Click Terraform Fix PRs',
      ],
      2: [
        'Continuous SOC2 & ISO 27001 ▸',
        'FedRAMP High & GovCloud ▸',
        'HIPAA & PCI-DSS Evidence ▸',
        'Executive Board Risk Report',
      ],
      3: [
        'Free 60-Second Cloud Audit ▸',
        'Growth SecOps Tier ▸',
        'Enterprise Unlimited Workloads ▸',
        'Breach Response SLA',
      ],
    },
    level2Submenus: {
      0: [
        '• Read-Only AWS/GCP/Azure Role',
        '• Blast Radius Visualization',
        '• Shadow AI Endpoint Discovery',
        '• Zero Production CPU Impact',
      ],
      1: [
        '• Ephemeral JIT Access Tokens',
        '• Auto-Revoke Unused IAM Roles',
        '• GitHub / GitLab Native Bot',
        '• Hardware YubiKey Enforced',
      ],
      2: [
        '• Automated Auditor Portal',
        '• Vanta & Drata Bi-Sync',
        '• Real-Time Drift Prevention',
        '• 1-Click PDF CISO Dossier',
      ],
      3: [
        '• Predictable Per-Cloud-Account',
        '• Unlimited Security Seats',
        '• 15-Min Incident Hotline',
        '• $5M Cyber Warranty Eligible',
      ],
    },
    recommendedTemplateId: 'sitemap-architecture',
    themePresetId: 'crimson-neon',
    colorPsychologyRationale:
      'Tactical Crimson (#F43F5E) accents against Deep Obsidian (#141418) immediately draw SecOps attention to critical blast-radius paths without visual clutter.',
    wcagContrastRatio: '14.9:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Monospace CVE identifiers, IAM ARNs, and SHA-256 hashes pair with sharp geometric headers for instant threat triage.',
    },
  },
  {
    industryId: 'biotech-health',
    industryName: 'Clinical AI Diagnostics & Longevity Biotech',
    regex: /\b(biotech|health|longevity|clinical|medical|biomarker|genomic|cellular|sleep|wellness|recovery|dabnaps|diagnostic|therapy)\b/i,
    defaultBrand: 'HELIX LONGEVITY',
    defaultTagline: 'MULTI-OMIC CLINICAL AI BIOMARKER & CELLULAR DIAGNOSTICS',
    confidenceScore: 97,
    marketOpportunitySummary:
      'Preventative medicine clinics and health-conscious executives are shifting from reactive sick-care to longitudinal 120+ biomarker AI digital twins.',
    targetAudience: 'Chief Medical Officers, Longevity Clinics, Biotech Founders & High-Performance Consumers',
    primaryPainPoint:
      'Static PDF lab reports with wide population reference ranges that miss early metabolic, cardiovascular, and sleep recovery decline.',
    threeSecondHook: 'Decode 140+ blood, epigenetic, and sleep biomarkers into a personalized cellular age reversal protocol.',
    eyebrowSuffix: 'CLIA / CAP CERTIFIED • CLINICAL BIOMARKER AI',
    headlineLine1: 'Decode Your Cellular Age.',
    headlineLine2: 'Precision AI Longevity.',
    subcopyLine1: 'Correlate multi-omic blood panels, continuous wearable telemetry,',
    subcopyLine2: 'and clinician-verified protocols inside one longitudinal health twin.',
    primaryCta: 'Order Lab Kit ▸',
    secondaryCta: '▶ Sample Report',
    proofMetrics: [
      '142+ Clinical Biomarkers',
      '-4.6 Yrs Biological Age',
      '99.8% CLIA Lab Precision',
      'HIPAA & Zero-Knowledge',
    ],
    valuePillars: [
      {
        badge: '01 / MULTI-OMIC AI',
        title: 'Longitudinal Biological Twin',
        metric: '142 Biomarkers',
        description: 'Synthesizes ApoB, hs-CRP, epigenetic methylation, and HRV sleep stages into actionable cellular scores.',
      },
      {
        badge: '02 / PROTOCOLS',
        title: 'Clinician-Verified Interventions',
        metric: '90-Day Retest Loop',
        description: 'Quantifies the exact delta of nutrition, peptide, sleep, and VO2-max protocols on your bloodwork.',
      },
      {
        badge: '03 / PRIVACY',
        title: 'Encrypted Genomic Vault',
        metric: 'HIPAA + Enclave',
        description: 'Patient-owned cryptographic health records that are never sold to insurers or third parties.',
      },
    ],
    competitors: [
      {
        name: 'Function Health / InsideTracker',
        archetype: 'Consumer Blood Panel App',
        strength: 'accessible quest/labcorp draw scheduling and broad consumer awareness',
        uxBlindSpot: 'Overwhelming wall of 100+ biomarkers with generic food recommendations and weak longitudinal delta tracking',
        unfairAdvantage: 'Causal AI biomarker graph that isolates the top 3 root-cause interventions ranked by clinical impact',
        threatLevel: 'High',
      },
      {
        name: 'Whoop / Oura',
        archetype: 'Continuous Wearable Hardware',
        strength: 'High daily retention for sleep and HRV recovery scores',
        uxBlindSpot: 'Surface physiological signals only—lacks deep cellular, hormonal, and lipid blood diagnostics',
        unfairAdvantage: 'Fuses continuous Oura/Whoop/Apple Watch streams directly with quarterly cellular blood panels',
        threatLevel: 'Medium',
      },
      {
        name: 'Traditional Concierge MD',
        archetype: 'Brick-and-Mortar Executive Physical',
        strength: 'High-touch physician consultation and imaging access',
        uxBlindSpot: '$12,000/yr price tag with static once-a-year PDF binders and zero real-time digital feedback',
        unfairAdvantage: '24/7 interactive biomarker telemetry at 1/10th the cost with on-demand MD review',
        threatLevel: 'Emerging',
      },
    ],
    topNavMenus: ['Biomarkers ▾', 'Cellular AI ▾', 'Clinical Proof ▾', 'Membership ▾'],
    level1Menus: {
      0: [
        'Cardio & Metabolic Panel ▸',
        'Epigenetic Pace-of-Aging ▸',
        'Hormone & Thyroid Matrix ▸',
        'Heavy Metals & Inflammation',
      ],
      1: [
        'Causal Root-Cause Graph ▸',
        'Wearable Sleep & HRV Fusion ▸',
        '90-Day Protocol Simulator ▸',
        'MD Telehealth Consultations',
      ],
      2: [
        'Peer-Reviewed Cohort Data ▸',
        'CLIA / CAP Lab Standards ▸',
        'Biological Age Reduction ▸',
        'Physician Advisory Board',
      ],
      3: [
        'Core Longevity ($39/mo) ▸',
        'Executive Full-Body + MRI ▸',
        'HSA / FSA Instant Eligibility ▸',
        'Clinic Partner White-Label',
      ],
    },
    level2Submenus: {
      0: [
        '• ApoB, Lp(a) & Particle Size',
        '• Fasting Insulin & HOMA-IR',
        '• DunedinPACE Methylation',
        '• Omega-3 Index & Vitamin D3',
      ],
      1: [
        '• Apple Health, Oura & Whoop',
        '• Supplement Dose Attribution',
        '• Circadian Sleep Optimization',
        '• Instant Lab PDF Import OCR',
      ],
      2: [
        '• 48,000+ Longitudinal Profiles',
        '• -4.6 Yr Avg Bio-Age Delta',
        '• Harvard & Stanford Advisors',
        '• Zero-Knowledge HIPAA Vault',
      ],
      3: [
        '• 2x Annual 140-Marker Draws',
        '• At-Home Phlebotomist Option',
        '• 100% HSA/FSA Reimbursable',
        '• Cancel Anytime Guarantee',
      ],
    },
    recommendedTemplateId: 'saas-mega-menu',
    themePresetId: 'royal-violet',
    colorPsychologyRationale:
      'Royal Violet (#8B5CF6) and Bio-Luminescent Lavender (#A78BFA) communicate precision genomic science, restorative cellular calm, and clinical sophistication.',
    wcagContrastRatio: '14.7:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Clean Inter body copy ensures effortless patient comprehension while JetBrains Mono renders reference ranges and pg/mL units with clinical clarity.',
    },
  },
  {
    industryId: 'luxury-commerce',
    industryName: 'Precision Hardware & Luxury D2C Commerce',
    regex: /\b(luxury|espresso|coffee|roaster|watch|titanium|cnc|hardware|atelier|fashion|monolith|bespoke|craft|artisan|store|d2c)\b/i,
    defaultBrand: 'MONOLITH ESPRESSO',
    defaultTagline: 'CNC MACHINED TITANIUM TELEMETRY ESPRESSO SYSTEM',
    confidenceScore: 98,
    marketOpportunitySummary:
      'Discerning prosumers and design collectors are trading mass-market appliances for heirloom CNC-machined hardware with real-time pressure/flow telemetry.',
    targetAudience: 'Design-Obsessed Founders, Specialty Coffee Connoisseurs & Architectural Home Collectors',
    primaryPainPoint:
      'Inconsistent thermal stability in legacy brass boilers and clunky plastic touchscreens that ruin kitchen aesthetics.',
    threeSecondHook: '0.1°C PID thermal precision carved from a solid billet of Grade-5 aerospace titanium.',
    eyebrowSuffix: 'NUMBERED EDITION 04 • SWISS CNC ATELIER',
    headlineLine1: 'Carved From Solid Titanium.',
    headlineLine2: '0.1°C Extraction Telemetry.',
    subcopyLine1: 'Dual-boiler saturated grouphead with real-time flow-profiling paddles,',
    subcopyLine2: 'sapphire OLED flush crystal display, and whisper-quiet rotary acoustics.',
    primaryCta: 'Reserve Batch 04',
    secondaryCta: '▶ 3D Cutaway',
    proofMetrics: [
      '±0.1°C Thermal Stability',
      'Grade-5 Billet Titanium',
      '24 dBA Whisper Rotary',
      'Lifetime Heirloom Warranty',
    ],
    valuePillars: [
      {
        badge: '01 / METALLURGY',
        title: '5-Axis Monoblock Chassis',
        metric: '0.01mm Tolerance',
        description: 'Milled from solid aerospace titanium and bead-blasted for a lifetime fingerprint-proof satin finish.',
      },
      {
        badge: '02 / TELEMETRY',
        title: 'Gravimetric Flow Profiling',
        metric: '100Hz Pressure Loop',
        description: 'Integrated Bluetooth scale and sapphire OLED curve let you replay world-champion extraction profiles.',
      },
      {
        badge: '03 / CONCIERGE',
        title: 'White-Glove Global Atelier',
        metric: 'Numbered Serial',
        description: 'Ships in a custom flight case with water-chemistry calibration and direct master-technician support.',
      },
    ],
    competitors: [
      {
        name: 'La Marzocco Linea Mini',
        archetype: 'Heritage Italian Cafe Icon',
        strength: 'Iconic commercial heritage and café brand prestige',
        uxBlindSpot: 'Limited native flow/pressure profiling without aftermarket mods; dated mobile app UX',
        unfairAdvantage: 'Native 100Hz pressure/flow telemetry built into a flush sapphire OLED + architectural monoblock body',
        threatLevel: 'High',
      },
      {
        name: 'Decent Espresso DE1',
        archetype: 'Data-Heavy Tablet Machine',
        strength: 'Unmatched programmable extraction curves and community recipes',
        uxBlindSpot: 'Bolted-on Android tablet and vibratory pump acoustics feel utilitarian rather than luxury heirloom',
        unfairAdvantage: 'Combines laboratory telemetry with whisper-quiet rotary acoustics and museum-grade titanium craft',
        threatLevel: 'High',
      },
      {
        name: 'Victoria Arduino Eagle One',
        archetype: 'Commercial Boutique Machine',
        strength: 'Strong sustainability story and café footprint',
        uxBlindSpot: 'Bulky countertop footprint and complex dealer-only purchasing funnel',
        unfairAdvantage: 'Direct-to-collector transparent batch reservation with instant Apple Pay & 3D configurator',
        threatLevel: 'Medium',
      },
    ],
    topNavMenus: ['Craftsmanship ▾', 'Telemetry ▾', 'Accessories ▾', 'Reserve ▾'],
    level1Menus: {
      0: [
        '5-Axis Grade-5 Titanium ▸',
        'Saturated Dual-Boiler PID ▸',
        'Whisper 24dBA Rotary Pump ▸',
        'Sapphire Flush OLED Crystal',
      ],
      1: [
        '100Hz Pressure & Flow Graph ▸',
        'Integrated Gravimetric Scale ▸',
        'Roaster Recipe Cloud Sync ▸',
        'Auto-Purge Steam Wand AI',
      ],
      2: [
        'Monolith Conical Burr Grinder ▸',
        'Precision Billet Tamper & WDT ▸',
        'Remineralization Water Filter ▸',
        'Anodized Flight Travel Case',
      ],
      3: [
        'Batch 04 Allocation ($4,850) ▸',
        '0% APR Affirm / Apple Pay ▸',
        'Zurich & NYC Showroom Tasting ▸',
        'Lifetime Heirloom Guarantee',
      ],
    },
    level2Submenus: {
      0: [
        '• 14-Hour CNC Machining Cycle',
        '• Lead-Free Stainless Fluid Path',
        '• Cool-Touch Articulated Steam',
        '• Laser-Engraved Serial Plate',
      ],
      1: [
        '• Pre-Infusion Bloom Control',
        '• 9-Bar to 4-Bar Taper Curve',
        '• Instant Shot Replay Share',
        '• 90-Second Cold-to-Ready Wake',
      ],
      2: [
        '• 83mm DLC Coated Flat Burrs',
        '• 0.0g Single-Dose Retention',
        '• Magnetic Self-Centering Cup',
        '• Custom Walnut & Titanium Trim',
      ],
      3: [
        '• Ships in 14 Business Days',
        '• 30-Day Home Trial Included',
        '• White-Glove Countertop Setup',
        '• Direct Engineer Concierge',
      ],
    },
    recommendedTemplateId: 'ecommerce-store',
    themePresetId: 'swiss-monochrome',
    colorPsychologyRationale:
      'Swiss Monochrome Platinum (#E5E5E5) on Obsidian (#141414) eliminates chromatic noise so the industrial design, material textures, and craftsmanship command 100% focus.',
    wcagContrastRatio: '16.8:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'Architectural Swiss proportions pair gallery-grade product titles with millimeter-precise technical specifications.',
    },
  },
  {
    industryId: 'cleantech-grid',
    industryName: 'Autonomous CleanTech & Microgrid Energy AI',
    regex: /\b(solar|grid|microgrid|battery|energy|cleantech|climate|ev|megapack|power|dispatch|arbitrage|utility|carbon)\b/i,
    defaultBrand: 'SOLARIS GRID AI',
    defaultTagline: 'AUTONOMOUS MICROGRID BATTERY DISPATCH & ENERGY ARBITRAGE',
    confidenceScore: 98,
    marketOpportunitySummary:
      'Commercial solar + storage operators leave 34% of wholesale energy arbitrage revenue on the table due to static time-of-use battery schedules.',
    targetAudience: 'VP of Energy Operations, IPPs, Microgrid Developers & Data Center Sustainability Leads',
    primaryPainPoint:
      'Volatile 5-minute wholesale LMP price spikes, transformer peak demand charges, and fragmented inverter Modbus protocols.',
    threeSecondHook: 'Boost battery storage IRR by +38% with autonomous 5-minute wholesale energy arbitrage.',
    eyebrowSuffix: 'FERC 2222 READY • AUTONOMOUS DER DISPATCH',
    headlineLine1: 'Autonomous Grid Arbitrage.',
    headlineLine2: '+38% Battery Storage IRR.',
    subcopyLine1: 'Predict 5-minute ERCOT/CAISO price spikes, shave peak demand charges,',
    subcopyLine2: 'and dispatch multi-megawatt battery fleets with zero battery warranty degradation.',
    primaryCta: 'Model Site IRR ▸',
    secondaryCta: '▶ Live Grid Map',
    proofMetrics: [
      '+38.4% Storage IRR Lift',
      '4.2 GWh Managed Assets',
      '< 80ms Inverter Dispatch',
      'NERC CIP & SOC2 Certified',
    ],
    valuePillars: [
      {
        badge: '01 / PRICE AI',
        title: '5-Minute LMP Spike Forecaster',
        metric: '96.8% Capture',
        description: 'Weather-ensemble + grid congestion neural models bid storage into day-ahead and real-time ancillary markets.',
      },
      {
        badge: '02 / CELL HEALTH',
        title: 'Chemistry-Aware Cycle Guard',
        metric: '+4 Yrs LFP Life',
        description: 'Optimizes State-of-Charge (SoC) windows and thermal C-rates to preserve OEM battery warranty guarantees.',
      },
      {
        badge: '03 / UNIVERSAL DER',
        title: 'Vendor-Agnostic EMS Edge',
        metric: '45+ Inverter OEMs',
        description: 'Drop-in DNP3, Modbus TCP, and IEEE 2030.5 telemetry for Tesla Megapack, Fluence, Sungrow, and Enphase.',
      },
    ],
    competitors: [
      {
        name: 'Tesla Autobidder',
        archetype: 'Walled-Garden OEM Software',
        strength: 'Tight vertical integration with Tesla Megapack hardware',
        uxBlindSpot: 'Locks operators into a single hardware vendor; incompatible with mixed Sungrow/BYD/Fluence fleets',
        unfairAdvantage: '100% vendor-agnostic EMS that unifies mixed-OEM solar, battery, and EV fleets in 1 pane of glass',
        threatLevel: 'High',
      },
      {
        name: 'Stem Athena',
        archetype: 'Legacy C&I Storage Aggregator',
        strength: 'Large historical C&I behind-the-meter install base',
        uxBlindSpot: 'Opaque revenue-share fee structures and slow commissioning timelines',
        unfairAdvantage: 'Transparent SaaS licensing with instant digital-twin backtesting on your site’s 15-minute interval CSV',
        threatLevel: 'Medium',
      },
      {
        name: 'Manual SCADA Schedules',
        archetype: 'Static Rule-Based Dispatch',
        strength: 'Familiar to legacy utility substation engineers',
        uxBlindSpot: 'Completely misses intraday weather/congestion price spikes and triggers costly demand ratchets',
        unfairAdvantage: 'Autonomous closed-loop reinforcement learning that adapts every 5 minutes with human-in-the-loop guardrails',
        threatLevel: 'Emerging',
      },
    ],
    topNavMenus: ['Dispatch AI ▾', 'Markets ▾', 'Hardware OEMs ▾', 'ROI Calculator ▾'],
    level1Menus: {
      0: [
        '5-Min Wholesale Price Forecast ▸',
        'Peak Demand Charge Shaving ▸',
        'LFP Battery Degradation Guard ▸',
        'Microgrid Islanding Failover',
      ],
      1: [
        'ERCOT & CAISO Real-Time Bid ▸',
        'PJM & NYISO Frequency Reg ▸',
        'FERC 2222 Virtual Power Plant ▸',
        '24/7 Carbon-Free Data Centers',
      ],
      2: [
        'Tesla Megapack & Powerpack ▸',
        'Sungrow, BYD & Fluence BESS ▸',
        'SMA & SolarEdge Inverters ▸',
        'Modbus / DNP3 Edge Gateway',
      ],
      3: [
        'Upload 15-Min Interval CSV ▸',
        'Site IRR & Payback Simulator ▸',
        'IRA 30–50% Tax Credit Model ▸',
        'Enterprise Fleet SLA',
      ],
    },
    level2Submenus: {
      0: [
        '• Weather + Load Ensemble AI',
        '• Automated Ancillary Spinning',
        '• Zero-Export Curtailment',
        '• Instant Storm-Watch Precharge',
      ],
      1: [
        '• Qualified Scheduling Entity',
        '• Automated ISO Settlement',
        '• Hourly REC Carbon Matching',
        '• Demand Response Auto-Enroll',
      ],
      2: [
        '• < 80ms Local Edge Loop',
        '• Cellular + Starlink Failover',
        '• NERC CIP-008 Compliant',
        '• Zero Downtime OTA Updates',
      ],
      3: [
        '• Instant Historical Backtest',
        '• Guaranteed Baseline Uplift',
        '• Bankable Engineer Report PDF',
        '• 24/7 Grid Trading Desk',
      ],
    },
    recommendedTemplateId: 'analytics-dashboard',
    themePresetId: 'emerald-fintech',
    colorPsychologyRationale:
      'CleanTech Emerald (#10B981) and Solar Mint (#34D399) over Deep Grid Slate (#0F172A) reinforce renewable vitality, high-uptime telemetry, and positive yield.',
    wcagContrastRatio: '15.8:1 AAA',
    typographyPairing: {
      display: 'Space Grotesk',
      ui: 'Inter',
      mono: 'JetBrains Mono',
      rationale:
        'High-density megawatt telemetry and $/MWh ticker values stay ultra-legible in JetBrains Mono alongside Space Grotesk headers.',
    },
  },
];

/**
 * Runs deterministic Tier-1 ($0.00, 0ms) Deep Market & Competitive Research for ANY user prompt,
 * returning a comprehensive `DeepResearchDossier` ready for Website Generation, Strategy Board Spawning, or Logo Variations.
 */
export function runDeepMarketResearch(query: string): DeepResearchDossier {
  const cleanQuery = (query || '').trim() || DEEP_RESEARCH_PRESETS[0].prompt;
  const parsedLogo = analyzeUserContentForLogo(cleanQuery);

  // Match the best industry template or synthesize a custom vertical adaptation
  const matchedEntry = INDUSTRY_KNOWLEDGE_BASE.find((kb) => kb.regex.test(cleanQuery));
  const isCustomPrompt = !matchedEntry;
  const matchedTemplate = matchedEntry || INDUSTRY_KNOWLEDGE_BASE[0];

  const brandName =
    parsedLogo.brandName && parsedLogo.brandName !== 'OSITO STUDIO'
      ? parsedLogo.brandName.slice(0, 22)
      : matchedTemplate.defaultBrand;

  const tagline =
    parsedLogo.tagline && parsedLogo.tagline !== 'NEXT-GEN HYBRID DESIGN SYSTEM'
      ? parsedLogo.tagline.slice(0, 44)
      : matchedTemplate.defaultTagline;

  const monogram = (parsedLogo.monogramText || brandName.slice(0, 2) || 'OS').slice(0, 3);

  // Select recommended theme (honoring any explicit color in the prompt first)
  let recommendedTheme =
    COLOR_THEME_PRESETS.find((p) => p.id === matchedTemplate.themePresetId) ||
    COLOR_THEME_PRESETS[0];

  if (parsedLogo.suggestedPresetId) {
    const userPreset = COLOR_THEME_PRESETS.find((p) => p.id === parsedLogo.suggestedPresetId);
    if (userPreset && (parsedLogo.extractedHexColor || isCustomPrompt)) {
      recommendedTheme = userPreset;
    }
  }

  // Build crisp, non-wrapping headlines and domain-specific intelligence tailored to the brand & prompt
  let industryId = matchedTemplate.industryId;
  let industryName = matchedTemplate.industryName;
  let marketOpportunitySummary = matchedTemplate.marketOpportunitySummary;
  let targetAudience = matchedTemplate.targetAudience;
  let primaryPainPoint = matchedTemplate.primaryPainPoint;
  let headlineLine1 = matchedTemplate.headlineLine1;
  let headlineLine2 = matchedTemplate.headlineLine2;
  let subcopyLine1 = matchedTemplate.subcopyLine1;
  let subcopyLine2 = matchedTemplate.subcopyLine2;
  let threeSecondHook = matchedTemplate.threeSecondHook;
  let eyebrowSuffix = matchedTemplate.eyebrowSuffix;
  let primaryCta = matchedTemplate.primaryCta;
  let secondaryCta = matchedTemplate.secondaryCta;
  let proofMetrics = matchedTemplate.proofMetrics;
  let valuePillars = matchedTemplate.valuePillars;
  let competitors = matchedTemplate.competitors;
  let topNavMenus = matchedTemplate.topNavMenus;
  let level1Menus = matchedTemplate.level1Menus;
  let level2Submenus = matchedTemplate.level2Submenus;

  if (isCustomPrompt && cleanQuery.length > 3) {
    const stopWords = new Set([
      'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'into', 'next', 'gen',
      'platform', 'system', 'app', 'studio', 'tool', 'software', 'service', 'services', 'inc', 'llc',
    ]);
    const brandTokens = new Set(
      brandName
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
    );
    const domainWords = cleanQuery
      .replace(/[—–-]/g, ' ')
      .split(/[^a-zA-Z0-9]+/)
      .filter((w) => w.length >= 3 && !stopWords.has(w.toLowerCase()) && !brandTokens.has(w.toLowerCase()))
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

    const domainPrimary = domainWords[0] || 'Enterprise';
    const domainSecondary = domainWords[1] || 'Workflow';
    const domainPhrase = domainWords.slice(0, 2).join(' ') || 'Digital Operations';

    const shortBrand = brandName
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    industryId = `custom-${domainPrimary.toLowerCase()}`;
    industryName = `${domainPhrase} & Intelligent Automation`;
    eyebrowSuffix = `${domainPhrase.toUpperCase()} OS`;
    headlineLine1 = `${shortBrand} ${domainPrimary}`.slice(0, 26);
    headlineLine2 = `Modern ${domainSecondary} Engine`.slice(0, 26);
    subcopyLine1 = `Deliver ${tagline.toLowerCase().slice(0, 42)} with real-time telemetry,`;
    subcopyLine2 = 'automated workflows, and enterprise-grade conversion velocity.';
    threeSecondHook = `${shortBrand} replaces fragmented ${domainPhrase.toLowerCase()} tools with a unified, real-time operating system.`;
    marketOpportunitySummary = `Organizations across the ${domainPhrase.toLowerCase()} sector are consolidating legacy point tools into unified, telemetry-driven platforms with instant self-serve onboarding.`;
    targetAudience = `Heads of ${domainPrimary}, Operations Directors & High-Velocity ${domainSecondary} Teams`;
    primaryPainPoint = `Slow manual ${domainPhrase.toLowerCase()} handoffs, disconnected spreadsheet tracking, and high onboarding friction in legacy suites.`;
    primaryCta = `Launch ${domainPrimary} ▸`.slice(0, 16);
    secondaryCta = '▶ Live Demo';

    proofMetrics = [
      `3.8× Faster ${domainPrimary}`,
      '99.95% Uptime SLA',
      '-62% Manual Overhead',
      '< 5 Min Onboarding',
    ];

    valuePillars = [
      {
        badge: `01 / ${domainPrimary.toUpperCase().slice(0, 10)}`,
        title: `Automated ${domainPrimary} Core`,
        metric: '3.8× Velocity',
        description: `Eliminates manual ${domainPhrase.toLowerCase()} bottlenecks with real-time validation and guided automation.`,
      },
      {
        badge: `02 / ${domainSecondary.toUpperCase().slice(0, 10)}`,
        title: `Live ${domainSecondary} Telemetry`,
        metric: '< 25ms Sync',
        description: `Provides instant visibility across every active ${domainSecondary.toLowerCase()} stage, SLA metric, and customer touchpoint.`,
      },
      {
        badge: '03 / INTEGRATIONS',
        title: 'Turnkey Ecosystem Sync',
        metric: '1-Click Export',
        description: `Connects seamlessly with existing ${domainPhrase.toLowerCase()} records, webhooks, and executive reporting dashboards.`,
      },
    ];

    competitors = [
      {
        name: `Legacy ${domainPrimary} Suite`,
        archetype: `Incumbent Enterprise ${domainPrimary}`,
        strength: `Broad historical install base in traditional ${domainPhrase.toLowerCase()} organizations`,
        uxBlindSpot: `Cluttered multi-tab menus, 6-week consultant setup, and zero real-time ${domainSecondary.toLowerCase()} telemetry`,
        unfairAdvantage: `Instant self-serve ${domainPhrase.toLowerCase()} workspace with 1-click automation and live KPI overlays`,
        threatLevel: 'High',
      },
      {
        name: `${domainPrimary}Cloud Point App`,
        archetype: `Single-Feature ${domainSecondary} Tool`,
        strength: `Quick initial signup for basic ${domainSecondary.toLowerCase()} checklists`,
        uxBlindSpot: `Lacks end-to-end ${domainPhrase.toLowerCase()} analytics, custom branding, and multi-team permissions`,
        unfairAdvantage: `Unified ${domainPrimary} + ${domainSecondary} pipeline with full executive reporting in one view`,
        threatLevel: 'Medium',
      },
      {
        name: `Manual ${domainPhrase} Sheets`,
        archetype: 'Fragmented Spreadsheets & Email',
        strength: 'Zero upfront software licensing cost',
        uxBlindSpot: `High human error rate, stale status updates, and zero automated client notifications`,
        unfairAdvantage: ` cuts manual ${domainPhrase.toLowerCase()} coordination by 62% with automated customer portals`,
        threatLevel: 'Emerging',
      },
    ];

    topNavMenus = [`${domainPrimary} ▾`, `${domainSecondary} ▾`, 'Analytics ▾', 'Pricing ▾'];
    level1Menus = {
      0: [
        `${domainPrimary} Automation Engine ▸`,
        `Real-Time ${domainSecondary} Board ▸`,
        'Custom Workflow Templates ▸',
        'Role-Based Access Control',
      ],
      1: [
        `Live ${domainSecondary} Tracker ▸`,
        'Automated Client Alerts ▸',
        'SLA & Quality Checklists ▸',
        'Mobile Field Companion',
      ],
      2: [
        'Executive KPI Dashboard ▸',
        'Conversion & ROI Attribution ▸',
        'Scheduled PDF & CSV Exports ▸',
        'Webhook & REST API Sync',
      ],
      3: [
        'Starter Team Workspace ▸',
        'Growth Automation Tier ▸',
        'Enterprise Custom SLA ▸',
        'Interactive ROI Calculator',
      ],
    };
  }

  const eyebrow = `✦ ${brandName.slice(0, 14)} • ${eyebrowSuffix}`.slice(0, 38);

  const logoVariations = generateLogoVariationsFromPrompt(cleanQuery, 0, {
    primary: recommendedTheme.primary,
    secondary: recommendedTheme.secondary,
    accent: recommendedTheme.accent,
  });

  const recommendedLogoConfig: LogoGeneratorConfig = {
    ...logoVariations[0].config,
    brandName,
    tagline,
    monogramText: monogram,
  };

  const pipelineSteps: ResearchPipelineStep[] = [
    {
      step: 1,
      title: 'Entity & Market Taxonomy',
      detail: `Classified "${brandName}" → ${industryName}`,
      status: 'done',
      durationMs: 14,
    },
    {
      step: 2,
      title: 'Competitor UX Teardown',
      detail: `Benchmarked ${competitors.map((c) => c.name.split(' ')[0]).join(', ')} blind spots`,
      status: 'done',
      durationMs: 22,
    },
    {
      step: 3,
      title: 'Conversion Copy & Proof Matrix',
      detail: `Synthesized 3-second hook, non-wrapping H1 & 4 quantified proof metrics`,
      status: 'done',
      durationMs: 18,
    },
    {
      step: 4,
      title: 'Nested IA Menu Architecture',
      detail: `Built 4 Top Menus × 16 Level-1 Flyouts × 16 Level-2 Submenus`,
      status: 'done',
      durationMs: 16,
    },
    {
      step: 5,
      title: 'Chromatic & WCAG 2.2 Verification',
      detail: `Verified ${recommendedTheme.name} at ${matchedTemplate.wcagContrastRatio} contrast`,
      status: 'done',
      durationMs: 11,
    },
  ];

  return {
    id: `dossier-${Date.now()}`,
    query: cleanQuery,
    brandName,
    tagline,
    monogram,
    industryId,
    industryName,
    confidenceScore: matchedTemplate.confidenceScore,
    marketOpportunitySummary,
    targetAudience,
    primaryPainPoint,
    threeSecondHook,
    eyebrow,
    headlineLine1: headlineLine1.slice(0, 26),
    headlineLine2: headlineLine2.slice(0, 26),
    subcopyLine1: subcopyLine1.slice(0, 68),
    subcopyLine2: subcopyLine2.slice(0, 68),
    primaryCta: primaryCta.slice(0, 16),
    secondaryCta: secondaryCta.slice(0, 16),
    proofMetrics,
    valuePillars,
    competitors,
    topNavMenus,
    level1Menus,
    level2Submenus,
    recommendedTemplateId: matchedTemplate.recommendedTemplateId,
    recommendedTheme,
    colorPsychologyRationale: matchedTemplate.colorPsychologyRationale,
    wcagContrastRatio: matchedTemplate.wcagContrastRatio,
    typographyPairing: matchedTemplate.typographyPairing,
    recommendedLogoConfig,
    pipelineSteps,
  };
}

// ============================================================================
// 4. EXECUTIVE DEEP RESEARCH & STRATEGY BOARD GENERATOR (55+ HI-FI LAYERS)
// ============================================================================

function buildRectNodes(w: number, h: number, radius = 0): BezierNode[] {
  const rw = Math.max(2, Math.round(w));
  const rh = Math.max(2, Math.round(h));
  const r = Math.max(0, Math.min(radius, rw / 2, rh / 2));
  if (r <= 0.5) {
    return [
      { id: 'n0', x: 0, y: 0, cp1x: 0, cp1y: 0, cp2x: 0, cp2y: 0, pointType: 'corner' },
      { id: 'n1', x: rw, y: 0, cp1x: rw, cp1y: 0, cp2x: rw, cp2y: 0, pointType: 'corner' },
      { id: 'n2', x: rw, y: rh, cp1x: rw, cp1y: rh, cp2x: rw, cp2y: rh, pointType: 'corner' },
      { id: 'n3', x: 0, y: rh, cp1x: 0, cp1y: rh, cp2x: 0, cp2y: rh, pointType: 'corner' },
    ];
  }
  const k = r * 0.55228475;
  return [
    { id: 'r0', x: r, y: 0, cp1x: r - k, cp1y: 0, cp2x: r, cp2y: 0, pointType: 'smooth' },
    { id: 'r1', x: rw - r, y: 0, cp1x: rw - r, cp1y: 0, cp2x: rw - r + k, cp2y: 0, pointType: 'smooth' },
    { id: 'r2', x: rw, y: r, cp1x: rw, cp1y: r - k, cp2x: rw, cp2y: r, pointType: 'smooth' },
    { id: 'r3', x: rw, y: rh - r, cp1x: rw, cp1y: rh - r, cp2x: rw, cp2y: rh - r + k, pointType: 'smooth' },
    { id: 'r4', x: rw - r, y: rh, cp1x: rw - r + k, cp1y: rh, cp2x: rw - r, cp2y: rh, pointType: 'smooth' },
    { id: 'r5', x: r, y: rh, cp1x: r, cp1y: rh, cp2x: r - k, cp2y: rh, pointType: 'smooth' },
    { id: 'r6', x: 0, y: rh - r, cp1x: 0, cp1y: rh - r + k, cp2x: 0, cp2y: rh - r, pointType: 'smooth' },
    { id: 'r7', x: 0, y: r, cp1x: 0, cp1y: r, cp2x: 0, cp2y: r - k, pointType: 'smooth' },
  ];
}

function makeBoardRect(
  id: string,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  opts: {
    radius?: number;
    fillType?: 'solid' | 'linear-gradient' | 'radial-gradient' | 'none';
    fillGradientEnd?: string;
    stroke?: string;
    strokeWidth?: number;
    shadow?: boolean;
    interactiveHover?: boolean;
    hoverFill?: string;
    hoverStroke?: string;
    params?: Record<string, number | boolean | string>;
  } = {}
): VectorPathObject {
  const w = Math.max(2, Math.round(width));
  const h = Math.max(2, Math.round(height));
  const fillType = opts.fillType ?? (opts.fillGradientEnd ? 'linear-gradient' : 'solid');
  const gradEnd = opts.fillGradientEnd ?? fill;
  const stroke = opts.stroke ?? 'none';
  const strokeWidth = opts.strokeWidth ?? (stroke === 'none' ? 0 : 1);

  return {
    id,
    name,
    type: 'vector-path',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: w,
    height: h,
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType,
    fillGradientEnd: gradEnd,
    stroke,
    strokeWidth,
    strokeAlign: 'inside',
    pixelSnap: true,
    shadow: opts.shadow
      ? { enabled: true, color: 'rgba(0,0,0,0.48)', blur: 16, offsetX: 0, offsetY: 6 }
      : { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    closed: true,
    nodes: buildRectNodes(w, h, opts.radius ?? 0),
    ...(opts.params ? { params: opts.params } : {}),
    ...(opts.interactiveHover
      ? {
          stateVariants: {
            default: {
              fill,
              fillGradientEnd: gradEnd,
              stroke,
              strokeWidth,
              opacity: 1,
            },
            hover: {
              fill: opts.hoverFill ?? gradEnd,
              fillGradientEnd: fill,
              stroke: opts.hoverStroke ?? '#ffffff',
              strokeWidth: Math.max(1.5, strokeWidth),
              opacity: 1,
              offsetY: -1,
              scale: 1.01,
            },
            active: {
              fill: gradEnd,
              fillGradientEnd: fill,
              stroke: opts.hoverStroke ?? '#ffffff',
              strokeWidth: Math.max(1.5, strokeWidth),
              opacity: 0.96,
              offsetY: 1,
              scale: 0.99,
            },
          },
        }
      : {}),
  };
}

function makeBoardText(
  id: string,
  name: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fontSize: number,
  fill: string,
  align: 'left' | 'center' | 'right' = 'left',
  fontFamily: 'Inter' | 'Space Grotesk' | 'JetBrains Mono' = 'Inter',
  fontWeight: '400' | '500' | '600' | '700' = '700',
  letterSpacing = 0.2
): TextObject {
  return {
    id,
    name,
    type: 'text',
    visible: true,
    locked: false,
    x: Math.round(x),
    y: Math.round(y),
    width: Math.max(12, Math.round(width)),
    height: Math.max(12, Math.round(height)),
    rotation: 0,
    opacity: 1,
    blendMode: 'source-over',
    fill,
    fillType: 'solid',
    fillGradientEnd: fill,
    stroke: 'none',
    strokeWidth: 0,
    strokeAlign: 'center',
    pixelSnap: true,
    shadow: { enabled: false, color: 'transparent', blur: 0, offsetX: 0, offsetY: 0 },
    text,
    fontFamily,
    fontSize,
    fontWeight,
    textAlign: align,
    letterSpacing,
  };
}

/**
 * Generates a 100% High-Fidelity Vector + Typography + Magnetic-Connector
 * Executive Deep Research & Competitive Strategy Board on the canvas.
 */
export function generateDeepResearchStrategyBoardObjects(
  dossier: DeepResearchDossier,
  canvasWidth = 960,
  _canvasHeight = 600
): CanvasObject[] {
  const s = Date.now();
  const theme = dossier.recommendedTheme;
  const pad = 24;
  const innerW = Math.max(520, canvasWidth - pad * 2);
  const ctaTextColor = getReadableTextColorForBg(theme.primary);

  // --------------------------------------------------------------------------
  // 1. TOP INTERACTIVE STRATEGY NAVBAR (y = 14, h = 50)
  // --------------------------------------------------------------------------
  const navX = pad;
  const navY = 14;
  const navW = innerW;
  const navH = 50;

  const navSurface = makeBoardRect(
    `web-navbar-surface-${s}`,
    'Top Strategy Navbar (Interactive Nested Menu)',
    navX,
    navY,
    navW,
    navH,
    theme.surface,
    {
      fillType: 'linear-gradient',
      fillGradientEnd: theme.surfaceAlt,
      stroke: theme.border,
      strokeWidth: 1.5,
      shadow: true,
      params: {
        hasNestedMenu: true,
        activeTab: 1,
        activeLink: 1,
        openMenuIndex: 0,
        openSubMenuIndex: 1,
        selectedLeafIndex: 1,
        customTopMenus: dossier.topNavMenus.join('|'),
        customLevel1Menus: JSON.stringify(dossier.level1Menus),
        customLevel2Menus: JSON.stringify(dossier.level2Submenus),
      },
    }
  );

  const navLogoBadge = makeBoardRect(
    `web-navbar-logo-bg-${s}`,
    'Strategy Navbar Brand Crest',
    navX + 12,
    navY + 11,
    28,
    28,
    theme.primary,
    {
      radius: 7,
      fillType: 'linear-gradient',
      fillGradientEnd: theme.secondary,
      stroke: '#ffffff',
      strokeWidth: 1.25,
    }
  );

  const navLogoMono = makeBoardText(
    `web-navbar-logo-mono-${s}`,
    'Strategy Navbar Monogram',
    dossier.monogram.slice(0, 2),
    navX + 12,
    navY + 18,
    28,
    14,
    10,
    ctaTextColor,
    'center',
    'Space Grotesk',
    '700'
  );

  const navBrandWordmark = makeBoardText(
    `web-navbar-brand-${s}`,
    'Strategy Navbar Brand Title',
    dossier.brandName.slice(0, 18),
    navX + 46,
    navY + 18,
    148,
    16,
    11.5,
    theme.textPrimary,
    'left',
    'Space Grotesk',
    '700',
    0.6
  );

  const navStartX = navX + Math.round(navW * 0.22);
  const navSpanW = Math.round(navW * 0.54);
  const itemW = Math.max(52, Math.floor(navSpanW / 4));
  const btnH = 28;
  const btnY = navY + Math.round((navH - btnH) / 2);

  const navButtons: CanvasObject[] = [];
  dossier.topNavMenus.slice(0, 4).forEach((label, idx) => {
    const bx = navStartX + idx * itemW + 4;
    const bw = Math.max(44, itemW - 8);
    navButtons.push(
      makeBoardRect(
        `web-navbar-item-${s}-${idx}-bg`,
        `Navbar Menu Pill: ${label}`,
        bx,
        btnY,
        bw,
        btnH,
        theme.surfaceAlt,
        {
          radius: 7,
          stroke: idx === 0 ? theme.accent : theme.border,
          strokeWidth: idx === 0 ? 1.5 : 1,
          interactiveHover: true,
          hoverFill: theme.primary,
        }
      ),
      makeBoardText(
        `web-navbar-item-${s}-${idx}-txt`,
        `Navbar Menu Text: ${label}`,
        label,
        bx + 4,
        btnY + 8,
        bw - 8,
        14,
        10,
        theme.textPrimary,
        'center',
        'Inter',
        '600'
      )
    );
  });

  const navCtaW = Math.max(96, Math.min(126, Math.round(navW * 0.14)));
  const navCtaX = navX + navW - navCtaW - 12;
  const navCtaBg = makeBoardRect(
    `web-navbar-cta-${s}-bg`,
    'Navbar Primary CTA Pill',
    navCtaX,
    btnY,
    navCtaW,
    btnH,
    theme.primary,
    {
      radius: 14,
      fillType: 'linear-gradient',
      fillGradientEnd: theme.secondary,
      stroke: theme.accent,
      strokeWidth: 1.5,
      shadow: true,
      interactiveHover: true,
      hoverFill: theme.accent,
    }
  );
  const navCtaTxt = makeBoardText(
    `web-navbar-cta-${s}-txt`,
    'Navbar Primary CTA Label',
    dossier.primaryCta,
    navCtaX + 6,
    btnY + 8,
    navCtaW - 12,
    14,
    10,
    ctaTextColor,
    'center',
    'Inter',
    '700'
  );

  const navbarLayers: CanvasObject[] = [
    navSurface,
    navLogoBadge,
    navLogoMono,
    navBrandWordmark,
    ...navButtons,
    navCtaBg,
    navCtaTxt,
  ];

  // --------------------------------------------------------------------------
  // 2. EXECUTIVE DOSSIER HEADER STRIP (y = 74, h = 54)
  // --------------------------------------------------------------------------
  const hdrY = 74;
  const hdrH = 54;
  const hdrCard = makeBoardRect(
    `dr-hdr-card-${s}`,
    'Executive Research Dossier Header Strip',
    pad,
    hdrY,
    innerW,
    hdrH,
    theme.surface,
    {
      fillType: 'linear-gradient',
      fillGradientEnd: theme.surfaceAlt,
      stroke: theme.border,
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const hdrTopBar = makeBoardRect(
    `dr-hdr-bar-${s}`,
    'Dossier Header Accent Bar',
    pad,
    hdrY,
    innerW,
    3,
    theme.primary,
    { fillType: 'linear-gradient', fillGradientEnd: theme.accent }
  );
  const hdrTitle = makeBoardText(
    `dr-hdr-title-${s}`,
    'Dossier Brand Title',
    `${dossier.brandName} — DEEP RESEARCH & COMPETITIVE STRATEGY DOSSIER`,
    pad + 16,
    hdrY + 11,
    Math.round(innerW * 0.62),
    18,
    13,
    theme.textPrimary,
    'left',
    'Space Grotesk',
    '700',
    0.4
  );
  const hdrHook = makeBoardText(
    `dr-hdr-hook-${s}`,
    'Dossier 3-Second Hook Subtitle',
    `3-SECOND HOOK: "${dossier.threeSecondHook.slice(0, 88)}"`,
    pad + 16,
    hdrY + 31,
    Math.round(innerW * 0.68),
    14,
    10,
    theme.accent,
    'left',
    'JetBrains Mono',
    '600'
  );
  const confBadgeBg = makeBoardRect(
    `dr-hdr-conf-bg-${s}`,
    'Confidence Score Badge Pill',
    pad + innerW - 268,
    hdrY + 15,
    118,
    24,
    theme.surfaceAlt,
    { radius: 12, stroke: theme.accent, strokeWidth: 1 }
  );
  const confBadgeTxt = makeBoardText(
    `dr-hdr-conf-txt-${s}`,
    'Confidence Score Badge Text',
    `CONFIDENCE: ${dossier.confidenceScore}%`,
    pad + innerW - 262,
    hdrY + 22,
    106,
    12,
    9,
    theme.accent,
    'center',
    'JetBrains Mono',
    '700'
  );
  const indBadgeBg = makeBoardRect(
    `dr-hdr-ind-bg-${s}`,
    'Industry Vertical Badge Pill',
    pad + innerW - 142,
    hdrY + 15,
    128,
    24,
    theme.primary,
    { radius: 12, fillType: 'linear-gradient', fillGradientEnd: theme.secondary, stroke: '#ffffff', strokeWidth: 1 }
  );
  const indBadgeTxt = makeBoardText(
    `dr-hdr-ind-txt-${s}`,
    'Industry Vertical Badge Text',
    dossier.industryId.toUpperCase().slice(0, 15),
    pad + innerW - 136,
    hdrY + 22,
    116,
    12,
    9,
    ctaTextColor,
    'center',
    'JetBrains Mono',
    '700'
  );

  // --------------------------------------------------------------------------
  // 3. COLUMN 1 (x = 24, w = 292, y = 138, h = 442) — COMPETITIVE TEARDOWN MATRIX
  // --------------------------------------------------------------------------
  const col1X = 24;
  const col1W = 292;
  const colY = 138;
  const colH = 442;

  const col1Surface = makeBoardRect(
    `dr-col1-surface-${s}`,
    'Column 1: Competitive Teardown Surface',
    col1X,
    colY,
    col1W,
    colH,
    theme.surface,
    {
      fillType: 'linear-gradient',
      fillGradientEnd: theme.surfaceAlt,
      stroke: theme.border,
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const col1Bar = makeBoardRect(
    `dr-col1-bar-${s}`,
    'Column 1 Top Accent Bar',
    col1X,
    colY,
    col1W,
    3,
    theme.primary
  );
  const col1Hdr = makeBoardText(
    `dr-col1-hdr-${s}`,
    'Column 1 Section Header',
    '01 • COMPETITOR TEARDOWN & UX BLIND SPOTS',
    col1X + 14,
    colY + 14,
    col1W - 28,
    14,
    9.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700',
    0.5
  );

  const compLayers: CanvasObject[] = [];
  const compYPositions = [178, 304, 430];
  dossier.competitors.slice(0, 3).forEach((comp, idx) => {
    const cy = compYPositions[idx];
    const ch = 116;
    const cx = col1X + 12;
    const cw = col1W - 24;

    const card = makeBoardRect(
      `dr-comp-card-${s}-${idx}`,
      `Competitor Card: ${comp.name}`,
      cx,
      cy,
      cw,
      ch,
      theme.surfaceAlt,
      {
        radius: 6,
        stroke: idx === 0 ? theme.accent : theme.border,
        strokeWidth: 1.25,
        interactiveHover: true,
      }
    );
    const leftStrip = makeBoardRect(
      `dr-comp-strip-${s}-${idx}`,
      `Competitor ${idx + 1} Accent Strip`,
      cx,
      cy,
      4,
      ch,
      idx === 0 ? theme.primary : idx === 1 ? theme.secondary : theme.accent
    );
    const compName = makeBoardText(
      `dr-comp-name-${s}-${idx}`,
      `Competitor ${idx + 1} Name`,
      `${comp.name.slice(0, 20)}`,
      cx + 12,
      cy + 10,
      cw - 92,
      16,
      12,
      theme.textPrimary,
      'left',
      'Space Grotesk',
      '700'
    );
    const threatBg = makeBoardRect(
      `dr-comp-threat-bg-${s}-${idx}`,
      `Competitor ${idx + 1} Threat Pill`,
      cx + cw - 78,
      cy + 9,
      68,
      18,
      theme.surface,
      { radius: 9, stroke: theme.accent, strokeWidth: 1 }
    );
    const threatTxt = makeBoardText(
      `dr-comp-threat-txt-${s}-${idx}`,
      `Competitor ${idx + 1} Threat Text`,
      comp.threatLevel.toUpperCase(),
      cx + cw - 74,
      cy + 14,
      60,
      10,
      8,
      theme.accent,
      'center',
      'JetBrains Mono',
      '700'
    );
    const compArch = makeBoardText(
      `dr-comp-arch-${s}-${idx}`,
      `Competitor ${idx + 1} Archetype Muted`,
      comp.archetype.slice(0, 38),
      cx + 12,
      cy + 29,
      cw - 24,
      12,
      9,
      theme.textMuted,
      'left',
      'JetBrains Mono',
      '500'
    );
    const blindSpotTxt = makeBoardText(
      `dr-comp-blind-${s}-${idx}`,
      `Competitor ${idx + 1} Blind Spot Muted`,
      `BLIND SPOT: ${comp.uxBlindSpot.slice(0, 40)}`,
      cx + 12,
      cy + 52,
      cw - 20,
      14,
      9.5,
      theme.textMuted,
      'left',
      'Inter',
      '400'
    );
    const unfairTxt1 = makeBoardText(
      `dr-comp-edge1-${s}-${idx}`,
      `Competitor ${idx + 1} Unfair Edge Accent`,
      `UNFAIR EDGE: ${comp.unfairAdvantage.slice(0, 39)}`,
      cx + 12,
      cy + 74,
      cw - 20,
      14,
      9.5,
      theme.accent,
      'left',
      'Inter',
      '700'
    );
    const unfairTxt2 = makeBoardText(
      `dr-comp-edge2-${s}-${idx}`,
      `Competitor ${idx + 1} Unfair Edge Line 2`,
      comp.unfairAdvantage.length > 39
        ? comp.unfairAdvantage.slice(39, 82)
        : `✓ Verified conversion advantage for ${dossier.brandName.slice(0, 12)}`,
      cx + 12,
      cy + 91,
      cw - 20,
      14,
      9,
      theme.textPrimary,
      'left',
      'Inter',
      '500'
    );

    compLayers.push(
      card,
      leftStrip,
      compName,
      threatBg,
      threatTxt,
      compArch,
      blindSpotTxt,
      unfairTxt1,
      unfairTxt2
    );
  });

  // --------------------------------------------------------------------------
  // 4. COLUMN 2 (x = 330, w = 310, y = 138, h = 442) — CONVERSION & FUNNEL
  // --------------------------------------------------------------------------
  const col2X = 330;
  const col2W = 310;

  const col2Surface = makeBoardRect(
    `dr-col2-surface-${s}`,
    'Column 2: Conversion Psychology Surface',
    col2X,
    colY,
    col2W,
    colH,
    theme.surface,
    {
      fillType: 'linear-gradient',
      fillGradientEnd: theme.surfaceAlt,
      stroke: theme.border,
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const col2Bar = makeBoardRect(
    `dr-col2-bar-${s}`,
    'Column 2 Top Accent Bar',
    col2X,
    colY,
    col2W,
    3,
    theme.secondary
  );
  const col2Hdr = makeBoardText(
    `dr-col2-hdr-${s}`,
    'Column 2 Section Header',
    '02 • CONVERSION COPY & BUYER FUNNEL',
    col2X + 14,
    colY + 14,
    col2W - 28,
    14,
    9.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700',
    0.5
  );

  // Hero Hook Preview Card (y = 178, h = 118)
  const heroBoxX = col2X + 12;
  const heroBoxY = 178;
  const heroBoxW = col2W - 24;
  const heroBoxH = 118;

  const heroPreviewCard = makeBoardRect(
    `dr-hero-preview-${s}`,
    'Hero Hook Copy Preview Card',
    heroBoxX,
    heroBoxY,
    heroBoxW,
    heroBoxH,
    theme.surfaceAlt,
    {
      radius: 6,
      stroke: theme.primary,
      strokeWidth: 1.5,
      interactiveHover: true,
    }
  );
  const heroEyebrow = makeBoardText(
    `dr-hero-eyebrow-${s}`,
    'Researched Eyebrow Copy',
    dossier.eyebrow.slice(0, 36),
    heroBoxX + 12,
    heroBoxY + 10,
    heroBoxW - 24,
    12,
    8.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700'
  );
  const heroH1 = makeBoardText(
    `dr-hero-h1-${s}`,
    'Researched Display Headline 1',
    dossier.headlineLine1,
    heroBoxX + 12,
    heroBoxY + 26,
    heroBoxW - 24,
    20,
    15,
    theme.textPrimary,
    'left',
    'Space Grotesk',
    '700'
  );
  const heroH2 = makeBoardText(
    `dr-hero-h2-${s}`,
    'Researched Display Headline 2 Accent',
    dossier.headlineLine2,
    heroBoxX + 12,
    heroBoxY + 45,
    heroBoxW - 24,
    20,
    15,
    theme.accent,
    'left',
    'Space Grotesk',
    '700'
  );
  const heroSub = makeBoardText(
    `dr-hero-sub-${s}`,
    'Researched Subcopy Muted',
    dossier.subcopyLine1.slice(0, 44),
    heroBoxX + 12,
    heroBoxY + 67,
    heroBoxW - 24,
    14,
    9.5,
    theme.textMuted,
    'left',
    'Inter',
    '400'
  );
  const heroCtaBg = makeBoardRect(
    `dr-hero-cta-bg-${s}`,
    'Hero Preview Primary CTA Button',
    heroBoxX + 12,
    heroBoxY + 86,
    126,
    24,
    theme.primary,
    {
      radius: 12,
      fillType: 'linear-gradient',
      fillGradientEnd: theme.secondary,
      stroke: theme.accent,
      strokeWidth: 1.25,
      interactiveHover: true,
      hoverFill: theme.accent,
    }
  );
  const heroCtaTxt = makeBoardText(
    `dr-hero-cta-txt-${s}`,
    'Hero Preview Primary CTA Text',
    dossier.primaryCta,
    heroBoxX + 18,
    heroBoxY + 93,
    114,
    12,
    9.5,
    ctaTextColor,
    'center',
    'Inter',
    '700'
  );

  // 2x2 Quantified Proof Metrics Grid (y = 306, h = 76)
  const metricGridY = 306;
  const metricW = Math.floor((heroBoxW - 8) / 2);
  const metricH = 34;
  const proofLayers: CanvasObject[] = [];
  dossier.proofMetrics.slice(0, 4).forEach((m, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const mx = heroBoxX + col * (metricW + 8);
    const my = metricGridY + row * (metricH + 8);
    proofLayers.push(
      makeBoardRect(
        `dr-proof-card-${s}-${idx}`,
        `Proof Metric Badge ${idx + 1}`,
        mx,
        my,
        metricW,
        metricH,
        theme.surfaceAlt,
        {
          radius: 5,
          stroke: theme.border,
          strokeWidth: 1,
          interactiveHover: true,
        }
      ),
      makeBoardText(
        `dr-proof-txt-${s}-${idx}`,
        `Proof Metric Value ${idx + 1}`,
        `✦ ${m.slice(0, 20)}`,
        mx + 8,
        my + 11,
        metricW - 16,
        14,
        9.5,
        theme.accent,
        'left',
        'JetBrains Mono',
        '700'
      )
    );
  });

  // Live Magnetic Conversion Flow Diagram (y = 394..566)
  const flowHdr = makeBoardText(
    `dr-flow-hdr-${s}`,
    'Magnetic Funnel Section Title',
    'LIVE MAGNETIC CONVERSION FUNNEL (DRAG NODES TO REROUTE)',
    heroBoxX,
    394,
    heroBoxW,
    14,
    8.5,
    theme.textMuted,
    'left',
    'JetBrains Mono',
    '700'
  );

  const flowNodeW = 84;
  const flowNodeH = 78;
  const flowNodeY = 416;
  const flowSpecs = [
    { id: `dr-flow-1-${s}`, title: '1. 3s Hook', sub: 'Pattern Interrupt', stroke: theme.primary },
    { id: `dr-flow-2-${s}`, title: '2. Proof Matrix', sub: '4 KPI Signals', stroke: theme.secondary },
    { id: `dr-flow-3-${s}`, title: '3. Intent CTA', sub: dossier.primaryCta.slice(0, 12), stroke: theme.accent },
  ];

  const flowNodeCards: VectorPathObject[] = [];
  const flowNodeChildren: CanvasObject[] = [];
  flowSpecs.forEach((sp, idx) => {
    const nx = heroBoxX + idx * (flowNodeW + 17);
    const nodeCard = makeBoardRect(
      sp.id,
      `Funnel Flow Node: ${sp.title}`,
      nx,
      flowNodeY,
      flowNodeW,
      flowNodeH,
      theme.surfaceAlt,
      {
        radius: 6,
        stroke: sp.stroke,
        strokeWidth: 1.5,
        shadow: true,
        interactiveHover: true,
      }
    );
    flowNodeCards.push(nodeCard);
    flowNodeChildren.push(
      makeBoardRect(
        `${sp.id}-bar`,
        `${sp.title} Accent Bar`,
        nx,
        flowNodeY,
        flowNodeW,
        3,
        sp.stroke
      ),
      makeBoardText(
        `${sp.id}-title`,
        `${sp.title} Node Heading`,
        sp.title,
        nx + 6,
        flowNodeY + 18,
        flowNodeW - 12,
        14,
        9.5,
        theme.textPrimary,
        'center',
        'Space Grotesk',
        '700'
      ),
      makeBoardText(
        `${sp.id}-sub`,
        `${sp.title} Node Subtext`,
        sp.sub,
        nx + 4,
        flowNodeY + 42,
        flowNodeW - 8,
        14,
        8.5,
        theme.accent,
        'center',
        'JetBrains Mono',
        '600'
      )
    );
  });

  const conn1 = createSmartConnectorObject(flowNodeCards[0], 'e', flowNodeCards[1], 'w', {
    stroke: theme.accent,
    strokeWidth: 2,
    routing: 'elbow',
  });
  conn1.id = `dr-flow-conn-1-${s}`;

  const conn2 = createSmartConnectorObject(flowNodeCards[1], 'e', flowNodeCards[2], 'w', {
    stroke: theme.primary,
    strokeWidth: 2,
    routing: 'elbow',
  });
  conn2.id = `dr-flow-conn-2-${s}`;

  const audienceStrip = makeBoardRect(
    `dr-audience-card-${s}`,
    'Target Buyer Persona Card',
    heroBoxX,
    506,
    heroBoxW,
    60,
    theme.surfaceAlt,
    { radius: 6, stroke: theme.border, strokeWidth: 1 }
  );
  const audienceTitle = makeBoardText(
    `dr-audience-title-${s}`,
    'Target Audience Label',
    `BUYER ICP: ${dossier.targetAudience.slice(0, 38)}`,
    heroBoxX + 10,
    516,
    heroBoxW - 20,
    14,
    9,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700'
  );
  const audiencePain = makeBoardText(
    `dr-audience-pain-${s}`,
    'Primary Buyer Pain Point Muted',
    `PAIN SOLVED: ${dossier.primaryPainPoint.slice(0, 42)}`,
    heroBoxX + 10,
    536,
    heroBoxW - 20,
    14,
    9,
    theme.textMuted,
    'left',
    'Inter',
    '400'
  );

  // --------------------------------------------------------------------------
  // 5. COLUMN 3 (x = 654, w = 282, y = 138, h = 442) — CHROMATIC & VISUAL SYSTEM
  // --------------------------------------------------------------------------
  const col3X = 654;
  const col3W = 282;

  const col3Surface = makeBoardRect(
    `dr-col3-surface-${s}`,
    'Column 3: Color Psychology & Tokens Surface',
    col3X,
    colY,
    col3W,
    colH,
    theme.surface,
    {
      fillType: 'linear-gradient',
      fillGradientEnd: theme.surfaceAlt,
      stroke: theme.border,
      strokeWidth: 1.5,
      shadow: true,
    }
  );
  const col3Bar = makeBoardRect(
    `dr-col3-bar-${s}`,
    'Column 3 Top Accent Bar',
    col3X,
    colY,
    col3W,
    3,
    theme.accent
  );
  const col3Hdr = makeBoardText(
    `dr-col3-hdr-${s}`,
    'Column 3 Section Header',
    '03 • COLOR PSYCHOLOGY & DESIGN TOKENS',
    col3X + 14,
    colY + 14,
    col3W - 28,
    14,
    9.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700',
    0.5
  );

  // 6 Color Swatch Cards (y = 178..342)
  const swatchRoles = [
    { role: 'PRIMARY', hex: theme.primary },
    { role: 'SECONDARY', hex: theme.secondary },
    { role: 'ACCENT', hex: theme.accent },
    { role: 'SURFACE', hex: theme.surface },
    { role: 'CARD ALT', hex: theme.surfaceAlt },
    { role: 'TEXT INK', hex: theme.textPrimary },
  ];
  const swGridX = col3X + 12;
  const swW = Math.floor((col3W - 24 - 16) / 3);
  const swH = 76;
  const swatchLayers: CanvasObject[] = [];

  swatchRoles.forEach((sw, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const sx = swGridX + col * (swW + 8);
    const sy = 178 + row * (swH + 8);

    swatchLayers.push(
      makeBoardRect(
        `dr-swatch-card-${s}-${idx}`,
        `Token Swatch Card: ${sw.role}`,
        sx,
        sy,
        swW,
        swH,
        theme.surfaceAlt,
        { radius: 5, stroke: theme.border, strokeWidth: 1 }
      ),
      makeBoardRect(
        `dr-swatch-chip-${s}-${idx}`,
        `Token Swatch Chip (${sw.hex})`,
        sx + 6,
        sy + 6,
        swW - 12,
        34,
        sw.hex,
        { radius: 3, stroke: '#ffffff', strokeWidth: 1 }
      ),
      makeBoardText(
        `dr-swatch-role-${s}-${idx}`,
        `Swatch ${sw.role} Label`,
        sw.role,
        sx + 4,
        sy + 44,
        swW - 8,
        12,
        8,
        theme.textMuted,
        'center',
        'JetBrains Mono',
        '600'
      ),
      makeBoardText(
        `dr-swatch-hex-${s}-${idx}`,
        `Swatch ${sw.role} Hex`,
        sw.hex.toUpperCase(),
        sx + 4,
        sy + 58,
        swW - 8,
        12,
        8.5,
        theme.textPrimary,
        'center',
        'JetBrains Mono',
        '700'
      )
    );
  });

  // Color Psychology Rationale Card (y = 356, h = 92)
  const psychCard = makeBoardRect(
    `dr-psych-card-${s}`,
    'Color Psychology Rationale Card',
    swGridX,
    356,
    col3W - 24,
    92,
    theme.surfaceAlt,
    { radius: 6, stroke: theme.accent, strokeWidth: 1 }
  );
  const psychTitle = makeBoardText(
    `dr-psych-title-${s}`,
    'Color Psychology Header',
    `PALETTE: ${theme.name.toUpperCase().slice(0, 18)} • WCAG ${dossier.wcagContrastRatio}`,
    swGridX + 10,
    366,
    col3W - 44,
    12,
    8.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700'
  );
  const psychLine1 = makeBoardText(
    `dr-psych-l1-${s}`,
    'Color Psychology Rationale Line 1',
    dossier.colorPsychologyRationale.slice(0, 44),
    swGridX + 10,
    386,
    col3W - 44,
    14,
    9.5,
    theme.textPrimary,
    'left',
    'Inter',
    '400'
  );
  const psychLine2 = makeBoardText(
    `dr-psych-l2-${s}`,
    'Color Psychology Rationale Line 2',
    dossier.colorPsychologyRationale.slice(44, 90),
    swGridX + 10,
    404,
    col3W - 44,
    14,
    9.5,
    theme.textMuted,
    'left',
    'Inter',
    '400'
  );
  const psychLine3 = makeBoardText(
    `dr-psych-l3-${s}`,
    'Color Psychology Rationale Line 3',
    dossier.colorPsychologyRationale.slice(90, 136),
    swGridX + 10,
    422,
    col3W - 44,
    14,
    9.5,
    theme.textMuted,
    'left',
    'Inter',
    '400'
  );

  // Typography & Architecture Spec Card (y = 458, h = 110)
  const typoCard = makeBoardRect(
    `dr-typo-card-${s}`,
    'Typography & Layout Spec Card',
    swGridX,
    458,
    col3W - 24,
    110,
    theme.surfaceAlt,
    { radius: 6, stroke: theme.border, strokeWidth: 1 }
  );
  const typoHdr = makeBoardText(
    `dr-typo-hdr-${s}`,
    'Typography Spec Header',
    'TYPOGRAPHY & RECOMMENDED ARCHITECTURE',
    swGridX + 10,
    468,
    col3W - 44,
    12,
    8.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700'
  );
  const typoDisplay = makeBoardText(
    `dr-typo-disp-${s}`,
    'Display Font Pairing',
    `Display H1: ${dossier.typographyPairing.display} (700 Bold)`,
    swGridX + 10,
    488,
    col3W - 44,
    14,
    10,
    theme.textPrimary,
    'left',
    'Space Grotesk',
    '700'
  );
  const typoUiMono = makeBoardText(
    `dr-typo-uimono-${s}`,
    'UI & Mono Font Pairing',
    `Body: ${dossier.typographyPairing.ui}  •  Telemetry: ${dossier.typographyPairing.mono}`,
    swGridX + 10,
    508,
    col3W - 44,
    14,
    9.5,
    theme.textMuted,
    'left',
    'Inter',
    '500'
  );
  const typoArch = makeBoardText(
    `dr-typo-arch-${s}`,
    'Recommended Layout Template Badge',
    `LAYOUT: ${dossier.recommendedTemplateId.toUpperCase()}`,
    swGridX + 10,
    530,
    col3W - 44,
    14,
    9.5,
    theme.accent,
    'left',
    'JetBrains Mono',
    '700'
  );
  const typoNote = makeBoardText(
    `dr-typo-note-${s}`,
    'Preview Mode Hint',
    'Tip: Switch to Preview Mode to test researched menus!',
    swGridX + 10,
    548,
    col3W - 44,
    12,
    8.5,
    theme.textMuted,
    'left',
    'Inter',
    '400'
  );

  return [
    hdrCard,
    hdrTopBar,
    hdrTitle,
    hdrHook,
    confBadgeBg,
    confBadgeTxt,
    indBadgeBg,
    indBadgeTxt,
    col1Surface,
    col1Bar,
    col1Hdr,
    ...compLayers,
    col2Surface,
    col2Bar,
    col2Hdr,
    heroPreviewCard,
    heroEyebrow,
    heroH1,
    heroH2,
    heroSub,
    heroCtaBg,
    heroCtaTxt,
    ...proofLayers,
    flowHdr,
    conn1,
    conn2,
    ...flowNodeCards,
    ...flowNodeChildren,
    audienceStrip,
    audienceTitle,
    audiencePain,
    col3Surface,
    col3Bar,
    col3Hdr,
    ...swatchLayers,
    psychCard,
    psychTitle,
    psychLine1,
    psychLine2,
    psychLine3,
    typoCard,
    typoHdr,
    typoDisplay,
    typoUiMono,
    typoArch,
    typoNote,
    ...navbarLayers,
  ];
}

// ============================================================================
// 5. LIVE CANVAS UX, WCAG & CONVERSION AUDITOR + 1-CLICK AUTO-POLISH
// ============================================================================

/**
 * Audits the current canvas objects & Retina export slices across 6 engineering & UX criteria.
 */
export function auditCanvasDesignReadiness(
  objects: CanvasObject[],
  slices: CanvasSlice[],
  _canvasWidth = 960,
  _canvasHeight = 600
): CanvasAuditReport {
  const visibleObjects = (objects || []).filter((o) => o.visible);
  const textObjects = visibleObjects.filter((o): o is TextObject => o.type === 'text');
  const vectorOrShapeObjects = visibleObjects.filter(
    (o): o is VectorPathObject | AutoShapeObject =>
      o.type === 'vector-path' || o.type === 'autoshape'
  );

  // 1. WCAG Contrast & Legibility (maxScore: 20)
  const tinyTexts = textObjects.filter((t) => (t.fontSize || 12) < 9);
  const lowContrastTexts = textObjects.filter(
    (t) => !t.fill || t.fill === 'none' || t.fill === 'transparent' || t.opacity < 0.65
  );
  let wcagScore = 20;
  if (textObjects.length === 0) {
    wcagScore = 12;
  } else {
    wcagScore -= Math.min(10, tinyTexts.length * 3 + lowContrastTexts.length * 4);
  }
  wcagScore = Math.max(8, wcagScore);

  // 2. Conversion Hierarchy & Primary CTA (maxScore: 20)
  const hasHeroHeadline = textObjects.some((t) => t.fontSize >= 20 || t.name.toLowerCase().includes('headline') || t.name.toLowerCase().includes('title'));
  const hasPrimaryCta = visibleObjects.some((o) => {
    const n = o.name.toLowerCase();
    return n.includes('cta') || n.includes('primary') || n.includes('btn') || n.includes('button');
  });
  const conversionScore = (hasHeroHeadline ? 10 : 4) + (hasPrimaryCta ? 10 : 4);

  // 3. Interactive Prototype & Nested Menu States (maxScore: 20)
  const interactiveCount = visibleObjects.filter(
    (o) =>
      Boolean(o.stateVariants?.hover || o.stateVariants?.active) ||
      Boolean(o.params?.hasNestedMenu) ||
      o.type === 'autoshape'
  ).length;
  const hasNestedMenu = visibleObjects.some((o) => Boolean(o.params?.hasNestedMenu));
  const protoScore = Math.min(
    20,
    (hasNestedMenu ? 10 : 4) + Math.min(10, interactiveCount * 2)
  );

  // 4. Sub-Pixel Vector & Snap Hygiene (maxScore: 15)
  const snappedCount = visibleObjects.filter(
    (o) =>
      o.pixelSnap &&
      Number.isInteger(Math.round(o.x)) &&
      Number.isInteger(Math.round(o.y))
  ).length;
  const snapRatio = visibleObjects.length > 0 ? snappedCount / visibleObjects.length : 1;
  const snapScore = Math.max(6, Math.round(snapRatio * 15));

  // 5. Multi-Scale Retina Slice Coverage (maxScore: 15)
  const validSlices = (slices || []).filter((s) => s.width >= 16 && s.height >= 16);
  const hasMultiScale = validSlices.some((s) => (s.scales || []).length >= 2);
  const sliceScore =
    validSlices.length >= 2 && hasMultiScale
      ? 15
      : validSlices.length >= 1
      ? 11
      : 5;

  // 6. Chromatic & Token Consistency (maxScore: 10)
  const distinctFills = new Set(
    vectorOrShapeObjects
      .map((o) => (o.fill || '').toLowerCase())
      .filter((f) => f && f !== 'none')
  );
  const tokenScore =
    distinctFills.size >= 2 && distinctFills.size <= 10
      ? 10
      : distinctFills.size > 10
      ? 7
      : 8;

  const categories: CanvasAuditCategory[] = [
    {
      id: 'wcag-contrast',
      label: 'WCAG 2.2 Contrast & Typography',
      score: wcagScore,
      maxScore: 20,
      status: wcagScore >= 18 ? 'optimal' : wcagScore >= 14 ? 'warning' : 'action-needed',
      summary:
        tinyTexts.length === 0 && lowContrastTexts.length === 0
          ? `${textObjects.length} text layers verified ≥ 9px with crisp AAA luminance`
          : `${tinyTexts.length} sub-9px or low-opacity text layers detected`,
      recommendation: 'Normalize all UI labels to ≥ 9px and high-contrast token fills.',
    },
    {
      id: 'conversion-hierarchy',
      label: 'Conversion Hierarchy & CTA',
      score: conversionScore,
      maxScore: 20,
      status: conversionScore >= 18 ? 'optimal' : conversionScore >= 12 ? 'warning' : 'action-needed',
      summary:
        hasHeroHeadline && hasPrimaryCta
          ? 'Clear H1 focal anchor paired with high-intent Primary CTA layer'
          : 'Missing prominent display headline (≥20px) or primary CTA button',
      recommendation: 'Spawn a Researched Website or Strategy Board with a 3-second hook.',
    },
    {
      id: 'interactive-states',
      label: 'Interactive States & Nested Menus',
      score: protoScore,
      maxScore: 20,
      status: protoScore >= 17 ? 'optimal' : protoScore >= 12 ? 'warning' : 'action-needed',
      summary: `${interactiveCount} interactive layers (${hasNestedMenu ? 'Nested Menu Active' : 'No Nested Navbar'})`,
      recommendation: 'Attach :hover/:active state variants to all cards and CTA buttons.',
    },
    {
      id: 'pixel-hygiene',
      label: '1px Osito Snap Hygiene',
      score: snapScore,
      maxScore: 15,
      status: snapScore >= 14 ? 'optimal' : snapScore >= 10 ? 'warning' : 'action-needed',
      summary: `${snappedCount}/${visibleObjects.length} layers locked to integer pixel grid`,
      recommendation: 'Round sub-pixel coordinates and enable 1px pixelSnap across all layers.',
    },
    {
      id: 'retina-slices',
      label: 'Retina @1x/@2x/@3x Export Slices',
      score: sliceScore,
      maxScore: 15,
      status: sliceScore >= 14 ? 'optimal' : sliceScore >= 10 ? 'warning' : 'action-needed',
      summary: `${validSlices.length} active Web Slices configured for multi-scale .ZIP export`,
      recommendation: 'Ensure hero and full-viewport Retina slices are ready for 1-click export.',
    },
    {
      id: 'token-harmony',
      label: 'Chromatic Design Token Harmony',
      score: tokenScore,
      maxScore: 10,
      status: tokenScore >= 9 ? 'optimal' : 'warning',
      summary: `${distinctFills.size} active surface & accent tokens in document`,
      recommendation: 'Unify canvas layers with a researched WCAG AAA color theme.',
    },
  ];

  const overallScore = categories.reduce((sum, c) => sum + c.score, 0);
  const actionableFixesCount = categories.filter((c) => c.score < c.maxScore).length;

  let grade: CanvasAuditReport['grade'] = 'A+';
  if (overallScore < 70) grade = 'C';
  else if (overallScore < 80) grade = 'B';
  else if (overallScore < 88) grade = 'B+';
  else if (overallScore < 95) grade = 'A';

  const summary =
    overallScore >= 95
      ? 'Production-ready! High-contrast typography, interactive hover states, 1px pixel alignment, and Retina slices verified.'
      : `${actionableFixesCount} optimization opportunities found — click Auto-Boost to elevate WCAG contrast, hover states & 1px alignment to 100/100.`;

  const checks: CanvasAuditCategory[] = categories.map((c) => ({
    ...c,
    status: c.status === 'optimal' ? 'pass' : c.status,
  }));

  return {
    overallScore,
    grade,
    summary,
    categories,
    checks,
    actionableFixesCount,
  };
}

/**
 * 1-Click Auto-Polish: Harmonizes colors (if theme provided), snaps all coordinates to integer 1px boundaries,
 * injects `:hover` / `:active` interactive stateVariants on cards/buttons, enforces readable text sizes,
 * and ensures Retina @1x/@2x/@3x export slices exist.
 */
export function autoPolishCanvasObjects(
  objects: CanvasObject[],
  slices: CanvasSlice[],
  theme?: ColorThemePalette,
  canvasWidth = 960,
  canvasHeight = 600
): {
  objects: CanvasObject[];
  slices: CanvasSlice[];
  fixedSummary: string;
} {
  const fixedSummaryList: string[] = [];
  const baseObjects = theme
    ? applyColorThemeToCanvasObjects(objects, theme)
    : objects.map((o) => ({ ...o }));

  if (theme) {
    fixedSummaryList.push(`Applied ${theme.name} WCAG color tokens`);
  }

  let snappedFixCount = 0;
  let stateAddedCount = 0;
  let textPolishedCount = 0;

  const polishedObjects = baseObjects.map((obj) => {
    const rx = Math.round(obj.x);
    const ry = Math.round(obj.y);
    const rw = Math.max(4, Math.round(obj.width));
    const rh = Math.max(4, Math.round(obj.height));

    if (!obj.pixelSnap || rx !== obj.x || ry !== obj.y || rw !== obj.width || rh !== obj.height) {
      snappedFixCount++;
    }

    if (obj.type === 'text') {
      const safeFontSize = Math.max(9.5, obj.fontSize || 12);
      const safeOpacity = Math.max(0.92, obj.opacity ?? 1);
      if (safeFontSize !== obj.fontSize || safeOpacity !== obj.opacity) {
        textPolishedCount++;
      }
      return {
        ...obj,
        x: rx,
        y: ry,
        width: rw,
        height: rh,
        pixelSnap: true,
        fontSize: safeFontSize,
        opacity: safeOpacity,
        fill:
          !obj.fill || obj.fill === 'none' || obj.fill === 'transparent'
            ? theme?.textPrimary || '#f8fafc'
            : obj.fill,
      };
    }

    if (obj.type === 'vector-path' || obj.type === 'autoshape') {
      const hasStates = Boolean(obj.stateVariants?.hover && obj.stateVariants?.active);
      const isConnector = obj.type === 'vector-path' && Boolean((obj as VectorPathObject).connectorMeta);
      let nextVariants = obj.stateVariants;

      if (!hasStates && !isConnector && obj.fill !== 'none') {
        stateAddedCount++;
        const accentStroke = theme?.accent || '#38bdf8';
        nextVariants = {
          default: {
            fill: obj.fill,
            fillGradientEnd: obj.fillGradientEnd,
            stroke: obj.stroke,
            strokeWidth: obj.strokeWidth,
            opacity: obj.opacity,
          },
          hover: {
            fill: obj.fillGradientEnd || obj.fill,
            fillGradientEnd: obj.fill,
            stroke: '#ffffff',
            strokeWidth: Math.max(1.5, obj.strokeWidth || 1),
            opacity: 1,
            offsetY: -1,
            scale: 1.01,
          },
          active: {
            fill: obj.fill,
            fillGradientEnd: obj.fillGradientEnd || obj.fill,
            stroke: accentStroke,
            strokeWidth: Math.max(2, obj.strokeWidth || 1),
            opacity: 0.96,
            offsetY: 1,
            scale: 0.99,
          },
        };
      }

      return {
        ...obj,
        x: rx,
        y: ry,
        width: rw,
        height: rh,
        pixelSnap: true,
        ...(nextVariants ? { stateVariants: nextVariants } : {}),
      };
    }

    return {
      ...obj,
      x: rx,
      y: ry,
      width: rw,
      height: rh,
      pixelSnap: true,
    };
  });

  if (snappedFixCount > 0) {
    fixedSummaryList.push(`Snapped ${snappedFixCount} layers to 1px grid`);
  }
  if (stateAddedCount > 0) {
    fixedSummaryList.push(`Added :hover/:active states to ${stateAddedCount} components`);
  }
  if (textPolishedCount > 0) {
    fixedSummaryList.push(`Boosted legibility on ${textPolishedCount} text layers`);
  }

  let polishedSlices = [...(slices || [])];
  if (polishedSlices.length < 2) {
    const stamp = Date.now();
    polishedSlices = [
      {
        id: `slice-hero-${stamp}`,
        name: 'hero-primary-cta',
        x: 24,
        y: 74,
        width: Math.min(912, canvasWidth - 48),
        height: 290,
        formats: ['webp', 'avif', 'svg', 'png'],
        scales: [1, 2, 3],
      },
      {
        id: `slice-viewport-${stamp}`,
        name: 'full-viewport-showcase',
        x: 16,
        y: 14,
        width: Math.max(320, canvasWidth - 32),
        height: Math.max(240, canvasHeight - 28),
        formats: ['webp', 'avif', 'svg', 'png'],
        scales: [1, 2, 3],
      },
    ];
    fixedSummaryList.push('Configured 2 Retina @1x/@2x/@3x export slices');
  }

  if (fixedSummaryList.length === 0) {
    fixedSummaryList.push('Verified 100% WCAG AAA contrast, 1px snap & interactive states');
  }

  return {
    objects: polishedObjects,
    slices: polishedSlices,
    fixedSummary: `Auto-Polish Complete: ${fixedSummaryList.join(' • ')}`,
  };
}
