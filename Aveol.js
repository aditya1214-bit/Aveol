// ── DEV STATUS BANNER ──
(function () {
  const banner = document.createElement('div');
  banner.id = 'devBanner';
  banner.innerHTML = `
    <span class="dev-banner-dot"></span>
    <span>AVEOL is currently in active development &mdash; <a href="index.html#waitlist">join the waitlist</a> to get early access</span>
    <button class="dev-banner-close" aria-label="Dismiss" onclick="this.parentElement.remove(); document.documentElement.style.setProperty('--banner-h','0px');">&#x2715;</button>
  `;
  document.body.prepend(banner);
  document.documentElement.style.setProperty('--banner-h', banner.offsetHeight + 'px');
  window.addEventListener('resize', () => {
    if (document.getElementById('devBanner')) {
      document.documentElement.style.setProperty('--banner-h', document.getElementById('devBanner').offsetHeight + 'px');
    }
  });
})();

// ── INTRO SPLASH (shows only once per session) ──
window.addEventListener("load", () => {
  const intro = document.getElementById("intro");
  if (!intro) return;
  if (sessionStorage.getItem('aveol_intro_shown')) {
    intro.classList.add("hidden");
  } else {
    sessionStorage.setItem('aveol_intro_shown', '1');
    setTimeout(() => intro.classList.add("hidden"), 1700);
  }
});

// ── GRID LINES OVERLAY ──
(function () {
  const grid = document.createElement('div');
  grid.id = 'gridLines';
  document.body.appendChild(grid);
})();

// ── MOUSE GLOW ──
const glow = document.getElementById("glow");
if (glow) {
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";
  });
}

// ═══════════════════════════════════════════════════
//  HERO SPOTLIGHT — moves with mouse inside hero
// ═══════════════════════════════════════════════════
(function () {
  const hero      = document.getElementById('hero');
  const spotlight = document.getElementById('heroSpotlight');
  if (!hero || !spotlight) return;
  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(2) + '%';
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2) + '%';
    hero.style.setProperty('--cursor-x', x);
    hero.style.setProperty('--cursor-y', y);
  });
})();

// ═══════════════════════════════════════════════════
//  CARD INTERIOR GLOW — tracks mouse position as CSS vars
// ═══════════════════════════════════════════════════
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.card, .step, .big-stat, .audience-card, .value-card').forEach(el => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      el.style.setProperty('--glow-x', x + 'px');
      el.style.setProperty('--glow-y', y + 'px');
    }
  });
});

// ── SCROLL REVEAL (IntersectionObserver) ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

window.addEventListener("load", () => {
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
});

// ── FAQ ACCORDION ──
document.addEventListener("click", (e) => {
  const q = e.target.closest(".faq-q");
  if (!q) return;
  const item   = q.closest(".faq-item");
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
});

// ── STAT COUNTER ANIMATION ──
function animateCounter(el, target, suffix, duration = 1400) {
  const start = performance.now();
  const update = (now) => {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const stat  = entry.target;
    stat.classList.add("counted");
    const numEl = stat.querySelector(".big-num");
    if (!numEl) return;
    const match = numEl.textContent.trim().match(/^(\d+)(.*)$/);
    if (match) animateCounter(numEl, parseInt(match[1]), match[2]);
    statObserver.unobserve(stat);
  });
}, { threshold: 0.4 });

window.addEventListener("load", () => {
  document.querySelectorAll(".big-stat").forEach(el => statObserver.observe(el));
});

// ── CARD 3D TILT (all card types, site-wide) ──
document.addEventListener("mousemove", (e) => {
  const SELECTORS = '.card, .pricing-card, .value-card, .audience-card, .blog-card, .step, .big-stat';
  document.querySelectorAll(SELECTORS).forEach(card => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1.5) {
      // Clamp rotation to max ±7deg
      const rx = Math.max(-7, Math.min(7, -dy * 7));
      const ry = Math.max(-7, Math.min(7,  dx * 7));
      card.style.transform = `perspective(900px) rotateY(${ry}deg) rotateX(${rx}deg) translateZ(10px)`;
    } else {
      card.style.transform = '';
    }
  });
});

// ── SECTION TITLES: subtle mouse-parallax depth shift ──
document.addEventListener('mousemove', (e) => {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;  // -1 to 1
  const dy = (e.clientY - cy) / cy;

  document.querySelectorAll('.section-title, .hero-title').forEach(el => {
    const rect = el.getBoundingClientRect();
    // Only affect elements in the viewport
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.style.transform = `perspective(1000px) rotateY(${dx * 1.5}deg) rotateX(${-dy * 1}deg)`;
    }
  });
});


// ═══════════════════════════════════════════════════
//  MAGNETIC BUTTONS — gentle pull toward cursor + ripple
// ═══════════════════════════════════════════════════
(function () {
  const MAG_STRENGTH = 0.35;

  document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * MAG_STRENGTH;
      const dy   = (e.clientY - cy) * MAG_STRENGTH;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1)';
      btn.style.transform  = '';
      setTimeout(() => { btn.style.transition = ''; }, 450);
    });

    // Click ripple
    btn.addEventListener('click', e => {
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;
      const ripple = document.createElement('span');
      ripple.className = 'ripple-ring';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
})();

// ── NAV SCROLL SHRINK ──
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}

// ── MOBILE MENU ──
const hamburger  = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu  = document.getElementById("closeMenu");
if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => mobileMenu.classList.add("open"));
  closeMenu?.addEventListener("click", () => mobileMenu.classList.remove("open"));
  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mobileMenu.classList.remove("open"));
  });
}

// ═══════════════════════════════════════════════════
//  PARTICLES CANVAS — mouse repulsion effect
// ═══════════════════════════════════════════════════
const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  const GOLD         = "201,162,77";
  let mouseX         = -9999, mouseY = -9999;
  const REPEL_RADIUS = 130;
  const REPEL_FORCE  = 1.6;

  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  const resize = () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const spawn = () => {
    particles = Array.from({ length: 82 }, () => {
      const vx = (Math.random() - 0.5) * 0.3;
      const vy = (Math.random() - 0.5) * 0.3;
      return {
        x:   Math.random() * canvas.width,
        y:   Math.random() * canvas.height,
        vx, vy, bvx: vx, bvy: vy,
        r:   Math.random() * 1.2 + 0.4,
        o:   Math.random() * 0.22 + 0.05,
      };
    });
  };

  const draw = () => {
    if (window.scrollY < window.innerHeight * 1.5) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p   = particles[i];
        const dxm = p.x - mouseX;
        const dym = p.y - mouseY;
        const dm  = Math.hypot(dxm, dym);

        // Mouse repulsion push
        if (dm < REPEL_RADIUS && dm > 0) {
          const force = ((REPEL_RADIUS - dm) / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dxm / dm) * force * 0.04;
          p.vy += (dym / dm) * force * 0.04;
        }
        // Restore toward base velocity
        p.vx += (p.bvx - p.vx) * 0.018;
        p.vy += (p.bvy - p.vy) * 0.018;

        // Draw connecting lines
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${GOLD}, ${0.055 * (1 - d / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${GOLD}, ${p.o})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
    }
    requestAnimationFrame(draw);
  };

  resize(); spawn(); draw();
  window.addEventListener("resize", () => { resize(); spawn(); }, { passive: true });
}


// ══════════════════════════════════════════════════════
//  BACKEND CONFIG
//  Shared by all form handlers on every page.
//  contact.html references this as window.AVEOL_BACKEND.
// ══════════════════════════════════════════════════════
window.AVEOL_BACKEND = (function () {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return 'https://aveol.onrender.com';
})();

// Shared fetch helper
async function postJSON(endpoint, data) {
  const res = await fetch(window.AVEOL_BACKEND + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 201 && res.status !== 202) {
    throw new Error(json.message || 'Something went wrong. Please try again.');
  }
  return json;
}

// ── WAITLIST FORM (hero — email only) ──
const wf = document.getElementById('waitlistForm');
if (wf) {
  wf.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = wf.querySelector('.btn-primary');
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    try {
      await postJSON('/api/audit/waitlist', {
        email: wf.email.value.trim(),
        _honey: wf._honey?.value || '',
      });
      window.location.href = 'thank-you.html';
    } catch (err) {
      alert(err.message);
      btn.textContent = original;
      btn.disabled = false;
    }
  });
}

// ── WAITLIST FORM LG (section — name + email + role) ──
const wfLg = document.getElementById('waitlistFormLg');
if (wfLg) {
  wfLg.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('reserveBtn');
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;
    try {
      await postJSON('/api/audit/waitlist', {
        email:       wfLg.email.value.trim(),
        companyRole: wfLg.companyRole?.value || undefined,
        _honey:      wfLg._honey?.value || '',
      });
      window.location.href = 'thank-you.html';
    } catch (err) {
      alert(err.message);
      btn.textContent = original;
      btn.disabled = false;
    }
  });
}

// (contact form handled inline in contact.html)

// ── NEWSLETTER ──
const nf = document.getElementById("newsletterForm");
if (nf) {
  nf.addEventListener("submit", function() {
    const btn = nf.querySelector(".btn-primary");
    btn.textContent = "Subscribing…";
    btn.disabled = true;
  });
}

// ── SCROLL PROGRESS BAR ──
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
}, { passive: true });

// ── BACK TO TOP BUTTON ──
const btt = document.createElement('button');
btt.id = 'backToTop';
btt.setAttribute('aria-label', 'Back to top');
btt.innerHTML = '↑';
document.body.appendChild(btt);

window.addEventListener('scroll', () => {
  btt.classList.toggle('show', window.scrollY > 400);
}, { passive: true });

btt.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── ROI CALCULATOR ──
(function () {
  const teamSize   = document.getElementById('teamSize');
  const hoursEl   = document.getElementById('hoursPerWeek');
  const rateEl     = document.getElementById('hourlyRate');
  const coverageEl = document.getElementById('coverage');
  if (!teamSize) return;

  const teamSizeVal    = document.getElementById('teamSizeVal');
  const hoursVal       = document.getElementById('hoursVal');
  const hourlyRateVal  = document.getElementById('hourlyRateVal');
  const coverageVal    = document.getElementById('coverageVal');
  const weeklyHoursEl  = document.getElementById('weeklyHours');
  const annualSavingEl = document.getElementById('annualSaving');
  const fteEquivEl     = document.getElementById('fteEquiv');

  function calcROI() {
    const team = parseInt(teamSize.value);
    const hrs  = parseInt(hoursEl.value);
    const rate = parseInt(rateEl.value);
    const cov  = parseInt(coverageEl.value) / 100;

    const weeklyHours  = Math.round(team * hrs * cov);
    const annualSaving = Math.round(team * hrs * cov * rate * 52);
    const fte          = (team * hrs * cov / 40).toFixed(1);

    teamSizeVal.textContent   = team;
    hoursVal.textContent      = hrs;
    hourlyRateVal.textContent = '₹' + rate;
    coverageVal.textContent   = Math.round(cov * 100) + '%';

    const flash = (el, val) => {
      el.style.transform = 'scale(1.08)';
      el.style.color = 'var(--gold-bright)';
      el.innerHTML = val;
      setTimeout(() => { el.style.transform = ''; el.style.color = ''; }, 200);
    };

    const fmt = (n) => {
      if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + 'Cr';
      if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
      if (n >= 1000)     return '₹' + (n / 1000).toFixed(0) + 'K';
      return '₹' + n;
    };

    flash(weeklyHoursEl,  weeklyHours + '<span>h</span>');
    flash(annualSavingEl, fmt(annualSaving));
    flash(fteEquivEl,     fte + '<span>x</span>');
  }

  [teamSize, hoursEl, rateEl, coverageEl].forEach(el => el.addEventListener('input', calcROI));
  calcROI();
})();

// ── WHATSAPP FLOAT BUTTON ──
(function () {
  const WA_NUMBER  = "919693716190";
  const WA_MESSAGE = encodeURIComponent("Hi AVEOL! I'd like to learn more about AI agent automation for my business.");

  const waBtn = document.createElement('a');
  waBtn.id = 'whatsappBtn';
  waBtn.href = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;
  waBtn.target = '_blank';
  waBtn.rel = 'noopener noreferrer';
  waBtn.setAttribute('aria-label', 'Chat on WhatsApp');
  waBtn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.47-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>`;

  const waTooltip = document.createElement('div');
  waTooltip.id = 'whatsappTooltip';
  waTooltip.textContent = 'Chat with us on WhatsApp';

  document.body.appendChild(waBtn);
  document.body.appendChild(waTooltip);
})();

// ── COOKIE CONSENT BANNER ──
(function () {
  if (localStorage.getItem('aveol_cookie_consent')) return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.innerHTML = `
    <p>We use cookies to improve your experience and to understand how visitors interact with our site. By continuing, you agree to our <a href="privacy.html">Privacy Policy</a>.</p>
    <div class="cookie-btns">
      <button id="cookieAccept">Accept</button>
      <button id="cookieDecline">Decline</button>
    </div>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('visible'), 1500);

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('aveol_cookie_consent', 'accepted');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 600);
  });
  document.getElementById('cookieDecline').addEventListener('click', () => {
    localStorage.setItem('aveol_cookie_consent', 'declined');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 600);
  });
})();

// ── ROTATING HERO WORD ──
(function () {
  const el = document.getElementById('rotatingIndustry');
  if (!el) return;
  const words = [
    'Agencies', 'Consultancies', 'SaaS Companies',
    'Healthcare Clinics', 'E-commerce Brands',
    'Financial Firms', 'Real Estate Teams', 'Startups'
  ];
  let i = 0;
  setInterval(() => {
    el.classList.add('fade-out');
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('fade-out');
    }, 350);
  }, 2500);
})();

// ── WAITLIST SOCIAL PROOF COUNTER ──
(function () {
  const el = document.getElementById('waitlistCount');
  if (!el) return;
  const TARGET = 120;
  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    let current = 0;
    const step  = Math.ceil(TARGET / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, TARGET);
      el.textContent = current;
      if (current >= TARGET) clearInterval(timer);
    }, 25);
  }, { threshold: 0.5 });
  obs.observe(el);
})();

// ═══════════════════════════════════════════════════
//  SECTION PARALLAX — orbs drift as page is scrolled
// ═══════════════════════════════════════════════════
(function () {
  const orbs = document.querySelectorAll('.orb');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const sy = window.scrollY;
      orbs.forEach((orb, i) => {
        const speed = [0.12, -0.08, 0.06][i] ?? 0.05;
        orb.style.transform = `translateY(${sy * speed}px)`;
      });
      ticking = false;
    });
    ticking = true;
  }, { passive: true });
})();

// ═══════════════════════════════════════════════════
//  SHIMMER REVEAL on scroll for cards & stats
// ═══════════════════════════════════════════════════
(function () {
  const shimmerObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        shimmerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.card, .big-stat, .step').forEach(el => {
    el.classList.add('reveal-shimmer');
    shimmerObs.observe(el);
  });
})();

console.log("AVEOL — Autonomous Intelligence. Infinite Scale.");

// ═══════════════════════════════════════════════════
//  AI AGENT DEMO TOGGLE (Show/Hide Workflow)
// ═══════════════════════════════════════════════════
document.querySelectorAll('.toggle-demo-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const card        = this.closest('.ai-agent-card');
    const demoSection = card.querySelector('.agent-demo-section');
    const isOpen      = demoSection.classList.contains('open');

    demoSection.classList.toggle('open', !isOpen);
    this.classList.toggle('open', !isOpen);

    // Lazy-load video on first expand to fix preload="none" deadlock
    if (!isOpen) {
      const video = demoSection.querySelector('.agent-video');
      if (video && video.getAttribute('preload') === 'none') {
        video.setAttribute('preload', 'metadata');
        video.load();
      }
    }

    // Reset any stale inline styles from previous version
    this.style.background = '';
    this.style.color      = '';
  });
});

// ═══════════════════════════════════════════════════
//  AGENT VIDEO FALLBACK
//  • If the mp4 file loads → show video, hide placeholder.
//  • If the mp4 file is missing (error) → keep placeholder.
// ═══════════════════════════════════════════════════
document.querySelectorAll('.agent-video-wrap').forEach(wrap => {
  const video  = wrap.querySelector('.agent-video');
  const source = video ? video.querySelector('source') : null;
  if (!video || !source) return;

  // Video has enough data to play — switch to video view
  video.addEventListener('loadeddata', () => {
    wrap.classList.add('video-loaded');
  });

  // Source failed to load (file missing or network error)
  source.addEventListener('error', () => {
    wrap.classList.remove('video-loaded');
  });
});

// ═══════════════════════════════════════════════════
//  AGENT TABS FILTER
// ═══════════════════════════════════════════════════
document.querySelectorAll('.agent-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    // Update active tab styling
    document.querySelectorAll('.agent-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');

    const filter = this.getAttribute('data-filter');
    const cards = document.querySelectorAll('.ai-agent-card');

    cards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.classList.remove('hidden');
        // Reset animation by removing and re-adding class
        card.style.animation = 'none';
        card.offsetHeight; // trigger reflow
        card.style.animation = '';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


// ══════════════════════════════════════════════
//  AI CONCIERGE CHAT WIDGET
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const fabBtns = document.querySelectorAll('#fabBtn');
    const chatWidget = document.getElementById('aiChatWidget');
    const chatClose = document.getElementById('aiChatClose');
    const chatBody = document.getElementById('aiChatBody');
    const chatOptions = document.getElementById('aiChatOptions');
    
    if (!chatWidget) return;

    let hasOpened = false;

    // Toggle Chat
    fabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
            if (chatWidget.classList.contains('active') && !hasOpened) {
                hasOpened = true;
                startConversation();
            }
        });
    });

    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });

    function addBotMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'ai-msg bot';
        msg.innerHTML = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'ai-msg user';
        msg.innerText = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'ai-msg bot typing-indicator';
        typing.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;
        return typing;
    }

    function clearOptions() {
        chatOptions.innerHTML = '';
    }

    function setOptions(options) {
        clearOptions();
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'ai-chat-btn';
            btn.innerText = opt.text;
            btn.onclick = () => {
                clearOptions();
                addUserMessage(opt.text);
                setTimeout(() => opt.action(), 500);
            };
            chatOptions.appendChild(btn);
        });
    }

    // Conversation Flow
    function startConversation() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("Hi there! 👋 I'm AVEOL's AI Concierge.");
            
            setTimeout(() => {
                const type2 = showTyping();
                setTimeout(() => {
                    type2.remove();
                    addBotMessage("I can help you explore how automation fits into your business. What are you looking to do today?");
                    
                    setOptions([
                        { text: "I want to automate repetitive tasks", action: flowTasks },
                        { text: "I need a custom AI agent built", action: flowCustom },
                        { text: "Just browsing your services", action: flowBrowse }
                    ]);
                }, 1000);
            }, 500);
            
        }, 800);
    }

    function flowTasks() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("Smart choice. On average, we save our clients over 20 hours a week by automating data entry, outreach, and reporting.");
            setTimeout(() => {
                addBotMessage("Would you like to book a free 30-minute workflow audit with our engineering team?");
                setOptions([
                    { text: "Yes, book a free audit", action: () => window.location.href = "contact.html" },
                    { text: "Not right now", action: flowEnd }
                ]);
            }, 1000);
        }, 1200);
    }

    function flowCustom() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("We specialize in custom engineering. We build bespoke AI systems that integrate directly into your existing software stack (Slack, CRM, etc).");
            setTimeout(() => {
                setOptions([
                    { text: "See pricing", action: () => window.location.href = "pricing.html" },
                    { text: "Let's discuss my project", action: () => window.location.href = "contact.html" }
                ]);
            }, 800);
        }, 1200);
    }

    function flowBrowse() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("Take your time! Feel free to check out our pre-built AI Agent templates. If you have any questions, I'm right here.");
            setOptions([
                { text: "View AI Agents catalog", action: () => window.location.href = "ai-agents.html" }
            ]);
        }, 1000);
    }

    function flowEnd() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("No problem. Feel free to reach out to rajaditya81156@gmail.com if anything comes up!");
            clearOptions();
      desc: 'We design, train, and deploy fully custom AI agents that autonomously execute your most time-consuming business tasks — 24 hours a day, 7 days a week, without human oversight.',
      features: [
        'End-to-end custom agent architecture tailored to your workflow',
        'Deployed directly into your existing tools (Slack, CRM, email)',
        'Trained on your business data, SOPs, and brand voice',
        'Continuous learning — improves with every interaction',
        'Full handover with documentation and training',
      ],
      roi: '⚡ Clients typically reclaim 20–30 hours per week within the first month.',
      cta: 'See Our AI Agent Catalog →',
      link: 'ai-agents.html',
    },
    'modal-outreach': {
      tag: '// Outreach & Lead Gen',
      title: 'AI-Powered Outreach & Lead Generation',
      desc: 'Stop manually prospecting. Our outreach agents identify your ideal clients, craft hyper-personalized messages, follow up automatically, and book qualified meetings directly onto your calendar.',
      features: [
        'Automated prospect research from LinkedIn, web, and CRMs',
        'Personalized cold email and DM sequences generated by AI',
        'Smart follow-up timing based on engagement signals',
        'Direct calendar integration for frictionless booking',
        'Full analytics: open rates, reply rates, and meetings booked',
      ],
      roi: '📈 Average of 3x more meetings booked with zero extra headcount.',
      cta: 'Build My Outreach Agent →',
      link: 'contact.html',
    },
    'modal-workflow': {
      tag: '// Workflow Automation',
      title: 'End-to-End Workflow Automation',
      desc: 'From onboarding new clients to generating weekly reports, we map your entire operational workflow and replace every manual step with an intelligent, automated pipeline.',
      features: [
        'Full workflow audit — we identify every manual bottleneck',
        'Connect any tool: HubSpot, Notion, Zapier, Google Workspace',
        'Automated data entry, file routing, and status updates',
        'Real-time notifications and exception handling',
        'One-time build, runs forever with minimal maintenance',
      ],
      roi: '⏱ Most clients save 20+ hours per week within 2 weeks of deployment.',
      cta: 'Automate My Workflow →',
      link: 'contact.html',
    },
    'modal-multi': {
      tag: '// Multi-Agent Orchestration',
      title: 'Multi-Agent Orchestration Systems',
      desc: 'This is the most advanced offering we provide. Instead of a single AI agent, we deploy a coordinated team of specialized agents that communicate, delegate tasks, and solve complex business problems as one unified intelligence layer.',
      features: [
        'Architect and deploy a network of specialized sub-agents',
        'Central orchestrator routes tasks to the right agent automatically',
        'Parallel processing — multiple workflows run simultaneously',
        'Ideal for agencies, large ops teams, and complex pipelines',
        'Built-in failover and error-recovery logic',
      ],
      roi: '🔗 Enables total operational synchronization across departments.',
      cta: 'Request a Custom Build →',
      link: 'contact.html',
    },
    'modal-dash': {
      tag: '// Intelligence Dashboards',
      title: 'AI Performance & Intelligence Dashboards',
      desc: 'Every AI system we build comes with a real-time dashboard that gives you complete visibility into what your agents are doing, what they have saved you, and what to optimize next.',
      features: [
        'Live view: tasks completed, time saved, cost per action',
        'ROI tracker — see the exact monetary value of your agents',
        'Alert system for errors, anomalies, or performance drops',
        'Exportable weekly reports for stakeholders',
        'Custom KPIs based on your business goals',
      ],
      roi: '📊 100% visibility into your AI investment — at all times.',
      cta: 'Get My Intelligence Dashboard →',
      link: 'contact.html',
    },
    'modal-integration': {
      tag: '// System Integration',
      title: 'Full Business System Integration',
      desc: 'Already using a CRM, project management tool, or communication platform? We plug your entire tech stack together into one seamless, automated ecosystem — no more switching between tabs.',
      features: [
        'Integrates with 50+ tools: HubSpot, Salesforce, Notion, Slack, Gmail',
        'Bi-directional data sync across all platforms',
        'Webhook and API-based connections for real-time data flow',
        'Custom middleware built for tools with no native integration',
        'One unified data layer — no more siloed information',
      ],
      roi: '🔌 Eliminates tool-switching, data duplication, and manual syncing.',
      cta: 'Connect My Tech Stack →',
      link: 'contact.html',
    },
  };

  function openModal(id) {
    const m = modals[id];
    if (!m) return;

    modalInner.innerHTML = `
      <div class="modal-tag">${m.tag}</div>
      <h2 class="modal-title">${m.title}</h2>
      <p class="modal-desc">${m.desc}</p>
      <div class="modal-divider"></div>
      <div class="modal-section-label">What's included</div>
      <ul class="modal-features">
        ${m.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="modal-roi-strip">${m.roi}</div>
      <a href="${m.link}" class="modal-cta">${m.cta}</a>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach click events to service cards
  document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.modal));
  });

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();

// ══════════════════════════════════════════════
//  SERVICE MODALS
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  var overlay = document.getElementById('modalOverlay');
  var modalInner = document.getElementById('modalInner');
  var modalClose = document.getElementById('modalClose');
  if (!overlay) return;

  var modals = {
    'modal-agents': {
      tag: '// AI Agent Deployment',
      title: 'Custom AI Agent Deployment',
      desc: 'We design, train, and deploy fully custom AI agents that autonomously execute your most time-consuming business tasks 24/7, without human oversight.',
      features: ['End-to-end custom agent architecture tailored to your workflow','Deployed directly into your existing tools (Slack, CRM, email)','Trained on your business data, SOPs, and brand voice','Continuous learning — improves with every interaction','Full handover with documentation and training'],
      roi: '⚡ Clients typically reclaim 20-30 hours per week within the first month.',
      cta: 'See Our AI Agent Catalog', link: 'ai-agents.html'
    },
    'modal-outreach': {
      tag: '// Outreach & Lead Gen',
      title: 'AI-Powered Outreach & Lead Generation',
      desc: 'Stop manually prospecting. Our outreach agents identify your ideal clients, craft hyper-personalized messages, follow up automatically, and book qualified meetings on your calendar.',
      features: ['Automated prospect research from LinkedIn, web, and CRMs','Personalized cold email and DM sequences generated by AI','Smart follow-up timing based on engagement signals','Direct calendar integration for frictionless booking','Full analytics: open rates, reply rates, and meetings booked'],
      roi: '📈 Average of 3x more meetings booked with zero extra headcount.',
      cta: 'Build My Outreach Agent', link: 'contact.html'
    },
    'modal-workflow': {
      tag: '// Workflow Automation',
      title: 'End-to-End Workflow Automation',
      desc: 'We map your entire operational workflow and replace every manual step with an intelligent, automated pipeline.',
      features: ['Full workflow audit to identify every manual bottleneck','Connect any tool: HubSpot, Notion, Zapier, Google Workspace','Automated data entry, file routing, and status updates','Real-time notifications and exception handling','One-time build, runs forever with minimal maintenance'],
      roi: '⏱ Most clients save 20+ hours per week within 2 weeks of deployment.',
      cta: 'Automate My Workflow', link: 'contact.html'
    },
    'modal-multi': {
      tag: '// Multi-Agent Orchestration',
      title: 'Multi-Agent Orchestration Systems',
      desc: 'We deploy a coordinated team of specialized agents that communicate, delegate tasks, and solve complex business problems as one unified intelligence layer.',
      features: ['Architect and deploy a network of specialized sub-agents','Central orchestrator routes tasks to the right agent automatically','Parallel processing — multiple workflows run simultaneously','Ideal for agencies, large ops teams, and complex pipelines','Built-in failover and error-recovery logic'],
      roi: '🔗 Enables total operational synchronization across departments.',
      cta: 'Request a Custom Build', link: 'contact.html'
    },
    'modal-dash': {
      tag: '// Intelligence Dashboards',
      title: 'AI Performance & Intelligence Dashboards',
      desc: 'Every AI system we build comes with a real-time dashboard giving you complete visibility into what your agents are doing and what they have saved you.',
      features: ['Live view: tasks completed, time saved, cost per action','ROI tracker — see the exact monetary value of your agents','Alert system for errors, anomalies, or performance drops','Exportable weekly reports for stakeholders','Custom KPIs based on your business goals'],
      roi: '📊 100% visibility into your AI investment at all times.',
      cta: 'Get My Intelligence Dashboard', link: 'contact.html'
    },
    'modal-integration': {
      tag: '// System Integration',
      title: 'Full Business System Integration',
      desc: 'We plug your entire tech stack together into one seamless, automated ecosystem — no more switching between tabs or copying data manually.',
      features: ['Integrates with 50+ tools: HubSpot, Salesforce, Notion, Slack, Gmail','Bi-directional data sync across all platforms','Webhook and API-based connections for real-time data flow','Custom middleware built for tools with no native integration','One unified data layer — no more siloed information'],
      roi: '🔌 Eliminates tool-switching, data duplication, and manual syncing.',
      cta: 'Connect My Tech Stack', link: 'contact.html'
    }
  };

  function openModal(id) {
    var m = modals[id];
    if (!m) return;
    var featureHTML = m.features.map(function(f){ return '<li>' + f + '</li>'; }).join('');
    modalInner.innerHTML = '<div class="modal-tag">' + m.tag + '</div>'
      + '<h2 class="modal-title">' + m.title + '</h2>'
      + '<p class="modal-desc">' + m.desc + '</p>'
      + '<div class="modal-divider"></div>'
      + '<div class="modal-section-label">What is included</div>'
      + '<ul class="modal-features">' + featureHTML + '</ul>'
      + '<div class="modal-roi-strip">' + m.roi + '</div>'
      + '<a href="' + m.link + '" class="modal-cta">' + m.cta + ' &rarr;</a>';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal]').forEach(function(card) {
    card.addEventListener('click', function() { openModal(card.getAttribute('data-modal')); });
  });

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });
});
