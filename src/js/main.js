import { initThreeProject } from './three-project.js';
import { initReactiveGrid } from './reactive-grid.js';
import { initTerminal } from './terminal.js';
import { initNavigation } from './navigation.js';
import { initTheme } from './theme.js';
import { initContact } from './contact.js';
import { initAsciiReveal } from './ascii-reveal.js';
import { initMagicCursor } from './magic-cursor.js';
import { initNeonBorder } from './neon-border.js';
import { initSnakeGrid } from './snake-grid.js';
import { SKILLS, SKILL_CATEGORIES, PROJECTS, EXPERIENCES, ACHIEVEMENTS } from './data.js';
import profileImg from '../../public/saminathan-profile.png';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Infrastructure & Physics Cursor
  initTheme();
  initNavigation();
  initContact();
  initTerminal();
  initMagicCursor({
    fillColor: "#16E263",
    cursorSize: 14,
    enableStretch: false,
    enableGlow: false
  });

  // 2. Initialize Autonomous Snake Grid Canvas in Hero Card
  const heroWrapper = document.querySelector('.hero-3d-wrapper') || document.getElementById('hero-canvas');
  if (heroWrapper) {
    initSnakeGrid(heroWrapper, {
      snakeColor: "#0C6428",
      cellSize: 25,
      gap: 2,
      rounded: 11,
      speed: 8,
      fade: 38,
      foodColor: "#F9731A",
      boardColor: "rgba(255, 255, 255, 0.06)"
    });
  }

  // 3. Initialize Interactive ASCII Portrait Reveal & Orbiting Neon Border in About Section
  const asciiCanvas = document.getElementById('ascii-portrait-canvas');
  const portraitCard = document.querySelector('.portrait-card');

  if (asciiCanvas) {
    initAsciiReveal(asciiCanvas, {
      src: profileImg,
      fit: 'cover',
      focusY: 20,
      columns: 140,
      ramp: ' .:-=+*#%@',
      contrast: 110,
      inkColor: '#10b981',
      reveal: true,
      revealOptions: { size: 85, softness: 20 }
    });
  }

  if (portraitCard) {
    initNeonBorder(portraitCard, {
      color: "#1BB754",
      rounded: 39,
      thickness: 2,
      borderSize: 25,
      glow: 100,
      speed: 16
    });
  }

  // 4. Render Skills Category & Cards
  renderSkills();

  // 5. Render Projects & Initialize 3D Project Viewer & Reactive Grid
  const projectStageContainer = document.getElementById('project-3d-stage');
  let reactiveGridInstance = null;
  if (projectStageContainer) {
    reactiveGridInstance = initReactiveGrid(projectStageContainer, {
      shape: PROJECTS[0]?.gridShape || "diamond",
      fill: "solid",
      strokeWidth: 1.5,
      particleColor: "rgba(255, 255, 255, 0.18)",
      backgroundColor: "#000000",
      maxSize: 36,
      minSize: 12,
      gap: 4,
      influence: 300
    });
  }

  const threeProject = initThreeProject('project-3d-stage');
  renderProjects(threeProject, reactiveGridInstance);

  // 6. Render Experience Timeline
  renderExperience();

  // 7. Render Achievements
  renderAchievements();
});

// Render Skills Component
function renderSkills() {
  const filterContainer = document.getElementById('skills-filter');
  const gridContainer = document.getElementById('skills-grid');
  if (!gridContainer) return;

  // Render Filter Tabs
  if (filterContainer) {
    filterContainer.innerHTML = SKILL_CATEGORIES.map((cat, index) => `
      <button class="filter-btn ${index === 0 ? 'active' : ''}" data-category="${cat.id}">
        ${cat.label}
      </button>
    `).join('');

    filterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;
      filterSkillsGrid(category);
    });
  }

  // Initial Grid Render
  filterSkillsGrid('all');

  function filterSkillsGrid(categoryId) {
    const filtered = categoryId === 'all' 
      ? SKILLS 
      : SKILLS.filter(s => s.category === categoryId);

    gridContainer.innerHTML = filtered.map(skill => `
      <div class="skill-card">
        <div class="skill-header">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-tag">${skill.tag}</span>
        </div>
        <div class="skill-bar-bg">
          <div class="skill-bar-fill" style="width: ${skill.level}%;"></div>
        </div>
      </div>
    `).join('');
  }
}

// Render Projects Component & 3D Stage Logic
function renderProjects(threeProjectInstance, reactiveGridInstance) {
  const stageDetailsContainer = document.getElementById('project-stage-details');
  let activeIndex = 0;

  // Update Featured Stage Content
  function updateFeaturedStage(index) {
    const project = PROJECTS[index];
    if (!project) return;

    if (threeProjectInstance) {
      threeProjectInstance.updateMesh(project.geometryType, project.color);
    }

    if (reactiveGridInstance && project.gridShape) {
      reactiveGridInstance.updateOptions({ shape: project.gridShape });
    }

    if (stageDetailsContainer) {
      stageDetailsContainer.innerHTML = `
        <!-- Interactive Project Switcher Tabs -->
        <div class="project-selector-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
          ${PROJECTS.map((proj, i) => `
            <button 
              class="stage-tab-btn ${i === index ? 'active' : ''}" 
              data-index="${i}"
              style="padding: 0.45rem 0.85rem; border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 0.78rem; cursor: pointer; transition: all 0.25s ease; border: 1px solid ${i === index ? 'var(--accent-primary)' : 'var(--border-color)'}; background: ${i === index ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)'}; color: ${i === index ? 'var(--accent-primary)' : 'var(--text-secondary)'}; font-weight: 600;"
            >
              0${i + 1}. ${proj.title}
            </button>
          `).join('')}
        </div>

        <div class="section-tag">${project.subtitle}</div>
        <h3 style="font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">${project.title}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 1.05rem; line-height: 1.6;">${project.description}</p>
        
        <ul style="margin-bottom: 2rem; padding-left: 1.2rem; color: var(--text-secondary);">
          ${project.highlights.map(h => `<li style="margin-bottom: 0.5rem; line-height: 1.5;">${h}</li>`).join('')}
        </ul>

        <div class="project-tags">
          ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <a href="${project.github}" target="_blank" class="btn btn-primary">
            View on GitHub
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
          </a>
        </div>
      `;

      // Wire stage nav tabs
      stageDetailsContainer.querySelectorAll('.stage-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.currentTarget.dataset.index, 10);
          activeIndex = idx;
          updateFeaturedStage(idx);
        });
      });
    }
  }

  // Initial Stage Render
  updateFeaturedStage(0);
}

// Render Experience Timeline
function renderExperience() {
  const timelineContainer = document.getElementById('experience-timeline');
  if (!timelineContainer) return;

  timelineContainer.innerHTML = EXPERIENCES.map(exp => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-primary); margin-bottom: 0.25rem;">
          ${exp.period} · ${exp.location}
        </div>
        <h4 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">${exp.role}</h4>
        <div style="font-weight: 600; color: var(--text-secondary); margin-bottom: 1rem;">${exp.company}</div>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1rem;">${exp.description}</p>
        <ul style="padding-left: 1.2rem; color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem;">
          ${exp.achievements.map(a => `<li style="margin-bottom: 0.35rem;">${a}</li>`).join('')}
        </ul>
        <div class="project-tags">
          ${exp.skills.map(s => `<span class="project-tag">${s}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// Render Achievements
function renderAchievements() {
  const gridContainer = document.getElementById('achievements-grid');
  if (!gridContainer) return;

  gridContainer.innerHTML = ACHIEVEMENTS.map(ach => `
    <div class="achievement-card">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-secondary);">${ach.issuer}</span>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${ach.date}</span>
      </div>
      <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">${ach.title}</h4>
      <p style="color: var(--text-secondary); font-size: 0.875rem;">${ach.description}</p>
    </div>
  `).join('');
}
