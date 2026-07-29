(() => {
  const config = window.LELYS_CONFIG || {};
  const orderUrl = config.hotplateOrderUrl || config.hotplateUrl || 'https://www.hotplate.com/lelysbread?event=current';
  const productGrid = document.querySelector('#product-grid');
  const menuStatus = document.querySelector('#menu-status');
  const menuFallback = document.querySelector('#menu-fallback');
  const heroProductName = document.querySelector('#hero-product-name');
  const heroProductImage = document.querySelector('#hero-product-image');

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function bindOrderLinks(scope = document) {
    scope.querySelectorAll('.js-order').forEach(link => {
      link.href = orderUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
    });
  }

  function productCard(product, index) {
    const title = product.title || 'Fresh-baked favorite';
    const image = product.image || (index % 2 ? '/assets/cinnamon-rolls-detail.svg' : '/assets/cinnamon-rolls-hero.svg');
    const description = product.description || 'Fresh-milled, small-batch, and made with thoughtfully chosen ingredients.';
    const price = product.price ? `$${Number(product.price).toFixed(2)}` : 'See options';
    const availability = product.available === false ? 'Next bake' : 'Available to order';
    const url = product.url || orderUrl;
    return `<article class="product-card reveal"><span class="product-badge">${escapeHtml(availability)}</span><div class="product-image"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy" /></div><div class="product-body"><div class="product-meta"><h3>${escapeHtml(title)}</h3><span class="product-price">${escapeHtml(price)}</span></div><p class="product-description">${escapeHtml(description)}</p><div class="product-actions"><a class="button" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Order Now</a></div></div></article>`;
  }

  async function loadMenu() {
    if (!productGrid) return;
    try {
      const response = await fetch(`/api/menu?chefId=${encodeURIComponent(config.hotplateSlug || 'lelysbread')}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Menu request failed: ${response.status}`);
      const data = await response.json();
      let products = Array.isArray(data.products) ? data.products : [];
      if (document.body.dataset.page === 'home') products = products.slice(0, 6);
      if (!products.length) throw new Error('No public products returned');
      productGrid.innerHTML = products.map(productCard).join('');
      if (menuStatus) menuStatus.textContent = data.eventTitle ? `Showing products from “${data.eventTitle}.”` : 'Showing the latest public Hotplate menu.';
      if (menuFallback) menuFallback.hidden = true;
      const featured = products.find(item => item.image) || products[0];
      if (featured && heroProductName) heroProductName.textContent = featured.title || 'Fresh-baked favorites';
      if (featured?.image && heroProductImage) {
        heroProductImage.src = featured.image;
        heroProductImage.alt = featured.title || "Fresh-baked item from Lely's Bread";
      }
      observeReveals(productGrid);
    } catch (error) {
      console.warn(error);
      if (menuStatus) menuStatus.textContent = 'Open Hotplate to see the current bread drop.';
      if (menuFallback) menuFallback.hidden = false;
    }
  }

  function observeReveals(scope = document) {
    const items = scope.querySelectorAll('.reveal:not([data-observed])');
    if (!('IntersectionObserver' in window)) {
      items.forEach(item => item.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    items.forEach(item => {
      item.dataset.observed = 'true';
      observer.observe(item);
    });
  }

  function setupNavigation() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');
    toggle?.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    nav?.querySelectorAll('a').forEach(item => item.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
    }));
  }

  function addStructuredData() {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Bakery',
      name: "Lely's Bread",
      description: 'Fresh-milled flour baked goods made in small batches with thoughtfully chosen ingredients.',
      areaServed: config.locationLabel || 'Wellington, Florida',
      url: window.location.origin
    };
    const node = document.createElement('script');
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify(schema);
    document.head.appendChild(node);
  }

  bindOrderLinks();
  setupNavigation();
  addStructuredData();
  observeReveals();
  loadMenu();
})();