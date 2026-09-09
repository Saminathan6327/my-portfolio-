/**
 * Portfolio Data Source
 * Reflects Saminathan M's AI & Data Science background and PDF resume credentials
 */

export const PERSONAL_INFO = {
  name: "Saminathan M",
  handle: "saminathan_ai",
  title: "AI & Data Science Specialist | Machine Learning Engineer",
  subTitle: "Turning complex data into direction.",
  bio: "AI & Data Science undergraduate (SRMIST) with practical experience in machine learning pipelines, deep learning (NLP/CV), and full-stack development. Proficient in Python and TensorFlow, aiming to apply predictive modeling and analytical skills to real-world AI engineering challenges.",
  status: "Available for Work & Collaboration",
  location: "Thanjavur, Tamil Nadu, India",
  email: "saminathan6327@gmail.com",
  github: "https://github.com/Saminathan6327",
  linkedin: "https://www.linkedin.com/in/sami-nathan6327/",
  resumeUrl: "#contact"
};

export const TERMINAL_COMMANDS = {
  help: `<div class="help-container">
  <div class="help-title">Available Commands</div>
  <div class="help-grid">
    <div class="help-row"><span class="cmd-link" data-cmd="me">me</span> <span class="help-desc">Profile & bio summary</span></div>
    <div class="help-row"><span class="cmd-link" data-cmd="skills">skills</span> <span class="help-desc">Technical stack & competencies</span></div>
    <div class="help-row"><span class="cmd-link" data-cmd="projects">projects</span> <span class="help-desc">Featured AI/ML & security projects</span></div>
    <div class="help-row"><span class="cmd-link" data-cmd="experience">experience</span> <span class="help-desc">Career & internship history</span></div>
    <div class="help-row"><span class="cmd-link" data-cmd="contact">contact</span> <span class="help-desc">Email & social links</span></div>
    <div class="help-row"><span class="cmd-link" data-cmd="clear">clear</span> <span class="help-desc">Clear terminal screen</span></div>
  </div>
  <div class="help-tip">💡 Click any green command or chip to navigate directly to that section.</div>
</div>`,

  me: `Saminathan M — AI & Data Science Undergraduate (SRMIST) & ML Intern
Focus: Machine Learning Pipelines, Deep Learning (NLP/CV), Data Analytics, Zero-Trust AI.
Location: Thanjavur / Tiruchirappalli, Tamil Nadu
Status: Ready for high-impact AI/ML engineering, research, and data science roles.`,

  whoami: `Saminathan M — AI & Data Science Undergraduate (SRMIST) & ML Intern
Focus: Machine Learning Pipelines, Deep Learning (NLP/CV), Data Analytics, Zero-Trust AI.
Location: Thanjavur / Tiruchirappalli, Tamil Nadu
Status: Ready for high-impact AI/ML engineering, research, and data science roles.`,

  skills: `Core Technical Competencies:
[AI & Data]   Python, TensorFlow, Scikit-Learn, Pandas, NLP, Data Visualization
[Web/Full-Stack] React.js, Vite, Tailwind CSS, Node.js, Express.js, MongoDB, Firebase, HTML, CSS, JavaScript
[DevOps & Tools] Git, GitHub, Docker, VS Code, SQL, Streamlit, Flask`,

  projects: `Featured Projects:
1. NGO Data Pipeline Engine [SQL · R · Python · Pandas] -> Automated student tracking for non-profits
2. Zero-Trust AI Security Pipeline [Python · FastAPI · Docker · Scikit-Learn] -> Real-time payload sanitization & mTLS
3. RAG Document Chatbot [Python · Gemini · Vector Search] -> Context-grounded Q&A engine`,

  experience: `Professional Experience:
• Machine Learning Intern @ Accent Techno Soft (Jun 2026 – Jul 2026)
  - Engineered NLP & CV training pipelines with Python & TensorFlow, cutting latency by 18%.
  - Processed 15+ datasets (100k+ records) with Pandas/NumPy, cutting data prep time by 25%.
  - Implemented neural network classification models, boosting validation accuracy by 14%.`,

  contact: `Get in Touch:
Email:    <a href="mailto:saminathan6327@gmail.com" class="terminal-link">saminathan6327@gmail.com</a>
Location: Thanjavur, Tamil Nadu
GitHub:   <a href="https://github.com/Saminathan6327" target="_blank" rel="noopener noreferrer" class="terminal-link">https://github.com/Saminathan6327</a>
LinkedIn: <a href="https://www.linkedin.com/in/sami-nathan6327/" target="_blank" rel="noopener noreferrer" class="terminal-link">https://www.linkedin.com/in/sami-nathan6327/</a>`
};

export const SKILL_CATEGORIES = [
  { id: "all", label: "All Skills" },
  { id: "ai", label: "AI & Data Science" },
  { id: "web", label: "Web & Full-Stack" },
  { id: "tools", label: "DevOps & Tools" }
];

export const SKILLS = [
  // AI & Data Science
  { name: "Python", category: "ai", level: 95, tag: "Primary" },
  { name: "TensorFlow", category: "ai", level: 90, tag: "Deep Learning" },
  { name: "Scikit-Learn", category: "ai", level: 92, tag: "ML" },
  { name: "Pandas & NumPy", category: "ai", level: 95, tag: "Data Wrangling" },
  { name: "Natural Language Processing (NLP)", category: "ai", level: 88, tag: "Deep Learning" },
  { name: "Computer Vision", category: "ai", level: 86, tag: "Vision" },
  { name: "Data Visualization", category: "ai", level: 90, tag: "Analytics" },

  // Web / Full-Stack
  { name: "React.js & Vite", category: "web", level: 88, tag: "Frontend" },
  { name: "Tailwind CSS", category: "web", level: 90, tag: "Styling" },
  { name: "Node.js & Express.js", category: "web", level: 86, tag: "Backend" },
  { name: "MongoDB & Firebase", category: "web", level: 84, tag: "Database" },
  { name: "HTML, CSS & JavaScript", category: "web", level: 92, tag: "Core Web" },

  // DevOps & Tools
  { name: "Git & GitHub", category: "tools", level: 92, tag: "VCS" },
  { name: "Docker", category: "tools", level: 85, tag: "Containers" },
  { name: "SQL", category: "tools", level: 90, tag: "Database" },
  { name: "Streamlit & Flask", category: "tools", level: 88, tag: "ML Serving" },
  { name: "VS Code", category: "tools", level: 95, tag: "IDE" }
];

export const PROJECTS = [
  {
    id: "ngo-pipeline",
    title: "NGO Data Pipeline Engine",
    subtitle: "2025 – 2026 · SQL · R · Python · Pandas",
    category: "data",
    geometryType: "torusKnot",
    gridShape: "diamond",
    color: "#10b981",
    description: "Developed an end-to-end data pipeline designed to identify and track at-risk students for Non-Governmental Organizations.",
    tags: ["SQL", "R", "Python", "Pandas", "ETL Pipelines", "Data Analytics"],
    github: "https://github.com/Saminathan6327",
    demo: "#",
    highlights: [
      "Developed an end-to-end data pipeline designed to identify and track at-risk students for Non-Governmental Organizations.",
      "Processed comprehensive multi-variable student datasets, optimizing query runtime and delivering automated, actionable visual reports for stakeholders to improve outreach targeting."
    ]
  },
  {
    id: "zero-trust-ai",
    title: "Zero-Trust AI Security Pipeline",
    subtitle: "2025 – 2026 · Python · FastAPI · Scikit-Learn · Docker · JWT · Cryptography",
    category: "ai",
    geometryType: "octahedron",
    gridShape: "hexagon",
    color: "#3b82f6",
    description: "Architected a Zero-Trust machine learning pipeline implementing continuous verification, role-based access controls (RBAC), and mutual TLS (mTLS) for microservice-to-model communications.",
    tags: ["Python", "FastAPI", "Scikit-Learn", "Docker", "JWT", "Cryptography", "Zero-Trust"],
    github: "https://github.com/Saminathan6327",
    demo: "#",
    highlights: [
      "Architected a Zero-Trust machine learning pipeline implementing continuous verification, role-based access controls (RBAC), and mutual TLS (mTLS) for microservice-to-model communications.",
      "Implemented real-time inference guardrails and input anomaly detection algorithms to sanitize payloads, mitigating adversarial injection attacks and data poisoning with 99% validation accuracy."
    ]
  },
  {
    id: "rag-chatbot",
    title: "RAG Document Chatbot",
    subtitle: "Python · Google Gemini · Pinecone",
    category: "ai",
    geometryType: "icosahedron",
    gridShape: "star",
    color: "#8b5cf6",
    description: "A Retrieval-Augmented Generation (RAG) chatbot built with Python, Google Gemini LLM, and Pinecone vector database for document search and context-grounded Q&A.",
    tags: ["RAG", "Python", "Google Gemini", "Pinecone", "Vector Search"],
    github: "https://github.com/Saminathan6327",
    demo: "#",
    highlights: [
      "Integrated Google Gemini AI model for high-accuracy contextual response generation.",
      "Engineered vector embedding index pipelines using Pinecone for instant document retrieval.",
      "Built robust prompt boundaries to eliminate hallucinations and enforce source grounding."
    ]
  }
];

export const EXPERIENCES = [
  {
    role: "Machine Learning Intern",
    company: "Accent Techno Soft",
    period: "Jun 2026 – Jul 2026",
    location: "Tamil Nadu, India",
    description: "Engineered and optimized machine learning pipelines, deep learning models, and complex data preprocessing routines for high-accuracy AI systems.",
    achievements: [
      "Engineered and optimized NLP and Computer Vision training pipelines using Python and TensorFlow, reducing model inference latency by 18%.",
      "Cleaned and structured 15+ complex datasets exceeding 100k+ records using Pandas and NumPy, cutting data preparation time by 25% and ensuring zero null leakage for neural network training.",
      "Implemented neural network classification models and backpropagation routines across 10+ code reviews, boosting baseline validation accuracy by 14%."
    ],
    skills: ["Python", "TensorFlow", "Pandas", "NumPy", "NLP", "Computer Vision", "Scikit-Learn"]
  }
];

export const ACHIEVEMENTS = [
  {
    title: "Google Data Analytics Professional Certificate",
    issuer: "Google / Coursera",
    date: "Certified",
    description: "Comprehensive professional program covering data analysis, SQL queries, R programming, data cleaning, and automated visualization reporting."
  },
  {
    title: "AWS Cloud Practitioner Essentials",
    issuer: "Amazon Web Services (AWS)",
    date: "Certified",
    description: "Foundational mastery of cloud concepts, security, architecture, compute services, and AWS cloud deployment best practices."
  },
  {
    title: "Introduction to SageMaker Unified Studio",
    issuer: "Amazon Web Services (AWS)",
    date: "Certified",
    description: "Hands-on expertise in machine learning development environments, model training, feature stores, and automated MLOps pipelines."
  },
  {
    title: "Building Language Models on AWS",
    issuer: "Amazon Web Services (AWS)",
    date: "Certified",
    description: "Specialized training on constructing, fine-tuning, and deploying modern Large Language Models and generative AI solutions on AWS infrastructure."
  }
];

