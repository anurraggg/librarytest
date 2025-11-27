export default function decorate(block) {
    console.log('✅ recipe-tabs-carousel: decorate() start');
    if (!block) return;
    block.classList.add('recipe-tabs-carousel');
  
    const rows = [...block.children];
    if (rows.length === 0) {
      console.warn('recipe-tabs-carousel: no rows found.');
      return;
    }
  
    // --- Title & subtitle (first row) ---
    const titleRow = rows.shift();
    const title = (titleRow?.children?.[0]?.innerText || '').trim();
    const subtitle = (titleRow?.children?.[1]?.innerText || '').trim();
  
    // --- Main structure ---
    const wrapper = document.createElement('div');
    wrapper.className = 'rtc__wrapper';
  
    if (title || subtitle) {
      const header = document.createElement('div');
      header.className = 'rtc__header';
      if (title) {
        const h2 = document.createElement('h2');
        h2.textContent = title;
        header.appendChild(h2);
      }
      if (subtitle) {
        const p = document.createElement('p');
        p.textContent = subtitle;
        header.appendChild(p);
      }
      wrapper.appendChild(header);
    }
  
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'rtc__tabs';
    const carouselsContainer = document.createElement('div');
    carouselsContainer.className = 'rtc__carousels';
  
    wrapper.appendChild(tabsContainer);
    wrapper.appendChild(carouselsContainer);
    block.innerHTML = '';
    block.appendChild(wrapper);
  
    // --- Helper: Parse content ---
    function parseRowContent(row) {
      const imgEl = row.querySelector('img');
      const img = imgEl ? (imgEl.src || '') : '';
      const texts = [...row.querySelectorAll('div, p, span')]
        .map(n => (n.innerText || '').trim())
        .filter(Boolean);
      const fullText = texts.join('\n');
      const getLabel = (label) => {
        const re = new RegExp(label.replace(/\s+/g, '\\s*') + '\\s*:\\s*(.+)', 'i');
        const m = fullText.match(re);
        return m ? m[1].trim() : null;
      };
      const data = {
        img,
        overlayTitle: getLabel('Overlay Title') || null,
        overlayButton: getLabel('Overlay Button') || null,
        category: getLabel('Category') || null,
        title: getLabel('Title') || null,
        time: getLabel('Time') || null,
        level: getLabel('Level') || null,
        link: getLabel('Link') || null,
        rawLines: texts
      };
      const anyLabelFound = ['overlayTitle', 'overlayButton', 'category', 'title', 'time', 'level', 'link']
        .some(k => !!data[k]);
      if (!anyLabelFound && data.rawLines.length) {
        const L = data.rawLines;
        data.overlayTitle = L[0] || null;
        data.overlayButton = L[1] || null;
        data.category = L[2] || null;
        data.title = L[3] || null;
        data.time = L[4] || null;
        data.level = L[5] || null;
        data.link = L[6] || null;
      }
      return data;
    }
  
    // --- Build tabs + carousels ---
    const tabsArray = [];
    const carouselsArray = [];
    let activeCarousel = null;
  
    rows.forEach((row) => {
      const firstCol = (row.children?.[0]?.innerText || '').trim().toLowerCase();
  
      if (firstCol === 'tab') {
        const tabName = (row.children?.[1]?.innerText || 'Tab').trim();
        const tabBtn = document.createElement('button');
        tabBtn.className = 'rtc__tab';
        tabBtn.type = 'button';
        tabBtn.textContent = tabName;
        tabsContainer.appendChild(tabBtn);
        tabsArray.push(tabBtn);
  
        const carouselWrap = document.createElement('div');
        carouselWrap.className = 'rtc__carousel-wrap';
        const carousel = document.createElement('div');
        carousel.className = 'rtc__carousel';
        carouselWrap.appendChild(carousel);
        carouselsContainer.appendChild(carouselWrap);
        carouselsArray.push(carousel);
        activeCarousel = carousel;
      } else if (activeCarousel) {
        const data = parseRowContent(row);
        const card = document.createElement('div');
        card.className = 'rtc__card';
  
        const imgWrap = document.createElement('div');
        imgWrap.className = 'rtc__image';
        if (data.img) {
          const img = document.createElement('img');
          img.src = data.img;
          img.alt = data.title || '';
          img.loading = 'lazy';
          imgWrap.appendChild(img);
        }
  
        const overlay = document.createElement('div');
        overlay.className = 'rtc__overlay';
        if (data.overlayTitle) {
          const oT = document.createElement('p');
          oT.className = 'rtc__overlay-title';
          oT.textContent = data.overlayTitle;
          overlay.appendChild(oT);
        }
        if (data.overlayButton) {
          const btn = document.createElement('a');
          btn.className = 'rtc__overlay-btn';
          btn.textContent = data.overlayButton;
          if (data.link) {
            btn.href = data.link;
            btn.setAttribute('target', '_self');
          }
          overlay.appendChild(btn);
        }
        imgWrap.appendChild(overlay);
  
        const body = document.createElement('div');
        body.className = 'rtc__body';
        if (data.category) {
          const cat = document.createElement('p');
          cat.className = 'rtc__category';
          cat.textContent = data.category;
          body.appendChild(cat);
        }
        if (data.title) {
          const h3 = document.createElement('h3');
          h3.textContent = data.title;
          body.appendChild(h3);
        }
        const meta = document.createElement('div');
        meta.className = 'rtc__meta';
        if (data.time) {
          const s = document.createElement('span');
          s.className = 'rtc__meta-item';
          s.innerHTML = `⏱ ${data.time}`;
          meta.appendChild(s);
        }
        if (data.level) {
          const s2 = document.createElement('span');
          s2.className = 'rtc__meta-item';
          s2.innerHTML = `👨‍🍳 ${data.level}`;
          meta.appendChild(s2);
        }
        body.appendChild(meta);
  
        card.appendChild(imgWrap);
        card.appendChild(body);
        activeCarousel.appendChild(card);
      }
    });
  
    if (!tabsArray.length || !carouselsArray.length) {
      console.warn('recipe-tabs-carousel: no tabs/carousels created.');
      return;
    }
  
    // --- Add navigation arrows ---
    const globalPrev = document.createElement('button');
    globalPrev.type = 'button';
    globalPrev.className = 'rtc__nav rtc__prev';
    globalPrev.textContent = '←';
  
    const globalNext = document.createElement('button');
    globalNext.type = 'button';
    globalNext.className = 'rtc__nav rtc__next';
    globalNext.textContent = '→';
  
    carouselsContainer.appendChild(globalPrev);
    carouselsContainer.appendChild(globalNext);
  
    // --- Helper to measure card size ---
    function getCardMetrics(carousel) {
      const card = carousel.querySelector('.rtc__card');
      if (!card) return null;
      const gap = parseInt(getComputedStyle(carousel).gap || 60, 10) || 60;
      const cw = Math.round(card.getBoundingClientRect().width);
      return { cardWidth: cw, full: cw + gap, gap };
    }
  
    // --- One-card-per-click scroll logic ---
    function scrollOneCardIndex(direction) {
      const active = carouselsArray.find(c => c.classList.contains('active'));
      if (!active) return;
  
      const metrics = getCardMetrics(active);
      if (!metrics) return;
  
      const fullCard = metrics.full;
      const totalCards = active.querySelectorAll('.rtc__card').length;
      const maxScroll = active.scrollWidth - active.clientWidth;
  
      // Current card index
      const currentIndex = Math.round(active.scrollLeft / fullCard);
      let targetIndex = direction === 'right' ? currentIndex + 1 : currentIndex - 1;
  
      const visibleCount = Math.floor(active.clientWidth / fullCard);
      const maxIndex = Math.max(0, totalCards - visibleCount);
      targetIndex = Math.max(0, Math.min(targetIndex, maxIndex));
  
      let targetScroll = targetIndex * fullCard;
  
      // ✅ FIX: Prevent last card from being half-hidden
      if (targetScroll > maxScroll - metrics.gap / 2) {
        targetScroll = maxScroll;
      }
  
      active.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  
    globalPrev.addEventListener('click', () => scrollOneCardIndex('left'));
    globalNext.addEventListener('click', () => scrollOneCardIndex('right'));
  
    // --- Tab switching ---
    function setActiveTab(index) {
      tabsArray.forEach((t, i) => t.classList.toggle('active', i === index));
      carouselsArray.forEach((c, i) => {
        c.classList.toggle('active', i === index);
        c.style.opacity = i === index ? '1' : '0';
        c.style.visibility = i === index ? 'visible' : 'hidden';
        c.style.transform = i === index ? 'translateY(0)' : 'translateY(10px)';
        if (c.parentElement) c.parentElement.style.zIndex = i === index ? '5' : '1';
        if (i === index) c.scrollTo({ left: 0, behavior: 'instant' });
      });
    }
  
    setActiveTab(0);
  
    tabsArray.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        if (!tab.classList.contains('active')) {
          setActiveTab(i);
        }
      });
    });
  
    // --- Overlay buttons ---
    block.querySelectorAll('.rtc__overlay-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const href = btn.getAttribute('href');
        if (href) window.location.href = href;
      });
    });
  
    // --- Resize observer for responsiveness ---
    const ro = new ResizeObserver(() => {
      const active = carouselsArray.find(c => c.classList.contains('active'));
      if (!active) return;
      const metrics = getCardMetrics(active);
      if (!metrics) return;
      const idx = Math.round(active.scrollLeft / metrics.full);
      active.scrollTo({ left: idx * metrics.full, behavior: 'instant' });
  
      // ✅ Extra check to ensure we don't exceed max scroll after resize
      const maxScroll = active.scrollWidth - active.clientWidth;
      if (active.scrollLeft > maxScroll) {
        active.scrollTo({ left: maxScroll, behavior: 'instant' });
      }
    });
  
    carouselsArray.forEach(c => ro.observe(c));
  
    // ✅ Optional: Keyboard arrow navigation
    block.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') scrollOneCardIndex('left');
      if (e.key === 'ArrowRight') scrollOneCardIndex('right');
    });
  
    console.log('✅ recipe-tabs-carousel: build complete', {
      tabs: tabsArray.length,
      carousels: carouselsArray.length
    });
  }
  