export function initContact() {
  const form = document.getElementById('contact-form');
  const copyEmailBtn = document.getElementById('copy-email-btn');

  // Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `Sending message...`;

      setTimeout(() => {
        showToast('Message sent successfully! Saminathan will reply soon.');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 1200);
    });
  }

  // Copy Email Button
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = copyEmailBtn.dataset.email || 'saminathan6327@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email address copied to clipboard!');
      }).catch(() => {
        showToast(`Email: ${email}`);
      });
    });
  }

  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="font-mono">✓</span> ${escapeHtml(message)}`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
