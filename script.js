/**
 * 歌手たかはしたけし 公式ポータル スクリプト (script.js)
 * コンセプト: 『神のみぞ知るセカイ』風 白基調アンティーク機械時計 & 歯車エンジン
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

  // 2. 『神のみぞ知るセカイ』白基調 機械時計 & 歯車 Canvas 背景エンジンの起動
  initClockworkCanvas();
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
// 4. 白基調 機械時計（Clockwork Engine）& 歯車・天球盤・星屑 Canvas
// ==========================================================================
function initClockworkCanvas() {
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

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX - width / 2) * 0.05;
    targetMouseY = (e.clientY - height / 2) * 0.05;
  });

  // 星屑パーティクルの初期化（白背景用：アンバーゴールド & サファイア & アメジスト）
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

  // 歯車描画ヘルパー（白背景でクッキリ映える真鍮・アンバーゴールド）
  function drawGear(cx, cy, radius, teeth, teethHeight, angle, color, spokeCount = 4) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.strokeStyle = color;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.5;

    // 歯車の輪郭
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

    // 内円（リム）
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 2);
    ctx.stroke();

    // スポーク（軸棒）
    for (let s = 0; s < spokeCount; s++) {
      const sa = (s * Math.PI * 2) / spokeCount;
      ctx.beginPath();
      ctx.moveTo(Math.cos(sa) * (radius * 0.2), Math.sin(sa) * (radius * 0.2));
      ctx.lineTo(Math.cos(sa) * (radius * 0.75), Math.sin(sa) * (radius * 0.75));
      ctx.stroke();
    }

    // センターハブ & ルビー調センター
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#E11D48'; // ルビー軸受
    ctx.fill();

    ctx.restore();
  }

  // ローマ数字の配列
  const romanNumerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  let globalTick = 0;

  function render() {
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    globalTick += 0.015;

    const now = new Date();
    const millis = now.getMilliseconds();
    const secs = now.getSeconds() + millis / 1000;
    const mins = now.getMinutes() + secs / 60;
    const hours = (now.getHours() % 12) + mins / 60;

    // ==========================================================
    // 1. 浮遊する星屑パーティクル（白背景用）
    // ==========================================================
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y -= p.speedY;
      p.x += p.speedX;
      p.pulse += 0.03;

      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }

      const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ==========================================================
    // 2. 右上の巨大スケルトン機械時計 (Main Clockwork Hub)
    // ==========================================================
    const clockX = width * 0.85 + mouseX * 0.5;
    const clockY = height * 0.28 + mouseY * 0.5;
    const clockRadius = Math.min(width * 0.32, 280);

    ctx.save();
    ctx.translate(clockX, clockY);

    // 外枠二重サークル（アストロレール）
    ctx.strokeStyle = 'rgba(180, 131, 22, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, clockRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, clockRadius - 12, 0, Math.PI * 2);
    ctx.stroke();

    // 60分割のミニッツインデックス
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI * 2) / 60 - Math.PI / 2;
      const isMajor = i % 5 === 0;
      const len = isMajor ? 10 : 4;
      const r1 = clockRadius - 12;
      const r2 = r1 - len;

      ctx.strokeStyle = isMajor ? 'rgba(180, 131, 22, 0.8)' : 'rgba(180, 131, 22, 0.3)';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
      ctx.lineTo(Math.cos(angle) * r2, Math.sin(angle) * r2);
      ctx.stroke();
    }

    // 12個のローマ数字文字盤（白背景でクッキリ読めるクラシックゴールド）
    ctx.font = `700 ${Math.max(12, clockRadius * 0.082)}px "Cinzel", serif`;
    ctx.fillStyle = '#92400E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
      const rText = clockRadius - 28;
      const tx = Math.cos(angle) * rText;
      const ty = Math.sin(angle) * rText;
      ctx.fillText(romanNumerals[i], tx, ty);
    }

    // 内部の幾何学リング
    ctx.strokeStyle = 'rgba(180, 131, 22, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, clockRadius * 0.58, 0, Math.PI * 2);
    ctx.stroke();

    // 連動する背面のアンティーク歯車たち
    drawGear(-clockRadius * 0.35, -clockRadius * 0.25, 45, 18, 5, globalTick * 0.5, 'rgba(180, 131, 22, 0.4)', 6);
    drawGear(clockRadius * 0.3, clockRadius * 0.28, 65, 24, 6, -globalTick * 0.35, 'rgba(217, 119, 6, 0.38)', 8);
    drawGear(-clockRadius * 0.2, clockRadius * 0.4, 38, 14, 4, globalTick * 0.6, 'rgba(146, 64, 14, 0.35)', 5);

    // 時計の針（ブレゲ風ヴィクトリアン・フィリグリー針）
    // 1. 時針 (Hour Hand - ディープ真鍮)
    const hourAngle = (hours * Math.PI * 2) / 12 - Math.PI / 2;
    ctx.save();
    ctx.rotate(hourAngle);
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, -clockRadius * 0.48);
    ctx.stroke();
    // ブレゲサークル
    ctx.beginPath();
    ctx.arc(0, -clockRadius * 0.36, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. 分針 (Minute Hand - クラシックゴールド)
    const minAngle = (mins * Math.PI * 2) / 60 - Math.PI / 2;
    ctx.save();
    ctx.rotate(minAngle);
    ctx.strokeStyle = '#B48316';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.lineTo(0, -clockRadius * 0.72);
    ctx.stroke();
    // ブレゲサークル
    ctx.beginPath();
    ctx.arc(0, -clockRadius * 0.58, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. 秒針 (Second Hand - 鮮烈なルビーレッド)
    const secAngle = (secs * Math.PI * 2) / 60 - Math.PI / 2;
    ctx.save();
    ctx.rotate(secAngle);
    ctx.strokeStyle = '#E11D48';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(0, -clockRadius * 0.82);
    ctx.stroke();
    // カウンターウェイト
    ctx.beginPath();
    ctx.arc(0, 14, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#E11D48';
    ctx.fill();
    ctx.restore();

    // 中心軸キャップ
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#D97706';
    ctx.fill();
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // ==========================================================
    // 3. 左下の重層歯車クラスタ & 振り子 (Secondary Clockwork)
    // ==========================================================
    const gearX = width * 0.08 + mouseX * 0.3;
    const gearY = height * 0.78 + mouseY * 0.3;

    ctx.save();
    ctx.translate(gearX, gearY);

    // 振り子 (Swinging Pendulum)
    const pendulumAngle = Math.sin(globalTick * 1.6) * 0.18;
    ctx.save();
    ctx.rotate(pendulumAngle);
    ctx.strokeStyle = 'rgba(180, 131, 22, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 160);
    ctx.stroke();
    // 振り子ボブ
    ctx.beginPath();
    ctx.arc(0, 160, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#B48316';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 噛み合う3連歯車
    drawGear(0, 0, 80, 28, 7, globalTick * 0.25, 'rgba(180, 131, 22, 0.35)', 6);
    drawGear(105, -55, 50, 18, 5, -globalTick * 0.4, 'rgba(217, 119, 6, 0.38)', 4);
    drawGear(-70, 75, 40, 14, 4, -globalTick * 0.5, 'rgba(146, 64, 14, 0.3)', 4);

    ctx.restore();

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
