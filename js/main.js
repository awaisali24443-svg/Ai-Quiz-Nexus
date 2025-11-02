// This script handles theme toggling globally and registers the service worker.

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('✅ ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('❌ ServiceWorker registration failed: ', error);
      });
  });
}

// --- Theme Toggling ---
document.addEventListener('DOMContentLoaded', () => {
    const THEME_STORAGE_KEY = 'ai-quiz-theme';
    const body = document.body;

    function applyTheme(themeName) {
        body.dataset.theme = themeName;
    }

    function handleThemeChange(event) {
        const themeBtn = event.target.closest('.theme-btn');
        if (!themeBtn) return;
        
        const theme = themeBtn.dataset.theme;
        if (theme) {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
            applyTheme(theme);
        }
    }

    // Use event delegation for theme buttons inside the settings container
    const settingsContainer = document.querySelector('.settings-container');
    if (settingsContainer) {
        settingsContainer.addEventListener('click', handleThemeChange);
    }
    
    // Apply initial theme on load
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark'; // Default to 'dark'
    applyTheme(savedTheme);
});