export default function decorate(block) {
    console.log('✅ Hero Carousel JS loaded!');
  
    block.classList.add('hero-carousel');
  
    // Detect table OR flattened div structure (AEM EDS converts tables to divs)
    let slides = [];
    const table = block.querySelector('table, div > table');
    const divRows = [...block.children].filter((el) => el.tagName === 'DIV');
  
    if (table) {
      console.log('📋 Table detected');
      const rows = table.querySelectorAll('tr');
      rows.forEach((row, i) => {
        if (i === 0) return; // skip header
        const cells = row.querySelectorAll('td');
        if (cells.length < 6) return;
  
        const bgImg = cells[0].querySelector('img')?.src || cells[0].innerText.trim();
        const overlayImg = cells[1].querySelector('img')?.src || cells[1].innerText.trim();
        const title = cells[2].innerText.trim();
        const desc = cells[3].innerText.trim();
        const btnText = cells[4].innerText.trim();
        const btnLink = cells[5].innerText.trim();
  
        slides.push({ bgImg, overlayImg, title, desc, btnText, btnLink });
      });
    } else if (divRows.length > 0) {
      console.log('🧩 Detected flattened DIV layout');
      // Skip the first div (header row)
      const dataRows = divRows.slice(1);
  
      dataRows.forEach((row) => {
        const cells = [...row.children];
        if (cells.length < 6) return;
  
        const bgImg = cells[0].querySelector('img')?.src || cells[0].innerText.trim();
        const overlayImg = cells[1].querySelector('img')?.src || cells[1].innerText.trim();
        const title = cells[2]?.innerText.trim() || '';
        const desc = cells[3]?.innerText.trim() || '';
        const btnText = cells[4]?.innerText.trim() || '';
        const btnLink = cells[5]?.innerText.trim() || '';
  
        slides.push({ bgImg, overlayImg, title, desc, btnText, btnLink });
      });
    }
  
    console.log('Slides found:', slides);
  
    if (slides.length === 0) {
      console.warn('⚠️ No valid slides detected in hero-carousel block');
      return;
    }
  
    // Create carousel wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-carousel__wrapper';
  
    slides.forEach((slide, i) => {
      const slideEl = document.createElement('div');
      slideEl.className = 'hero-carousel__slide';
      if (i === 0) slideEl.classList.add('active');
      slideEl.style.backgroundImage = `url('${slide.bgImg}')`;
  
      const overlay = document.createElement('div');
      overlay.className = 'hero-carousel__overlay';
  
      if (slide.overlayImg) {
        const overlayImg = document.createElement('img');
        overlayImg.src = slide.overlayImg;
        overlayImg.alt = slide.title;
        overlayImg.className = 'hero-carousel__logo';
        overlay.appendChild(overlayImg);
      }
  
      const content = document.createElement('div');
      content.className = 'hero-carousel__content';
      content.innerHTML = `
        <h2>${slide.title}</h2>
        <p>${slide.desc}</p>
        ${
          slide.btnText
            ? `<a href="${slide.btnLink}" class="hero-carousel__btn">${slide.btnText}</a>`
            : ''
        }
      `;
  
      overlay.appendChild(content);
      slideEl.appendChild(overlay);
      wrapper.appendChild(slideEl);
    });
  
    // Clear and rebuild
    block.innerHTML = '';
    block.appendChild(wrapper);
  
    // Navigation
    const prevBtn = document.createElement('button');
    prevBtn.className = 'hero-carousel__nav hero-carousel__prev';
    prevBtn.innerHTML = '<';
  
    const nextBtn = document.createElement('button');
    nextBtn.className = 'hero-carousel__nav hero-carousel__next';
    nextBtn.innerHTML = '>';
  
    const dots = document.createElement('div');
    dots.className = 'hero-carousel__dots';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-carousel__dot';
      if (i === 0) dot.classList.add('active');
      dots.appendChild(dot);
    });
  
    block.append(prevBtn, nextBtn, dots);
  
    // Carousel Logic
    let current = 0;
    const allSlides = block.querySelectorAll('.hero-carousel__slide');
    const allDots = block.querySelectorAll('.hero-carousel__dot');
  
    function showSlide(index) {
      allSlides.forEach((s) => s.classList.remove('active'));
      allDots.forEach((d) => d.classList.remove('active'));
      allSlides[index].classList.add('active');
      allDots[index].classList.add('active');
    }
  
    prevBtn.addEventListener('click', () => {
      current = (current - 1 + slides.length) % slides.length;
      showSlide(current);
    });
  
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % slides.length;
      showSlide(current);
    });
  
    allDots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        current = i;
        showSlide(i);
      });
    });
  }
  