/* =========================================
   MATRIX BIRTHDAY — SCRIPT.JS
   Red Matrix Cyberpunk Experience
   =========================================
   Author: Generated for Azzahra
   ========================================= */

'use strict';

// ─── STATE ─────────────────────────────────
let sceneIndex = -1;
const TOTAL_SCENES = 11;
let isTransitioning = false;
let matrixPaused = false;
let matrixIntensity = 1;
let videoSceneLocked = false; // true saat di scene video, unlock setelah video ended

// ─── DOM REFERENCES ─────────────────────────
const canvas       = document.getElementById('matrix-canvas');
const ctx          = canvas.getContext('2d');
const glitchOverlay = document.getElementById('glitch-overlay');
const mediaContainer = document.getElementById('media-container');
const mediaFrame   = document.getElementById('media-frame');
const photoDisplay = document.getElementById('photo-display');
const videoDisplay = document.getElementById('video-display');
const mediaCaption = document.getElementById('media-caption');
const textContainer = document.getElementById('text-container');
const systemLabel  = document.getElementById('system-label');
const mainText     = document.getElementById('main-text');
const subText      = document.getElementById('sub-text');
const tapIndicator = document.getElementById('tap-indicator');
const progressDots = document.getElementById('progress-dots');

// ─── BOOT SCREEN ────────────────────────────
const bootScreen = document.createElement('div');
bootScreen.id = 'boot-screen';
bootScreen.innerHTML = `
  <div id="boot-logo">AZZAHRA</div>
  <div id="boot-log">initializing system...</div>
  <div id="boot-bar-wrap">
    <div id="boot-bar"><div id="boot-fill"></div></div>
    <div id="boot-percent">0%</div>
  </div>
  <div id="boot-tasks">
    <div class="boot-task" id="bt0"><span class="task-icon">&#9632;</span> loading matrix engine</div>
    <div class="boot-task" id="bt1"><span class="task-icon">&#9632;</span> decrypting memory banks</div>
    <div class="boot-task" id="bt2"><span class="task-icon">&#9632;</span> locating subject</div>
    <div class="boot-task" id="bt3"><span class="task-icon">&#9632;</span> verifying identity</div>
    <div class="boot-task" id="bt4"><span class="task-icon">&#9632;</span> compiling transmission</div>
  </div>
`;
document.body.appendChild(bootScreen);

const fadeOverlay = document.createElement('div');
fadeOverlay.id = 'fade-overlay';
document.body.appendChild(fadeOverlay);

const finalMessage = document.createElement('div');
finalMessage.id = 'final-message';
document.body.appendChild(finalMessage);

// ─── SOUND SYSTEM ───────────────────────────
const sfx = {
  tap:    document.getElementById('sfx-tap'),
  boot:   document.getElementById('sfx-boot'),
  glitch: document.getElementById('sfx-glitch'),
  reveal: document.getElementById('sfx-reveal'),
  final:  document.getElementById('sfx-final'),
};

function playSound(name) {
  const audio = sfx[name];
  if (!audio || !audio.src || audio.src.endsWith('/')) return;
  try {
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.play().catch(() => {}); // silent fail if file missing
  } catch (e) {}
}

// ─── VIDEO FULLSCREEN ────────────────────────
function enterVideoFullscreen(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  const vid = document.getElementById('video-display');
  if (!vid) return;
  if (vid.requestFullscreen)            vid.requestFullscreen();
  else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
  else if (vid.webkitEnterFullscreen)   vid.webkitEnterFullscreen(); // iOS
}

// ─── MATRIX RAIN ENGINE ─────────────────────
const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*!<>[]{}|AZZAHRA';
const SPECIAL_NAME = 'AZZAHRA';

let columns = [];
let columnCount = 0;
const FONT_SIZE = 14;

function initMatrix() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  columnCount = Math.floor(canvas.width / FONT_SIZE);
  columns = [];
  for (let i = 0; i < columnCount; i++) {
    columns.push({
      y: Math.random() * -canvas.height,
      speed: 0.5 + Math.random() * 1.2,
      chars: [],
      length: 8 + Math.floor(Math.random() * 20),
      nameMode: false,
      nameTick: 0
    });
    // Seed with random chars
    for (let j = 0; j < 30; j++) {
      columns[i].chars.push(randomChar());
    }
  }
}

function randomChar(includeAzzahra) {
  if (includeAzzahra && Math.random() < 0.04) {
    const letters = SPECIAL_NAME.split('');
    return letters[Math.floor(Math.random() * letters.length)];
  }
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

let lastTime = 0;
let matrixTargetFPS = 30;   // bisa diturunkan saat video
let animFrameId;

function drawMatrix(timestamp) {
  animFrameId = requestAnimationFrame(drawMatrix);

  const frameInterval = 1000 / matrixTargetFPS;
  const elapsed = timestamp - lastTime;
  if (elapsed < frameInterval) return;
  lastTime = timestamp - (elapsed % frameInterval);

  if (matrixPaused) return;

  // Fade trail
  ctx.fillStyle = `rgba(0, 0, 0, ${0.04 + (1 - matrixIntensity) * 0.06})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;

  // Nonaktifkan shadowBlur saat mode hemat (video playing) — ini operasi GPU paling berat
  const useShadow = !matrixPaused && matrixTargetFPS > 15;

  const useAzzahra = sceneIndex >= 9;

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const x = i * FONT_SIZE;

    const ch = randomChar(useAzzahra);

    // Head of stream — bright
    ctx.fillStyle = `rgba(255, 0, 60, ${0.9 * matrixIntensity})`;
    if (useShadow) {
      ctx.shadowColor = '#ff003c';
      ctx.shadowBlur = 8;
    }
    ctx.fillText(ch, x, col.y);
    if (useShadow) ctx.shadowBlur = 0;

    // Trail
    for (let j = 1; j < col.length; j++) {
      const alpha = (1 - j / col.length) * 0.55 * matrixIntensity;
      if (alpha <= 0) continue;
      ctx.fillStyle = `rgba(180, 0, 30, ${alpha})`;
      const trailY = col.y - j * FONT_SIZE;
      if (trailY > 0 && trailY < canvas.height) {
        ctx.fillText(randomChar(useAzzahra), x, trailY);
      }
    }

    col.y += col.speed * FONT_SIZE * 0.5;

    if (col.y > canvas.height + col.length * FONT_SIZE) {
      col.y = -FONT_SIZE * (1 + Math.random() * 10);
      col.speed = 0.5 + Math.random() * 1.2;
      col.length = 8 + Math.floor(Math.random() * 20);
    }
  }

  ctx.shadowBlur = 0;
}

// ─── GLITCH EFFECTS ─────────────────────────
function triggerGlitch(type, silent = false) {
  glitchOverlay.className = '';
  void glitchOverlay.offsetWidth;
  glitchOverlay.className = `glitch-${type}`;
  // sfx glitch HANYA dibunyikan kalau bukan dari random scheduler (silent=true)
  if (!silent && (type === 'flash' || type === 'rgb')) playSound('glitch');
  setTimeout(() => { glitchOverlay.className = ''; }, 300);
}

function randomGlitch() {
  const types = ['rgb', 'flash', 'scan', 'rgb'];
  const t = types[Math.floor(Math.random() * types.length)];
  triggerGlitch(t, true); // silent — jangan bunyi sfx
}

// Random glitch scheduler
function scheduleGlitch() {
  const delay = 2000 + Math.random() * 6000;
  setTimeout(() => {
    randomGlitch();
    scheduleGlitch();
  }, delay);
}

// ─── GLITCH TEXT DECODER ────────────────────
const GLITCH_CHARS = '!@#$%^&*<>[]{}|?/\\~`1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function glitchDecode(element, finalText, duration = 1000, onDone) {
  element.classList.add('visible');
  const len = finalText.length;
  const frames = Math.floor(duration / 40);
  let frame = 0;

  const resolved = new Array(len).fill(false);
  const resolveOrder = shuffleArray([...Array(len).keys()]);
  const resolvePerFrame = Math.max(1, Math.floor(len / (frames * 0.6)));

  const interval = setInterval(() => {
    frame++;

    let display = '';
    for (let i = 0; i < len; i++) {
      if (finalText[i] === ' ' || finalText[i] === '\n') {
        display += finalText[i];
      } else if (resolved[i]) {
        display += finalText[i];
      } else {
        display += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
    }

    // Resolve chars progressively
    const toResolve = Math.floor((frame / frames) * len);
    for (let k = 0; k < resolveOrder.length && k < toResolve; k++) {
      resolved[resolveOrder[k]] = true;
    }

    element.innerHTML = display.replace(/\n/g, '<br>');

    if (frame >= frames) {
      clearInterval(interval);
      element.innerHTML = finalText.replace(/\n/g, '<br>');
      if (onDone) onDone();
    }
  }, 40);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── PROGRESS DOTS ──────────────────────────
function buildDots() {
  progressDots.innerHTML = '';
  for (let i = 0; i < TOTAL_SCENES; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === sceneIndex) dot.classList.add('active');
    progressDots.appendChild(dot);
  }
}

function updateDots() {
  const dots = progressDots.querySelectorAll('.dot');
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === sceneIndex);
  });
}

// ─── CLEAR SCENE ────────────────────────────
function clearScene(cb) {
  // Reset video lock
  videoSceneLocked = false;
  tapIndicator.textContent = '[ tap ]';
  // Restore matrix performance ke normal
  matrixTargetFPS = 30;
  canvas.style.opacity = '0.85';

  // Hide text
  mainText.classList.remove('visible');
  mainText.classList.remove('name-reveal', 'terminal-output');
  subText.classList.remove('visible');
  systemLabel.classList.remove('visible');
  textContainer.classList.remove('has-media');

  // Hide media
  mediaContainer.classList.remove('visible');
  mediaContainer.classList.remove('video-active');
  mediaCaption.classList.remove('visible');
  photoDisplay.classList.remove('active');
  videoDisplay.classList.remove('active');
  photoDisplay.src = '';
  videoDisplay.pause();
  videoDisplay.src = ''; // bersihkan src agar tidak autoplay ulang

  setTimeout(() => {
    mainText.innerHTML = '';
    subText.innerHTML = '';
    systemLabel.innerHTML = '';
    mediaCaption.innerHTML = '';
    if (cb) cb();
  }, 300);
}

// ─── SHOW TEXT HELPER ────────────────────────
function showText({ label = '', main = '', sub = '', mainClass = '', delay = 0 }) {
  setTimeout(() => {
    if (label) {
      systemLabel.innerHTML = label;
      systemLabel.classList.add('visible');
    }

    if (main) {
      mainText.className = mainClass ? `${mainClass}` : '';
      mainText.classList.add('visible');
      glitchDecode(mainText, main, 900);
    }

    if (sub) {
      setTimeout(() => {
        subText.classList.add('visible');
        glitchDecode(subText, sub, 600);
      }, 1000);
    }
  }, delay);
}

// ─── SHOW MEDIA HELPER ───────────────────────
function showMedia({ src, type = 'photo', caption = '' }) {
  textContainer.classList.add('has-media');
  mediaContainer.classList.add('visible');

  if (type === 'photo') {
    mediaContainer.classList.remove('video-active');
    photoDisplay.src = src;
    photoDisplay.classList.add('active');
  } else {
    // VIDEO: dengan suara, tanpa loop, tunggu ended untuk unlock tap
    videoSceneLocked = true;
    mediaContainer.classList.add('video-active');
    videoDisplay.src = src;
    videoDisplay.muted = false;   // suara aktif
    videoDisplay.loop  = false;   // tidak loop
    videoDisplay.classList.add('active');
    videoDisplay.currentTime = 0;

    // Update tap indicator selama video
    tapIndicator.textContent = '[ menonton video... ]';

    // Setelah video selesai — unlock tap, kembalikan indikator
    function onVideoEnded() {
      videoSceneLocked = false;
      tapIndicator.textContent = '[ tap ]';
      // Beri sinyal visual bahwa video selesai
      mediaCaption.innerHTML = '> video ended — tap untuk lanjut';
      triggerGlitch('scan', true);
      videoDisplay.removeEventListener('ended', onVideoEnded);
    }
    videoDisplay.addEventListener('ended', onVideoEnded);

    // Fallback: kalau video error load, jangan stuck
    videoDisplay.addEventListener('error', () => {
      videoSceneLocked = false;
      tapIndicator.textContent = '[ tap ]';
    }, { once: true });

    // Preload hint agar browser buffer dulu sebelum decode
    videoDisplay.preload = 'auto';

    // Tunggu buffer cukup (canplaythrough) sebelum play
    // Ini cegah lag di awal pada HP dengan I/O lambat
    function tryPlay() {
      videoDisplay.play().catch(() => {
        videoSceneLocked = false;
        tapIndicator.textContent = '[ tap ]';
      });
    }

    if (videoDisplay.readyState >= 4) {
      // Sudah fully buffered — langsung play
      tryPlay();
    } else {
      tapIndicator.textContent = '[ buffering... ]';
      videoDisplay.addEventListener('canplaythrough', () => {
        tapIndicator.textContent = '[ menonton video... ]';
        tryPlay();
      }, { once: true });
      // Mulai load
      videoDisplay.load();
    }
  }

  if (caption) {
    mediaCaption.innerHTML = caption.replace(/\n/g, '<br>');
    setTimeout(() => mediaCaption.classList.add('visible'), 900);
  }
}

// ─── SCENES ─────────────────────────────────
const scenes = [

  // Scene 0
  () => {
    triggerGlitch('flash');
    setTimeout(() => {
      showText({
        label: '// system.boot',
        main: 'Hari ini bukan hari biasa.',
        delay: 200
      });
    }, 100);
  },

  // Scene 1
  () => {
    showText({
      label: '// scanning...',
      main: 'Karena di hari ini,\nseseorang yang sangat penting\ndi dunia lahir.',
      delay: 100
    });
  },

  // Scene 2 — Azzahra reveal
  () => {
    triggerGlitch('rgb');
    matrixIntensity = 1.4;

    setTimeout(() => {
      systemLabel.innerHTML = 'SYSTEM NOTICE';
      systemLabel.classList.add('visible');
    }, 100);

    setTimeout(() => {
      mainText.classList.add('name-reveal');
      mainText.classList.add('visible');
      glitchDecode(mainText, 'AZZAHRA', 700);
      triggerGlitch('flash');
      playSound('reveal');
    }, 600);

    setTimeout(() => {
      matrixIntensity = 1;
    }, 2000);
  },

  // Scene 3
  () => {
    showText({
      label: '// anomaly detected',
      main: 'Di antara miliaran manusia,\nanehnya aku bisa ketemu kamu.',
      delay: 100
    });
  },

  // Scene 4 — Photo 1
  () => {
    showMedia({ src: 'media/photo1.jpg', caption: '> visual record detected' });
    setTimeout(() => {
      showText({
        label: '// memory_01.jpg',
        main: '',
        delay: 200
      });
    }, 200);
  },

  // Scene 5 — Photo 2
  () => {
    showMedia({ src: 'media/photo2.jpg', caption: '> memory fragment loaded' });
    setTimeout(() => {
      showText({ label: '// memory_02.jpg', delay: 200 });
    }, 200);
  },

  // Scene 6 — Photo 3
  () => {
    showMedia({ src: 'media/photo3.jpg', caption: '> beberapa orang cuma lewat di hidup kita\n  kamu enggak' });
    setTimeout(() => {
      showText({ label: '// memory_03.jpg', delay: 200 });
    }, 200);
  },

  // Scene 7 — Probability
  () => {
    triggerGlitch('scan');
    showText({
      label: '// calculating...',
      main: 'calculating coincidence...',
      delay: 100
    });
    setTimeout(() => {
      mainText.classList.remove('visible');
      setTimeout(() => {
        mainText.classList.add('terminal-output');
        mainText.classList.add('visible');
        glitchDecode(mainText, 'probability: 0.0000000001%', 600);
        triggerGlitch('rgb');
      }, 400);
      setTimeout(() => {
        subText.classList.add('visible');
        glitchDecode(subText, 'Statistiknya kecil.\nTapi keajaiban kadang memang terjadi.', 700);
      }, 1200);
    }, 1800);
  },

  // Scene 8 — Video
  () => {
    matrixPaused = true;
    triggerGlitch('flash');

    setTimeout(() => {
      matrixPaused = false;
      // Mode hemat untuk HP kentang: FPS matrix turun + canvas opacity dikurangi
      matrixTargetFPS = 10;
      canvas.style.opacity = '0.35';

      showMedia({ src: 'media/video.mp4', type: 'video', caption: '> core memory detected' });
      setTimeout(() => {
        showText({ label: '// playing core_memory.mp4', delay: 100 });
      }, 200);
    }, 800);
  },

  // Scene 9 — Happy Birthday
  () => {
    matrixIntensity = 1.3;
    triggerGlitch('rgb');

    setTimeout(() => {
      showText({
        label: '// AZZAHRA // AZZAHRA // AZZAHRA',
        main: 'Selamat ulang tahun.',
        delay: 300
      });
    }, 200);
  },

  // Scene 10 — Final
  () => {
    // Show final message, then fade to black
    showText({
      label: '// transmission.end',
      main: 'Terima kasih sudah lahir.',
      delay: 200
    });

    // Fade to black
    setTimeout(() => {
      isTransitioning = true; // lock input
      playSound('final');
      // Fade overlay in
      fadeOverlay.classList.add('fade-in');

      // Show final message on black
      setTimeout(() => {
        finalMessage.innerHTML = '❤<br><br>T E R I M A K A S I H<br>S U D A H  L A H I R<br><br>— A Z Z A H R A —';
        finalMessage.classList.add('visible');
      }, 2800);

    }, 2500);
  }
];

// ─── ADVANCE SCENE ──────────────────────────
function advanceScene() {
  if (isTransitioning) return;
  if (sceneIndex >= TOTAL_SCENES - 1) return;

  isTransitioning = true;
  playSound('tap');
  triggerGlitch('flash');

  clearScene(() => {
    sceneIndex++;
    updateDots();
    scenes[sceneIndex]();

    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  });
}

// ─── INPUT HANDLING ─────────────────────────
let lastInputTime = 0;
const INPUT_DEBOUNCE = 350;

function isLockActive() {
  const lock = document.getElementById('lock-screen');
  return lock && lock.style.display !== 'none';
}

function handleInput(e) {
  // Jangan intercept apapun selama lock screen masih aktif
  if (isLockActive()) return;

  // Block tap selama video scene belum selesai
  if (videoSceneLocked) return;

  if (e.type === 'touchstart') e.preventDefault();

  const now = Date.now();
  if (now - lastInputTime < INPUT_DEBOUNCE) return;
  lastInputTime = now;

  advanceScene();
}

document.addEventListener('click',      handleInput);
document.addEventListener('touchstart', handleInput, { passive: false });

// ─── RESIZE ─────────────────────────────────
window.addEventListener('resize', () => {
  initMatrix();
});

// ─── BOOT SEQUENCE ──────────────────────────
function boot() {
  buildDots();

  const fill      = document.getElementById('boot-fill');
  const bootLog   = document.getElementById('boot-log');
  const bootPct   = document.getElementById('boot-percent');

  // Boot tasks config: [id, percent, log message, delay from start ms]
  const tasks = [
    { id: 'bt0', pct: 18,  log: 'loading matrix engine...',     delay: 200  },
    { id: 'bt1', pct: 40,  log: 'decrypting memory banks...',   delay: 700  },
    { id: 'bt2', pct: 62,  log: 'locating subject...',          delay: 1200 },
    { id: 'bt3', pct: 81,  log: 'verifying identity...',        delay: 1700 },
    { id: 'bt4', pct: 100, log: '> SUBJECT FOUND. AZZAHRA',       delay: 2200 },
  ];

  function setProgress(pct) {
    fill.style.width = pct + '%';
    bootPct.textContent = pct + '%';
  }

  tasks.forEach((task, i) => {
    setTimeout(() => {
      // Mark previous done
      if (i > 0) {
        const prev = document.getElementById(tasks[i-1].id);
        if (prev) { prev.classList.remove('active'); prev.classList.add('done'); prev.querySelector('.task-icon').innerHTML = '&#10003;'; }
      }
      // Activate current
      const el = document.getElementById(task.id);
      if (el) el.classList.add('active');

      // Update progress
      setProgress(task.pct);
      bootLog.textContent = task.log;
      if (task.pct === 100) {
        bootLog.classList.add('highlight');
        // Mark last task done after brief pause
        setTimeout(() => {
          if (el) { el.classList.remove('active'); el.classList.add('done'); el.querySelector('.task-icon').innerHTML = '&#10003;'; }
        }, 300);
      }
    }, task.delay);
  });

  // Hide boot screen and start experience
  setTimeout(() => {
    playSound('boot');
    bootScreen.classList.add('hidden');
    setTimeout(() => {
      bootScreen.style.display = 'none';
      advanceScene();
    }, 700);
  }, 3000);
}

// ─── ACCESS DENIED OVERLAY ──────────────────
function showAccessDenied(attempts, onDone) {
  // Buat overlay fullscreen
  const overlay = document.createElement('div');
  overlay.id = 'denied-overlay';

  // Pilih pesan berdasarkan attempt count
  const messages = [
    ['AKSES', 'DITOLAK'],
    ['IDENTITAS', 'TIDAK DIKENAL'],
    ['SISTEM', 'TERKUNCI'],
    ['ANCAMAN', 'TERDETEKSI'],
    ['INTRUSI', 'DICATAT'],
  ];
  const pair = messages[(attempts - 1) % messages.length];

  overlay.innerHTML = `
    <div id="denied-scanlines"></div>
    <div id="denied-noise"></div>
    <div id="denied-inner">
      <div id="denied-icon">⛔</div>
      <div id="denied-line1">${pair[0]}</div>
      <div id="denied-line2">${pair[1]}</div>
      <div id="denied-sub">// attempt ${attempts} logged — tracing origin</div>
      <div id="denied-bar-wrap">
        <div id="denied-bar-label">THREAT ANALYSIS</div>
        <div id="denied-bar"><div id="denied-bar-fill"></div></div>
      </div>
      <div id="denied-code">ERR_${(Math.random()*0xFFFFFF|0).toString(16).toUpperCase().padStart(6,'0')}</div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Noise canvas — random pixel static
  const noiseEl = document.getElementById('denied-noise');
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = 200; noiseCanvas.height = 200;
  noiseEl.appendChild(noiseCanvas);
  const nCtx = noiseCanvas.getContext('2d');
  let noiseFrame;
  function drawNoise() {
    const id = nCtx.createImageData(200, 200);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() > 0.85 ? (Math.random() * 120 | 0) : 0;
      id.data[i]   = v + 80;   // R tint red
      id.data[i+1] = 0;
      id.data[i+2] = 0;
      id.data[i+3] = Math.random() > 0.85 ? 180 : 0;
    }
    nCtx.putImageData(id, 0, 0);
    noiseFrame = requestAnimationFrame(drawNoise);
  }
  drawNoise();

  // Phase 1 — slam in (t=0ms)
  requestAnimationFrame(() => {
    overlay.classList.add('denied-enter');
    triggerGlitch('rgb');
    triggerGlitch('flash');
    playSound('glitch');
  });

  // Phase 2 — glitch text decode
  const line1 = document.getElementById('denied-line1');
  const line2 = document.getElementById('denied-line2');
  const glitchPool = '!@#$%^&*<>[]{}|?X#@!\~ERR0R';

  function glitchText(el, finalText, duration) {
    let frame = 0;
    const total = Math.floor(duration / 35);
    const resolved = new Array(finalText.length).fill(false);
    const order = [...Array(finalText.length).keys()].sort(() => Math.random() - 0.5);
    const iv = setInterval(() => {
      frame++;
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        if (finalText[i] === ' ') { out += ' '; continue; }
        out += resolved[i] ? finalText[i] : glitchPool[Math.floor(Math.random() * glitchPool.length)];
      }
      const resolveCount = Math.floor((frame / total) * finalText.length);
      for (let k = 0; k < resolveCount && k < order.length; k++) resolved[order[k]] = true;
      el.textContent = out;
      if (frame >= total) { clearInterval(iv); el.textContent = finalText; }
    }, 35);
  }

  setTimeout(() => { glitchText(line1, pair[0], 400); }, 80);
  setTimeout(() => { glitchText(line2, pair[1], 500); triggerGlitch('rgb'); }, 200);

  // Phase 3 — bar fill
  setTimeout(() => {
    const fill = document.getElementById('denied-bar-fill');
    if (fill) {
      fill.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';
      fill.style.width = '100%';
    }
    triggerGlitch('scan');
  }, 500);

  // Phase 4 — extra glitch burst
  setTimeout(() => { triggerGlitch('rgb'); playSound('glitch'); }, 800);
  setTimeout(() => { triggerGlitch('flash'); }, 1100);
  setTimeout(() => { triggerGlitch('rgb'); }, 1400);

  // Phase 5 — exit: glitch dissolve lalu buang overlay
  setTimeout(() => {
    overlay.classList.add('denied-exit');
    triggerGlitch('flash');
    triggerGlitch('scan');
    cancelAnimationFrame(noiseFrame);
    setTimeout(() => {
      overlay.remove();
      if (onDone) onDone();
    }, 600);
  }, 2000);
}

// ─── LOCK SCREEN ────────────────────────────
const LOCK_CODE = '12503092';

function createLockScreen() {
  const lock = document.createElement('div');
  lock.id = 'lock-screen';
  lock.innerHTML = `
    <div id="lock-matrix-hint"></div>
    <div id="lock-inner">
      <div id="lock-logo">
        <span id="lock-logo-glitch">SYS</span><span>.</span><span id="lock-logo-sub">LOCK</span>
      </div>
      <div id="lock-subtitle">// AKSES TERENKRIPSI //</div>
      <div id="lock-display">
        <div id="lock-digits">
          <span class="ldigit empty"></span>
          <span class="ldigit empty"></span>
          <span class="ldigit empty"></span>
          <span class="ldigit empty"></span>
          <span class="ldigit empty"></span>
          <span class="ldigit empty"></span>
          <span class="ldigit empty"></span>
          <span class="ldigit empty"></span>
        </div>
        <div id="lock-status">masukkan kode akses 8 digit</div>
      </div>
      <div id="lock-keypad">
        <button class="lkey" data-val="1">1</button>
        <button class="lkey" data-val="2">2</button>
        <button class="lkey" data-val="3">3</button>
        <button class="lkey" data-val="4">4</button>
        <button class="lkey" data-val="5">5</button>
        <button class="lkey" data-val="6">6</button>
        <button class="lkey" data-val="7">7</button>
        <button class="lkey" data-val="8">8</button>
        <button class="lkey" data-val="9">9</button>
        <button class="lkey lkey-clear" data-val="clear">CLR</button>
        <button class="lkey" data-val="0">0</button>
        <button class="lkey lkey-del" data-val="del">⌫</button>
      </div>
      <div id="lock-footer">
        <span id="lock-attempt-text">// awaiting authentication</span>
      </div>
    </div>
  `;
  document.body.appendChild(lock);

  // Animate glitch chars in background hint
  const hintEl = document.getElementById('lock-matrix-hint');
  const hintChars = 'アイウエオ0123456789ABCDEFG@#$%![]{}|*';
  function animHint() {
    let out = '';
    for (let i = 0; i < 80; i++) {
      out += hintChars[Math.floor(Math.random() * hintChars.length)];
      if ((i + 1) % 20 === 0) out += '\n';
    }
    hintEl.textContent = out;
  }
  setInterval(animHint, 120);
  animHint();

  let entered = '';
  let attempts = 0;
  let locked = false;

  const digitEls = lock.querySelectorAll('.ldigit');
  const statusEl = document.getElementById('lock-status');
  const attemptEl = document.getElementById('lock-attempt-text');

  function updateDigits() {
    digitEls.forEach((el, i) => {
      if (i < entered.length) {
        el.textContent = '●';
        el.classList.remove('empty');
        el.classList.add('filled');
      } else {
        el.textContent = '';
        el.classList.add('empty');
        el.classList.remove('filled');
      }
    });
  }

  function shakeDisplay() {
    const disp = document.getElementById('lock-display');
    disp.classList.add('lock-shake');
    setTimeout(() => disp.classList.remove('lock-shake'), 500);
  }

  function flashStatus(msg, type = 'error') {
    statusEl.textContent = msg;
    statusEl.className = 'lock-status-' + type;
    setTimeout(() => {
      statusEl.textContent = 'masukkan kode akses 8 digit';
      statusEl.className = '';
    }, 1200);
  }

  function handleKey(val) {
    if (locked) return;

    if (val === 'clear') {
      entered = '';
      updateDigits();
      attemptEl.textContent = '// awaiting authentication';
      statusEl.textContent = 'masukkan kode akses 8 digit';
      statusEl.className = '';
      return;
    }
    if (val === 'del') {
      entered = entered.slice(0, -1);
      updateDigits();
      return;
    }
    if (entered.length >= 8) return;

    entered += val;
    updateDigits();

    // Trigger glitch on digit press
    triggerGlitch('scan');

    if (entered.length === 8) {
      // Check after brief pause for dramatic effect
      setTimeout(() => {
        if (entered === LOCK_CODE) {
          // CORRECT
          statusEl.textContent = '> ACCESS GRANTED';
          statusEl.className = 'lock-status-success';
          attemptEl.textContent = '// identity verified. loading...';
          digitEls.forEach(el => el.classList.add('success'));
          triggerGlitch('rgb');
          playSound('boot');
          // Unlock after animation
          setTimeout(() => {
            lock.classList.add('lock-exit');
            setTimeout(() => {
              lock.style.display = 'none';
              boot();
            }, 800);
          }, 1000);
        } else {
          // WRONG — full immersive ACCESS DENIED sequence
          attempts++;
          locked = true;
          digitEls.forEach(el => el.classList.add('error'));
          showAccessDenied(attempts, () => {
            entered = '';
            updateDigits();
            digitEls.forEach(el => el.classList.remove('error'));
            if (attempts % 3 === 0) {
              let countdown = 5;
              attemptEl.textContent = `// cooldown aktif — retry in ${countdown}s`;
              statusEl.textContent = `> THERMAL LOCKOUT`;
              statusEl.className = 'lock-status-error';
              const iv = setInterval(() => {
                countdown--;
                if (countdown <= 0) {
                  clearInterval(iv);
                  locked = false;
                  attemptEl.textContent = '// awaiting authentication';
                  statusEl.textContent = 'masukkan kode akses 8 digit';
                  statusEl.className = '';
                } else {
                  attemptEl.textContent = `// cooldown aktif — retry in ${countdown}s`;
                }
              }, 1000);
            } else {
              locked = false;
              attemptEl.textContent = `// authentication failed [${attempts}]`;
              statusEl.textContent = 'masukkan kode akses 8 digit';
              statusEl.className = '';
            }
          });
        }
      }, 200);
    }
  }

  // Keypad click / touch
  lock.querySelectorAll('.lkey').forEach(btn => {
    // touchstart: respons instan di mobile, hindari delay 300ms
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();   // cegah ghost click & cegah scroll
      e.stopPropagation();
      btn._lastTouch = Date.now();
      handleKey(btn.dataset.val);
    }, { passive: false });

    // click: fallback desktop, skip jika baru di-handle touchstart
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const now = Date.now();
      if (btn._lastTouch && now - btn._lastTouch < 400) return;
      handleKey(btn.dataset.val);
    });
  });

  // Physical keyboard support
  document.addEventListener('keydown', (e) => {
    if (lock.style.display === 'none') return;
    if (e.key >= '0' && e.key <= '9') handleKey(e.key);
    else if (e.key === 'Backspace') handleKey('del');
    else if (e.key === 'Escape') handleKey('clear');
  });
}

// ─── INIT ────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Start matrix canvas immediately for ambiance behind lock screen
  initMatrix();
  requestAnimationFrame(drawMatrix);
  scheduleGlitch();
  createLockScreen();
});
