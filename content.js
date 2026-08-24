/**
 * Kedy - Chrome Extension Content Script
 * Injects a cute mouse-tracking cat into webpages using Shadow DOM for maximum style isolation.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (document.getElementById('kedy-extension-host')) {
    return;
  }

  // Default configuration
  let config = {
    enabled: true,
    catSize: 140,
    catColor: '#322d35',
    catTheme: 'black',
    eyeColor: '#ffffff',
    showLedge: true,
    laserMode: false,
    soundEnabled: true,
    position: 'bottom-right',
    customX: null,
    customY: null
  };

  // Host container with Shadow DOM
  const host = document.createElement('div');
  host.id = 'kedy-extension-host';
  host.style.cssText = 'all: initial; position: static; z-index: 2147483647;';
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Stylesheet inside Shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :host {
      all: initial;
      display: block;
    }
    * {
      box-sizing: border-box;
      user-select: none;
      -webkit-user-drag: none;
    }
    #kedy-container {
      position: fixed;
      z-index: 2147483647;
      cursor: grab;
      touch-action: none;
      transform-origin: bottom center;
      transition: opacity 0.2s ease, transform 0.1s ease;
      filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.18));
      line-height: 0;
    }
    #kedy-container.hidden {
      display: none !important;
    }
    #kedy-container:active {
      cursor: grabbing;
    }

    .kedy-wrapper {
      position: relative;
      display: inline-block;
    }

    .kedy-svg {
      display: block;
      overflow: visible;
      pointer-events: auto;
    }

    /* Tail Wag Animation */
    .kedy-tail-group {
      transform-origin: 154px 86px;
      animation: kedyTailSway 3.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
    }
    @keyframes kedyTailSway {
      0%, 100% { transform: rotate(0deg); }
      30% { transform: rotate(-8deg); }
      70% { transform: rotate(10deg); }
    }

    /* Eye Blinking */
    .kedy-eye {
      transform-origin: center;
      transition: transform 0.1s ease;
    }
    .kedy-eye.blinking {
      transform: scaleY(0.08) !important;
    }

    /* Floating Heart Reaction */
    .kedy-floating-emoji {
      position: absolute;
      font-size: 22px;
      pointer-events: none;
      animation: kedyFloatUp 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      z-index: 999;
    }
    @keyframes kedyFloatUp {
      0% {
        opacity: 0;
        transform: translate(0, 0) scale(0.5);
      }
      20% {
        opacity: 1;
        transform: translate(0, -15px) scale(1.2);
      }
      100% {
        opacity: 0;
        transform: translate(var(--tx, 0px), -80px) scale(0.9);
      }
    }

    /* Laser Dot */
    #kedy-laser-dot {
      position: fixed;
      width: 8px;
      height: 8px;
      background: #ff003b;
      border-radius: 50%;
      box-shadow: 0 0 10px #ff003b, 0 0 4px #fff;
      pointer-events: none;
      z-index: 2147483647;
      display: none;
    }
  `;
  shadow.appendChild(styleEl);

  // Cat Template
  const catWrapper = document.createElement('div');
  catWrapper.id = 'kedy-container';
  catWrapper.innerHTML = `
    <div class="kedy-wrapper">
      <svg class="kedy-svg" id="kedySvg" viewBox="0 0 200 190" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Tüneme Çubuğu (Ledge Bar) -->
        <g id="kedyLedge">
          <rect x="0" y="86" width="200" height="24" rx="12" fill="#E2E8F0" opacity="0.95"/>
        </g>

        <!-- Kuyruk (Tail) -->
        <g class="kedy-tail-group" id="kedyTailGroup">
          <path id="kedyTail" d="M 152 86 C 166 86 172 110 165 135 C 158 160 138 174 120 166 C 107 160 110 144 122 140 C 133 136 145 146 150 135 C 156 118 152 102 144 86 Z" fill="#322D35"/>
          <path id="kedyTuxedoTailTip" class="kedy-tuxedo-detail" d="M 120 166 C 107 160 110 144 122 140 C 117 148 114 157 120 166 Z" fill="#FFFFFF" style="display:none;"/>
        </g>

        <!-- Gövde ve Pati (Body & Front Paw) -->
        <g id="kedyBodyGroup">
          <path id="kedyBody" d="M 38 86 C 38 86 42 74 58 64 C 70 56 84 56 94 58 C 112 48 142 49 158 70 C 162 76 160 84 154 86 Z" fill="#322D35"/>
          <path id="kedyTuxedoChest" class="kedy-tuxedo-detail" d="M 44 86 C 45 74 54 64 68 64 C 62 72 58 80 58 86 Z" fill="#FFFFFF" style="display:none;"/>
          <path id="kedyPaw" d="M 38 78 C 33 78 24 81 22 89 C 20 97 24 102 30 102 C 37 102 41 95 42 86 Z" fill="#322D35"/>
          <path id="kedyTuxedoPaw" class="kedy-tuxedo-detail" d="M 22 89 C 20 97 24 102 30 102 C 37 102 41 95 40 88 C 36 90 28 90 22 89 Z" fill="#FFFFFF" style="display:none;"/>
        </g>

        <!-- Kafa ve Kulaklar (Head & Ears) -->
        <g id="kedyHeadGroup" style="transform-origin: 58px 58px;">
          <!-- Kafa Şekli -->
          <path id="kedyHeadShape" d="
            M 42 42 
            L 34 16 
            L 50 28 
            C 56 24 64 24 70 28 
            L 86 14 
            L 78 40 
            C 90 50 88 70 78 78 
            C 68 86 46 86 36 78 
            C 26 70 28 50 42 42 Z
          " fill="#322D35"/>

          <!-- Smokinli Burun/Çene Beyazlığı (Tuxedo Muzzle) -->
          <path id="kedyTuxedoMuzzle" class="kedy-tuxedo-detail" d="M 52 54 C 54 50 62 50 64 54 C 68 60 62 76 58 76 C 54 76 48 60 52 54 Z" fill="#FFFFFF" style="display:none;"/>

          <!-- Sol Göz -->
          <g id="kedyLeftEyeGroup" class="kedy-eye" style="transform-origin: 47px 52px;">
            <circle cx="47" cy="52" r="6" fill="#FFFFFF" class="kedy-eye-sclera"/>
            <circle id="kedyLeftPupil" cx="47" cy="52" r="3.2" fill="#1C1820" class="kedy-eye-pupil"/>
            <circle cx="45" cy="50" r="1.3" fill="#FFFFFF" opacity="0.9"/>
          </g>

          <!-- Sağ Göz -->
          <g id="kedyRightEyeGroup" class="kedy-eye" style="transform-origin: 69px 48px;">
            <circle cx="69" cy="48" r="6" fill="#FFFFFF" class="kedy-eye-sclera"/>
            <circle id="kedyRightPupil" cx="69" cy="48" r="3.2" fill="#1C1820" class="kedy-eye-pupil"/>
            <circle cx="67" cy="46" r="1.3" fill="#FFFFFF" opacity="0.9"/>
          </g>

          <!-- Burun Detayı -->
          <path id="kedyNose" d="M 57 63 L 60 63 L 58.5 65 Z" fill="#58505E" opacity="0.6"/>
        </g>
      </svg>
    </div>
  `;
  shadow.appendChild(catWrapper);

  // Laser Pointer Element
  const laserDot = document.createElement('div');
  laserDot.id = 'kedy-laser-dot';
  shadow.appendChild(laserDot);

  // References
  const kedySvg = shadow.getElementById('kedySvg');
  const headGroup = shadow.getElementById('kedyHeadGroup');
  const leftPupil = shadow.getElementById('kedyLeftPupil');
  const rightPupil = shadow.getElementById('kedyRightPupil');
  const leftEyeGroup = shadow.getElementById('kedyLeftEyeGroup');
  const rightEyeGroup = shadow.getElementById('kedyRightEyeGroup');
  const kedyLedge = shadow.getElementById('kedyLedge');
  const kedyBody = shadow.getElementById('kedyBody');
  const kedyPaw = shadow.getElementById('kedyPaw');
  const kedyTail = shadow.getElementById('kedyTail');
  const kedyHeadShape = shadow.getElementById('kedyHeadShape');
  const kedyNose = shadow.getElementById('kedyNose');

  // Tracking state
  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.3;
  let curHeadRot = 0;
  let curHeadTx = 0;
  let curHeadTy = 0;

  // Apply Settings
  function applyConfig() {
    if (!config.enabled) {
      catWrapper.classList.add('hidden');
      laserDot.style.display = 'none';
      return;
    }
    catWrapper.classList.remove('hidden');

    // Size
    const w = parseInt(config.catSize, 10) || 140;
    const h = Math.round(w * 0.95);
    kedySvg.setAttribute('width', w);
    kedySvg.setAttribute('height', h);

    // Colors & Theme
    const isTuxedo = config.catTheme === 'tuxedo';
    const catColor = isTuxedo ? '#221f26' : (config.catColor || '#322d35');

    kedyBody.setAttribute('fill', catColor);
    kedyPaw.setAttribute('fill', catColor);
    kedyTail.setAttribute('fill', catColor);
    kedyHeadShape.setAttribute('fill', catColor);

    // Tuxedo specific patches
    const tuxedoDetails = shadow.querySelectorAll('.kedy-tuxedo-detail');
    tuxedoDetails.forEach(el => {
      el.style.display = isTuxedo ? 'block' : 'none';
    });

    if (kedyNose) {
      kedyNose.setAttribute('fill', isTuxedo ? '#ff9eaa' : '#58505E');
    }

    const eyeColor = config.eyeColor || '#ffffff';
    shadow.querySelectorAll('.kedy-eye-sclera').forEach(el => el.setAttribute('fill', eyeColor));

    // Ledge
    kedyLedge.style.display = config.showLedge ? 'block' : 'none';

    // Position
    applyPosition();

    // Laser mode
    laserDot.style.display = config.laserMode ? 'block' : 'none';
  }

  function applyPosition() {
    if (config.customX !== null && config.customY !== null) {
      catWrapper.style.left = config.customX + 'px';
      catWrapper.style.top = config.customY + 'px';
      catWrapper.style.right = 'auto';
      catWrapper.style.bottom = 'auto';
      return;
    }

    catWrapper.style.left = 'auto';
    catWrapper.style.right = 'auto';
    catWrapper.style.top = 'auto';
    catWrapper.style.bottom = 'auto';

    switch (config.position) {
      case 'bottom-left':
        catWrapper.style.bottom = '16px';
        catWrapper.style.left = '24px';
        break;
      case 'bottom-center':
        catWrapper.style.bottom = '16px';
        catWrapper.style.left = 'calc(50% - ' + (kedySvg.getAttribute('width') / 2) + 'px)';
        break;
      case 'top-right':
        catWrapper.style.top = '24px';
        catWrapper.style.right = '24px';
        break;
      case 'top-left':
        catWrapper.style.top = '24px';
        catWrapper.style.left = '24px';
        break;
      case 'bottom-right':
      default:
        catWrapper.style.bottom = '16px';
        catWrapper.style.right = '28px';
        break;
    }
  }

  // Load configuration from Chrome Storage
  function loadConfig() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(config, (items) => {
        config = { ...config, ...items };
        // Check local storage for custom drag coords if any
        chrome.storage.local.get(['kedyCustomX', 'kedyCustomY'], (localItems) => {
          if (localItems.kedyCustomX !== undefined && localItems.kedyCustomY !== undefined) {
            config.customX = localItems.kedyCustomX;
            config.customY = localItems.kedyCustomY;
          }
          applyConfig();
        });
      });
    } else {
      applyConfig();
    }
  }

  // Listen to storage changes live
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync') {
        for (let key in changes) {
          config[key] = changes[key].newValue;
        }
        applyConfig();
      } else if (area === 'local') {
        if ('kedyCustomX' in changes && 'kedyCustomY' in changes) {
          config.customX = changes.kedyCustomX.newValue;
          config.customY = changes.kedyCustomY.newValue;
          applyPosition();
        }
      }
    });
  }

  // Mouse tracking listener
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (config.laserMode && laserDot.style.display !== 'none') {
      laserDot.style.left = (mouseX - 4) + 'px';
      laserDot.style.top = (mouseY - 4) + 'px';
    }
  }, { passive: true });

  // Blinking
  function blink() {
    if (!config.enabled) return;
    leftEyeGroup.classList.add('blinking');
    rightEyeGroup.classList.add('blinking');
    setTimeout(() => {
      leftEyeGroup.classList.remove('blinking');
      rightEyeGroup.classList.remove('blinking');
    }, 140);
  }

  setInterval(() => {
    if (Math.random() > 0.4) blink();
  }, 3600);

  // Click / Petting interaction
  const emojis = ['❤️', '✨', '🐾', '😻', '💖', '⭐', '😽', '🐱'];
  catWrapper.addEventListener('click', (e) => {
    if (isDraggingCat) return;

    const heart = document.createElement('div');
    heart.className = 'kedy-floating-emoji';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    const rect = catWrapper.getBoundingClientRect();
    heart.style.left = (e.clientX - rect.left - 12) + 'px';
    heart.style.top = (e.clientY - rect.top - 20) + 'px';
    heart.style.setProperty('--tx', (Math.random() * 50 - 25) + 'px');
    catWrapper.querySelector('.kedy-wrapper').appendChild(heart);
    setTimeout(() => heart.remove(), 1200);

    if (config.soundEnabled) {
      playPurrSound();
    }
    blink();
  });

  // Synthesized audio without external asset requirements
  function playPurrSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(460, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } catch (err) {}
  }

  // Draggable Cat Support
  let isDraggingCat = false;
  let hasMovedDuringDrag = false;
  let dragStartX = 0, dragStartY = 0;
  let initLeft = 0, initTop = 0;

  catWrapper.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    isDraggingCat = true;
    hasMovedDuringDrag = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = catWrapper.getBoundingClientRect();
    initLeft = rect.left;
    initTop = rect.top;
    catWrapper.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  catWrapper.addEventListener('pointermove', (e) => {
    if (!isDraggingCat) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.hypot(dx, dy) > 5) {
      hasMovedDuringDrag = true;
    }
    let nx = initLeft + dx;
    let ny = initTop + dy;
    nx = Math.max(5, Math.min(window.innerWidth - catWrapper.offsetWidth - 5, nx));
    ny = Math.max(5, Math.min(window.innerHeight - catWrapper.offsetHeight - 5, ny));
    catWrapper.style.left = nx + 'px';
    catWrapper.style.top = ny + 'px';
    catWrapper.style.right = 'auto';
    catWrapper.style.bottom = 'auto';
  });

  catWrapper.addEventListener('pointerup', (e) => {
    if (!isDraggingCat) return;
    isDraggingCat = false;
    try {
      catWrapper.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (hasMovedDuringDrag) {
      const rect = catWrapper.getBoundingClientRect();
      config.customX = Math.round(rect.left);
      config.customY = Math.round(rect.top);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          kedyCustomX: config.customX,
          kedyCustomY: config.customY
        });
      }
    }
  });

  // Ctrl + Wheel to resize directly on the cat
  catWrapper.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -10 : 10;
      let newSize = Math.max(70, Math.min(320, config.catSize + delta));
      config.catSize = newSize;
      applyConfig();
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set({ catSize: newSize });
      }
    }
  }, { passive: false });

  // Main Tracking Loop with smooth interpolation (LERP)
  function renderLoop() {
    if (config.enabled) {
      const headRect = headGroup.getBoundingClientRect();
      const hx = headRect.left + headRect.width / 2;
      const hy = headRect.top + headRect.height / 2;

      const dx = mouseX - hx;
      const dy = mouseY - hy;
      const dist = Math.hypot(dx, dy);

      // Head rotation calculation based on cursor angle
      let targetRot = 0;
      if (dx < 0) {
        targetRot = Math.max(-42, Math.min(25, (dy / (Math.abs(dx) + 60)) * 42 - 12));
      } else {
        targetRot = Math.max(-20, Math.min(48, (dy / (Math.abs(dx) + 60)) * 38 + 14));
      }

      // Parallax 3D translation
      const maxTx = 6;
      const maxTy = 5;
      const targetTx = Math.max(-maxTx, Math.min(maxTx, (dx / (window.innerWidth * 0.5 || 1)) * maxTx));
      const targetTy = Math.max(-maxTy, Math.min(maxTy, (dy / (window.innerHeight * 0.5 || 1)) * maxTy));

      // LERP (smooth damping)
      curHeadRot += (targetRot - curHeadRot) * 0.12;
      curHeadTx += (targetTx - curHeadTx) * 0.12;
      curHeadTy += (targetTy - curHeadTy) * 0.12;

      headGroup.style.transform = `translate(${curHeadTx.toFixed(2)}px, ${curHeadTy.toFixed(2)}px) rotate(${curHeadRot.toFixed(2)}deg)`;

      // Eye pupil tracking
      const maxPupil = 2.4;
      const pupilD = Math.min(maxPupil, dist / 70);
      const angle = Math.atan2(dy, dx);
      const px = Math.cos(angle) * pupilD;
      const py = Math.sin(angle) * pupilD;

      leftPupil.setAttribute('cx', (47 + px).toFixed(2));
      leftPupil.setAttribute('cy', (52 + py).toFixed(2));
      rightPupil.setAttribute('cx', (69 + px).toFixed(2));
      rightPupil.setAttribute('cy', (48 + py).toFixed(2));
    }

    requestAnimationFrame(renderLoop);
  }

  // Initialize
  loadConfig();
  renderLoop();
})();
