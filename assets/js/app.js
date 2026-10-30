/**
 * Main Wedding Invitation Application Script
 * Features:
 * - Cover Unlock & Autoplay Audio Handling with Fade-in
 * - Realtime Countdown Timer to Wedding Date
 * - LocalStorage Guestbook & RSVP with Initial Testimonials
 * - Digital Envelope Copy Number with Toast Notification
 * - URL Parameter Support (?to=Nama+Tamu)
 * - Navigation Scrollspy & Smooth Scrolling
 * - Reveal on Scroll Animations
 */

// ==========================================================
// CONFIGURATION
// ==========================================================
const WEDDING_CONFIG = {
  // Wedding Date & Time (YYYY-MM-DDTHH:MM:SS)
  weddingDate: '2026-12-12T09:00:00',
  groomName: 'Rian Pratama',
  brideName: 'Anita Permata',
  defaultGuest: 'Tamu Undangan & Keluarga'
};

// ==========================================================
// AUDIO CONTROLLER
// ==========================================================
const AudioController = {
  audio: null,
  musicBtn: null,
  isPlaying: false,

  init() {
    this.audio = document.getElementById('wedding-audio');
    this.musicBtn = document.getElementById('music-toggle');
    if (!this.audio || !this.musicBtn) return;

    this.audio.volume = 0.7;

    this.musicBtn.addEventListener('click', () => {
      this.toggle();
    });

    // Auto-update button UI on play/pause events
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.musicBtn.classList.add('playing');
      this.musicBtn.innerHTML = '<i class="fas fa-compact-disc"></i>';
      this.musicBtn.setAttribute('title', 'Jeda Musik');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.musicBtn.classList.remove('playing');
      this.musicBtn.innerHTML = '<i class="fas fa-play"></i>';
      this.musicBtn.setAttribute('title', 'Putar Musik');
    });
  },

  play() {
    if (!this.audio) return;
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.fadeIn();
    }).catch((err) => {
      console.warn('Autoplay prevented by browser policy:', err);
    });
  },

  pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.isPlaying = false;
  },

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  },

  fadeIn() {
    let currentVol = 0;
    this.audio.volume = 0;
    const fadeInterval = setInterval(() => {
      if (currentVol < 0.75) {
        currentVol += 0.05;
        this.audio.volume = Math.min(currentVol, 0.75);
      } else {
        clearInterval(fadeInterval);
      }
    }, 100);
  }
};

// ==========================================================
// COUNTDOWN TIMER
// ==========================================================
const CountdownTimer = {
  targetDate: new Date(WEDDING_CONFIG.weddingDate).getTime(),
  daysEl: null,
  hoursEl: null,
  minutesEl: null,
  secondsEl: null,

  init() {
    this.daysEl = document.getElementById('days');
    this.hoursEl = document.getElementById('hours');
    this.minutesEl = document.getElementById('minutes');
    this.secondsEl = document.getElementById('seconds');

    if (!this.daysEl) return;

    this.update();
    setInterval(() => this.update(), 1000);
  },

  update() {
    const now = new Date().getTime();
    const distance = this.targetDate - now;

    if (distance <= 0) {
      if (this.daysEl) this.daysEl.textContent = '00';
      if (this.hoursEl) this.hoursEl.textContent = '00';
      if (this.minutesEl) this.minutesEl.textContent = '00';
      if (this.secondsEl) this.secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.daysEl.textContent = String(days).padStart(2, '0');
    this.hoursEl.textContent = String(hours).padStart(2, '0');
    this.minutesEl.textContent = String(minutes).padStart(2, '0');
    this.secondsEl.textContent = String(seconds).padStart(2, '0');
  }
};

// ==========================================================
// GUESTBOOK & RSVP (LOCALSTORAGE)
// ==========================================================
const Guestbook = {
  storageKey: 'wedding_guestbook_wishes_v1',
  wishes: [],

  defaultWishes: [
    {
      id: 1,
      name: 'Dimas & Keluarga',
      attendance: 'hadir',
      attendanceText: 'Hadir',
      message: 'Selamat menempuh hidup baru Rian dan Anita! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah serta senantiasa dilimpahi keberkahan.',
      timestamp: '2 jam yang lalu'
    },
    {
      id: 2,
      name: 'Siti Rahmawati',
      attendance: 'hadir',
      attendanceText: 'Hadir',
      message: 'Barakallahu lakuma wa baraka alaikuma wa jama\'a bainakuma fii khoir. Turut berbahagia untuk kalian berdua, can\'t wait for the big day! 💕',
      timestamp: '5 jam yang lalu'
    },
    {
      id: 3,
      name: 'Budi Santoso (Alumni TI)',
      attendance: 'ragu',
      attendanceText: 'Masih Ragu',
      message: 'Happy wedding bro Rian! Insya Allah diusahakan hadir yaa, semoga semua persiapan acara lancar sampai hari H.',
      timestamp: '1 hari yang lalu'
    },
    {
      id: 4,
      name: 'dr. Farah Anggraini',
      attendance: 'hadir',
      attendanceText: 'Hadir',
      message: 'MasyaAllah cantiknya Anita, selamat menempuh babak baru yang penuh cinta. Semoga langgeng hingga kakek nenek aamiin.',
      timestamp: '2 hari yang lalu'
    }
  ],

  init() {
    this.load();
    this.bindEvents();
    this.render();
  },

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        this.wishes = JSON.parse(raw);
      } catch (e) {
        this.wishes = [...this.defaultWishes];
      }
    } else {
      this.wishes = [...this.defaultWishes];
      this.save();
    }
  },

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.wishes));
  },

  bindEvents() {
    const form = document.getElementById('guestbook-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('guest-name');
      const attendanceInput = document.getElementById('guest-attendance');
      const messageInput = document.getElementById('guest-message');

      const name = nameInput.value.trim();
      const attendance = attendanceInput.value;
      const message = messageInput.value.trim();

      if (!name || !message) {
        showToast('Silakan isi nama dan ucapan doa terlebih dahulu.');
        return;
      }

      let attendanceText = 'Hadir';
      if (attendance === 'ragu') attendanceText = 'Masih Ragu';
      if (attendance === 'tidak') attendanceText = 'Berhalangan';

      const newWish = {
        id: Date.now(),
        name: name,
        attendance: attendance,
        attendanceText: attendanceText,
        message: message,
        timestamp: 'Baru saja'
      };

      this.wishes.unshift(newWish);
      this.save();
      this.render();

      form.reset();
      showToast('💌 Terima kasih atas ucapan dan doa restunya!');
    });
  },

  render() {
    const listEl = document.getElementById('guestbook-list');
    const countEl = document.getElementById('wishes-count');
    if (!listEl) return;

    if (countEl) {
      countEl.textContent = `${this.wishes.length} Doa & Ucapan`;
    }

    listEl.innerHTML = '';

    this.wishes.forEach(item => {
      const initial = item.name.charAt(0).toUpperCase();
      let badgeClass = 'hadir';
      if (item.attendance === 'ragu') badgeClass = 'ragu';
      if (item.attendance === 'tidak') badgeClass = 'tidak';

      const wishEl = document.createElement('div');
      wishEl.className = 'wish-item';
      wishEl.innerHTML = `
        <div class="wish-header">
          <div class="wish-user">
            <div class="wish-avatar">${initial}</div>
            <div>
              <div class="wish-name">${escapeHTML(item.name)}</div>
              <span class="badge-attending ${badgeClass}">${item.attendanceText}</span>
            </div>
          </div>
          <span class="wish-time">${item.timestamp}</span>
        </div>
        <p class="wish-message">${escapeHTML(item.message)}</p>
      `;
      listEl.appendChild(wishEl);
    });
  }
};

// ==========================================================
// TOAST NOTIFICATION UTILITY
// ==========================================================
function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// Copy to clipboard helper
function copyToClipboard(text, accountLabel) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`✅ Nomor Rekening ${accountLabel} (${text}) berhasil disalin!`);
  }).catch(() => {
    // Fallback for older browsers
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    showToast(`✅ Nomor Rekening ${accountLabel} berhasil disalin!`);
  });
}

// Simple HTML escaping helper for guestbook
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// ==========================================================
// DOM READY & APP INITIALIZATION
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Audio Controller
  AudioController.init();

  // 2. Initialize Countdown Timer
  CountdownTimer.init();

  // 3. Initialize Guestbook
  Guestbook.init();

  // 4. URL Param Guest Name Reader (?to=...)
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to') || urlParams.get('guest') || urlParams.get('u');
  const guestName = guestParam ? decodeURIComponent(guestParam.replace(/\+/g, ' ')) : WEDDING_CONFIG.defaultGuest;
  
  const guestPlaceholderEl = document.getElementById('cover-guest-name');
  if (guestPlaceholderEl) {
    guestPlaceholderEl.textContent = guestName;
  }

  // Pre-fill name in guestbook if query param was present
  const guestInput = document.getElementById('guest-name');
  if (guestInput && guestParam) {
    guestInput.value = guestName;
  }

  // 5. Open Invitation Cover Button Click Event
  const openBtn = document.getElementById('btn-open');
  const coverOverlay = document.getElementById('cover-overlay');
  
  if (openBtn && coverOverlay) {
    openBtn.addEventListener('click', () => {
      // Smooth slide up cover
      coverOverlay.classList.add('opened');
      
      // Auto play background music
      AudioController.play();

      // Scroll smoothly to hero section
      setTimeout(() => {
        const heroSection = document.getElementById('home');
        if (heroSection) {
          heroSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    });
  }

  // 6. Floating Petals Toggle Button
  const petalsBtn = document.getElementById('petals-toggle');
  if (petalsBtn) {
    petalsBtn.addEventListener('click', () => {
      if (typeof petalEngineInstance !== 'undefined' && petalEngineInstance) {
        const isRunning = petalEngineInstance.toggle();
        petalsBtn.style.opacity = isRunning ? '1' : '0.5';
        showToast(isRunning ? '🌸 Efek bunga berguguran diaktifkan' : '🌸 Efek bunga dijeda');
      }
    });
  }

  // 7. Copy Account Buttons
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetNumber = btn.getAttribute('data-account');
      const targetBank = btn.getAttribute('data-bank');
      copyToClipboard(targetNumber, targetBank);
    });
  });

  // 8. Intersection Observer for Scroll Animations
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));

  // 9. Active Navigation Link Scrollspy
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.bottom-nav .nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 200;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
});
