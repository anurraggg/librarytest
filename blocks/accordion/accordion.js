// accordion.js
// eslint-disable-next-line no-unused-vars
export default async function decorate(block) {
    const KEYCODES = {
      ENTER: 13,
      SPACE: 32,
      END: 35,
      HOME: 36,
      ARROW_LEFT: 37,
      ARROW_UP: 38,
      ARROW_RIGHT: 39,
      ARROW_DOWN: 40,
    };
  
    const SELECTORS = {
      self: block,
      row: 'div > div',
      cell: 'div > div > div',
    };
  
    // Check for single expansion option
    const singleExpansion = block.hasAttribute('data-single-expansion');
  
    // Build accordion items from table rows
    const rows = block.querySelectorAll(SELECTORS.row);
    const items = [];
    rows.forEach((row, index) => {
      const cells = row.querySelectorAll(SELECTORS.cell);
      if (cells.length >= 2) {
        const question = cells[0].innerHTML.trim();
        const answer = cells[1].innerHTML.trim();
  
        if (question && answer) {
          const item = document.createElement('div');
          item.classList.add('accordion-item');
          item.setAttribute('data-cmp-hook-accordion', 'item');
          item.setAttribute('tabindex', '0');
          item.innerHTML = `
            <button class="accordion-button" data-cmp-hook-accordion="button" aria-expanded="false" aria-controls="panel-${index}">
              <span>${question}</span>
            </button>
            <div id="panel-${index}" class="accordion-panel hidden" data-cmp-hook-accordion="panel" aria-labelledby="button-${index}" aria-hidden="true">
              <div>${answer}</div>
            </div>
          `;
          const button = item.querySelector('[data-cmp-hook-accordion="button"]');
          button.id = `button-${index}`;
          items.push(item);
          block.appendChild(item);
        }
      }
    });
  
    // Remove original table structure
    rows.forEach((row) => row.remove());
  
    // Initialize accordion if items exist
    if (items.length === 0) {
      console.warn('No valid accordion items found.');
      return;
    }
  
    const elements = {
      self: block,
      item: Array.from(block.querySelectorAll('[data-cmp-hook-accordion="item"]')),
      button: Array.from(block.querySelectorAll('[data-cmp-hook-accordion="button"]')),
      panel: Array.from(block.querySelectorAll('[data-cmp-hook-accordion="panel"]')),
    };
  
    // Bind events
    elements.button.forEach((btn, i) => {
      btn.addEventListener('click', () => toggle(i));
      btn.addEventListener('keydown', (e) => handleKey(e, i));
    });
  
    function toggle(index) {
      const item = elements.item[index];
      const expanded = item.hasAttribute('data-cmp-expanded');
  
      if (singleExpansion) {
        elements.item.forEach((i) => i.removeAttribute('data-cmp-expanded'));
      }
  
      if (expanded) {
        item.removeAttribute('data-cmp-expanded');
        updateUI(index, false);
      } else {
        item.setAttribute('data-cmp-expanded', '');
        updateUI(index, true);
      }
    }
  
    function updateUI(index, expanded) {
      const btn = elements.button[index];
      const panel = elements.panel[index];
  
      btn.setAttribute('aria-expanded', expanded);
      panel.setAttribute('aria-hidden', !expanded);
  
      if (expanded) {
        panel.classList.add('expanded');
        panel.classList.remove('hidden');
        // Dynamically set max-height for smooth transition
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      } else {
        panel.style.maxHeight = '0';
        panel.classList.remove('expanded');
        panel.classList.add('hidden');
      }
    }
  
    function handleKey(e, index) {
      const total = elements.button.length - 1;
      e.preventDefault();
      switch (e.keyCode) {
        case KEYCODES.ARROW_LEFT:
        case KEYCODES.ARROW_UP:
          elements.button[Math.max(0, index - 1)].focus();
          break;
        case KEYCODES.ARROW_RIGHT:
        case KEYCODES.ARROW_DOWN:
          elements.button[Math.min(total, index + 1)].focus();
          break;
        case KEYCODES.HOME:
          elements.button[0].focus();
          break;
        case KEYCODES.END:
          elements.button[total].focus();
          break;
        case KEYCODES.ENTER:
        case KEYCODES.SPACE:
          toggle(index);
          break;
        default:
          return;
      }
    }
  
    // Expose for potential external control
    block.accordion = { toggle };
  }