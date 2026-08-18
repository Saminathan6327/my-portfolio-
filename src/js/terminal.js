import { TERMINAL_COMMANDS } from './data.js';

export function initTerminal() {
  const outputContainer = document.getElementById('terminal-output');
  const inputEl = document.getElementById('terminal-input');
  const chipContainer = document.getElementById('terminal-chips');
  if (!outputContainer || !inputEl) return;

  // Print initial welcome message
  printOutput(`Welcome to Saminathan's interactive shell. Type <span class="cmd-highlight">help</span> or click command chips below.`);

  function printOutput(text, isCommand = false, commandStr = '') {
    const line = document.createElement('div');
    line.className = 'terminal-output-line';
    
    if (isCommand) {
      line.innerHTML = `<span class="prompt-user">saminathan@dev</span>:<span class="prompt-path">~</span>$ ${escapeHtml(commandStr)}`;
    } else {
      line.innerHTML = text;
    }

    outputContainer.appendChild(line);
    outputContainer.scrollTop = outputContainer.scrollHeight;
  }

  const SECTION_MAP = {
    me: 'about',
    whoami: 'about',
    skills: 'skills',
    projects: 'projects',
    experience: 'experience',
    contact: 'contact'
  };

  function handleCommand(cmd) {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    // Print command line
    printOutput('', true, trimmed);

    if (trimmed === 'clear') {
      outputContainer.innerHTML = '';
      return;
    }

    if (TERMINAL_COMMANDS[trimmed]) {
      printOutput(TERMINAL_COMMANDS[trimmed]);
      
      // Scroll to corresponding page section if mapped
      const targetId = SECTION_MAP[trimmed];
      if (targetId) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      printOutput(`Command not found: <span class="cmd-highlight">${escapeHtml(trimmed)}</span>. Type <span class="cmd-highlight">help</span> for options.`);
    }

    inputEl.value = '';
  }

  // Keydown listener
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleCommand(inputEl.value);
    }
  });

  // Handle clicks inside terminal output (e.g., interactive help links)
  outputContainer.addEventListener('click', (e) => {
    const cmdLink = e.target.closest('.cmd-link, [data-cmd]');
    if (cmdLink && cmdLink.dataset.cmd) {
      handleCommand(cmdLink.dataset.cmd);
      inputEl.focus();
    }
  });

  // Suggestion Chip Clicks
  if (chipContainer) {
    chipContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.terminal-chip');
      if (chip) {
        const cmd = chip.dataset.cmd || chip.innerText.trim();
        handleCommand(cmd);
        inputEl.focus();
      }
    });
  }

  // Refresh Button Logic
  const refreshBtn = document.getElementById('terminal-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.classList.add('spinning');
      outputContainer.innerHTML = '';
      inputEl.value = '';
      printOutput(`Welcome to Saminathan's interactive shell. Type <span class="cmd-highlight">help</span> or click command chips below.`);
      setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
      inputEl.focus();
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
