import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Tries to extract a YouTube video ID and construct an embed URL.
 * @param {string} url The URL to check.
 * @returns {string|null} The embed URL or null.
 */
function getYoutubeEmbedUrl(url) {
  let embedUrl = null;
  try {
    const urlObj = new URL(url, window.location.href); // Use window.location.href as base for relative URLs
    const { hostname, pathname, searchParams } = urlObj;

    let videoId = null;

    if (hostname.includes('youtube.com')) {
      // Standard watch link: https://www.youtube.com/watch?v=VIDEO_ID
      videoId = searchParams.get('v');
    } else if (hostname.includes('youtu.be')) {
      // Short link: https://youtu.be/VIDEO_ID
      videoId = pathname.substring(1); // Remove the leading '/'
    }

    if (videoId) {
      // Note: autoplay is required for carousels, which also requires mute.
      // loop=1&playlist=VIDEO_ID is the standard way to loop an embedded video.
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0`;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error parsing YouTube URL:', e);
  }
  return embedUrl;
}

/**
 * Creates the decorative side borders with lights.
 * @param {'left' | 'right'} side Which border to create.
 * @returns {HTMLDivElement} The border element with lights.
 */
function createShowbizBorder(side) {
  const border = document.createElement('div');
  border.className = `carousel-border carousel-border-${side}`;
  for (let i = 0; i < 15; i += 1) {
    const light = document.createElement('div');
    light.className = 'carousel-light';
    border.append(light);
  }
  return border;
}

/**
 * Updates the carousel to show a specific slide.
 * @param {HTMLElement} block The carousel block element.
 *Next, try to access the site and provide the token value:
 * @param {number} newIndex The index of the slide to show.
 * @param {number} totalSlides The total number of slides.
 */
function showSlide(block, newIndex, totalSlides) {
  const slider = block.querySelector('.carousel-slider');
  const dots = block.querySelectorAll('.carousel-dot');
  
  const currentIndex = parseInt(block.dataset.currentIndex, 10);

  // Stop any playing YouTube videos in the slide we are leaving
  const currentSlide = slider.children[currentIndex];
  const iframe = currentSlide.querySelector('iframe');
  if (iframe) {
    iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
  }

  // Remove active state from current slide and dot
  slider.children[currentIndex].classList.remove('active');
  dots[currentIndex].classList.remove('active');

  // Calculate the new index, wrapping around
  // eslint-disable-next-line no-param-reassign
  newIndex = (newIndex + totalSlides) % totalSlides;

  // Add active state to new slide and dot
  slider.children[newIndex].classList.add('active');
  dots[newIndex].classList.add('active');
  
  // Autoplay YouTube video in the new active slide
  const newSlide = slider.children[newIndex];
  const newIframe = newSlide.querySelector('iframe');
  if (newIframe) {
    newIframe.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
  }

  slider.style.transform = `translateX(-${newIndex * 100}%)`;
  block.dataset.currentIndex = newIndex;
}

export default async function decorate(block) {
  const slider = document.createElement('div');
  slider.className = 'carousel-slider';

  const slides = [...block.children];
  const totalSlides = slides.length;

  slides.forEach((row, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    const link = row.querySelector('a');
    const text = row.textContent.trim();
    let href = null;
    let isMedia = false; // Flag to check if we handled it as media

    // Check if the cell is JUST a link (authored as a hyperlink)
    if (link && text === link.textContent.trim()) {
      href = link.href;
    } 
    // Check if the cell is JUST text that LOOKS like a URL (authored as plain text)
    else if (!link && (text.startsWith('https://') || text.startsWith('http://'))) {
      href = text;
    } 
    // Check if the cell is JUST text that LOOKS like a relative path
    else if (!link && text.startsWith('/')) {
      href = text;
    }

    if (href) {
      const youtubeEmbedUrl = getYoutubeEmbedUrl(href);

      if (href.endsWith('.mp4')) {
        // --- MP4 Video Slide ---
        slide.classList.add('carousel-slide-video');
        const video = document.createElement('video');
        video.src = href;
        video.playsinline = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.setAttribute('aria-label', 'carousel video slide');
        slide.append(video);
        isMedia = true;

      } else if (youtubeEmbedUrl) {
        // --- YouTube Video Slide ---
        // We add &enablejsapi=1 to control the video
        slide.classList.add('carousel-slide-youtube');
        const iframe = document.createElement('iframe');
        iframe.src = `${youtubeEmbedUrl}&enablejsapi=1`;
        iframe.width = '560';
        iframe.height = '315';
        iframe.title = 'YouTube video player';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowfullscreen = true;
        slide.append(iframe);
        isMedia = true;

      } else if (href.endsWith('.jpeg') || href.endsWith('.jpg') || href.endsWith('.png') || href.endsWith('.svg') || href.endsWith('.webp')) {
        // --- Image path as text Slide ---
        // Create an optimized picture from the text path
        const pic = createOptimizedPicture(href, '', false); // alt text is empty, eager is false
        slide.append(pic);
        isMedia = true;
      }
    }

    // --- Standard Content Slide (e.g., an INSERTED image or text) ---
    if (!isMedia) {
      // This will append the <picture> tag (if image was inserted)
      // OR the plain text if it wasn't a media link.
      slide.append(...row.children);
    }
    
    if (index === 0) {
      slide.classList.add('active');
    }
    slider.append(slide);
  });
  
  // Clear the original authored content
  block.innerHTML = '';
  // Add the slider, borders, and controls
  block.append(createShowbizBorder('left'));
  block.append(slider);
  block.append(createShowbizBorder('right'));

  // Store the current index
  block.dataset.currentIndex = 0;

  // Create and add Navigation Arrows
  const prevArrow = document.createElement('button');
  prevArrow.className = 'carousel-arrow carousel-arrow-prev';
  prevArrow.setAttribute('aria-label', 'Previous Slide');
  prevArrow.addEventListener('click', () => {
    const currentIndex = parseInt(block.dataset.currentIndex, 10);
    showSlide(block, currentIndex - 1, totalSlides);
  });

  const nextArrow = document.createElement('button');
  nextArrow.className = 'carousel-arrow carousel-arrow-next';
  nextArrow.setAttribute('aria-label', 'Next Slide');
  nextArrow.addEventListener('click', () => {
    const currentIndex = parseInt(block.dataset.currentIndex, 10);
    showSlide(block, currentIndex + 1, totalSlides);
  });

  // Create and add Pagination Dots
  const dotsWrapper = document.createElement('div');
  dotsWrapper.className = 'carousel-dots';
  
  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    if (index === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
    
    dot.addEventListener('click', () => {
      showSlide(block, index, totalSlides);
    });
    
    dotsWrapper.append(dot);
  });

  block.append(prevArrow, nextArrow, dotsWrapper);
}