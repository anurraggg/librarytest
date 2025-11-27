// eslint-disable-next-line no-unused-vars
export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  if (rows.length < 1) return;

  // Extract all image rows
  const images = [];
  rows.forEach(row => {
    const match = row.textContent.trim().match(/^image\d*?\s+(.*)$/i);
    if (match) {
      const img = document.createElement('img');
      img.src = match[1].trim() || 'https://via.placeholder.com/400x300';
      img.alt = `Slider image ${images.length + 1}`;
      img.loading = 'lazy';
      images.push(img);
    }
  });

  if (images.length === 0) return;

  // Structure the block
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Slider');
  block.setAttribute('tabindex', '0');

  // --- MODIFIED ---
  // Show 3 slides on desktop (>= 768px), 1 on mobile
  const imagesPerPage = window.innerWidth >= 768 ? 3 : 1;
  const slidesToScroll = 1; // Always scroll 1 slide at a time
  // --- END MODIFICATION ---

  const totalSlides = images.length;
  if (totalSlides === 0) return;

  const container = document.createElement('div');
  container.classList.add('slider-container');

  const track = document.createElement('div');
  track.classList.add('slider-track');

  // Build individual slides (one per image)
  images.forEach((img, i) => {
    const slide = document.createElement('div');
    slide.classList.add('slider-slide');
    slide.dataset.slideIndex = i;
    slide.setAttribute('aria-hidden', i >= imagesPerPage);
    const imgWrapper = document.createElement('div');
    imgWrapper.appendChild(img);
    slide.appendChild(imgWrapper);
    track.appendChild(slide);
  });

  // For infinite: Clone buffers (first/last imagesPerPage slides)
  const bufferSize = imagesPerPage;
  // Prepend clones of last slides
  for (let i = totalSlides - 1; i >= totalSlides - bufferSize; i--) {
    const clone = track.children[i].cloneNode(true);
    clone.dataset.isClone = 'true';
    clone.dataset.originalIndex = i;
    track.insertBefore(clone, track.firstChild);
  }
  // Append clones of first slides
  for (let i = 0; i < bufferSize; i++) {
    const clone = track.children[i].cloneNode(true);
    clone.dataset.isClone = 'true';
    clone.dataset.originalIndex = i;
    track.appendChild(clone);
  }

  // Set widths (responsive)
  const extendedTotalSlides = track.children.length;
  Array.from(track.children).forEach(slide => {
    slide.style.width = `${100 / imagesPerPage}%`;
  });
  track.style.width = `${extendedTotalSlides * (100 / imagesPerPage)}%`;

  container.appendChild(track);

  // Navigation buttons (like slick-prev/next)
  const navButtons = document.createElement('div');
  navButtons.classList.add('slider-navigation-buttons');
  const prevButton = document.createElement('button');
  prevButton.classList.add('slide-prev');
  prevButton.textContent = '<<';
  prevButton.setAttribute('aria-label', 'Previous slide');
  const nextButton = document.createElement('button');
  nextButton.classList.add('slide-next');
  nextButton.textContent = '>>';
  nextButton.setAttribute('aria-label', 'Next slide');
  navButtons.append(prevButton, nextButton);
  container.appendChild(navButtons);

  // Dots (like slick-dots)
  const dotsContainer = document.createElement('ul');
  dotsContainer.classList.add('slider-dots');
  dotsContainer.setAttribute('role', 'tablist');
  // Will now create 1 dot per image
  for (let i = 0; i < Math.ceil(totalSlides / slidesToScroll); i++) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.setAttribute('aria-label', `Go to slide ${i + 1}`);
    button.setAttribute('aria-selected', i === 0);
    li.appendChild(button);
    dotsContainer.appendChild(li);
  }
  container.appendChild(dotsContainer);

  // Clear and append
  block.innerHTML = '';
  block.append(container);
  block.classList.add('image-slider');

  // Logic
  let currentSlide = bufferSize; // Start after prepend clones
  let isTransitioning = false;

  const statusAnnounce = document.createElement('div');
  statusAnnounce.className = 'sr-only'; // This class is now used to hide the text
  statusAnnounce.setAttribute('aria-live', 'polite');
  statusAnnounce.textContent = `Slider with ${totalSlides} images. Showing first view.`;
  block.appendChild(statusAnnounce);

  const dots = dotsContainer.querySelectorAll('li button');

  function updateActiveSlide() {
    Array.from(track.children).forEach((slide, idx) => {
      const realIdx = idx - bufferSize;
      const isVisible = (realIdx >= currentSlide - bufferSize) && (realIdx < currentSlide - bufferSize + imagesPerPage);
      slide.setAttribute('aria-hidden', !isVisible);
    });
    // Update dots
    const currentGroup = Math.floor((currentSlide - bufferSize) / slidesToScroll);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentGroup);
      dot.setAttribute('aria-selected', i === currentGroup);
    });
    // Status
    const currentImage = ((currentSlide - bufferSize) % totalSlides) + 1;
    statusAnnounce.textContent = `Showing image ${currentImage} of ${totalSlides}.`;
  }


  function showSlide(direction) {
    if (isTransitioning) return;
    isTransitioning = true;

    currentSlide += direction * slidesToScroll;
    const offset = -(currentSlide * (100 / imagesPerPage));
    track.style.transform = `translate3d(${offset}%, 0, 0px)`;

    // Seamless reset
    setTimeout(() => {
      const realPos = (currentSlide - bufferSize) % totalSlides;
      if (currentSlide < bufferSize || currentSlide >= totalSlides + bufferSize) {
        currentSlide = bufferSize + realPos;
        track.style.transition = 'none';
        track.style.transform = `translate3d(${(currentSlide * (100 / imagesPerPage)) * -1}%, 0, 0px)`;
        track.offsetHeight; // Reflow
        track.style.transition = 'transform 0.5s ease';
      }
      isTransitioning = false;
      updateActiveSlide();
    }, 500);
  }

  // Events
  prevButton.addEventListener('click', () => showSlide(-1));
  nextButton.addEventListener('click', () => showSlide(1));
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const targetSlide = bufferSize + (i * slidesToScroll);
      currentSlide = targetSlide;
      const offset = -(targetSlide * (100 / imagesPerPage));
      track.style.transform = `translate3d(${offset}%, 0, 0px)`;
      updateActiveSlide();
    });
  });

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showSlide(-1);
    if (e.key === 'ArrowRight') showSlide(1);
  });

  // --- NEW ---
  // Responsive resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Re-init widths (simplified; full re-decorate if needed)
      const newPerPage = window.innerWidth >= 768 ? 3 : 1;
      if (newPerPage !== imagesPerPage) location.reload(); // Simple refresh
    }, 250);
  });
  // --- END NEW ---

  updateActiveSlide();
}