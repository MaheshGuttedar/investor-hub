// Global site scripts adapted from the original inline <script>.
// This file intentionally attaches functions to window so legacy markup
// that calls `showPage(...)` etc. continues to work.

const pages = ['home','about','projects','news','contact','login','invest'];
const navIds = ['home','about','projects','news','contact'];

function showPage(name: string) {
  pages.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.remove('active');
  });
  const target = document.getElementById('page-' + name);
  if (target) target.classList.add('active');

  // Nav highlighting
  navIds.forEach(id => {
    const el = document.getElementById('nav-' + id);
    if (el) el.classList.remove('active');
  });
  const activeNav = document.getElementById('nav-' + name);
  if (activeNav) activeNav.classList.add('active');

  // Footer visibility
  const noFooter = ['login','invest'];
  const footer = document.getElementById('site-footer');
  if (footer) footer.style.display = noFooter.includes(name) ? 'none' : 'block';

  // Close mobile menu if open (mobile flow)
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu && mobileMenu.classList.contains('open')) {
    mobileMenu.classList.remove('open');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

function showToast(msg: string) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Attach to window so existing inline handlers and other modules can call them.
(window as any).showPage = showPage;
(window as any).toggleMenu = toggleMenu;
(window as any).showToast = showToast;

// Navbar scroll listener
const onScroll = () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 50);
};
window.addEventListener('scroll', onScroll);
// run once to set initial state
onScroll();

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('mobileMenu');
  const ham = document.querySelector('.hamburger');
  const target = e.target as Node;
  if (menu && ham && menu.classList.contains('open') && !menu.contains(target) && !ham.contains(target)) {
    menu.classList.remove('open');
  }
});

// Init default page
showPage('home');

// Note: this module intentionally has no exports — importing it runs the setup.
