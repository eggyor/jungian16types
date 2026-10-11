(() => {
  if (!window.matchMedia('(min-width: 901px)').matches) return;

  const articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  const popup = document.createElement('aside');
  popup.className = 'article-link-preview';
  popup.setAttribute('role', 'tooltip');
  popup.setAttribute('aria-hidden', 'true');
  popup.innerHTML = '<span class="article-link-preview__ornament" aria-hidden="true">✦</span><strong class="article-link-preview__title"></strong><p class="article-link-preview__excerpt"></p>';
  document.body.append(popup);

  const titleNode = popup.querySelector('.article-link-preview__title');
  const excerptNode = popup.querySelector('.article-link-preview__excerpt');
  const cache = new Map();
  let activeLink = null;
  let showTimer = 0;
  let hideTimer = 0;

  const shorten = (text, limit = 50) => {
    const clean = (text || '').replace(/\s+/g, ' ').trim();
    const chars = Array.from(clean);
    return chars.length > limit ? `${chars.slice(0, limit).join('')}…` : clean;
  };

  function loadPreview(link) {
    const target = new URL(link.href, window.location.href);
    if (target.origin !== window.location.origin || (target.pathname === location.pathname && target.hash)) return null;
    const key = `${target.pathname}${target.search}`;
    if (!cache.has(key)) {
      cache.set(key, fetch(target.href, {credentials: 'same-origin'})
        .then(response => response.ok ? response.text() : '')
        .then(markup => {
          if (!markup) return {title: link.textContent.trim(), excerpt: ''};
          const doc = new DOMParser().parseFromString(markup, 'text/html');
          const title = doc.querySelector('.article-head h1, main h1, h1')?.textContent || doc.title || link.textContent;
          const description = doc.querySelector('meta[name="description"]')?.content
            || doc.querySelector('.article-body p, main p')?.textContent
            || '';
          return {title: shorten(title, 70), excerpt: shorten(description)};
        })
        .catch(() => ({title: shorten(link.textContent, 70), excerpt: ''})));
    }
    return cache.get(key);
  }

  function placePopup(link) {
    const rect = link.getBoundingClientRect();
    const margin = 12;
    const width = popup.offsetWidth;
    const height = popup.offsetHeight;
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
    const below = rect.bottom + height + 14 <= window.innerHeight;
    popup.style.left = `${left}px`;
    popup.style.top = `${below ? rect.bottom + 10 : Math.max(margin, rect.top - height - 10)}px`;
  }

  function hidePopup() {
    window.clearTimeout(showTimer);
    window.clearTimeout(hideTimer);
    const previousLink = activeLink;
    activeLink = null;
    popup.classList.remove('is-visible');
    popup.setAttribute('aria-hidden', 'true');
    if (previousLink) previousLink.removeAttribute('aria-describedby');
  }

  function scheduleShow(link) {
    window.clearTimeout(showTimer);
    window.clearTimeout(hideTimer);
    hidePopup();
    activeLink = link;
    const previewPromise = loadPreview(link);
    if (!previewPromise) return;
    showTimer = window.setTimeout(async () => {
      const preview = await previewPromise;
      if (activeLink !== link) return;
      titleNode.textContent = preview.title;
      excerptNode.textContent = preview.excerpt;
      excerptNode.hidden = !preview.excerpt;
      link.setAttribute('aria-describedby', 'article-link-preview');
      popup.id = 'article-link-preview';
      popup.classList.add('is-visible');
      popup.setAttribute('aria-hidden', 'false');
      placePopup(link);
    }, 500);
  }

  function scheduleHide() {
    window.clearTimeout(showTimer);
    hideTimer = window.setTimeout(() => {
      activeLink = null;
      hidePopup();
    }, 140);
  }

  articleBody.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('pointerenter', () => scheduleShow(link));
    link.addEventListener('pointerleave', scheduleHide);
    link.addEventListener('focus', () => scheduleShow(link));
    link.addEventListener('blur', scheduleHide);
  });

  popup.addEventListener('pointerenter', () => window.clearTimeout(hideTimer));
  popup.addEventListener('pointerleave', scheduleHide);
  window.addEventListener('scroll', hidePopup, {passive: true});
  window.addEventListener('resize', hidePopup, {passive: true});
})();
