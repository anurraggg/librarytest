export default function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  
  // --- THIS IS THE CORRECTED PARSER ---
  const videos = [];
  
  // Start loop at i = 1 (was 2)
  // This skips the header row (rows[0]) and starts on "First Ad" (rows[1])
  for (let i = 1; i < rows.length; i += 1) { 
    const cells = rows[i].querySelectorAll(':scope > div');
    
    if (cells.length >= 2) {
      const title = cells[0].textContent.trim();
      const url = cells[1].textContent.trim();
      const videoId = extractYouTubeId(url);
      
      if (videoId) {
        videos.push({ title, id: videoId });
      } else {
        console.warn(`Invalid YouTube URL in row ${i + 1}: ${url}`);
      }
    }
  }
  // --- END OF PARSER ---

  if (videos.length === 0) {
    console.error('No valid videos found. Check table structure/URLs.');
    return;
  }

  // Render only available videos (dynamic count)
  block.classList.add('video-gallery');

  const mainContainer = document.createElement('div');
  mainContainer.classList.add('main-video');
  const mainIframe = document.createElement('iframe');
  // This will now correctly load videos[0] which is "First Ad"
  mainIframe.src = `https://www.youtube.com/embed/${videos[0].id}?autoplay=0&rel=0`;
  mainIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  mainIframe.allowFullscreen = true;
  mainContainer.appendChild(mainIframe);

  const thumbsContainer = document.createElement('div');
  thumbsContainer.classList.add('thumbnails');

  videos.forEach((video, i) => {
    const thumb = document.createElement('div');
    thumb.classList.add('thumbnail');
    if (i === 0) thumb.classList.add('active'); // Select the first one

    const img = document.createElement('img');
    img.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
    img.alt = video.title;
    img.loading = 'lazy';
    img.onerror = () => { img.src = 'https://via.placeholder.com/300x120?text=No+Thumb'; };

    const overlay = document.createElement('div');
    overlay.classList.add('play-overlay');
    overlay.innerHTML = '▶';

    const titleP = document.createElement('p');
    titleP.textContent = video.title; 

    thumb.append(img, overlay, titleP);
    thumb.addEventListener('click', () => switchVideo(i, mainIframe, videos, thumbsContainer));
    thumbsContainer.appendChild(thumb);
  });

  block.innerHTML = '';
  block.append(mainContainer, thumbsContainer);

  // This is the desktop height fix
  function alignVideoHeight() {
    if (window.innerWidth > 768) {
      // Desktop: Make video height match thumbnail list height
      requestAnimationFrame(() => {
        const thumbsHeight = thumbsContainer.offsetHeight;
        mainIframe.style.height = `${thumbsHeight}px`; 
      });
    } else {
      // Mobile: Remove inline style so CSS (aspect-ratio) takes over
      mainIframe.style.height = '';
    }
  }

  // Run it on load
  alignVideoHeight();
  
  // And run it again if the window is resized
  window.addEventListener('resize', alignVideoHeight);
}

// Helper: Extract YouTube ID from URL
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Switch video function
function switchVideo(index, iframe, videos, thumbsContainer) {
  // Update active thumb
  Array.from(thumbsContainer.children).forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });

  // Update main iframe
  const video = videos[index];
  iframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`;
}