// banner.js
import { createOptimizedPicture } from '../../scripts/aem.js'; // From AEM boilerplate

/**
 * Decorates the banner block: Parses image URL and text, auto-detects order for flexibility.
 * @param {Element} block The banner block element
 */
export default async function decorate(block) {
  // Get rows: Prioritize table cells, fallback to children
  let rows = block.querySelectorAll('div > div'); // Table rows
  if (rows.length === 0) {
    rows = Array.from(block.children).filter(child => 
      child.tagName === 'P' || child.tagName === 'DIV' || child.tagName === 'H1' || child.tagName === 'H2'
    ); // Paragraphs/headings
  }

  const rowArray = Array.from(rows); // Convert to Array

  if (rowArray.length === 0) {
    block.dataset.blockStatus = 'loaded';
    return;
  }

  let imageUrl = '';
  let textHTML = ''; // Full innerHTML from best text row

  // Normalize paths: Replace backslashes with forward slashes
  const normalizePath = (path) => path.replace(/\\/g, '/').trim();

  // Broader URL detection: Contains path + image ext (e.g., /icons/file.png or icons/file.png)
  const urlPattern = /\/?.*\.(png|jpg|jpeg|gif|svg|webp)$/i; // Matches /icons/... or icons/...

  // Find URL row (first match)
  let urlRowIndex = -1;
  for (let i = 0; i < rowArray.length; i++) {
    const candidate = normalizePath(rowArray[i].textContent);
    if (urlPattern.test(candidate)) {
      urlRowIndex = i;
      break; // Take first match
    }
  }
  
  if (urlRowIndex !== -1) {
    imageUrl = normalizePath(rowArray[urlRowIndex].textContent);
    console.log('Banner URL detected:', imageUrl, 'at index', urlRowIndex); // Temp log
  }

  // Find best text: First/largest non-URL row with content (no Set dup, direct innerHTML)
  let bestTextRow = null;
  let maxLength = 0;
  rowArray.forEach((row, i) => {
    if (i !== urlRowIndex && row.textContent.trim().length > maxLength) {
      maxLength = row.textContent.trim().length;
      bestTextRow = row;
    }
  });

  if (bestTextRow) {
    textHTML = bestTextRow.innerHTML; // Full rich HTML (bold, etc.)
    console.log('Banner text selected from row', rowArray.indexOf(bestTextRow), 'length:', maxLength); // Temp log
  }

  // Create image if URL valid (prepend first)
  if (imageUrl) {
    try {
      const alt = block.dataset.alt || (textHTML ? `Banner image for ${bestTextRow.textContent.trim().substring(0, 50)}...` : 'Banner image');
      const picture = createOptimizedPicture(imageUrl, alt, true); // Eager load
      block.prepend(picture);
    } catch (error) {
      console.error('Banner: Failed to create image:', error, imageUrl);
    }
  }

  // Append single text div (only if valid text, no path)
  if (textHTML && textHTML.trim() && !urlPattern.test(textHTML)) { // Double-check no path in HTML
    const textDiv = document.createElement('div');
    textDiv.classList.add('banner-text');
    textDiv.innerHTML = textHTML;
    block.appendChild(textDiv);
  }

  // Remove originals only if we added new content
  if (imageUrl || textHTML) {
    rowArray.forEach(row => {
      if (row.parentNode) row.remove();
    });
  }

  block.dataset.blockStatus = 'loaded';
}