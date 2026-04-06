/* ========================================================
   AJ GAMENG PORTFOLIO - script.js
======================================================== */

// ─── PROJECT DATA ────────────────────────────────────────
const STORAGE_KEY = 'aj_projects';

const defaultProjects = [
  {
    id: 1, title: 'Veterinary Record Management System', emoji: '🐾',
    category: 'Web', type: 'Capstone', hue: '200deg',
    stack: ['Laravel 11', 'MySQL', 'Chart.js', 'Breeze'],
    desc: 'A comprehensive web system built for the local government of Ballesteros, Cagayan. Manages Animal Registry, Health Records, Livestock Ledger, BAPC/QRBA government-required forms, and a real-time analytics dashboard across four distinct user roles.',
    features: ['Four user roles: Admin, Vet, Encoder, and Viewer','Animal Registry with complete health history tracking','Livestock Ledger with inventory management','Government form generation (BAPC/QRBA)','Live analytics dashboard powered by Chart.js','Role-based access control with Laravel Breeze auth'],
    screenshots: [],
  },
  {
    id: 2, title: 'Santa Praxedes High School Grading System', emoji: '🏫',
    category: 'Desktop', type: 'Academic', hue: '150deg',
    stack: ['Visual Basic', 'SQL Server', 'SSRS'],
    desc: 'A desktop-based grading system built for Santa Praxedes High School using Visual Basic and SQL Server. Handles student grade encoding, computation, report generation, and academic record management with a clean Windows Forms interface.',
    features: ['Student grade encoding per subject and quarter','Automatic GWA and remarks computation','Report card generation and printing','Teacher and admin account management','SQL Server database integration','Academic year and section management'],
    screenshots: [],
  },
  {
    id: 3, title: 'Shoot the Zombie', emoji: '🧟',
    category: 'Game', type: 'Personal', hue: '100deg',
    stack: ['C#', 'Visual Basic', '.NET', 'GDI+'],
    desc: 'A 2D zombie shooting game built in C# using Windows Forms and GDI+ graphics. Features wave-based zombie spawning, a scoring system, player lives, and progressively increasing difficulty.',
    features: ['Wave-based zombie spawning with increasing difficulty','Player shooting mechanics with collision detection','Score tracking and high score system','Player lives and game-over screen','Animated sprites using GDI+ rendering','Sound effects and game loop management'],
    screenshots: [],
  },
  
];

function getProjects() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [...defaultProjects];
}

function saveProjects(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
}

let projects = getProjects();
let currentProjectId = null;
let lightboxImages = [];
let lightboxIndex = 0;
let pendingDeleteId = null;

// ─── DELETE CONFIRMATION MODAL ───────────────────────
function openDeleteModal(projectId) {
  const project = projects.find(p => p.id === projectId);
  if (!project) return;
  pendingDeleteId = projectId;
  document.getElementById('deleteMsg').textContent =
    `"${project.title}" will be permanently removed from your portfolio.`;
  document.getElementById('deleteOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
  document.getElementById('deleteOverlay').classList.remove('open');
  document.body.style.overflow = '';
  pendingDeleteId = null;
}

document.getElementById('deleteCancelBtn')?.addEventListener('click', closeDeleteModal);
document.getElementById('deleteOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('deleteOverlay')) closeDeleteModal();
});
document.getElementById('deleteConfirmBtn')?.addEventListener('click', () => {
  if (pendingDeleteId === null) return;
  projects = projects.filter(p => p.id !== pendingDeleteId);
  saveProjects(projects);
  renderProjects(getActiveFilter());
  closeDeleteModal();
  const flash = document.createElement('div');
  flash.textContent = '✓ Project removed.';
  flash.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:#e05260;color:#fff;padding:0.75rem 1.5rem;border-radius:100px;font-family:var(--font-mono);font-size:0.8rem;z-index:9999;animation:fadeIn 0.2s ease;`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 2500);
});

// ─── RENDER PROJECTS ─────────────────────────────────────
function renderProjects(filter = 'all') {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = filter === 'all' ? projects : projects.filter(p =>
    p.category === filter || p.type === filter
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);font-family:var(--font-mono);font-size:0.85rem;">No projects in this category yet.</div>`;
    return;
  }

  filtered.forEach((project, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.dataset.id = project.id;
    card.innerHTML = `
      <div class="project-card-banner" style="--card-hue:${project.hue}">
        <div class="project-card-num">00${i + 1}</div>
        <div class="project-card-icon">${project.emoji || '🖥️'}</div>
      </div>
      <div class="project-card-body">
        <div class="project-stack">${project.stack.map(s => `<span>${s}</span>`).join('')}</div>
        <h3>${project.title}</h3>
        <p>${project.desc.length > 130 ? project.desc.slice(0, 130) + '…' : project.desc}</p>
      </div>
      <div class="project-card-footer">
        <span class="project-type">${project.type || project.category}</span>
        <div class="card-footer-actions">
          <button class="project-delete-btn" title="Remove project" data-id="${project.id}">🗑</button>
          <span class="project-arrow-btn">↗</span>
        </div>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.project-delete-btn')) return;
      openProjectModal(project.id);
    });
    card.querySelector('.project-delete-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openDeleteModal(project.id);
    });
    grid.appendChild(card);
  });

  const countEl = document.getElementById('projectCount');
  if (countEl) countEl.textContent = projects.length + '+';
}

// ─── FILTER ──────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.dataset.filter);
  });
});

// ─── PROJECT MODAL ───────────────────────────────────────
function openProjectModal(id) {
  const project = projects.find(p => p.id === id);
  if (!project) return;
  currentProjectId = id;
  document.getElementById('modalBadge').textContent = project.type || project.category;
  document.getElementById('modalNum').textContent = `#${String(id).padStart(3, '0')}`;
  document.getElementById('modalEmoji').textContent = project.emoji || '🖥️';
  document.getElementById('modalTitle').textContent = project.title;
  document.getElementById('modalDesc').textContent = project.desc;
  document.getElementById('modalStack').innerHTML = project.stack.map(s => `<span>${s}</span>`).join('');
  const featEl = document.getElementById('modalFeatures');
  const featSection = document.getElementById('modalFeaturesSection');
  if (project.features && project.features.length > 0) {
    featEl.innerHTML = project.features.map(f => `<li>${f}</li>`).join('');
    featSection.style.display = '';
  } else {
    featSection.style.display = 'none';
  }
  renderModalScreenshots(project);
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderModalScreenshots(project) {
  const container = document.getElementById('modalScreenshots');
  container.innerHTML = '';
  if (project.screenshots && project.screenshots.length > 0) {
    project.screenshots.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src; img.alt = `Screenshot ${i + 1}`;
      img.addEventListener('click', () => openLightbox(project.screenshots, i));
      container.appendChild(img);
    });
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'screenshot-placeholder';
    placeholder.innerHTML = `<span style="font-size:1.5rem">📷</span><span>No screenshots yet</span><span style="font-size:0.6rem;opacity:0.6">Click "+ Add Screenshot" below</span>`;
    container.appendChild(placeholder);
  }
}

function closeProjectModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  currentProjectId = null;
}

document.getElementById('modalClose')?.addEventListener('click', closeProjectModal);
document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) closeProjectModal();
});

document.getElementById('screenshotUpload')?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (!currentProjectId || files.length === 0) return;
  const project = projects.find(p => p.id === currentProjectId);
  if (!project) return;
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (!project.screenshots) project.screenshots = [];
      project.screenshots.push(ev.target.result);
      loaded++;
      if (loaded === files.length) { saveProjects(projects); renderModalScreenshots(project); renderProjects(getActiveFilter()); }
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

// ─── ADD PROJECT MODAL ───────────────────────────────────
let formScreenshotData = [];

document.getElementById('addProjectBtn')?.addEventListener('click', () => {
  formScreenshotData = [];
  document.getElementById('formTitle').value = '';
  document.getElementById('formCategory').value = 'Web';
  document.getElementById('formEmoji').value = '';
  document.getElementById('formStack').value = '';
  document.getElementById('formDesc').value = '';
  document.getElementById('formFeatures').value = '';
  document.getElementById('formScreenshotPreview').innerHTML = '';
  document.getElementById('addModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeAddModal() {
  document.getElementById('addModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('addModalClose')?.addEventListener('click', closeAddModal);
document.getElementById('cancelAddProject')?.addEventListener('click', closeAddModal);
document.getElementById('addModalOverlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('addModalOverlay')) closeAddModal();
});

document.getElementById('formScreenshots')?.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  const preview = document.getElementById('formScreenshotPreview');
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      formScreenshotData.push(ev.target.result);
      const img = document.createElement('img');
      img.src = ev.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

document.getElementById('saveProject')?.addEventListener('click', () => {
  const title = document.getElementById('formTitle').value.trim();
  const category = document.getElementById('formCategory').value;
  const emoji = document.getElementById('formEmoji').value.trim() || '🖥️';
  const stack = document.getElementById('formStack').value.split(',').map(s => s.trim()).filter(Boolean);
  const desc = document.getElementById('formDesc').value.trim();
  const featuresRaw = document.getElementById('formFeatures').value.trim();
  const features = featuresRaw ? featuresRaw.split('\n').map(f => f.trim()).filter(Boolean) : [];
  if (!title || !stack.length || !desc) { alert('Please fill in the required fields: Title, Tech Stack, and Description.'); return; }
  const hues = { Web: '200deg', Desktop: '150deg', Game: '100deg', Mobile: '190deg', Competition: '30deg', Capstone: '260deg', Academic: '320deg' };
  const newProject = { id: Date.now(), title, emoji, category, type: category, hue: hues[category] || '200deg', stack, desc, features, screenshots: [...formScreenshotData] };
  projects.push(newProject);
  saveProjects(projects);
  closeAddModal();
  renderProjects(getActiveFilter());
  const flash = document.createElement('div');
  flash.textContent = '✓ Project added!';
  flash.style.cssText = `position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;padding:0.75rem 1.5rem;border-radius:100px;font-family:var(--font-mono);font-size:0.8rem;z-index:9999;`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 2500);
});

function getActiveFilter() {
  const active = document.querySelector('.filter-btn.active');
  return active ? active.dataset.filter : 'all';
}

// ─── LIGHTBOX ────────────────────────────────────────────
function openLightbox(images, index) {
  lightboxImages = images; lightboxIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function updateLightbox() {
  document.getElementById('lightboxImg').src = lightboxImages[lightboxIndex];
  document.getElementById('lightboxCounter').textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`;
}
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }

document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
document.getElementById('lightbox')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('lightbox') || e.target === document.getElementById('lightboxImg')) closeLightbox();
});
document.getElementById('lightboxPrev')?.addEventListener('click', () => { lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; updateLightbox(); });
document.getElementById('lightboxNext')?.addEventListener('click', () => { lightboxIndex = (lightboxIndex + 1) % lightboxImages.length; updateLightbox(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeLightbox(); closeProjectModal(); closeAddModal(); closeDeleteModal(); }
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; updateLightbox(); }
    if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % lightboxImages.length; updateLightbox(); }
  }
});

// ─── CURSOR ──────────────────────────────────────────────
const blob = document.getElementById('cursorBlob');
const dot  = document.getElementById('cursorDot');
document.addEventListener('mousemove', (e) => {
  blob.style.left = e.clientX + 'px'; blob.style.top = e.clientY + 'px';
  dot.style.left  = e.clientX + 'px'; dot.style.top  = e.clientY + 'px';
});

// ─── NAV ─────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  const scrollY = window.scrollY;
  document.querySelectorAll('section[id]').forEach(section => {
    const top = section.offsetTop - 120, bottom = top + section.offsetHeight;
    if (scrollY >= top && scrollY < bottom) {
      document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
      document.querySelector(`.nav-links a[href="#${section.id}"]`)?.classList.add('active');
    }
  });
}, { passive: true });

document.getElementById('menuBtn')?.addEventListener('click', () => document.getElementById('mobileMenu').classList.toggle('open'));
document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('open')));

// ─── SCROLL REVEAL ───────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.1 });

function observeRevealElements() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// ─── INIT ────────────────────────────────────────────────
renderProjects();
observeRevealElements();

// ─── EMAILJS ─────────────────────────────────────────────
const EMAILJS_PUBLIC_KEY  = 'uIL-4rCHhoSVw7mT7';
const EMAILJS_SERVICE_ID  = 'service_6gvl68s';
const EMAILJS_TEMPLATE_ID = 'template_333w6ec';

if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

document.getElementById('dismissNotice')?.addEventListener('click', () => {
  document.getElementById('emailjsNotice')?.classList.add('hidden');
});

// ─── CONTACT FORM ────────────────────────────────────────
const contactForm   = document.getElementById('contactForm');
const cfSubmitBtn   = document.getElementById('cfSubmitBtn');
const cfSuccess     = document.getElementById('cfSuccess');
const cfSendError   = document.getElementById('cfSendError');
const cfSendAnother = document.getElementById('cfSendAnother');

function cfValidate() {
  let valid = true;
  const fields = [
    { id: 'cf-name',    errId: 'err-name',    msg: 'Name is required.' },
    { id: 'cf-email',   errId: 'err-email',   msg: 'Valid email is required.' },
    { id: 'cf-subject', errId: 'err-subject', msg: 'Subject is required.' },
    { id: 'cf-message', errId: 'err-message', msg: 'Message cannot be empty.' },
  ];
  fields.forEach(({ id, errId, msg }) => {
    const el = document.getElementById(id), err = document.getElementById(errId), val = el.value.trim();
    const isEmail = id === 'cf-email', emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!val || (isEmail && !emailOk)) {
      err.textContent = isEmail && val ? 'Please enter a valid email.' : msg;
      el.classList.add('error'); valid = false;
    } else { err.textContent = ''; el.classList.remove('error'); }
  });
  return valid;
}

['cf-name','cf-email','cf-subject','cf-message'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
    const errMap = { 'cf-name':'err-name','cf-email':'err-email','cf-subject':'err-subject','cf-message':'err-message' };
    document.getElementById(errMap[id]).textContent = '';
  });
});

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  cfSendError.classList.remove('show');
  if (!cfValidate()) return;
  cfSubmitBtn.classList.add('loading');
  cfSubmitBtn.disabled = true;
  const params = {
    name:    document.getElementById('cf-name').value.trim(),
    email:   document.getElementById('cf-email').value.trim(),
    subject: document.getElementById('cf-subject').value.trim(),
    message: document.getElementById('cf-message').value.trim(),
  };
  if (typeof emailjs === 'undefined') {
    cfSubmitBtn.classList.remove('loading');
    cfSubmitBtn.disabled = false;
    cfSendError.classList.add('show');
    const mailtoLink = `mailto:aj.gameng2026@gmail.com?subject=${encodeURIComponent(params.subject)}&body=${encodeURIComponent(`From: ${params.name} <${params.email}>\n\n${params.message}`)}`;
    setTimeout(() => window.location.href = mailtoLink, 400);
    return;
  }
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    contactForm.style.display = 'none';
    cfSuccess.classList.add('show');
    contactForm.reset();
  } catch (err) {
    console.error('EmailJS error:', err);
    cfSendError.classList.add('show');
  } finally {
    cfSubmitBtn.classList.remove('loading');
    cfSubmitBtn.disabled = false;
  }
});

cfSendAnother?.addEventListener('click', () => {
  cfSuccess.classList.remove('show');
  cfSendError.classList.remove('show');
  contactForm.style.display = '';
});
