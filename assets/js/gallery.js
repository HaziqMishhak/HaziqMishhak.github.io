/* =====================================================
   Haziq Mishhak — Photographic Works
   Dynamic loader + lightbox
   ===================================================== */

const PORTFOLIO_PATH = 'assets/img/portfolio';
const MANIFEST_URL   = 'data/manifest.json';
const VIDEOS_URL     = 'data/videos.txt';

const state = {
  vertical: [],
  horizontal: [],
  videos: [],
  currentSet: [],
  currentIndex: 0,
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = (n) => String(n).padStart(2, '0');

function setCount(target, n) {
  const el = document.querySelector(`[data-count-target="${target}"]`);
  if (el) el.textContent = `${pad(n)} / ${pad(n)}`;
}

function showError(grid, message) {
  grid.textContent = '';
  const div = document.createElement('div');
  div.className = 'error';
  div.textContent = message;
  grid.appendChild(div);
}

function showEmpty(grid, message) {
  grid.textContent = '';
  const div = document.createElement('div');
  div.className = 'empty';
  div.textContent = message;
  grid.appendChild(div);
}

/* ---------- manifest + videos ---------- */
async function loadManifest() {
  const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load manifest.json');
  return res.json();
}

async function loadVideos() {
  try {
    const res = await fetch(VIDEOS_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error();
    const text = await res.text();
    return text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => {
        const [title, url] = l.split('|').map(s => (s || '').trim());
        if (!title || !url) return null;
        return { title, url, id: parseYouTubeId(url) };
      })
      .filter(v => v && v.id);
  } catch {
    return [];
  }
}

function parseYouTubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.searchParams.get('v')) return u.searchParams.get('v');
    const m = u.pathname.match(/\/(embed|shorts)\/([^/?]+)/);
    if (m) return m[2];
  } catch {}
  return null;
}

/* ---------- DOM helpers ---------- */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
function svg(viewBox, paths, size = 22) {
  const s = document.createElementNS(SVG_NS, 'svg');
  s.setAttribute('viewBox', viewBox);
  s.setAttribute('width', size);
  s.setAttribute('height', size);
  for (const p of paths) {
    const path = document.createElementNS(SVG_NS, 'path');
    for (const [k, v] of Object.entries(p)) path.setAttribute(k, v);
    s.appendChild(path);
  }
  return s;
}

/* ---------- render: photo cards ---------- */
function renderGrid(grid, files, folder, kind) {
  if (!files.length) {
    showEmpty(grid, `No ${kind} photographs yet — drop files into ${PORTFOLIO_PATH}/${folder}/ and add them to manifest.json.`);
    return;
  }

  grid.textContent = '';
  files.forEach((file, i) => {
    const src = `${PORTFOLIO_PATH}/${folder}/${file}`;
    const arrow = kind === 'vertical' ? '↕' : '↔';

    const img = el('img', {
      class: 'card__img',
      src,
      alt: `${kind} photograph ${i + 1}`,
      loading: 'lazy',
    });

    const left = el('span', {}, [
      el('b', { text: pad(i + 1) }),
      ` · ${file}`,
    ]);
    const right = el('span', { text: arrow });

    const meta = el('figcaption', { class: 'card__meta' }, [left, right]);
    const fig = el('figure', {
      class: 'card',
      onclick: () => openLightbox(kind, i),
    }, [img, meta]);

    grid.appendChild(fig);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const node = e.target;
        const order = [...node.parentNode.children].indexOf(node);
        node.style.animationDelay = `${Math.min(order * 60, 600)}ms`;
        node.classList.add('is-in');
        io.unobserve(node);
      }
    });
  }, { rootMargin: '60px' });
  $$('.card', grid).forEach(c => io.observe(c));
}

/* ---------- render: video cards ---------- */
function renderVideos(grid, videos) {
  if (!videos.length) {
    showEmpty(grid, 'No videos yet — add lines to data/videos.txt in the format: Title | YouTube URL');
    return;
  }

  grid.textContent = '';
  videos.forEach((v, i) => {
    const thumbImg = el('img', {
      src: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      alt: v.title,
      loading: 'lazy',
    });
    thumbImg.addEventListener('error', () => {
      thumbImg.src = `https://i.ytimg.com/vi/${v.id}/0.jpg`;
    });

    const playSvg = svg('0 0 24 24', [{ d: 'M8 5v14l11-7z', fill: 'currentColor' }], 22);
    const playSpan = el('span', {}, [playSvg]);
    const playWrap = el('div', { class: 'video__play' }, [playSpan]);

    const card = el('article', { class: 'video' });
    const thumb = el('div', {
      class: 'video__thumb',
      role: 'button',
      'aria-label': `Play ${v.title}`,
    }, [thumbImg, playWrap]);

    const frame = el('iframe', {
      class: 'video__iframe',
      'data-src': `https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`,
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowfullscreen: '',
    });

    thumb.addEventListener('click', () => {
      frame.src = frame.dataset.src;
      card.classList.add('is-playing');
    });

    const title = el('h3', { class: 'video__title', text: v.title });
    const num = el('span', { class: 'video__num', text: `${pad(i + 1)} / ${pad(videos.length)}` });
    const meta = el('div', { class: 'video__meta' }, [title, num]);

    card.appendChild(thumb);
    card.appendChild(frame);
    card.appendChild(meta);
    grid.appendChild(card);
  });
}

/* ---------- lightbox ---------- */
const lb = { el: null, img: null, name: null, index: null, dl: null };

function initLightbox() {
  lb.el    = $('#lightbox');
  lb.img   = $('.lightbox__img', lb.el);
  lb.name  = $('.lightbox__name', lb.el);
  lb.index = $('.lightbox__index', lb.el);
  lb.dl    = $('.lightbox__download', lb.el);

  $('.lightbox__close', lb.el).addEventListener('click', closeLightbox);
  $('.lightbox__nav--prev', lb.el).addEventListener('click', () => step(-1));
  $('.lightbox__nav--next', lb.el).addEventListener('click', () => step(1));
  lb.el.addEventListener('click', (e) => { if (e.target === lb.el) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.el.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft')  step(-1);
  });
}

function openLightbox(kind, index) {
  const files = state[kind];
  state.currentSet = files.map(f => ({ src: `${PORTFOLIO_PATH}/${kind}/${f}`, name: f }));
  state.currentIndex = index;
  showLightboxFrame();
  lb.el.classList.add('is-open');
  lb.el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lb.el.classList.remove('is-open');
  lb.el.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function step(delta) {
  const len = state.currentSet.length;
  state.currentIndex = (state.currentIndex + delta + len) % len;
  showLightboxFrame();
}

function showLightboxFrame() {
  const item = state.currentSet[state.currentIndex];
  lb.img.src = item.src;
  lb.img.alt = item.name;
  lb.name.textContent = item.name;
  lb.index.textContent = `${pad(state.currentIndex + 1)} / ${pad(state.currentSet.length)}`;
  lb.dl.href = item.src;
  lb.dl.setAttribute('download', item.name);
}

/* ---------- init ---------- */
async function init() {
  initLightbox();
  $('#year').textContent = new Date().getFullYear();

  const vGrid = $('#vertical-grid');
  const hGrid = $('#horizontal-grid');
  const videoGrid = $('#video-grid');

  try {
    const manifest = await loadManifest();
    state.vertical   = Array.isArray(manifest.vertical)   ? manifest.vertical   : [];
    state.horizontal = Array.isArray(manifest.horizontal) ? manifest.horizontal : [];
    renderGrid(vGrid, state.vertical, 'vertical', 'vertical');
    renderGrid(hGrid, state.horizontal, 'horizontal', 'horizontal');
    setCount('vertical', state.vertical.length);
    setCount('horizontal', state.horizontal.length);
  } catch (err) {
    console.error(err);
    showError(vGrid, 'Could not load manifest.json — make sure data/manifest.json exists.');
    showError(hGrid, 'Could not load manifest.json — make sure data/manifest.json exists.');
  }

  state.videos = await loadVideos();
  renderVideos(videoGrid, state.videos);
  setCount('video', state.videos.length);
}

document.addEventListener('DOMContentLoaded', init);
