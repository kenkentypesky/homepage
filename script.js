/**
 * 歌手たかはしたけし 公式ポータル スクリプト (script.js)
 * コンセプト: 『黄雷のガクトゥーン (Gahkthun of the Golden Lightning)』
 * 黄金時計（Golden Chronometer）& 黄金の雷光（テスラ放電スパーク）エンジン
 * 完全リアルタイム同期（時・分・秒運針）
 * HTML完全無変更で動作
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. モバイルドロワーメニューの開閉
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

    // ドロワー外クリックで閉じる
    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('is-active') && 
          !mobileDrawer.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        mobileDrawer.classList.remove('is-active');
      }
    });
  }

  // 2. 『黄雷のガクトゥーン』黄金時計 & テスラ雷光 Canvas 背景エンジンの起動
  initGahkthunClockworkCanvas();
});

// 3. Lightbox Modal functions
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
// 4. 『黄雷のガクトゥーン』黄金時計 & 黄金の雷光（Tesla Lightning）Canvas
// ==========================================================================
function initGahkthunClockworkCanvas() {
  let canvas = document.getElementById('clockwork-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'clockwork-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
  }

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;
  let rawMouseX = 0, rawMouseY = 0;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    rawMouseX = e.clientX;
    rawMouseY = e.clientY;
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  });

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

  // 黄金の稲妻（Lightning Bolt）生成器
  const lightningArcs = [];
  function triggerLightningArc(x1, y1, x2, y2, branches = 2) {
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

  // スチームパンク真鍮歯車描画ヘルパー
  function drawBrassGear(cx, cy, radius, teeth, teethHeight, angle, color, rimColor, spokeCount = 4) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.strokeStyle = color;
    ctx.fillStyle = 'rgba(12, 16, 26, 0.7)';
    ctx.lineWidth = 1.6;

    // 歯車の外周・歯型
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

    // 内円（真鍮リム）
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.76, 0, Math.PI * 2);
    ctx.strokeStyle = rimColor;
    ctx.stroke();

    // スポーク（補強軸棒 & リベット穴）
    for (let s = 0; s < spokeCount; s++) {
      const sa = (s * Math.PI * 2) / spokeCount;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sa) * (radius * 0.24), Math.sin(sa) * (radius * 0.24));
      ctx.lineTo(Math.cos(sa) * (radius * 0.76), Math.sin(sa) * (radius * 0.76));
      ctx.stroke();

      // リベット
      const rx = Math.cos(sa) * (radius * 0.52);
      const ry = Math.sin(sa) * (radius * 0.52);
      ctx.beginPath();
      ctx.arc(rx, ry, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFE600';
      ctx.fill();
    }

    // センターハブ
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 20, 32, 0.95)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();

    // センター放電コア
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE600';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFE600';
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  // ローマ数字
  const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  let globalTick = 0;
  let lastSparkTime = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    globalTick += 0.018;

    // 現在時刻の正確な取得
    const now = new Date();
    const millis = now.getMilliseconds();
    const secs = now.getSeconds() + millis / 1000;
    const mins = now.getMinutes() + secs / 60;
    const hours = (now.getHours() % 12) + mins / 60;

    // ==========================================================
    // 1. 浮遊する黄金の火花・スチーム粒子
    // ==========================================================
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y -= p.speedY;
      p.x += p.speedX;
      p.pulse += 0.04;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ==========================================================
    // 2. 右上の『ガクトゥーン』巨大黄金時計 (Gahkthun Chronometer)
    // ==========================================================
    const clockX = width * 0.85 + mouseX * 0.5;
    const clockY = height * 0.28 + mouseY * 0.5;
    const clockRadius = Math.min(width * 0.32, 280);

    ctx.save();
    ctx.translate(clockX, clockY);

    // ランダムな黄金雷光スパーク（テスラ放電）のトリガー
    if (Math.random() < 0.06) {
      const sparkAngle = Math.random() * Math.PI * 2;
      const r1 = Math.random() * 20;
      const r2 = clockRadius * (0.4 + Math.random() * 0.55);
      triggerLightningArc(
        clockX + Math.cos(sparkAngle) * r1,
        clockY + Math.sin(sparkAngle) * r1,
        clockX + Math.cos(sparkAngle + (Math.random() - 0.5) * 0.4) * r2,
        clockY + Math.sin(sparkAngle + (Math.random() - 0.5) * 0.4) * r2
      );
    }

    // 外枠二重真鍮サークル & 黄金発光
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(255, 230, 0, 0.3)';
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, clockRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(197, 155, 71, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, clockRadius - 14, 0, Math.PI * 2);
    ctx.stroke();

    // 60分割のミニッツインデックス（真上が0分=12時）
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI * 2) / 60 - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const len = isMajor ? 12 : 5;
      const r1 = clockRadius - 14;
      const r2 = r1 - len;

      ctx.strokeStyle = isMajor ? '#FFE600' : 'rgba(229, 184, 105, 0.4)';
      ctx.lineWidth = isMajor ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.stroke();
    }

    // 12個のローマ数字文字盤（黄金の雷光フォント）
    ctx.font = `800 ${Math.max(12, clockRadius * 0.086)}px "Cinzel", serif`;
    ctx.fillStyle = '#FFE600';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(255, 230, 0, 0.6)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
      const rText = clockRadius - 32;
      const tx = Math.cos(angle) * rText;
      const ty = Math.sin(angle) * rText;
      ctx.fillText(romanNumerals[i], tx, ty);
    }
    ctx.shadowBlur = 0;

    // 内部のテスラ計器リング
    ctx.strokeStyle = 'rgba(255, 230, 0, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, clockRadius * 0.58, 0, Math.PI * 2);
    ctx.stroke();

    // 背面の多重連動スチームパンク真鍮歯車たち
    drawBrassGear(-clockRadius * 0.35, -clockRadius * 0.25, 48, 18, 6, globalTick * 0.5, '#C59B47', '#FFE600', 6);
    drawBrassGear(clockRadius * 0.3, clockRadius * 0.28, 68, 24, 7, -globalTick * 0.35, '#E5B869', '#FFE600', 8);
    drawBrassGear(-clockRadius * 0.2, clockRadius * 0.42, 40, 14, 5, globalTick * 0.6, '#8C662D', '#C59B47', 4);

    // ==========================================================
    // ガクトゥーン時計針（正確な現在時刻）
    // ==========================================================

    // 1. 時針 (Hour Hand - 重厚な真鍮スチームパンク針)
    const hourAngle = (hours * Math.PI * 2) / 12;
    ctx.save();
    ctx.rotate(hourAngle);
    ctx.strokeStyle = '#E5B869';
    ctx.fillStyle = '#C59B47';
    ctx.lineWidth = 3.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFE600';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, -clockRadius * 0.5);
    ctx.stroke();
    // 矢尻・ダイヤモンドヘッド
    ctx.beginPath();
    ctx.arc(0, -clockRadius * 0.35, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();

    // 2. 分針 (Minute Hand - 鋭角なテスラブレード針)
    const minAngle = (mins * Math.PI * 2) / 60;
    ctx.save();
    ctx.rotate(minAngle);
    ctx.strokeStyle = '#FFFBEB';
    ctx.fillStyle = '#FFE600';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#FFE600';
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.lineTo(0, -clockRadius * 0.74);
    ctx.stroke();
    // ブレードリング
    ctx.beginPath();
    ctx.arc(0, -clockRadius * 0.58, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fill();
    ctx.restore();

    // 3. 秒針 (Second Hand - 黄金の稲妻ジグザグ針⚡)
    const secAngle = (secs * Math.PI * 2) / 60;
    ctx.save();
    ctx.rotate(secAngle);
    ctx.strokeStyle = '#FFE600';
    ctx.fillStyle = '#FFE600';
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 16;
    ctx.shadowColor = '#FFE600';
    
    // 稲妻ジグザグ形状の秒針
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(0, 0);
    ctx.lineTo(3, -clockRadius * 0.2);
    ctx.lineTo(-3, -clockRadius * 0.4);
    ctx.lineTo(4, -clockRadius * 0.65);
    ctx.lineTo(0, -clockRadius * 0.86);
    ctx.stroke();

    // 後端の放電球
    ctx.beginPath();
    ctx.arc(0, 16, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 中心軸キャップ（テスラ放電コア）
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFE600';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFE600';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();

    // ==========================================================
    // 3. 左下のテスラコイル放電管 & 連動真鍮歯車クラスタ
    // ==========================================================
    const gearX = width * 0.08 + mouseX * 0.3;
    const gearY = height * 0.78 + mouseY * 0.3;

    ctx.save();
    ctx.translate(gearX, gearY);

    // テスラコイル球体間の放電
    if (Math.random() < 0.1) {
      triggerLightningArc(gearX, gearY - 40, gearX + 80, gearY + 30);
    }

    // 噛み合う3連真鍮歯車
    drawBrassGear(0, 0, 82, 28, 8, globalTick * 0.25, '#C59B47', '#FFE600', 6);
    drawBrassGear(110, -55, 52, 18, 6, -globalTick * 0.4, '#E5B869', '#FFE600', 4);
    drawBrassGear(-75, 78, 42, 14, 5, -globalTick * 0.5, '#8C662D', '#C59B47', 4);

    ctx.restore();

    // ==========================================================
    // 4. 黄金の稲妻（Lightning Arcs）の描画 & 更新
    // ==========================================================
    for (let i = lightningArcs.length - 1; i >= 0; i--) {
      const arc = lightningArcs[i];
      arc.life -= arc.decay;

      if (arc.life <= 0) {
        lightningArcs.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = arc.life;
      ctx.strokeStyle = arc.color;
      ctx.lineWidth = arc.width;
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#FFE600';

      ctx.beginPath();
      for (const seg of arc.segments) {
        ctx.moveTo(seg.x1, seg.y1);
        ctx.lineTo(seg.x2, seg.y2);
      }
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
