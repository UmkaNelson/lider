(function() {
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav-links');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('active');
      nav.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen.toString());
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Close mobile menu when clicking logo
  const brand = document.querySelector('.brand');
  brand?.addEventListener('click', () => {
    nav?.classList.remove('open');
    burger?.classList.remove('active');
    burger?.setAttribute('aria-expanded', 'false');
  });

  // Warm up cache for all on-page images right after initial render
  const siteImages = [
    'images/logo-main.png',
    'images/logo-fav.png',
    'images/pc1.png',
    'images/pc2.jpg',
    'images/pc3.png',
    'images/pc4.jpg',
    'images/pc6.png',
    'images/slider/slide1.png',
    'images/slider/slide2.png',
    'images/slider/slide3.png',
    'images/slider/slide4.png',
    'images/slider/slide5.png',
    'images/slider/slide11.png',
    'images/slider/slide12.png',
    'images/slider/slide13.png',
    'images/slider/slide14.png',
    'images/slider/slide15.png'
  ];

  const preloadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = resolve;
    img.decoding = 'async';
    img.src = src;
  });

  const preloadAllImages = () => {
    Promise.allSettled(siteImages.map(preloadImage));
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadAllImages, { timeout: 1200 });
  } else {
    window.setTimeout(preloadAllImages, 250);
  }

  // Slider
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const prevBtn = document.querySelector('.slider__btn.prev');
  const nextBtn = document.querySelector('.slider__btn.next');

  let currentIndex = 0;
  let autoTimer = null;
  let resumeTimer = null;
  const autoDelay = 5000;
  const manualPause = 10000;

  const setActiveSlide = (index) => {
    if (!slides.length) return;
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const active = i === currentIndex;
      slide.classList.toggle('active', active);
      slide.setAttribute('aria-hidden', (!active).toString());
    });
    dots.forEach((dot, i) => {
      const active = i === currentIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active.toString());
    });
  };

  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => setActiveSlide(currentIndex + 1), autoDelay);
  };

  const pauseAuto = () => {
    clearInterval(autoTimer);
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => startAuto(), manualPause);
  };

  if (slides.length) {
    startAuto();
  }

  const handleManual = (delta) => {
    setActiveSlide(currentIndex + delta);
    pauseAuto();
  };

  prevBtn?.addEventListener('click', () => handleManual(-1));
  nextBtn?.addEventListener('click', () => handleManual(1));

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = Number(dot.dataset.index || 0);
      setActiveSlide(idx);
      pauseAuto();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(autoTimer);
    } else {
      startAuto();
    }
  });

  // Touch swipe for mobile
  const slidesWrap = document.querySelector('.slides');
  let touchStartX = null;
  let touchDeltaX = 0;
  const swipeThreshold = 40;

  slidesWrap?.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
  }, { passive: true });

  slidesWrap?.addEventListener('touchmove', (e) => {
    if (touchStartX === null) return;
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  slidesWrap?.addEventListener('touchend', () => {
    if (touchStartX === null) return;
    if (Math.abs(touchDeltaX) > swipeThreshold) {
      handleManual(touchDeltaX < 0 ? 1 : -1);
    }
    touchStartX = null;
    touchDeltaX = 0;
  });

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach(el => observer.observe(el));

  // Phone mask
  const phoneInput = document.getElementById('phone');
  const formatPhone = (value) => {
    let digits = value.replace(/\D/g, '');
    if (!digits.startsWith('7')) {
      if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
      } else {
        digits = '7' + digits;
      }
    }
    digits = digits.slice(0, 11);
    const parts = [digits.slice(1,4), digits.slice(4,7), digits.slice(7,9), digits.slice(9,11)];
    let result = '+7';
    if (parts[0]) result += ` (${parts[0]}`;
    if (parts[0] && parts[0].length === 3) result += ')';
    if (parts[1]) result += ` ${parts[1]}`;
    if (parts[2]) result += `-${parts[2]}`;
    if (parts[3]) result += `-${parts[3]}`;
    return result.trim();
  };

  phoneInput?.addEventListener('input', (e) => {
    const caret = e.target.selectionStart;
    e.target.value = formatPhone(e.target.value);
    e.target.setSelectionRange(caret, caret);
  });

  // Form handling
  const form = document.getElementById('contact-form');
  const statusBox = document.getElementById('form-status');
  const btn = form?.querySelector('button[type="submit"]');

  const sanitizeInput = (str = '') => str.replace(/[<>"']/g, (match) => {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return match;
    }
  });

  const validateForm = (data) => {
    if (!data.name || data.name.trim().length < 2) return 'Пожалуйста, укажите имя (мин. 2 символа).';
    if (!data.phone || data.phone.replace(/\D/g, '').length !== 11) return 'Введите телефон в формате +7 (XXX) XXX-XX-XX.';
    if (!data.message || data.message.trim().length < 10) return 'Опишите обращение подробнее (мин. 10 символов).';
    return '';
  };

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const payload = {
      name: sanitizeInput(form.name.value.trim()),
      phone: sanitizeInput(form.phone.value.trim()),
      message: sanitizeInput(form.message.value.trim())
    };

    const error = validateForm(payload);
    if (error) {
      statusBox.textContent = error;
      statusBox.style.color = '#b00020';
      return;
    }

    btn.disabled = true;
    statusBox.textContent = 'Отправляем...';
    statusBox.style.color = 'inherit';

    try {
      const res = await fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('network');
      statusBox.textContent = 'Сообщение отправлено. Мы свяжемся с вами в ближайшее время.';
      form.reset();
    } catch (err) {
      statusBox.textContent = 'Не удалось отправить. Попробуйте ещё раз позднее.';
      statusBox.style.color = '#b00020';
    } finally {
      btn.disabled = false;
    }
  });

  // Modal
  const modal = document.getElementById('policy-modal');
  const openPolicy = document.getElementById('open-policy');
  const closeBtn = modal?.querySelector('.modal__close');

  const openModal = () => {
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
  };
  const closeModal = () => {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
  };

  openPolicy?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
})();
