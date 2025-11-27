export default function decorate(block) {
    block.classList.add('category-grid');
  
    const rows = [...block.children];
    if (rows.length === 0) return;
  
    // --- Detect Title (row with text but no image) ---
    let titleText = '';
    const firstRow = rows[0];
    const maybeImg = firstRow.querySelector('img');
    const maybeText = firstRow.textContent.trim();
  
    if (maybeText && !maybeImg) {
      titleText = maybeText;
      firstRow.remove(); // safely remove title row from grid
    }
  
    // --- Build Wrapper ---
    const wrapper = document.createElement('div');
    wrapper.className = 'category-grid__wrapper';
  
    // --- Loop through Remaining Rows ---
    [...block.children].forEach((row) => {
      const img = row.querySelector('img');
      const nameEl = [...row.querySelectorAll('div, p')]
        .find((el) => el !== img?.parentElement && el.textContent.trim());
      const name = nameEl ? nameEl.textContent.trim() : '';
      const imgSrc = img ? img.src : '';
  
      // Skip invalid rows
      if (!imgSrc && !name) return;
  
      const item = document.createElement('div');
      item.className = 'category-grid__item';
  
      const imgWrap = document.createElement('div');
      imgWrap.className = 'category-grid__image-wrap';
      if (imgSrc) {
        const image = document.createElement('img');
        image.src = imgSrc;
        image.alt = name;
        image.loading = 'lazy';
        imgWrap.appendChild(image);
      }
  
      const label = document.createElement('p');
      label.className = 'category-grid__label';
      label.textContent = name;
  
      item.append(imgWrap, label);
      wrapper.appendChild(item);
    });
  
    // --- Clear & Rebuild Block ---
    block.innerHTML = '';
  
    if (titleText) {
      const title = document.createElement('h2');
      title.className = 'category-grid__title';
      title.textContent = titleText;
      block.appendChild(title);
    }
  
    block.appendChild(wrapper);
  }
  