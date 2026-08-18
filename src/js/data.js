/**
 * Portfolio Data Source
 * Combines Saminathan's AI/ML Engineering background with Yash Pandav's structural UX data
 */

export const PERSONAL_INFO = {
  name: "Saminathan M",
  handle: "saminathan_ai",
  title: "AI Engineer & Machine Learning Specialist",
  subTitle: "Turning complex data into direction.",
  bio: "Artificial Intelligence undergraduate at SRM Institute of Science and Technology and Machine Learning Intern at Accent Techno Soft. Specializing in end-to-end data pipelines, predictive modeling, NLP, and Agentic AI architectures.",
  status: "Available for Work & Collaboration",
  location: "Tamil Nadu & Gujarat, India",
  email: "saminathan6327@gmail.com",
  github: "https://github.com/Saminathan6327",
  linkedin: "https://www.linkedin.com/in/sami-nathan6327/",
  twitter: "https://twitter.com/saminathan_ml",
  resumeUrl: "#contact"
};

export const TERMINAL_COMMANDS = {
  help: `Available commands:
  • <span class="cmd-highlight">whoami</span>      - Display professional profile summary
  • <span class="cmd-highlight">skills</span>      - List core technical competencies
  • <span class="cmd-highlight">projects</span>    - Display featured AI/ML & Web projects
  • <span class="cmd-highlight">experience</span>  - View career history and internships
  • <span class="cmd-highlight">contact</span>     - Display email and social channels
  • <span class="cmd-highlight">clear</span>       - Clear terminal window text`,

  whoami: `Saminathan M — AI Undergraduate & Machine Learning Intern
Focus: Data Pipelines, Predictive Analytics, RAG Architectures, Computer Vision & NLP.
Location: SRM Institute of Science & Technology | Accent Techno Soft
Status: Ready for high-impact AI/ML research and full-stack engineering roles.`,

  skills: `Core Technical Competencies:
[Languages]   Python, SQL, R, JavaScript, TypeScript, C++
[ML & Data]   Scikit-Learn, TensorFlow, PyTorch, Pandas, NumPy, OpenCV, NLTK
[Agentic AI]  LangChain, RAG Pipelines, VectorDB (Chroma/Pinecone), FastApi
[Web Stack]   HTML5, CSS3, TailwindCSS, React, Node.js, WebGL/Three.js`,

  projects: `Selected Featured Projects:
1. NGO Data Pipeline Engine [SQL + R] -> Automated at-risk student tracking
2. RAG Document Chatbot [Python + Gemini + Pinecone] -> Context-grounded Q&A engine
3. 20-Day Portfolio Sprint [Python + SQL + Algorithms] -> Micro-project engineering suite`,

  experience: `Professional Experience:
• ML Intern @ Accent Techno Soft (2024 - Present)
  - Developed predictive machine learning models and optimized NLP data pipelines.`,

  contact: `Get in Touch:
Email:    <a href="mailto:saminathan6327@gmail.com" class="terminal-link">saminathan6327@gmail.com</a>
GitHub:   <a href="https://github.com/Saminathan6327" target="_blank" rel="noopener noreferrer" class="terminal-link">https://github.com/Saminathan6327</a>
LinkedIn: <a href="https://www.linkedin.com/in/sami-nathan6327/" target="_blank" rel="noopener noreferrer" class="terminal-link">https://www.linkedin.com/in/sami-nathan6327/</a>`
};

export const SKILL_CATEGORIES = [
  { id: "all", label: "All Skills" },
  { id: "ai", label: "AI & Machine Learning" },
  { id: "frontend", label: "Frontend & 3D" },
  { id: "backend", label: "Backend & Systems" },
  { id: "data", label: "Data & Pipelines" }
];

export const SKILLS = [
  { name: "Python", category: "ai", level: 95, tag: "Primary" },
  { name: "TensorFlow & PyTorch", category: "ai", level: 90, tag: "Deep Learning" },
  { name: "Scikit-Learn", category: "ai", level: 92, tag: "ML" },
  { name: "LangChain & RAG", category: "ai", level: 88, tag: "GenAI" },
  { name: "Computer Vision (OpenCV)", category: "ai", level: 85, tag: "Vision" },
  { name: "Natural Language Processing", category: "ai", level: 87, tag: "NLP" },

  { name: "JavaScript (ES6+)", category: "frontend", level: 90, tag: "Core" },
  { name: "Three.js / WebGL", category: "frontend", level: 82, tag: "3D Rendering" },
  { name: "HTML5 & Vanilla CSS", category: "frontend", level: 95, tag: "UI/UX" },
  { name: "Tailwind CSS", category: "frontend", level: 90, tag: "Styling" },

  { name: "Node.js & Express", category: "backend", level: 86, tag: "Backend" },
  { name: "FastAPI & REST APIs", category: "backend", level: 90, tag: "API Engine" },
  { name: "C++ Systems", category: "backend", level: 78, tag: "Algorithms" },

  { name: "SQL & PostgreSQL", category: "data", level: 92, tag: "Database" },
  { name: "R & Statistical Modeling", category: "data", level: 85, tag: "Analytics" },
  { name: "Pandas & NumPy", category: "data", level: 95, tag: "Data Wrangling" },
  { name: "Vector Databases (Chroma)", category: "data", level: 88, tag: "Vector DB" }
];

export const PROJECTS = [
  {
    id: "ngo-pipeline",
    title: "NGO Data Pipeline Engine",
    subtitle: "SQL + R · Multi-Variable Educational Analytics",
    category: "data",
    geometryType: "torusKnot",
    gridShape: "diamond",
    color: "#10b981",
    description: "An end-to-end data pipeline designed to process comprehensive student demographic and performance data for non-profit organizations to identify and track at-risk students in real-time.",
    tags: ["SQL", "R", "ETL Pipelines", "Data Analytics", "Predictive Modeling"],
    github: "https://github.com/Saminathan6327/ngo-data-pipeline",
    demo: "#",
    highlights: [
      "Processed over 50,000+ student data points with automated cleaning and validation.",
      "Achieved 94% accuracy in predicting dropout risk factors using multivariate logistic regression.",
      "Built interactive dashboard reporting for field operations and resource allocation."
    ]
  },
  {
    id: "rag-chatbot",
    title: "RAG Document Chatbot",
    subtitle: "Python + Google Gemini + Pinecone",
    category: "ai",
    geometryType: "octahedron",
    gridShape: "hexagon",
    color: "#3b82f6",
    description: "A Retrieval-Augmented Generation (RAG) chatbot built with Python, Google Gemini LLM, and Pinecone vector database for document search and context-grounded Q&A.",
    tags: ["RAG", "Python", "Google Gemini", "Pinecone", "Vector Search"],
    github: "https://github.com/Saminathan6327/rag-chatbot",
    demo: "#",
    highlights: [
      "Integrated Google Gemini AI model for high-accuracy contextual response generation.",
      "Engineered vector embedding index pipelines using Pinecone for instant document retrieval.",
      "Built robust prompt boundaries to eliminate hallucinations and enforce source grounding."
    ]
  },
  {
    id: "portfolio-sprint",
    title: "20-Day Portfolio Sprint",
    subtitle: "Python + SQL + Algorithms",
    category: "data",
    geometryType: "icosahedron",
    gridShape: "star",
    color: "#8b5cf6",
    description: "A 20-day sprint of Python, SQL, and algorithm micro-projects engineered for technical problem solving, algorithm design, and technical interview preparation.",
    tags: ["Python", "SQL", "Algorithms", "Data Structures", "Interview Prep"],
    github: "https://github.com/Saminathan6327/20-Day-Portfolio-Sprint",
    demo: "#",
    highlights: [
      "Completed 20 modular daily sprints spanning data structures, SQL optimization, and Python scripts.",
      "Benchmarked algorithmic space/time complexity for production code efficiency.",
      "Structured clean modular code repositories with comprehensive test coverage."
    ]
  }
];

export const EXPERIENCES = [
  {
    role: "Machine Learning Intern",
    company: "Accent Techno Soft",
    period: "2024 – Present",
    location: "Coimbatore, India",
    description: "Working on enterprise machine learning pipelines, NLP feature extraction, and predictive algorithm optimizations for client applications.",
    achievements: [
      "Refactored data preprocessing modules, improving ETL pipeline throughput by 35%.",
      "Developed fine-tuned NLP classification models for customer sentiment and automated ticket routing.",
      "Collaborated with senior software architects to deploy production ML APIs."
    ],
    skills: ["Python", "Scikit-Learn", "FastAPI", "NLP", "Pandas"]
  }
];

export const ACHIEVEMENTS = [
  {
    title: "Google Data Analytics Professional",
    issuer: "Google / Coursera",
    date: "2025",
    description: "Successfully completed advanced coursework and a technical capstone focused on SQL, R programming, data pipelines, and visual reporting."
  },
  {
    title: "AWS Cloud & Machine Learning Certifications",
    issuer: "Amazon Web Services (AWS)",
    date: "2024 - 2025",
    description: "Earned multiple technical credentials including AWS Cloud Practitioner, SageMaker Unified Studio, Foundations of Prompt Engineering, and Building Language Models."
  },
  {
    title: "AI: Constraint Satisfaction Certification",
    issuer: "NPTEL",
    date: "2025",
    description: "Cleared advanced academic curriculum and technical examinations focused on artificial intelligence logic and constraint satisfaction algorithms."
  }
];
