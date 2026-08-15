/**
 * 歌手たかはしたけし 公式ポータル メインスクリプト (script.js)
 * - 全6デザインテーマ（ガクトゥーン、神のみ白、神のみ夜、魔法科、ルネサンス、サイバー）の切替管理
 * - リアルタイム時計・Canvas背景エンジン（各テーマ別）
 * - URLパラメータ共有機能（?theme=...）
 * - モバイルドロワー & Lightboxモーダル
 */

// ==========================================================================
// 1. テーマ定義データ
// ==========================================================================
const THEMES = [
  {
    id: 'gahkthun',
    name: '黄雷のガクトゥーン',
    sub: 'スチームパンク × 黄金時計 & テスラ雷光',
    badge: 'STEAMPUNK / TESLA',
    css: 'themes/theme-gahkthun.css',
    engine: 'gahkthun',
    colors: ['#FFE600', '#B45309', '#0B0F19'],
    desc: '真鍮・鉄鋼の計器盤装飾と、鮮烈な黄金の稲妻テスラ放電＆黄金時計が駆動する重厚スチームパンク版'
  },
  {
    id: 'twgok-white',
    name: '神のみぞ知るセカイ（白）',
    sub: '白基調美術書 × 金箔アンティーク機械時計',
    badge: 'ELEGANT / CLOCKWORK',
    css: 'themes/theme-twgok-white.css',
    engine: 'twgok-white',
    colors: ['#FAF6F0', '#D97706', '#2A1F18'],
    desc: '象牙色・上質紙の美術書装丁に、真鍮歯車と時・分・秒がリアルタイムで刻まれる美しいアンティーク時計版'
  },
  {
    id: 'twgok-dark',
    name: '神のみぞ知るセカイ（夜）',
    sub: 'ミッドナイトブルー × 金箔押し機械時計',
    badge: 'MIDNIGHT / CLOCKWORK',
    css: 'themes/theme-twgok-dark.css',
    engine: 'twgok-dark',
    colors: ['#070B19', '#F59E0B', '#60A5FA'],
    desc: '夜空と星屑が舞うミッドナイトブルーに、金箔時計仕掛けが浮かび上がる幻想的なダーククロックワーク版'
  },
  {
    id: 'magica',
    name: '魔法科高校（Magica Pro）',
    sub: '白CADハイテク × イタリアントリコローレ',
    badge: 'HI-TECH CAD / READABLE',
    css: 'themes/theme-magica.css',
    engine: 'none',
    colors: ['#009246', '#FFFFFF', '#CE2B37'],
    desc: '白CADハイテクUIと鮮やかなイタリア国旗カラー（緑・白・赤）を融合させた高コントラスト視認性特化版'
  },
  {
    id: 'renaissance',
    name: 'Neo-Rinascimento',
    sub: 'イタリア・ルネサンス × サイバーパンク',
    badge: 'RENAISSANCE / CYBER',
    css: 'themes/theme-renaissance.css',
    engine: 'none',
    colors: ['#1A0B2E', '#F59E0B', '#9333EA'],
    desc: 'フィレンツェの大聖堂アーチ・古典美とネオンサイバーを融合させた重厚かつ華やかなネオ・ルネサンス版'
  },
  {
    id: 'cyber',
    name: '近未来スマートポータル',
    sub: 'ディープネイビー × ネオンシアン',
    badge: 'NEON CYBER / MINIMAL',
    css: 'themes/theme-cyber.css',
    engine: 'none',
    colors: ['#050814', '#00F0FF', '#3B82F6'],
    desc: '深藍の宇宙空間に鮮烈なネオンブルーとすりガラス効果が光る、初期スマートポータル版'
  }
];

// 現在実行中のCanvasアニメーション制御
let currentAnimationId = null;
let currentResizeHandler = null;
let currentMouseMoveHandler = null;

// ==========================================================================
// 2. DOMContentLoaded 初期化
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initMobileDrawer();
  initThemeManager();
});

// ==========================================================================
// 3. モバイルドロワー & Lightbox
// ==========================================================================
function initMobileDrawer() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      mobileDrawer.classList.add('is-active');
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-active');
      });
    }

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('is-active');
      });
    });

    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('is-active') && 
          !mobileDrawer.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        mobileDrawer.classList.remove('is-active');
      }
    });
  }
}

function openLightbox(title, desc, bgClass) {
  const modal = document.getElementById('lightbox-modal');
  const modalTitle = document.getElementById('lightbox-title');
  const modalDesc = document.getElementById('lightbox-desc');
  const modalDisplay = document.getElementById('lightbox-art-display');

  if (modal && modalTitle && modalDesc && modalDisplay) {
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalDisplay.className = `lightbox-view ${bgClass}`;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox(event) {
  const modal = document.getElementById('lightbox-modal');
  if (event.target === modal || event.target.closest('.lightbox-close')) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// ==========================================================================
// 4. テーママネージャー & UI構築
// ==========================================================================
function initThemeManager() {
  buildThemeSwitcherUI();

  // 初期テーマの判定: URLパラメータ (?theme=...) -> localStorage -> デフォルト (gahkthun)
  const urlParams = new URLSearchParams(window.location.search);
  const paramTheme = urlParams.get('theme');
  const savedTheme = localStorage.getItem('takahashi_selected_theme');

  let initialThemeId = 'gahkthun';
  if (paramTheme && THEMES.some(t => t.id === paramTheme)) {
    initialThemeId = paramTheme;
  } else if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
    initialThemeId = savedTheme;
  }

  switchTheme(initialThemeId, false);
}

function buildThemeSwitcherUI() {
  // フローティングボタン (FAB)
  const fab = document.createElement('button');
  fab.className = 'theme-switcher-fab';
  fab.id = 'theme-fab';
  fab.setAttribute('aria-label', 'デザイン切り替えメニューを開く');
  fab.innerHTML = `
    <span class="theme-fab-icon"><i class="fa-solid fa-palette"></i></span>
    <span class="theme-fab-text">デザイン切替</span>
    <span class="theme-fab-badge">全6種</span>
  `;

  // モーダル
  const backdrop = document.createElement('div');
  backdrop.className = 'theme-modal-backdrop';
  backdrop.id = 'theme-modal-backdrop';

  const modalCardsHtml = THEMES.map(theme => `
    <div class="theme-select-card" data-theme-id="${theme.id}">
      <div class="theme-card-top">
        <span class="theme-style-badge">${theme.badge}</span>
        <div class="theme-palette-dots">
          ${theme.colors.map(c => `<span class="palette-dot" style="background-color: ${c};"></span>`).join('')}
        </div>
      </div>
      <div class="theme-card-main">
        <div class="theme-card-title">
          <span>${theme.name}</span>
          <span class="active-check-badge"><i class="fa-solid fa-check"></i> 適用中</span>
        </div>
        <span class="theme-card-sub">${theme.sub}</span>
        <p class="theme-card-desc">${theme.desc}</p>
      </div>
    </div>
  `).join('');

  backdrop.innerHTML = `
    <div class="theme-modal-card">
      <div class="theme-modal-header">
        <div class="theme-header-info">
          <h3 class="theme-modal-title"><i class="fa-solid fa-wand-magic-sparkles"></i> デザイン＆世界観 ギャラリー</h3>
          <p class="theme-modal-subtitle">過去に作成した様々なデザインをお試しいただけます。お好きなスタイルをクリックしてください。</p>
        </div>
        <button class="theme-modal-close-btn" id="theme-modal-close" aria-label="閉じる"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="theme-modal-body">
        <div class="theme-cards-grid">
          ${modalCardsHtml}
        </div>
      </div>
      <div class="theme-modal-footer">
        <span class="theme-footer-note"><i class="fa-solid fa-circle-info"></i> 選択したデザインはブラウザに自動保存されます</span>
        <button class="theme-share-btn" id="theme-copy-link-btn">
          <i class="fa-solid fa-link"></i> このデザインのURLをコピー
        </button>
      </div>
    </div>
  `;

  // トースト通知
  const toast = document.createElement('div');
  toast.className = 'theme-toast';
  toast.id = 'theme-toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>デザイン用URLをクリップボードにコピーしました！</span>`;

  document.body.appendChild(fab);
  document.body.appendChild(backdrop);
  document.body.appendChild(toast);

  // イベントリスナー
  fab.addEventListener('click', () => {
    backdrop.classList.add('is-open');
  });

  const closeBtn = document.getElementById('theme-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      backdrop.classList.remove('is-open');
    });
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.remove('is-open');
    }
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) {
      backdrop.classList.remove('is-open');
    }
  });

  // テーマカードクリック
  const cards = backdrop.querySelectorAll('.theme-select-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const themeId = card.getAttribute('data-theme-id');
      switchTheme(themeId, true);
    });
  });

  // URLコピーボタン
  const copyBtn = document.getElementById('theme-copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const activeThemeId = document.documentElement.getAttribute('data-theme') || 'gahkthun';
      const url = new URL(window.location.href);
      url.searchParams.set('theme', activeThemeId);
      navigator.clipboard.writeText(url.toString()).then(() => {
        showToast('デザイン用共有URLをコピーしました！');
      }).catch(() => {
        showToast('URL: ' + url.toString());
      });
    });
  }
}

function showToast(message) {
  const toast = document.getElementById('theme-toast');
  if (toast) {
    toast.querySelector('span').textContent = message;
    toast.classList.add('is-show');
    setTimeout(() => {
      toast.classList.remove('is-show');
    }, 2800);
  }
}

// ==========================================================================
// 5. テーマ切り替え実行
// ==========================================================================
function switchTheme(themeId, userInitiated = false) {
  const targetTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  // 1. スタイルシートの切り替え
  let themeCssLink = document.getElementById('theme-css');
  if (!themeCssLink) {
    themeCssLink = document.createElement('link');
    themeCssLink.id = 'theme-css';
    themeCssLink.rel = 'stylesheet';
    document.head.appendChild(themeCssLink);
  }
  themeCssLink.href = targetTheme.css;

  // 2. data-theme属性の更新
  document.documentElement.setAttribute('data-theme', targetTheme.id);

  // 3. モーダル内のアクティブクラス更新
  document.querySelectorAll('.theme-select-card').forEach(card => {
    if (card.getAttribute('data-theme-id') === targetTheme.id) {
      card.classList.add('is-active');
    } else {
      card.classList.remove('is-active');
    }
  });

  // 4. 保存 & URL更新
  if (userInitiated) {
    localStorage.setItem('takahashi_selected_theme', targetTheme.id);
    const url = new URL(window.location.href);
    url.searchParams.set('theme', targetTheme.id);
    window.history.replaceState({}, '', url.toString());
  }

  // 5. Canvas 背景エンジンの切り替え
  stopCurrentCanvasEngine();

  if (targetTheme.engine === 'gahkthun') {
    startGahkthunEngine();
  } else if (targetTheme.engine === 'twgok-white') {
    startTWGOKWhiteEngine();
  } else if (targetTheme.engine === 'twgok-dark') {
    startTWGOKDarkEngine();
  } else {
    // Canvas非表示
    const canvas = document.getElementById('clockwork-canvas');
    if (canvas) {
      canvas.style.display = 'none';
    }
  }
}

function stopCurrentCanvasEngine() {
  if (currentAnimationId) {
    cancelAnimationFrame(currentAnimationId);
    currentAnimationId = null;
  }
  if (currentResizeHandler) {
    window.removeEventListener('resize', currentResizeHandler);
    currentResizeHandler = null;
  }
  if (currentMouseMoveHandler) {
    window.removeEventListener('mousemove', currentMouseMoveHandler);
    currentMouseMoveHandler = null;
  }
  const canvas = document.getElementById('clockwork-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function getOrCreateCanvas() {
  let canvas = document.getElementById('clockwork-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'clockwork-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
  }
  canvas.style.display = 'block';
  return canvas;
}

// ==========================================================================
// 6. Canvas エンジン: 黄雷のガクトゥーン (Gahkthun)
// ==========================================================================
function startGahkthunEngine() {
  const canvas = getOrCreateCanvas();
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  currentResizeHandler = resize;
  window.addEventListener('resize', resize);
  resize();

  function onMouseMove(e) {
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  }
  currentMouseMoveHandler = onMouseMove;
  window.addEventListener('mousemove', onMouseMove);

  // 黄金の火花・蒸気パーティクル
  const particleCount = 45;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.45 + 0.15,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.25 ? '#FFE600' : '#F59E0B'
    });
  }

  // 黄金の稲妻（Lightning Bolt）
  const lightningArcs = [];
  function triggerLightningArc(x1, y1, x2, y2) {
    const segments = [];
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(4, Math.floor(dist / 14));
    let curX = x1, curY = y1;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const nx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 16;
      const ny = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 16;
      segments.push({ x1: curX, y1: curY, x2: (i === steps ? x2 : nx), y2: (i === steps ? y2 : ny) });
      curX = nx;
      curY = ny;
    }

    lightningArcs.push({
      segments: segments,
      life: 1.0,
      decay: Math.random() * 0.08 + 0.06,
      width: Math.random() * 1.5 + 1.2,
      color: Math.random() > 0.3 ? '#FFE600' : '#FFFBEB'
    });
  }

  // 真鍮歯車描画
  function drawBrassGear(cx, cy, radius, teeth, teethHeight, angle, color, rimColor, spokeCount = 4) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.strokeStyle = color;
    ctx.fillStyle = 'rgba(12, 16, 26, 0.7)';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    const toothAngle = (Math.PI * 2) / teeth;
    const halfTooth = toothAngle * 0.25;

    for (let i = 0; i < teeth; i++) {
      const a = i * toothAngle;
      const rOuter = radius + teethHeight;
      const rInner = radius;

      const a1 = a - halfTooth;
      const a2 = a + halfTooth;
      const a3 = a + toothAngle * 0.5 - halfTooth;
      const a4 = a + toothAngle * 0.5 + halfTooth;

      if (i === 0) {
        ctx.moveTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      } else {
        ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      }
      ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
      ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
      ctx.lineTo(Math.cos(a3) * rInner, Math.sin(a3) * rInner);
      ctx.lineTo(Math.cos(a4) * rInner, Math.sin(a4) * rInner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = rimColor;
    ctx.stroke();

    for (let s = 0; s < spokeCount; s++) {
      const sa = (s * Math.PI * 2) / spokeCount;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sa) * (radius * 0.24), Math.sin(sa) * (radius * 0.24));
      ctx.lineTo(Math.cos(sa) * (radius * 0.76), Math.sin(sa) * (radius * 0.76));
      ctx.stroke();

      const rx = Math.cos(sa) * (radius * 0.52);
      const ry = Math.sin(sa) * (radius * 0.52);
      ctx.beginPath();
      ctx.arc(rx, ry, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE600';
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#111726';
    ctx.fill();
    ctx.strokeStyle = '#FFE600';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.restore();
  }

  // 黄金時計の描画
  function drawGahkthunClock(cx, cy, radius, now) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();

    const secFraction = (seconds + millis / 1000) / 60;
    const minFraction = (minutes + secFraction) / 60;
    const hourFraction = ((hours % 12) + minFraction) / 12;

    const secAngle = secFraction * Math.PI * 2 - Math.PI / 2;
    const minAngle = minFraction * Math.PI * 2 - Math.PI / 2;
    const hourAngle = hourFraction * Math.PI * 2 - Math.PI / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(0, 0, radius * 1.08, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.45)';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(229, 184, 105, 0.35)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 目盛り
    for (let i = 0; i < 60; i++) {
      const a = (i * Math.PI * 2) / 60 - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const r1 = isMajor ? radius * 0.85 : radius * 0.92;
      const r2 = radius * 0.98;

      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.strokeStyle = isMajor ? '#FFE600' : 'rgba(229, 184, 105, 0.4)';
      ctx.lineWidth = isMajor ? 2.0 : 1.0;
      ctx.stroke();
    }

    // ローマ数字
    const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.font = `600 ${Math.max(10, radius * 0.09)}px 'Cinzel', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFE600';
    for (let h = 0; h < 12; h++) {
      const a = (h * Math.PI * 2) / 12 - Math.PI / 2;
      const nr = radius * 0.74;
      ctx.fillText(romanNumerals[h], Math.cos(a) * nr, Math.sin(a) * nr);
    }

    // 時針
    ctx.save();
    ctx.rotate(hourAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-2, -radius * 0.52);
    ctx.lineTo(0, -radius * 0.58);
    ctx.lineTo(2, -radius * 0.52);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fillStyle = '#E5B869';
    ctx.fill();
    ctx.strokeStyle = '#FFE600';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 分針
    ctx.save();
    ctx.rotate(minAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(-3, 0);
    ctx.lineTo(-1.5, -radius * 0.76);
    ctx.lineTo(0, -radius * 0.83);
    ctx.lineTo(1.5, -radius * 0.76);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fillStyle = '#FFE600';
    ctx.fill();
    ctx.restore();

    // 稲妻秒針
    ctx.save();
    ctx.rotate(secAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 18);
    ctx.lineTo(0, -radius * 0.25);
    ctx.lineTo(4, -radius * 0.45);
    ctx.lineTo(-2, -radius * 0.52);
    ctx.lineTo(5, -radius * 0.75);
    ctx.lineTo(0, -radius * 0.92);
    ctx.strokeStyle = '#FFFBEB';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#FFE600';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 中心の真鍮ハブ
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE600';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#07090F';
    ctx.fill();

    ctx.restore();
  }

  let lastArcTime = 0;
  let angleOffset = 0;

  function render(time) {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    angleOffset += 0.003;

    ctx.clearRect(0, 0, width, height);

    const clockX = width * 0.82 + mouseX * 0.8;
    const clockY = height * 0.32 + mouseY * 0.8;
    const clockRadius = Math.min(width, height) * 0.22;

    const now = new Date();

    // 歯車描画
    drawBrassGear(clockX - clockRadius * 0.85, clockY + clockRadius * 0.85, clockRadius * 0.55, 16, 10, -angleOffset * 1.5, 'rgba(229, 184, 105, 0.35)', 'rgba(255, 230, 0, 0.4)', 6);
    drawBrassGear(clockX + clockRadius * 0.95, clockY - clockRadius * 0.5, clockRadius * 0.45, 14, 8, angleOffset * 2.0, 'rgba(197, 155, 71, 0.3)', 'rgba(255, 230, 0, 0.35)', 4);
    drawBrassGear(width * 0.12 + mouseX * 0.4, height * 0.78 + mouseY * 0.4, clockRadius * 0.7, 20, 12, angleOffset * 0.8, 'rgba(229, 184, 105, 0.25)', 'rgba(255, 230, 0, 0.3)', 8);

    // 時計本体
    drawGahkthunClock(clockX, clockY, clockRadius, now);

    // テスラ雷光スパーク
    if (time - lastArcTime > 1400 + Math.random() * 2000) {
      lastArcTime = time;
      triggerLightningArc(
        clockX + (Math.random() - 0.5) * clockRadius * 1.2,
        clockY + (Math.random() - 0.5) * clockRadius * 1.2,
        clockX + (Math.random() - 0.5) * clockRadius * 2.2,
        clockY + (Math.random() - 0.5) * clockRadius * 2.2
      );
    }

    // 稲妻アーク更新＆描画
    for (let i = lightningArcs.length - 1; i >= 0; i--) {
      const arc = lightningArcs[i];
      arc.life -= arc.decay;
      if (arc.life <= 0) {
        lightningArcs.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = arc.width * arc.life;
      ctx.globalAlpha = arc.life;
      ctx.shadowColor = '#FFE600';
      ctx.shadowBlur = 12 * arc.life;
      ctx.beginPath();
      arc.segments.forEach((seg, idx) => {
        if (idx === 0) ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      });
      ctx.stroke();
      ctx.restore();
    }

    // パーティクル更新
    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.pulse += 0.03;
      if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      const alpha = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    currentAnimationId = requestAnimationFrame(render);
  }

  currentAnimationId = requestAnimationFrame(render);
}

// ==========================================================================
// 7. Canvas エンジン: 神のみぞ知るセカイ（白） (TWGOK White)
// ==========================================================================
function startTWGOKWhiteEngine() {
  const canvas = getOrCreateCanvas();
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  currentResizeHandler = resize;
  window.addEventListener('resize', resize);
  resize();

  function onMouseMove(e) {
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  }
  currentMouseMoveHandler = onMouseMove;
  window.addEventListener('mousemove', onMouseMove);

  // 星屑パーティクル
  const particleCount = 40;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.35 + 0.15,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#D97706' : (Math.random() > 0.5 ? '#7E22CE' : '#2563EB')
    });
  }

  function drawGear(cx, cy, radius, teeth, teethHeight, angle, color, spokeCount = 4) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    const toothAngle = (Math.PI * 2) / teeth;
    const halfTooth = toothAngle * 0.25;

    for (let i = 0; i < teeth; i++) {
      const a = i * toothAngle;
      const rOuter = radius + teethHeight;
      const rInner = radius;

      const a1 = a - halfTooth;
      const a2 = a + halfTooth;
      const a3 = a + toothAngle * 0.5 - halfTooth;
      const a4 = a + toothAngle * 0.5 + halfTooth;

      if (i === 0) {
        ctx.moveTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      } else {
        ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      }
      ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
      ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
      ctx.lineTo(Math.cos(a3) * rInner, Math.sin(a3) * rInner);
      ctx.lineTo(Math.cos(a4) * rInner, Math.sin(a4) * rInner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    for (let s = 0; s < spokeCount; s++) {
      const sa = (s * Math.PI * 2) / spokeCount;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sa) * (radius * 0.25), Math.sin(sa) * (radius * 0.25));
      ctx.lineTo(Math.cos(sa) * (radius * 0.75), Math.sin(sa) * (radius * 0.75));
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawTWGOKClock(cx, cy, radius, now) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();

    const secFraction = (seconds + millis / 1000) / 60;
    const minFraction = (minutes + secFraction) / 60;
    const hourFraction = ((hours % 12) + minFraction) / 12;

    const secAngle = secFraction * Math.PI * 2 - Math.PI / 2;
    const minAngle = minFraction * Math.PI * 2 - Math.PI / 2;
    const hourAngle = hourFraction * Math.PI * 2 - Math.PI / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 目盛り
    for (let i = 0; i < 60; i++) {
      const a = (i * Math.PI * 2) / 60 - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const r1 = isMajor ? radius * 0.88 : radius * 0.93;
      const r2 = radius * 0.97;

      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.strokeStyle = isMajor ? '#B45309' : 'rgba(180, 83, 9, 0.35)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    // ローマ数字
    const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.font = `600 ${Math.max(10, radius * 0.1)}px 'Cinzel', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#B45309';
    for (let h = 0; h < 12; h++) {
      const a = (h * Math.PI * 2) / 12 - Math.PI / 2;
      const nr = radius * 0.78;
      ctx.fillText(romanNumerals[h], Math.cos(a) * nr, Math.sin(a) * nr);
    }

    // 針
    // 時針
    ctx.save();
    ctx.rotate(hourAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(0, -radius * 0.5);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fillStyle = '#92400E';
    ctx.fill();
    ctx.restore();

    // 分針
    ctx.save();
    ctx.rotate(minAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-3, 0);
    ctx.lineTo(0, -radius * 0.75);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fillStyle = '#B45309';
    ctx.fill();
    ctx.restore();

    // 秒針
    ctx.save();
    ctx.rotate(secAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, -radius * 0.88);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 中心の留め具
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#B45309';
    ctx.fill();

    ctx.restore();
  }

  let angleOffset = 0;

  function render() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    angleOffset += 0.003;

    ctx.clearRect(0, 0, width, height);

    const clockX = width * 0.82 + mouseX * 0.8;
    const clockY = height * 0.32 + mouseY * 0.8;
    const clockRadius = Math.min(width, height) * 0.22;

    const now = new Date();

    // 歯車
    drawGear(clockX - clockRadius * 0.8, clockY + clockRadius * 0.8, clockRadius * 0.5, 14, 8, -angleOffset * 1.5, 'rgba(217, 119, 6, 0.45)', 6);
    drawGear(clockX + clockRadius * 0.9, clockY - clockRadius * 0.4, clockRadius * 0.4, 12, 7, angleOffset * 2.0, 'rgba(180, 83, 9, 0.4)', 4);

    // 時計本体
    drawTWGOKClock(clockX, clockY, clockRadius, now);

    // パーティクル
    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.pulse += 0.03;
      if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      const alpha = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    currentAnimationId = requestAnimationFrame(render);
  }

  currentAnimationId = requestAnimationFrame(render);
}

// ==========================================================================
// 8. Canvas エンジン: 神のみぞ知るセカイ（夜） (TWGOK Dark)
// ==========================================================================
function startTWGOKDarkEngine() {
  const canvas = getOrCreateCanvas();
  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  currentResizeHandler = resize;
  window.addEventListener('resize', resize);
  resize();

  function onMouseMove(e) {
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  }
  currentMouseMoveHandler = onMouseMove;
  window.addEventListener('mousemove', onMouseMove);

  // 金箔星屑パーティクル
  const particleCount = 45;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.8,
      speedY: Math.random() * 0.4 + 0.15,
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.3 ? '#F59E0B' : (Math.random() > 0.5 ? '#60A5FA' : '#C084FC')
    });
  }

  function drawGear(cx, cy, radius, teeth, teethHeight, angle, color, spokeCount = 4) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.fillStyle = 'rgba(7, 11, 25, 0.75)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    const toothAngle = (Math.PI * 2) / teeth;
    const halfTooth = toothAngle * 0.25;

    for (let i = 0; i < teeth; i++) {
      const a = i * toothAngle;
      const rOuter = radius + teethHeight;
      const rInner = radius;

      const a1 = a - halfTooth;
      const a2 = a + halfTooth;
      const a3 = a + toothAngle * 0.5 - halfTooth;
      const a4 = a + toothAngle * 0.5 + halfTooth;

      if (i === 0) {
        ctx.moveTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      } else {
        ctx.lineTo(Math.cos(a1) * rInner, Math.sin(a1) * rInner);
      }
      ctx.lineTo(Math.cos(a1) * rOuter, Math.sin(a1) * rOuter);
      ctx.lineTo(Math.cos(a2) * rOuter, Math.sin(a2) * rOuter);
      ctx.lineTo(Math.cos(a2) * rInner, Math.sin(a2) * rInner);
      ctx.lineTo(Math.cos(a3) * rInner, Math.sin(a3) * rInner);
      ctx.lineTo(Math.cos(a4) * rInner, Math.sin(a4) * rInner);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    for (let s = 0; s < spokeCount; s++) {
      const sa = (s * Math.PI * 2) / spokeCount;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sa) * (radius * 0.25), Math.sin(sa) * (radius * 0.25));
      ctx.lineTo(Math.cos(sa) * (radius * 0.75), Math.sin(sa) * (radius * 0.75));
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#070B19';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawDarkClock(cx, cy, radius, now) {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const millis = now.getMilliseconds();

    const secFraction = (seconds + millis / 1000) / 60;
    const minFraction = (minutes + secFraction) / 60;
    const hourFraction = ((hours % 12) + minFraction) / 12;

    const secAngle = secFraction * Math.PI * 2 - Math.PI / 2;
    const minAngle = minFraction * Math.PI * 2 - Math.PI / 2;
    const hourAngle = hourFraction * Math.PI * 2 - Math.PI / 2;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let i = 0; i < 60; i++) {
      const a = (i * Math.PI * 2) / 60 - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const r1 = isMajor ? radius * 0.88 : radius * 0.93;
      const r2 = radius * 0.97;

      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
      ctx.strokeStyle = isMajor ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.stroke();
    }

    const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    ctx.font = `600 ${Math.max(10, radius * 0.1)}px 'Cinzel', serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#F59E0B';
    for (let h = 0; h < 12; h++) {
      const a = (h * Math.PI * 2) / 12 - Math.PI / 2;
      const nr = radius * 0.78;
      ctx.fillText(romanNumerals[h], Math.cos(a) * nr, Math.sin(a) * nr);
    }

    // 針
    // 時針
    ctx.save();
    ctx.rotate(hourAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(0, -radius * 0.5);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fillStyle = '#D97706';
    ctx.fill();
    ctx.restore();

    // 分針
    ctx.save();
    ctx.rotate(minAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(-3, 0);
    ctx.lineTo(0, -radius * 0.75);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fillStyle = '#F59E0B';
    ctx.fill();
    ctx.restore();

    // 秒針
    ctx.save();
    ctx.rotate(secAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, -radius * 0.88);
    ctx.strokeStyle = '#60A5FA';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#60A5FA';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();

    ctx.restore();
  }

  let angleOffset = 0;

  function render() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;
    angleOffset += 0.003;

    ctx.clearRect(0, 0, width, height);

    const clockX = width * 0.82 + mouseX * 0.8;
    const clockY = height * 0.32 + mouseY * 0.8;
    const clockRadius = Math.min(width, height) * 0.22;

    const now = new Date();

    drawGear(clockX - clockRadius * 0.8, clockY + clockRadius * 0.8, clockRadius * 0.5, 14, 8, -angleOffset * 1.5, 'rgba(245, 158, 11, 0.4)', 6);
    drawGear(clockX + clockRadius * 0.9, clockY - clockRadius * 0.4, clockRadius * 0.4, 12, 7, angleOffset * 2.0, 'rgba(217, 119, 6, 0.35)', 4);

    drawDarkClock(clockX, clockY, clockRadius, now);

    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.pulse += 0.03;
      if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;

      const alpha = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    currentAnimationId = requestAnimationFrame(render);
  }

  currentAnimationId = requestAnimationFrame(render);
}
