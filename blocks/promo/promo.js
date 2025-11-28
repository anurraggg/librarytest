import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const rows = [...block.children];

  // Define the class names for each row in order
  const rowClasses = ['promo-title', 'promo-description-1', 'promo-image', 'promo-description-2'];

  rows.forEach((row, index) => {
    // Add the appropriate class to each row
    if (rowClasses[index]) {
      row.classList.add(rowClasses[index]);
    }

    const cell = row.children[0];
    
    // Check if the cell is empty
    if (cell && !cell.textContent.trim() && !cell.querySelector('picture')) {
      row.classList.add('promo-empty');
    }

    // Handle the image row specifically
    if (rowClasses[index] === 'promo-image') {
      const picture = cell.querySelector('picture');
      if (picture) {
        const img = picture.querySelector('img');
        // Optimize the picture and replace the cell's content
        cell.innerHTML = ''; 
        cell.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
      }
    }
  });
}