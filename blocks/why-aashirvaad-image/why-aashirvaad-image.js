// eslint-disable-next-line no-unused-vars
export default async function decorate(block) {
    const rows = block.querySelectorAll(':scope > div');
    if (rows.length < 1) return;
  
    // Extract image from the first row
    const [imageRow] = rows;
    const img = imageRow.querySelector('img') || document.createElement('img');
    if (!img.src) {
      const imagePath = imageRow.textContent.trim().replace(/image\s+/, '');
      img.src = imagePath.startsWith('/') ? imagePath : `/icons/${imagePath}` || 'https://via.placeholder.com/800x400';
    }
  
    // Structure the block
    block.innerHTML = '';
    block.append(img);
  
    // Add classes and structure
    block.classList.add('why-aashirvaad-image');
  }