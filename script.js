/**
 * 声楽家 たかはしたけし 公式ポータル スクリプト (script.js)
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

  // 2. お問い合わせフォーム送信シミュレーション
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHTML = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';

      setTimeout(() => {
        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> 送信完了：お問い合わせありがとうございます。';
        formFeedback.style.display = 'block';

        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;

        setTimeout(() => {
          formFeedback.style.display = 'none';
        }, 5000);
      }, 600);
    });
  }
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
