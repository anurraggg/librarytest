// eslint-disable-next-line no-unused-vars
export default async function decorate(block) {
    const rows = block.querySelectorAll(':scope > div');
    if (rows.length < 1) return;
  
    // Extract all image rows
    const images = [];
    rows.forEach(row => {
      const match = row.textContent.match(/image\d*\s+(.*)/);
      if (match) {
        const img = document.createElement('img');
        img.src = match[1].trim() || 'https://via.placeholder.com/400x300';
        images.push(img);
      }
    });
  
    if (images.length === 0) return;
  
    // Structure the block
    block.setAttribute('role', 'region');
    block.setAttribute('aria-roledescription', 'Carousel');
  
    const container = document.createElement('div');
    container.classList.add('carousel-container');
    const slidesWrapper = document.createElement('div');
    slidesWrapper.classList.add('carousel-slides');
    const imagesPerPage = 3;
    const totalSlides = Math.ceil(images.length / imagesPerPage);
    slidesWrapper.style.width = `${totalSlides * 100}%`;
  
    // Create slides with 3 images each
    for (let i = 0; i < totalSlides; i++) {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');
      slide.dataset.slideIndex = i;
      slide.setAttribute('aria-hidden', i !== 0);
      slide.style.width = `${100 / totalSlides}%`;
      for (let j = 0; j < imagesPerPage; j++) {
        const index = i * imagesPerPage + j;
        if (index < images.length) {
          const imgContainer = document.createElement('div');
          imgContainer.style.flex = '0 0 400px'; // Fixed width for each image
          imgContainer.appendChild(images[index]);
          slide.appendChild(imgContainer);
        } else {
          const emptyDiv = document.createElement('div');
          emptyDiv.style.flex = '0 0 400px'; // Placeholder for empty space
          slide.appendChild(emptyDiv);
        }
      }
      slidesWrapper.appendChild(slide);
    }
  
    container.appendChild(slidesWrapper);
    const navButtons = document.createElement('div');
    navButtons.classList.add('carousel-navigation-buttons');
    const prevButton = document.createElement('button');
    prevButton.classList.add('slide-prev');
    prevButton.textContent = '<<';
    const nextButton = document.createElement('button');
    nextButton.classList.add('slide-next');
    nextButton.textContent = '>>';
    navButtons.append(prevButton, nextButton);
    block.innerHTML = '';
    block.append(container, navButtons);
  
    // Add classes and structure
    block.classList.add('image-carousel');
  
    // Carousel logic
    let currentSlide = 0;
  
    function updateActiveSlide() {
      const slides = block.querySelectorAll('.carousel-slide');
      slides.forEach((slide, idx) => {
        slide.setAttribute('aria-hidden', idx !== currentSlide);
      });
      prevButton.disabled = currentSlide === 0;
      nextButton.disabled = currentSlide >= totalSlides - 1;
    }
  
    function showSlide(slideIndex) {
      currentSlide = (slideIndex % totalSlides + totalSlides) % totalSlides; // Ensure looping
      const offset = -currentSlide * (100 / totalSlides);
      slidesWrapper.style.transform = `translateX(${offset}%)`;
      updateActiveSlide();
      slidesWrapper.scrollTo({
        left: slidesWrapper.querySelector(`.carousel-slide[data-slide-index="${currentSlide}"]`).offsetLeft,
        behavior: 'smooth'
      });
    }
  
    prevButton.addEventListener('click', () => showSlide(currentSlide - 1));
    nextButton.addEventListener('click', () => showSlide(currentSlide + 1));
  
    // Initial update
    updateActiveSlide();
  }
