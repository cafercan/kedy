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
        <defs>
          <!-- Kuyruk Kırpma Alanı -->
          <clipPath id="kedyTailClip">
            <path d="M 152 86 C 166 86 172 110 165 135 C 158 160 138 174 120 166 C 107 160 110 144 122 140 C 133 136 145 146 150 135 C 156 118 152 102 144 86 Z"/>
          </clipPath>
          <!-- Gövde Kırpma Alanı -->
          <clipPath id="kedyBodyClip">
            <path d="M 38 86 C 38 86 42 74 58 64 C 70 56 84 56 94 58 C 112 48 142 49 158 70 C 162 76 160 84 154 86 Z"/>
          </clipPath>
          <!-- Kafa Kırpma Alanı -->
          <clipPath id="kedyHeadClip">
            <path d="
              M 36 42
              C 40 37 37 23 34 16
              L 50 28
              C 56 24 64 24 70 28
              L 86 14
              C 85 23 79 34 80 42
              C 87 51 86 69 78 78
              C 68 86 48 86 38 78
              C 30 69 29 51 36 42 Z
            "/>
          </clipPath>
        </defs>

        <!-- Tüneme Çubuğu (Ledge Bar) -->
        <g id="kedyLedge">
          <rect x="0" y="86" width="200" height="24" rx="12" fill="#E2E8F0" opacity="0.95"/>
        </g>

        <!-- Kuyruk (Tail) -->
        <g class="kedy-tail-group" id="kedyTailGroup">
          <path id="kedyTail" d="M 152 86 C 166 86 172 110 165 135 C 158 160 138 174 120 166 C 107 160 110 144 122 140 C 133 136 145 146 150 135 C 156 118 152 102 144 86 Z" fill="#322D35"/>

          <!-- Kuyruk içi detaylar (clipPath ile kuyruk sınırına kırpılır) -->
          <g clip-path="url(#kedyTailClip)">
            <path id="kedyTuxedoTailTip" class="kedy-tuxedo-detail" d="M 100 140 L 140 140 L 140 180 L 100 180 Z" fill="#FFFFFF" style="display:none;"/>
            <!-- Sarman Kuyruk Çizgileri -->
            <g class="kedy-sarman-detail" style="display:none;">
              <rect x="140" y="96" width="30" height="6" rx="3" transform="rotate(20 155 99)" fill="#B6550A"/>
              <rect x="135" y="114" width="30" height="6" rx="3" transform="rotate(-5 150 117)" fill="#B6550A"/>
              <rect x="128" y="132" width="28" height="6" rx="3" transform="rotate(-28 142 135)" fill="#B6550A"/>
              <rect x="110" y="148" width="25" height="6" rx="3" transform="rotate(-50 122 151)" fill="#B6550A"/>
            </g>
          </g>
        </g>

        <!-- Gövde ve Pati (Body & Front Paw) -->
        <g id="kedyBodyGroup">
          <path id="kedyBody" d="M 38 86 C 38 86 42 74 58 64 C 70 56 84 56 94 58 C 112 48 142 49 158 70 C 162 76 160 84 154 86 Z" fill="#322D35"/>

          <!-- Gövde içi detaylar (clipPath ile gövde sınırına kırpılır) -->
          <g clip-path="url(#kedyBodyClip)">
            <!-- Smokinli Beyaz Göğüs -->
            <path id="kedyTuxedoChest" class="kedy-tuxedo-detail" d="M 38 86 C 38 70 48 56 66 56 C 76 56 86 68 88 86 Z" fill="#FFFFFF" style="display:none;"/>
            <!-- Sarman Gövde Çizgileri -->
            <g class="kedy-sarman-detail" style="display:none;">
              <path d="M 68 54 C 72 66 70 76 68 86 C 64 86 63 74 62 60 Z" fill="#B6550A"/>
              <path d="M 92 50 C 96 64 94 76 91 86 C 87 86 88 72 86 56 Z" fill="#B6550A"/>
              <path d="M 116 48 C 120 62 118 75 114 86 C 110 86 112 70 110 54 Z" fill="#B6550A"/>
              <path d="M 138 58 C 143 69 141 77 138 86 C 134 86 135 74 133 64 Z" fill="#B6550A"/>
            </g>
          </g>
          
          <path id="kedyPaw" d="M 38 78 C 33 78 24 81 22 89 C 20 97 24 102 30 102 C 37 102 41 95 42 86 Z" fill="#322D35"/>
          <!-- Smokinli Beyaz Pati -->
          <path id="kedyTuxedoPaw" class="kedy-tuxedo-detail" d="M 38 78 C 33 78 24 81 22 89 C 20 97 24 102 30 102 C 37 102 41 95 42 86 Z" fill="#FFFFFF" style="display:none;"/>

          <!-- Sarman Pati Çizgisi -->
          <g class="kedy-sarman-detail" style="display:none;">
            <path d="M 23 88 C 28 87 34 88 38 89 C 38 91 32 91 24 90 Z" fill="#B6550A"/>
          </g>
        </g>

        <!-- Kafa ve Kulaklar (Head & Ears) -->
        <g id="kedyHeadGroup" style="transform-origin: 58px 58px;">
          <!-- Kafa Şekli (kulak altları yumuşak eğrilerle) -->
          <path id="kedyHeadShape" d="
            M 36 42
            C 40 37 37 23 34 16
            L 50 28
            C 56 24 64 24 70 28
            L 86 14
            C 85 23 79 34 80 42
            C 87 51 86 69 78 78
            C 68 86 48 86 38 78
            C 30 69 29 51 36 42 Z
          " fill="#322D35"/>

          <!-- Kafa içi detaylar (clipPath ile kafa sınırına kırpılır) -->
          <g clip-path="url(#kedyHeadClip)">
            <!-- Smokinli Pembe İç Kulaklar -->
            <g class="kedy-tuxedo-detail" style="display:none;">
              <path d="M 44 33 L 38.5 23 L 46 29.5 Z" fill="#FFAEC9" opacity="0.9"/>
              <path d="M 75 33 L 81.5 21 L 72.5 28.5 Z" fill="#FFAEC9" opacity="0.9"/>
            </g>

            <!-- Smokinli Beyaz Yüz Maskesi -->
            <path id="kedyTuxedoFaceMask" class="kedy-tuxedo-detail" d="
              M 58 26
              C 56 36 53 44 48 48
              C 43 52 35 56 34 68
              C 34 76 44 86 58 86
              C 72 86 82 76 82 68
              C 81 56 73 52 68 48
              C 63 44 60 36 58 26 Z
            " fill="#FFFFFF" style="display:none;"/>

            <!-- Smokinli Yanak Detayı -->
            <g class="kedy-tuxedo-detail" style="display:none;">
              <path d="M 34 64 L 40 65 L 35 70 Z" fill="#221F26"/>
              <path d="M 82 64 L 76 65 L 81 70 Z" fill="#221F26"/>
            </g>

            <!-- Sarman Kafa Detayları -->
            <g class="kedy-sarman-detail" style="display:none;">
              <!-- Pembe İç Kulaklar -->
              <path d="M 44 33 L 38.5 23 L 46 29.5 Z" fill="#FFAEC9" opacity="0.9"/>
              <path d="M 75 33 L 81.5 21 L 72.5 28.5 Z" fill="#FFAEC9" opacity="0.9"/>
              <!-- Alın Çizgileri (Tabby M) -->
              <path d="M 57 28 L 59 28 L 58.5 40 L 57 40 Z" fill="#B6550A"/>
              <path d="M 50 31 L 52 30 L 52.5 41 L 51 42 Z" fill="#B6550A"/>
              <path d="M 66 31 L 64 30 L 63.5 41 L 65 42 Z" fill="#B6550A"/>
              <!-- Yanak Çizgileri -->
              <path d="M 32 54 L 40 55 L 39 57 L 32 56 Z" fill="#B6550A"/>
              <path d="M 32 62 L 39 63 L 38 65 L 33 64 Z" fill="#B6550A"/>
              <path d="M 82 52 L 75 53 L 76 55 L 82 54 Z" fill="#B6550A"/>
              <path d="M 81 60 L 75 61 L 76 63 L 80 62 Z" fill="#B6550A"/>
              <!-- Açık Krem Ağız/Bıyık Alanı -->
              <path d="M 52 57 C 54 53 62 53 64 57 C 67 63 62 72 58 72 C 54 72 49 63 52 57 Z" fill="#FFC993"/>
              <!-- Burun ve Ağız -->
              <path d="M 56 61 L 60 61 L 58 63.5 Z" fill="#8A3805"/>
              <path d="M 58 63.5 L 58 66 M 58 66 C 56 66 54 68 54 69 M 58 66 C 60 66 62 68 62 69" stroke="#6E2B02" stroke-width="1.1" stroke-linecap="round" fill="none"/>
            </g>
          </g>

          <!-- Bıyıklar (kafa dışına taşması doğal) -->
          <g class="kedy-sarman-detail" style="display:none;">
            <path d="M 38 64 L 18 62 M 38 66 L 19 67 M 39 68 L 21 72" stroke="#4A1E02" stroke-width="0.9" stroke-linecap="round"/>
            <path d="M 77 62 L 97 60 M 77 64 L 96 65 M 76 66 L 94 70" stroke="#4A1E02" stroke-width="0.9" stroke-linecap="round"/>
          </g>

          <!-- Sol Göz -->
          <g id="kedyLeftEyeGroup" class="kedy-eye" style="transform-origin: 47px 48px;">
            <circle cx="47" cy="48" r="6" fill="#FFFFFF" class="kedy-eye-sclera"/>
            <circle id="kedyLeftPupil" cx="47" cy="48" r="3.2" fill="#1C1820" class="kedy-eye-pupil"/>
            <circle id="kedyLeftEyeHighlight" cx="45.6" cy="46.6" r="1" fill="#FFFFFF" opacity="0.9"/>
          </g>

          <!-- Sağ Göz -->
          <g id="kedyRightEyeGroup" class="kedy-eye" style="transform-origin: 69px 48px;">
            <circle cx="69" cy="48" r="6" fill="#FFFFFF" class="kedy-eye-sclera"/>
            <circle id="kedyRightPupil" cx="69" cy="48" r="3.2" fill="#1C1820" class="kedy-eye-pupil"/>
            <circle id="kedyRightEyeHighlight" cx="67.6" cy="46.6" r="1" fill="#FFFFFF" opacity="0.9"/>
          </g>

          <!-- Smokinli Burun ve Ağız Çizgileri -->
          <g class="kedy-tuxedo-detail" style="display:none;">
            <path d="M 55 60 L 61 60 L 58 63 Z" fill="#221F26"/>
            <path d="M 58 63 L 58 66 M 58 66 C 56 66 54 68 54 69 M 58 66 C 60 66 62 68 62 69" stroke="#221F26" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          </g>

          <!-- Normal Burun Detayı -->
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
  const leftEyeHighlight = shadow.getElementById('kedyLeftEyeHighlight');
  const rightEyeHighlight = shadow.getElementById('kedyRightEyeHighlight');
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
    const isSarman = config.catTheme === 'orange' || config.catTheme === 'sarman';
    let catColor = config.catColor || '#322d35';

    if (isTuxedo) {
      catColor = '#221f26';
    } else if (isSarman) {
      catColor = '#E88624';
    }

    kedyBody.setAttribute('fill', catColor);
    kedyPaw.setAttribute('fill', catColor);
    kedyTail.setAttribute('fill', catColor);
    kedyHeadShape.setAttribute('fill', catColor);

    // Tuxedo specific patches
    const tuxedoDetails = shadow.querySelectorAll('.kedy-tuxedo-detail');
    tuxedoDetails.forEach(el => {
      el.style.display = isTuxedo ? 'block' : 'none';
    });

    // Sarman specific stripes & details
    const sarmanDetails = shadow.querySelectorAll('.kedy-sarman-detail');
    sarmanDetails.forEach(el => {
      el.style.display = isSarman ? 'block' : 'none';
    });

    if (kedyNose) {
      kedyNose.setAttribute('fill', isTuxedo ? '#ff9eaa' : (isSarman ? '#8a3805' : '#58505E'));
      kedyNose.style.display = (isTuxedo || isSarman) ? 'none' : 'block';
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
      leftPupil.setAttribute('cy', (48 + py).toFixed(2));
      rightPupil.setAttribute('cx', (69 + px).toFixed(2));
      rightPupil.setAttribute('cy', (48 + py).toFixed(2));
      leftEyeHighlight.setAttribute('cx', (45.6 + px).toFixed(2));
      leftEyeHighlight.setAttribute('cy', (46.6 + py).toFixed(2));
      rightEyeHighlight.setAttribute('cx', (67.6 + px).toFixed(2));
      rightEyeHighlight.setAttribute('cy', (46.6 + py).toFixed(2));
    }

    requestAnimationFrame(renderLoop);
  }

  // Initialize
  loadConfig();
  renderLoop();
})();
