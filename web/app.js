/**
 * MatchVision — Interactive Computer Vision & Tactical Analytics App
 */

// Application State
const state = {
  currentTime: 0,
  duration: MATCH_DATA.match.duration_seconds,
  fps: MATCH_DATA.match.fps,
  isPlaying: false,
  playbackRate: 1.0,
  activeTab: 'match-center',
  tacticalMode: 'passing', // 'passing' | 'heatmap' | 'formation'
  tacticalTeam: 1,
  hoveredPlayer: null,
  layers: {
    boxes: true,
    speed: true,
    ball: true,
    possession: true
  }
};

// DOM Elements
const video = document.getElementById('matchVideo');
const cvCanvas = document.getElementById('cvCanvas');
const cvCtx = cvCanvas.getContext('2d');
const miniRadarCanvas = document.getElementById('miniRadarCanvas');
const miniRadarCtx = miniRadarCanvas.getContext('2d');
const tacticalCanvas = document.getElementById('tacticalMainCanvas');
const tacticalCtx = tacticalCanvas.getContext('2d');

const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const videoTimestamp = document.getElementById('videoTimestamp');
const progressRail = document.getElementById('progressRail');
const progressFill = document.getElementById('progressFill');
const timelineTrack = document.getElementById('timelineTrack');
const timelineNeedle = document.getElementById('timelineNeedle');
const eventMarkersContainer = document.getElementById('eventMarkersContainer');
const liveModeBtn = document.getElementById('liveModeBtn');
const speedToggleBtn = document.getElementById('speedToggleBtn');
const stepBackBtn = document.getElementById('stepBackBtn');
const stepForwardBtn = document.getElementById('stepForwardBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const muteToggleBtn = document.getElementById('muteToggleBtn');
const uiTooltip = document.getElementById('uiTooltip');

// Initialize Application
window.addEventListener('DOMContentLoaded', () => {
  initVideoPlayer();
  initTimelineEvents();
  initSidebarStats();
  initTacticalStudio();
  initHighlightsStudio();
  initUploadModal();
  initNavigation();
  initResizeHandler();

  // Initial render cycle
  updateCanvasSizes();
  renderFrame(0);
});

// Navigation Tabs
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  const matchCenterView = document.getElementById('matchCenterView');
  const tacticalStudioView = document.getElementById('tacticalStudioView');
  const highlightsStudioView = document.getElementById('highlightsStudioView');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      state.activeTab = target;

      matchCenterView.style.display = target === 'match-center' ? 'grid' : 'none';
      tacticalStudioView.style.display = target === 'tactical-studio' ? 'grid' : 'none';
      highlightsStudioView.style.display = target === 'highlights-studio' ? 'grid' : 'none';

      if (target === 'tactical-studio') {
        renderTacticalStudio();
      }
    });
  });
}

// Video & CV Sync Engine
function initVideoPlayer() {
  video.addEventListener('loadedmetadata', () => {
    state.duration = video.duration || MATCH_DATA.match.duration_seconds;
    updateTimestampDisplay();
  });

  video.addEventListener('timeupdate', () => {
    state.currentTime = video.currentTime;
    updatePlayProgress();
    renderFrame(state.currentTime);
  });

  video.addEventListener('play', () => {
    state.isPlaying = true;
    updatePlayIcon(true);
    requestAnimationFrame(renderLoop);
  });

  video.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayIcon(false);
  });

  playPauseBtn.addEventListener('click', togglePlay);
  liveModeBtn.addEventListener('click', togglePlay);

  // Keyboard shortcut (Space = Play/Pause)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      togglePlay();
    }
  });

  // Step controls
  stepBackBtn.addEventListener('click', () => seekTime(Math.max(0, state.currentTime - 1.0)));
  stepForwardBtn.addEventListener('click', () => seekTime(Math.min(state.duration, state.currentTime + 1.0)));

  // Speed toggle
  const speeds = [0.5, 1.0, 1.5, 2.0];
  let speedIdx = 1;
  speedToggleBtn.addEventListener('click', () => {
    speedIdx = (speedIdx + 1) % speeds.length;
    state.playbackRate = speeds[speedIdx];
    video.playbackRate = state.playbackRate;
    speedToggleBtn.textContent = state.playbackRate.toFixed(1) + 'x';
  });

  // Progress Rail scrubbing
  progressRail.addEventListener('click', (e) => {
    const rect = progressRail.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTime(ratio * state.duration);
  });

  // Mute / Fullscreen
  muteToggleBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteToggleBtn.style.color = video.muted ? 'var(--accent-red)' : '#fff';
  });

  fullscreenBtn.addEventListener('click', () => {
    const container = document.getElementById('videoContainer');
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  });

  // Layer Toggles
  document.querySelectorAll('.toggle-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const layer = chip.dataset.layer;
      state.layers[layer] = !state.layers[layer];
      chip.classList.toggle('active', state.layers[layer]);
      renderFrame(state.currentTime);
    });
  });
}

function togglePlay() {
  if (video.paused) {
    video.play().catch(() => {
      // Fallback: If browser prevents direct video autoplay, run simulated animation loop
      state.isPlaying = true;
      updatePlayIcon(true);
      requestAnimationFrame(simulatedLoop);
    });
  } else {
    video.pause();
    state.isPlaying = false;
    updatePlayIcon(false);
  }
}

function updatePlayIcon(isPlaying) {
  playIcon.innerHTML = isPlaying
    ? `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`
    : `<polygon points="5 3 19 12 5 21 5 3"/>`;
  liveModeBtn.innerHTML = isPlaying
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause Analysis`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Auto Play`;
}

function seekTime(targetSeconds) {
  state.currentTime = Math.max(0, Math.min(state.duration, targetSeconds));
  if (video && !isNaN(video.duration)) {
    video.currentTime = state.currentTime;
  }
  updatePlayProgress();
  renderFrame(state.currentTime);
}

// Fallback smooth simulation loop if native video isn't active
let lastTimestamp = 0;
function simulatedLoop(now) {
  if (!state.isPlaying) return;
  if (!lastTimestamp) lastTimestamp = now;
  const delta = (now - lastTimestamp) / 1000;
  lastTimestamp = now;

  state.currentTime += delta * state.playbackRate;
  if (state.currentTime >= state.duration) {
    state.currentTime = 0;
  }
  updatePlayProgress();
  renderFrame(state.currentTime);
  requestAnimationFrame(simulatedLoop);
}

function renderLoop() {
  if (state.isPlaying && !video.paused) {
    renderFrame(state.currentTime);
    requestAnimationFrame(renderLoop);
  }
}

function updatePlayProgress() {
  const percent = (state.currentTime / state.duration) * 100;
  progressFill.style.width = percent + '%';
  timelineNeedle.style.left = percent + '%';
  updateTimestampDisplay();
}

function updateTimestampDisplay() {
  const curM = Math.floor(state.currentTime / 60).toString().padStart(2, '0');
  const curS = (state.currentTime % 60).toFixed(1).padStart(4, '0');
  const durM = Math.floor(state.duration / 60).toString().padStart(2, '0');
  const durS = (state.duration % 60).toFixed(1).padStart(4, '0');
  videoTimestamp.textContent = `${curM}:${curS} / ${durM}:${durS}`;
}

// Rendering Logic for CV Overlays & Radar
function renderFrame(timeInSeconds) {
  const totalFrames = MATCH_DATA.match.frame_count;
  const currentFrameIdx = Math.floor((timeInSeconds / state.duration) * totalFrames);
  const frameData = getSimulatedFrameData(currentFrameIdx, totalFrames);

  renderCVOverlays(frameData);
  renderMiniRadar(frameData);
  updateActiveEventHighlight(timeInSeconds);
}

// Draw Computer Vision Overlays on Video Canvas
function renderCVOverlays(frameData) {
  cvCtx.clearRect(0, 0, cvCanvas.width, cvCanvas.height);
  const { players, ball } = frameData;

  const scaleX = cvCanvas.width / 1920;
  const scaleY = cvCanvas.height / 1080;

  // Ball Trajectory & Marker
  if (state.layers.ball && ball) {
    const bx = ball.screen_x * scaleX;
    const by = ball.screen_y * scaleY;

    // Glowing ball indicator
    cvCtx.beginPath();
    cvCtx.arc(bx, by, 7 * scaleX, 0, Math.PI * 2);
    cvCtx.fillStyle = '#FFE600';
    cvCtx.shadowColor = '#FFE600';
    cvCtx.shadowBlur = 12;
    cvCtx.fill();
    cvCtx.shadowBlur = 0;

    // Trajectory vector ring
    cvCtx.beginPath();
    cvCtx.arc(bx, by, 14 * scaleX, 0, Math.PI * 2);
    cvCtx.strokeStyle = 'rgba(255, 230, 0, 0.6)';
    cvCtx.lineWidth = 1.5;
    cvCtx.stroke();
  }

  // Players Bounding Boxes & Telemetry HUD
  players.forEach(p => {
    const [bx, by, bw, bh] = p.screen_bbox;
    const x = bx * scaleX;
    const y = by * scaleY;
    const w = bw * scaleX;
    const h = bh * scaleY;

    const teamColor = p.team === 1 ? '#00FF87' : '#00E5FF';

    // Bounding Box
    if (state.layers.boxes) {
      cvCtx.strokeStyle = teamColor;
      cvCtx.lineWidth = 1.5;
      cvCtx.strokeRect(x, y, w, h);

      // Corner accent markers
      const cLen = Math.min(w * 0.3, 8);
      cvCtx.lineWidth = 3;
      // Top-left
      cvCtx.beginPath();
      cvCtx.moveTo(x, y + cLen); cvCtx.lineTo(x, y); cvCtx.lineTo(x + cLen, y);
      cvCtx.stroke();
      // Bottom-right
      cvCtx.beginPath();
      cvCtx.moveTo(x + w, y + h - cLen); cvCtx.lineTo(x + w, y + h); cvCtx.lineTo(x + w - cLen, y + h);
      cvCtx.stroke();
    }

    // Possession Aura
    if (state.layers.possession && p.has_ball) {
      cvCtx.beginPath();
      cvCtx.ellipse(x + w/2, y + h, w * 0.7, w * 0.35, 0, 0, Math.PI * 2);
      cvCtx.strokeStyle = '#FFE600';
      cvCtx.lineWidth = 2.5;
      cvCtx.shadowColor = '#FFE600';
      cvCtx.shadowBlur = 15;
      cvCtx.stroke();
      cvCtx.shadowBlur = 0;
    }

    // Name & Speed Tag
    if (state.layers.speed) {
      // Top Name Tag
      const tagText = `#${p.number} ${p.name.split(' ').pop()}`;
      cvCtx.font = `600 ${Math.max(9, Math.round(11 * scaleX))}px 'Plus Jakarta Sans', sans-serif`;
      const textWidth = cvCtx.measureText(tagText).width;

      cvCtx.fillStyle = 'rgba(7, 10, 14, 0.85)';
      cvCtx.fillRect(x + w/2 - textWidth/2 - 4, y - 18, textWidth + 8, 15);
      cvCtx.strokeStyle = teamColor;
      cvCtx.lineWidth = 1;
      cvCtx.strokeRect(x + w/2 - textWidth/2 - 4, y - 18, textWidth + 8, 15);

      cvCtx.fillStyle = '#ffffff';
      cvCtx.textAlign = 'center';
      cvCtx.fillText(tagText, x + w/2, y - 6);

      // Bottom Speed Badge
      const speedText = `${p.speed_kmh} km/h`;
      cvCtx.font = `700 ${Math.max(8, Math.round(10 * scaleX))}px 'JetBrains Mono', monospace`;
      const speedWidth = cvCtx.measureText(speedText).width;

      cvCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      cvCtx.fillRect(x + w/2 - speedWidth/2 - 3, y + h + 3, speedWidth + 6, 13);
      cvCtx.fillStyle = p.speed_kmh > 30 ? '#00FF87' : '#8B9BB4';
      cvCtx.fillText(speedText, x + w/2, y + h + 13);
    }
  });
}

// Draw 2D Mini Pitch Radar
function renderMiniRadar(frameData) {
  const w = miniRadarCanvas.width;
  const h = miniRadarCanvas.height;
  miniRadarCtx.clearRect(0, 0, w, h);

  // Pitch Background & Lines
  drawPitchBackground(miniRadarCtx, w, h);

  const { players, ball } = frameData;

  // Draw Players on 2D Radar
  players.forEach(p => {
    // Pitch bounds: 0..105 (X), 0..68 (Y)
    const px = (p.x / 105) * w;
    const py = (p.y / 68) * h;

    const color = p.team === 1 ? '#00FF87' : '#00E5FF';

    // Player dot
    miniRadarCtx.beginPath();
    miniRadarCtx.arc(px, py, 4.5, 0, Math.PI * 2);
    miniRadarCtx.fillStyle = color;
    miniRadarCtx.shadowColor = color;
    miniRadarCtx.shadowBlur = 8;
    miniRadarCtx.fill();
    miniRadarCtx.shadowBlur = 0;

    if (p.has_ball) {
      miniRadarCtx.beginPath();
      miniRadarCtx.arc(px, py, 8, 0, Math.PI * 2);
      miniRadarCtx.strokeStyle = '#FFE600';
      miniRadarCtx.lineWidth = 1.5;
      miniRadarCtx.stroke();
    }
  });

  // Draw Ball on 2D Radar
  if (ball) {
    const bx = (ball.x / 105) * w;
    const by = (ball.y / 68) * h;

    miniRadarCtx.beginPath();
    miniRadarCtx.arc(bx, by, 3.5, 0, Math.PI * 2);
    miniRadarCtx.fillStyle = '#FFE600';
    miniRadarCtx.shadowColor = '#FFE600';
    miniRadarCtx.shadowBlur = 10;
    miniRadarCtx.fill();
    miniRadarCtx.shadowBlur = 0;
  }
}

// 2D Football Pitch Standard Canvas Generator
function drawPitchBackground(ctx, w, h) {
  ctx.fillStyle = '#0b1b13';
  ctx.fillRect(0, 0, w, h);

  // Pitch outline
  ctx.strokeStyle = 'rgba(0, 255, 135, 0.25)';
  ctx.lineWidth = 1.5;
  const pad = 10;
  const pw = w - pad * 2;
  const ph = h - pad * 2;

  ctx.strokeRect(pad, pad, pw, ph);

  // Halfway line
  ctx.beginPath();
  ctx.moveTo(w / 2, pad);
  ctx.lineTo(w / 2, h - pad);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, ph * 0.18, 0, Math.PI * 2);
  ctx.stroke();

  // Center spot
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 255, 135, 0.4)';
  ctx.fill();

  // Penalty Boxes
  const penW = pw * 0.16;
  const penH = ph * 0.55;
  // Left Box
  ctx.strokeRect(pad, (h - penH) / 2, penW, penH);
  // Right Box
  ctx.strokeRect(w - pad - penW, (h - penH) / 2, penW, penH);

  // Goal Area (6-yard)
  const goalW = pw * 0.06;
  const goalH = ph * 0.3;
  ctx.strokeRect(pad, (h - goalH) / 2, goalW, goalH);
  ctx.strokeRect(w - pad - goalW, (h - goalH) / 2, goalW, goalH);
}

// Timeline Events & Badges
function initTimelineEvents() {
  eventMarkersContainer.innerHTML = '';

  MATCH_DATA.events.forEach(ev => {
    const leftPercent = (ev.timestamp / state.duration) * 100;
    const marker = document.createElement('div');
    marker.className = `timeline-event-marker marker-${ev.type}`;
    marker.style.left = `${leftPercent}%`;

    const icon = ev.type === 'goal' ? '⚽' : ev.type === 'shot' ? '🎯' : ev.type === 'pass' ? '⚡' : '🔄';
    marker.innerHTML = `<span>${icon}</span> <span>${ev.type.toUpperCase()}</span>`;
    marker.title = `${ev.text} (${ev.timestamp}s)`;

    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      seekTime(ev.timestamp);
    });

    eventMarkersContainer.appendChild(marker);
  });

  // Track click to seek
  timelineTrack.addEventListener('click', (e) => {
    const rect = timelineTrack.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTime(ratio * state.duration);
  });
}

function updateActiveEventHighlight(currentTime) {
  const currentEvent = MATCH_DATA.events.find(ev => Math.abs(ev.timestamp - currentTime) < 1.0);
  const activeBallCarrierText = document.getElementById('activeBallCarrierText');
  if (currentEvent) {
    activeBallCarrierText.textContent = `${currentEvent.type.toUpperCase()}: ${currentEvent.text}`;
  } else {
    activeBallCarrierText.textContent = "Ball in Continuous Play";
  }
}

// Sidebar Telemetry & Match Stats
function initSidebarStats() {
  // Speed Leaderboard
  const sortedPlayers = [...MATCH_DATA.players].sort((a, b) => b.speed_max - a.speed_max).slice(0, 5);
  const speedLeaderboard = document.getElementById('speedLeaderboard');
  speedLeaderboard.innerHTML = '';

  sortedPlayers.forEach(p => {
    const row = document.createElement('div');
    row.className = 'speed-row';
    row.innerHTML = `
      <div class="player-speed-meta">
        <span class="player-badge-num t${p.team}">${p.number}</span>
        <div>
          <div class="player-name-text">${p.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${p.team === 1 ? 'ARS' : 'MCI'} • ${p.role}</div>
        </div>
      </div>
      <div class="speed-metric-tag">${p.speed_max} <span style="font-size: 0.65rem; color: var(--text-muted);">KM/H</span></div>
    `;
    speedLeaderboard.appendChild(row);
  });

  // Match Summary Stats Grid
  const stats = [
    { name: 'Total Shots', t1: MATCH_DATA.match.team_1.shots_total, t2: MATCH_DATA.match.team_2.shots_total },
    { name: 'Shots On Target', t1: MATCH_DATA.match.team_1.shots_on_target, t2: MATCH_DATA.match.team_2.shots_on_target },
    { name: 'Expected Goals (xG)', t1: MATCH_DATA.match.team_1.xg, t2: MATCH_DATA.match.team_2.xg },
    { name: 'Pass Accuracy', t1: `${MATCH_DATA.match.team_1.pass_accuracy}%`, t2: `${MATCH_DATA.match.team_2.pass_accuracy}%` },
    { name: 'Fouls Committed', t1: MATCH_DATA.match.team_1.fouls, t2: MATCH_DATA.match.team_2.fouls }
  ];

  const statsContainer = document.getElementById('statsGridContainer');
  statsContainer.innerHTML = '';

  stats.forEach(st => {
    const num1 = parseFloat(st.t1);
    const num2 = parseFloat(st.t2);
    const sum = num1 + num2 || 1;
    const pct1 = Math.round((num1 / sum) * 100);

    const item = document.createElement('div');
    item.className = 'stat-row-item';
    item.innerHTML = `
      <div class="stat-labels">
        <strong style="color: var(--accent-green); font-family: var(--font-mono);">${st.t1}</strong>
        <span class="stat-name">${st.name}</span>
        <strong style="color: var(--accent-cyan); font-family: var(--font-mono);">${st.t2}</strong>
      </div>
      <div class="stat-bar-compare">
        <div class="stat-bar-left" style="width: ${pct1}%;"></div>
        <div class="stat-bar-right" style="width: ${100 - pct1}%;"></div>
      </div>
    `;
    statsContainer.appendChild(item);
  });
}

// Tactical Studio (Passing Networks, Heatmaps, Formations)
function initTacticalStudio() {
  const btnPassing = document.getElementById('btnModePassing');
  const btnHeatmap = document.getElementById('btnModeHeatmap');
  const btnFormation = document.getElementById('btnModeFormation');
  const btnTeam1 = document.getElementById('btnTeamFilter1');
  const btnTeam2 = document.getElementById('btnTeamFilter2');

  const setMode = (mode) => {
    state.tacticalMode = mode;
    [btnPassing, btnHeatmap, btnFormation].forEach(b => b.classList.remove('active'));
    if (mode === 'passing') btnPassing.classList.add('active');
    if (mode === 'heatmap') btnHeatmap.classList.add('active');
    if (mode === 'formation') btnFormation.classList.add('active');
    renderTacticalStudio();
  };

  btnPassing.addEventListener('click', () => setMode('passing'));
  btnHeatmap.addEventListener('click', () => setMode('heatmap'));
  btnFormation.addEventListener('click', () => setMode('formation'));

  btnTeam1.addEventListener('click', () => {
    state.tacticalTeam = 1;
    renderTacticalStudio();
  });
  btnTeam2.addEventListener('click', () => {
    state.tacticalTeam = 2;
    renderTacticalStudio();
  });

  // Tactical Canvas Hover Interaction
  tacticalCanvas.addEventListener('mousemove', handleTacticalHover);
  tacticalCanvas.addEventListener('mouseleave', () => {
    state.hoveredPlayer = null;
    uiTooltip.style.display = 'none';
    renderTacticalStudio();
  });

  updateTacticalSidebar();
}

function updateTacticalSidebar() {
  const teamData = state.tacticalTeam === 1 ? MATCH_DATA.match.team_1 : MATCH_DATA.match.team_2;
  document.getElementById('tacticalCardFormation').textContent = teamData.formation;
  document.getElementById('tacticalCardLineHeight').textContent = `${teamData.defensive_line_height_m} m`;
  document.getElementById('tacticalCardCompactness').textContent = `${teamData.compactness_m2} m²`;
  document.getElementById('tacticalCardCentroid').textContent = `X: ${teamData.centroid_m[0]}m, Y: ${teamData.centroid_m[1]}m`;

  const matrixList = document.getElementById('passingMatrixList');
  matrixList.innerHTML = '';
  const connections = state.tacticalTeam === 1 ? MATCH_DATA.passing_network.team_1 : MATCH_DATA.passing_network.team_2;
  
  connections.slice(0, 5).forEach(c => {
    const pFrom = MATCH_DATA.players.find(p => p.id === c.from);
    const pTo = MATCH_DATA.players.find(p => p.id === c.to);
    if (!pFrom || !pTo) return;

    const row = document.createElement('div');
    row.className = 'speed-row';
    row.innerHTML = `
      <div style="font-size: 0.8rem; font-weight: 600;">
        ${pFrom.name.split(' ').pop()} → ${pTo.name.split(' ').pop()}
      </div>
      <div style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); font-size: 0.85rem;">
        ${c.count} <span style="font-size: 0.65rem; color: var(--text-muted);">PASSES</span>
      </div>
    `;
    matrixList.appendChild(row);
  });
}

function renderTacticalStudio() {
  const w = tacticalCanvas.width;
  const h = tacticalCanvas.height;
  tacticalCtx.clearRect(0, 0, w, h);

  drawPitchBackground(tacticalCtx, w, h);
  updateTacticalSidebar();

  const teamPlayers = MATCH_DATA.players.filter(p => p.team === state.tacticalTeam);
  const teamColor = state.tacticalTeam === 1 ? '#00FF87' : '#00E5FF';

  if (state.tacticalMode === 'heatmap') {
    renderOccupancyHeatmap(tacticalCtx, w, h, teamPlayers, teamColor);
  } else if (state.tacticalMode === 'formation') {
    renderFormationLines(tacticalCtx, w, h, teamPlayers, teamColor);
  } else {
    renderPassingNetwork(tacticalCtx, w, h, teamPlayers, teamColor);
  }
}

// 1. Passing Network Renderer
function renderPassingNetwork(ctx, w, h, teamPlayers, teamColor) {
  const network = state.tacticalTeam === 1 ? MATCH_DATA.passing_network.team_1 : MATCH_DATA.passing_network.team_2;

  // Passing links
  network.forEach(link => {
    const fromP = teamPlayers.find(p => p.id === link.from);
    const toP = teamPlayers.find(p => p.id === link.to);
    if (!fromP || !toP) return;

    const fx = (fromP.x / 105) * w;
    const fy = (fromP.y / 68) * h;
    const tx = (toP.x / 105) * w;
    const ty = (toP.y / 68) * h;

    const isConnected = state.hoveredPlayer && (fromP.id === state.hoveredPlayer || toP.id === state.hoveredPlayer);
    const alpha = state.hoveredPlayer ? (isConnected ? 0.9 : 0.12) : 0.45;
    const lineWidth = Math.max(1.5, (link.count / 24) * 6);

    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.quadraticCurveTo((fx + tx) / 2 + 10, (fy + ty) / 2 - 10, tx, ty);
    ctx.strokeStyle = isConnected ? '#FFE600' : teamColor;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.globalAlpha = 1.0;
  });

  // Player Nodes
  teamPlayers.forEach(p => {
    const px = (p.x / 105) * w;
    const py = (p.y / 68) * h;
    const isHovered = state.hoveredPlayer === p.id;
    const radius = isHovered ? 18 : 14;

    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#ffffff' : '#0B141D';
    ctx.fill();
    ctx.strokeStyle = isHovered ? '#FFE600' : teamColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Jersey number
    ctx.fillStyle = isHovered ? '#000000' : '#ffffff';
    ctx.font = "700 11px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.number.toString(), px, py);

    // Player surname below node
    ctx.fillStyle = '#C8D6E5';
    ctx.font = "600 10px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(p.name.split(' ').pop(), px, py + radius + 11);
  });
}

// 2. Calibrated Pitch Occupancy Heatmap Renderer
function renderOccupancyHeatmap(ctx, w, h, teamPlayers, teamColor) {
  // Density gradient passes
  teamPlayers.forEach(p => {
    const px = (p.x / 105) * w;
    const py = (p.y / 68) * h;
    const radius = 60 + (p.stamina * 0.3);

    const grad = ctx.createRadialGradient(px, py, 5, px, py, radius);
    grad.addColorStop(0, 'rgba(255, 87, 34, 0.45)');
    grad.addColorStop(0.4, 'rgba(255, 184, 0, 0.25)');
    grad.addColorStop(0.8, 'rgba(0, 229, 255, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Re-draw minimal player dot positions
  teamPlayers.forEach(p => {
    const px = (p.x / 105) * w;
    const py = (p.y / 68) * h;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
}

// 3. Dynamic Team Formation & Lines Renderer
function renderFormationLines(ctx, w, h, teamPlayers, teamColor) {
  // Group players by approximate longitudinal X lines (Defenders, Midfielders, Attackers)
  const sortedByX = [...teamPlayers].sort((a, b) => a.x - b.x);
  const gk = sortedByX[0];
  const defenders = sortedByX.slice(1, 5);
  const midfielders = sortedByX.slice(5, 8);
  const attackers = sortedByX.slice(8, 11);

  const drawLine = (group, strokeColor) => {
    if (group.length < 2) return;
    const sortedY = [...group].sort((a, b) => a.y - b.y);
    ctx.beginPath();
    ctx.moveTo((sortedY[0].x / 105) * w, (sortedY[0].y / 68) * h);
    for (let i = 1; i < sortedY.length; i++) {
      ctx.lineTo((sortedY[i].x / 105) * w, (sortedY[i].y / 68) * h);
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  drawLine(defenders, 'rgba(0, 229, 255, 0.7)');
  drawLine(midfielders, 'rgba(0, 255, 135, 0.7)');
  drawLine(attackers, 'rgba(255, 184, 0, 0.7)');

  // Draw players
  teamPlayers.forEach(p => {
    const px = (p.x / 105) * w;
    const py = (p.y / 68) * h;
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = teamColor;
    ctx.fill();
    ctx.fillStyle = '#06090e';
    ctx.font = "700 9px 'JetBrains Mono', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.number.toString(), px, py);
  });
}

function handleTacticalHover(e) {
  const rect = tacticalCanvas.getBoundingClientRect();
  const scaleX = tacticalCanvas.width / rect.width;
  const scaleY = tacticalCanvas.height / rect.height;
  const mouseX = (e.clientX - rect.left) * scaleX;
  const mouseY = (e.clientY - rect.top) * scaleY;

  const teamPlayers = MATCH_DATA.players.filter(p => p.team === state.tacticalTeam);
  let found = null;

  for (const p of teamPlayers) {
    const px = (p.x / 105) * tacticalCanvas.width;
    const py = (p.y / 68) * tacticalCanvas.height;
    if (Math.hypot(mouseX - px, mouseY - py) < 18) {
      found = p;
      break;
    }
  }

  state.hoveredPlayer = found ? found.id : null;

  if (found) {
    uiTooltip.style.display = 'block';
    uiTooltip.style.left = `${e.clientX}px`;
    uiTooltip.style.top = `${e.clientY - 12}px`;
    uiTooltip.innerHTML = `
      <strong style="color: ${found.team === 1 ? 'var(--accent-green)' : 'var(--accent-cyan)'};">#${found.number} ${found.name}</strong> (${found.role})<br>
      Top Speed: <strong>${found.speed_max} km/h</strong><br>
      Pass Accuracy: <strong>${found.pass_acc}%</strong><br>
      Distance Covered: <strong>${found.distance_m} m</strong>
    `;
  } else {
    uiTooltip.style.display = 'none';
  }

  renderTacticalStudio();
}

// Highlights Studio
function initHighlightsStudio() {
  const grid = document.getElementById('highlightsCardGrid');
  grid.innerHTML = '';

  MATCH_DATA.highlights.forEach(hl => {
    const card = document.createElement('div');
    card.className = 'sidebar-card';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';
    card.style.cursor = 'pointer';

    card.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span class="timeline-event-marker marker-${hl.type}" style="position: static; transform: none;">${hl.type.toUpperCase()}</span>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${hl.timestamp}s</span>
        </div>
        <h3 style="font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 0.35rem;">${hl.title}</h3>
        <p style="font-size: 0.8rem; color: var(--accent-amber); font-weight: 600;">${hl.score_impact}</p>
      </div>
      <button class="btn btn-glass" style="margin-top: 1rem; width: 100%;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Play Segment
      </button>
    `;

    card.addEventListener('click', () => {
      // Switch back to match center and seek to highlight
      document.getElementById('tabMatchCenter').click();
      seekTime(hl.timestamp);
      if (video.paused) togglePlay();
    });

    grid.appendChild(card);
  });

  // Shot probability breakdown list
  const shotsList = document.getElementById('shotsListContainer');
  shotsList.innerHTML = '';
  const shotEvents = MATCH_DATA.events.filter(e => e.type === 'shot' || e.type === 'goal');

  shotEvents.forEach(s => {
    const player = MATCH_DATA.players.find(p => p.id === s.player_from);
    const item = document.createElement('div');
    item.className = 'speed-row';
    item.innerHTML = `
      <div>
        <div style="font-weight: 600; font-size: 0.82rem;">${player ? player.name : 'Unknown Player'}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">${s.outcome ? s.outcome.toUpperCase() : 'SHOT'} • ${s.shot_speed_kmh} km/h</div>
      </div>
      <div style="text-align: right;">
        <span style="font-family: var(--font-mono); font-weight: 700; color: ${s.type === 'goal' ? 'var(--accent-amber)' : 'var(--accent-green)'};">
          ${s.xg} xG
        </span>
      </div>
    `;
    shotsList.appendChild(item);
  });
}

// Modal Windows (Upload & Calibration)
function initUploadModal() {
  const modal = document.getElementById('uploadModal');
  const openBtn = document.getElementById('openUploadBtn');
  const closeBtn = document.getElementById('closeUploadModal');
  const cancelBtn = document.getElementById('cancelUploadBtn');
  const startBtn = document.getElementById('startProcessingBtn');

  const shotSlider = document.getElementById('shotConfSlider');
  const shotVal = document.getElementById('shotConfVal');
  const cooldownSlider = document.getElementById('shotCooldownSlider');
  const cooldownVal = document.getElementById('shotCooldownVal');

  openBtn.addEventListener('click', () => modal.classList.add('open'));
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  cancelBtn.addEventListener('click', () => modal.classList.remove('open'));

  shotSlider.addEventListener('input', () => {
    shotVal.textContent = parseFloat(shotSlider.value).toFixed(2);
  });
  cooldownSlider.addEventListener('input', () => {
    cooldownVal.textContent = parseFloat(cooldownSlider.value).toFixed(2) + 's';
  });

  startBtn.addEventListener('click', () => {
    startBtn.textContent = 'Processing Pipeline...';
    startBtn.disabled = true;
    setTimeout(() => {
      startBtn.textContent = 'Pipeline Finished!';
      setTimeout(() => {
        modal.classList.remove('open');
        startBtn.textContent = 'Start Computer Vision Pipeline';
        startBtn.disabled = false;
        seekTime(0);
        togglePlay();
      }, 700);
    }, 1200);
  });

  // Export Analysis JSON File Download
  document.getElementById('exportReportBtn').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MATCH_DATA, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `matchvision_analysis_${MATCH_DATA.analysis_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });
}

// Handle dynamic canvas sizing
function initResizeHandler() {
  window.addEventListener('resize', () => {
    updateCanvasSizes();
    renderFrame(state.currentTime);
  });
}

function updateCanvasSizes() {
  const container = document.getElementById('videoContainer');
  cvCanvas.width = container.clientWidth;
  cvCanvas.height = container.clientHeight;
}
