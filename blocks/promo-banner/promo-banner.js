export default function decorate(block) {
    block.classList.add('promo-banner');
  
    // Collect all child divs (Google Doc → EDS flattens to <div>)
    const divs = [...block.querySelectorAll(':scope > div')];
  
    if (divs.length === 0) return;
  
    // Extract background image (first image found)
    const bgImg = block.querySelector('img');
    const bgImgSrc = bgImg ? bgImg.src : '';
  
    // Extract content fields
    const textFields = divs.map((d) => d.innerText.trim()).filter((t) => t);
  
    const title = textFields[0] || '';
    const description = textFields[1] || '';
    const buttonText = textFields[2] || '';
    const buttonLink = textFields[3] || '#';
  
    // --- Build Banner ---
    const wrapper = document.createElement('div');
    wrapper.className = 'promo-banner__wrapper';
    if (bgImgSrc) wrapper.style.backgroundImage = `url('${bgImgSrc}')`;
  
    const overlay = document.createElement('div');
    overlay.className = 'promo-banner__overlay';
  
    const content = document.createElement('div');
    content.className = 'promo-banner__content';
  
    if (title) {
      const h2 = document.createElement('h2');
      h2.textContent = title;
      content.appendChild(h2);
    }
  
    if (description) {
      const p = document.createElement('p');
      p.textContent = description;
      content.appendChild(p);
    }
  
    if (buttonText) {
      const a = document.createElement('a');
      a.textContent = buttonText;
      a.href = buttonLink;
      a.className = 'promo-banner__btn';
      content.appendChild(a);
    }
  
    overlay.appendChild(content);
    wrapper.appendChild(overlay);
  
    // Clear original block content and insert new markup
    block.innerHTML = '';
    block.appendChild(wrapper);
  }
  