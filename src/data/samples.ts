export type InterviewItem = {
  id: string;
  spoken: string;
  source: "EN" | "UR";
  topic: string;
  glosses: string[];
};

/** Phrases the Deaf/Mute user is "signing" -> streamed into the subtitle tray. */
export const signerPhrases: string[] = [
  "I have two years of experience in Python and database management.",
  "In my previous role I led a team of four backend engineers.",
  "I specialize in scalable system design and clean architecture.",
  "Let me walk you through my approach to this problem.",
  "I am comfortable working in fast-paced Agile environments.",
  "I reduced our API latency by forty percent last quarter.",
];

/** Spoken interviewer questions -> split/re-ordered into structured sign glosses. */
export const interviewQuestions: InterviewItem[] = [
  {
    id: "q1",
    spoken: "Can you explain your experience with SQL databases?",
    source: "EN",
    topic: "Backend · Databases",
    glosses: ["EXPLAIN", "YOUR", "EXPERIENCE", "SQL", "DATABASE", "Q_MARK"],
  },
  {
    id: "q2",
    spoken: "How would you design a scalable microservices architecture?",
    source: "EN",
    topic: "System Design",
    glosses: ["HOW", "DESIGN", "SCALABLE", "MICRO-SERVICE", "ARCHITECTURE", "Q_MARK"],
  },
  {
    id: "q3",
    spoken: "Aap machine learning mein kitna experience rakhte hain?",
    source: "UR",
    topic: "ML · Urdu",
    glosses: ["YOU", "MACHINE-LEARNING", "EXPERIENCE", "HOW-MUCH", "Q_MARK"],
  },
  {
    id: "q4",
    spoken: "Describe a time you optimized a slow database query.",
    source: "EN",
    topic: "Performance",
    glosses: ["DESCRIBE", "PAST", "OPTIMIZE", "SLOW", "DATABASE", "QUERY"],
  },
  {
    id: "q5",
    spoken: "What is your approach to debugging complex production issues?",
    source: "EN",
    topic: "Engineering",
    glosses: ["YOUR", "APPROACH", "DEBUG", "COMPLEX", "PROBLEM", "Q_MARK"],
  },
];

export type GlossaryToken = {
  token: string;
  full: string;
  category:
    | "Concept"
    | "Database"
    | "Backend"
    | "Frontend"
    | "Testing"
    | "Ops"
    | "Language"
    | "Custom";
};

export const glossaryTokens: GlossaryToken[] = [
  { token: "AI", full: "Artificial Intelligence", category: "Concept" },
  { token: "ML", full: "Machine Learning", category: "Concept" },
  { token: "SQL", full: "Structured Query Language", category: "Database" },
  { token: "API", full: "Application Programming Interface", category: "Backend" },
  { token: "QA Testing", full: "Quality Assurance Testing", category: "Testing" },
  { token: "React", full: "Frontend UI Framework", category: "Frontend" },
  { token: "DevOps", full: "Development & Operations", category: "Ops" },
  { token: "Python", full: "Programming Language", category: "Language" },
  { token: "Node.js", full: "JavaScript Runtime", category: "Backend" },
  { token: "Agile", full: "Iterative Methodology", category: "Ops" },
  { token: "CI/CD", full: "Continuous Integration / Delivery", category: "Ops" },
  { token: "REST", full: "API Architecture Style", category: "Backend" },
];

export type ProfileConfig = {
  profile: string;
  dialect: string;
  dialectShort: string;
  target: string;
};

export const profile: ProfileConfig = {
  profile: "Signer (Expert)",
  dialect: "Pakistani Sign Language",
  dialectShort: "PSL",
  target: "English / Urdu",
};

export type EngineMetric = {
  label: string;
  value: string;
  hint: string;
  tone: "emerald" | "sky" | "violet";
};

export const engineMetrics: EngineMetric[] = [
  {
    label: "Tracking",
    value: "MediaPipe Holistic",
    hint: "543 Landmarks",
    tone: "emerald",
  },
  { label: "FPS", value: "60", hint: "Real-Time", tone: "sky" },
  { label: "Engine", value: "Local TFLite", hint: "INT8 Quantized", tone: "violet" },
];
