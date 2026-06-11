// =============================================
// STUDENT GRIEVANCE SYSTEM - app.js
// Shared utilities & localStorage operations
// =============================================

// ---- DATA STORE (API Integration) ----
const API_BASE = 'http://localhost:8000/api';
const ADMIN_KEY = 'sgs_admin_session';

// --- STUDENT AUTH ---
async function registerStudent(data) {
  const res = await fetch(`${API_BASE}/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return await res.json();
}

async function loginStudent(data) {
  const res = await fetch(`${API_BASE}/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return await res.json();
}

function getLoggedInStudent() {
  const data = localStorage.getItem('sgs_student_session');
  return data ? JSON.parse(data) : null;
}

function logoutStudent() {
  localStorage.removeItem('sgs_student_session');
  window.location.href = 'student-login.html';
}

async function getStudentGrievances(studentId) {
  try {
    const res = await fetch(`${API_BASE}/student/${studentId}/grievances`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}


async function getGrievances() {
  try {
    const res = await fetch(`${API_BASE}/grievances`);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch grievances:', e);
    return [];
  }
}

async function getGrievanceById(id) {
  try {
    const res = await fetch(`${API_BASE}/grievances/${id}`);
    if (res.ok) return await res.json();
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function addGrievance(grievance) {
  try {
    const res = await fetch(`${API_BASE}/grievances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(grievance)
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
}

async function updateGrievance(id, updates) {
  try {
    const res = await fetch(`${API_BASE}/grievances/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  } catch (e) {
    console.error(e);
  }
}

async function deleteGrievance(id) {
  try {
    await fetch(`${API_BASE}/grievances/${id}`, { method: 'DELETE' });
  } catch (e) {
    console.error(e);
  }
}

// ---- ID GENERATOR ----
function generateGrievanceId() {
  const prefix = 'SGS';
  const year = new Date().getFullYear().toString().slice(-2);
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${year}${num}`;
}

// ---- DATE FORMATTER ----
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

// ---- STATUS BADGE ----
function statusBadge(status) {
  const map = {
    pending:   { cls: 'badge-pending',  icon: '⏳', label: 'Pending' },
    review:    { cls: 'badge-review',   icon: '🔍', label: 'Under Review' },
    resolved:  { cls: 'badge-resolved', icon: '✅', label: 'Resolved' },
    rejected:  { cls: 'badge-rejected', icon: '❌', label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return `<span class="badge ${s.cls}">${s.icon} ${s.label}</span>`;
}

// ---- PRIORITY BADGE ----
function priorityBadge(priority) {
  const map = {
    low:    { color: 'var(--emerald)', icon: '🟢', label: 'Low' },
    medium: { color: 'var(--amber)',   icon: '🟡', label: 'Medium' },
    high:   { color: 'var(--rose)',    icon: '🔴', label: 'High' },
  };
  const p = map[priority] || map.medium;
  return `<span style="color:${p.color}; font-weight:600; font-size:0.8rem;">${p.icon} ${p.label}</span>`;
}

// ---- CATEGORY ICON ----
function categoryIcon(cat) {
  const map = {
    academic:       '📚',
    hostel:         '🏠',
    fee:            '💰',
    infrastructure: '🏗️',
    faculty:        '👨‍🏫',
    sports:         '⚽',
    library:        '📖',
    other:          '📝',
  };
  return map[cat] || '📋';
}

// ---- TOAST NOTIFICATIONS ----
function showToast(type, title, message, duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ---- NAVBAR SCROLL ----
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // Hamburger
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
}

// ---- PARTICLES ----
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      color: Math.random() > 0.5 ? '124, 58, 237' : '6, 182, 212',
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
      ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124, 58, 237, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', init);
}

// ---- SCROLL ANIMATIONS ----
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// ---- STATS ----
async function getStats() {
  const all = await getGrievances();
  return {
    total: all.length,
    pending: all.filter(g => g.status === 'pending').length,
    review: all.filter(g => g.status === 'review').length,
    resolved: all.filter(g => g.status === 'resolved').length,
    rejected: all.filter(g => g.status === 'rejected').length,
    high: all.filter(g => g.priority === 'high').length,
  };
}

// ---- COUNTER ANIMATION ----
function animateCounter(el, target, duration = 1200) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { clearInterval(timer); start = target; }
    el.textContent = Math.floor(start);
  }, 16);
}

// ---- ADMIN AUTH ----
const ADMIN_PASS = 'admin123';

function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}

async function adminLogin(password) {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      sessionStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY);
}

// ---- SEED DEMO DATA ----
async function seedDemoData() {
  const existing = await getGrievances();
  if (existing.length > 0) return;
  const demos = [
    {
      name: 'Arjun Sharma', enrollment: 'EN2024001',
      email: 'arjun@college.edu', phone: '9876543210', department: 'Computer Science',
      year: '3rd Year', category: 'academic', priority: 'high',
      subject: 'Unfair grading in Data Structures exam',
      description: 'I believe my answer scripts were not evaluated properly. I scored much lower than expected. I request a re-evaluation of my paper.',
    },
    {
      name: 'Priya Patel', enrollment: 'EN2024002',
      email: 'priya@college.edu', phone: '9876543211', department: 'Electronics',
      year: '2nd Year', category: 'hostel', priority: 'medium',
      subject: 'Water supply issue in Girls Hostel Block B',
      description: 'There has been no water supply in Block B for the last 2 days. This is causing major inconvenience to the students.',
    }
  ];
  for (const d of demos) {
    await addGrievance(d);
  }
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initParticles();
  initScrollAnimations();
  seedDemoData();
});
