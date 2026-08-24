// Popup logic for Kedy Chrome Extension
document.addEventListener('DOMContentLoaded', () => {
  const enabledToggle = document.getElementById('enabledToggle');
  const sizeSlider = document.getElementById('sizeSlider');
  const sizeVal = document.getElementById('sizeVal');
  const catColorPicker = document.getElementById('catColorPicker');
  const posSelect = document.getElementById('posSelect');
  const resetPosBtn = document.getElementById('resetPosBtn');
  const ledgeToggle = document.getElementById('ledgeToggle');
  const laserToggle = document.getElementById('laserToggle');
  const soundToggle = document.getElementById('soundToggle');
  const catChips = document.querySelectorAll('.theme-chips .chip');
  const eyeChips = document.querySelectorAll('.theme-chips .eye-chip');

  // Load current settings
  chrome.storage.sync.get({
    enabled: true,
    catSize: 140,
    catColor: '#322d35',
    catTheme: 'black',
    eyeColor: '#ffffff',
    showLedge: true,
    laserMode: false,
    soundEnabled: true,
    position: 'bottom-right'
  }, (items) => {
    enabledToggle.checked = items.enabled;
    sizeSlider.value = items.catSize;
    sizeVal.textContent = items.catSize + 'px';
    catColorPicker.value = items.catColor;
    posSelect.value = items.position;
    ledgeToggle.checked = items.showLedge;
    laserToggle.checked = items.laserMode;
    soundToggle.checked = items.soundEnabled;

    updateActiveChips(items.catTheme || 'black', items.catColor, items.eyeColor);
  });

  function updateActiveChips(catTheme, catColor, eyeColor) {
    catChips.forEach(chip => {
      const chipTheme = chip.dataset.theme;
      const chipColor = chip.dataset.color;
      if (chipTheme && catTheme) {
        if (chipTheme === catTheme) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      } else if (chipColor && chipColor.toLowerCase() === (catColor || '').toLowerCase()) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    eyeChips.forEach(chip => {
      if (chip.dataset.eye.toLowerCase() === (eyeColor || '').toLowerCase()) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
  }

  // Event Listeners
  enabledToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ enabled: e.target.checked });
  });

  sizeSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    sizeVal.textContent = val + 'px';
    chrome.storage.sync.set({ catSize: val });
  });

  catChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const color = chip.dataset.color;
      const theme = chip.dataset.theme || 'custom';
      catColorPicker.value = color;
      chrome.storage.sync.set({ catColor: color, catTheme: theme });
      catChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  catColorPicker.addEventListener('input', (e) => {
    const color = e.target.value;
    chrome.storage.sync.set({ catColor: color, catTheme: 'custom' });
    catChips.forEach(c => c.classList.remove('active'));
  });

  eyeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const eye = chip.dataset.eye;
      chrome.storage.sync.set({ eyeColor: eye });
      eyeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  posSelect.addEventListener('change', (e) => {
    chrome.storage.sync.set({ position: e.target.value });
    // Reset custom dragged coordinates when changing preset position
    chrome.storage.local.remove(['kedyCustomX', 'kedyCustomY']);
  });

  resetPosBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['kedyCustomX', 'kedyCustomY'], () => {
      chrome.storage.sync.set({ position: posSelect.value });
      resetPosBtn.textContent = 'Sıfırlandı ✓';
      setTimeout(() => {
        resetPosBtn.textContent = 'Sıfırla';
      }, 1000);
    });
  });

  ledgeToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ showLedge: e.target.checked });
  });

  laserToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ laserMode: e.target.checked });
  });

  soundToggle.addEventListener('change', (e) => {
    chrome.storage.sync.set({ soundEnabled: e.target.checked });
  });
});
