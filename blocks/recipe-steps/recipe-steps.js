import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Get all rows except the first one (which is the block name)
  const rows = [...block.children].slice(1);
  const stepsWrapper = document.createElement('div');
  stepsWrapper.classList.add('recipe-steps-wrapper');
  
  rows.forEach((row, i) => {
    // 1. Create the main wrapper for the step
    const step = document.createElement('div');
    step.classList.add('recipe-step-item');

    // 2. Automatically hide steps after the 3rd one
    if (i >= 3) {
      step.classList.add('is-hidden');
    }

    // 3. Create the Image column
    const imageCell = row.children[0];
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('recipe-step-image');
    const picture = imageCell.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      imageWrapper.append(createOptimizedPicture(img.src, img.alt, i < 3, [{ width: '400' }]));
    }

    // 4. Create the Content column
    const contentCell = row.children[1];
    const timeCell = row.children[2];
    const contentWrapper = document.createElement('div');
    contentWrapper.classList.add('recipe-step-content');

    // 4a. Add the "STEP X" title
    const title = document.createElement('h3');
    title.classList.add('recipe-step-title');
    title.textContent = `STEP ${i + 1}`;

    // 4b. Add the description
    const description = document.createElement('p');
    description.classList.add('recipe-step-description');
    description.textContent = contentCell.textContent;

    // 4c. Add the time
    const time = document.createElement('span');
    time.classList.add('recipe-step-time');
    time.textContent = timeCell.textContent;

    contentWrapper.append(title, description, time);
    
    // 5. Assemble the step
    step.append(imageWrapper, contentWrapper);
    stepsWrapper.append(step);
  });

  // 6. Add the "Read More" button if there are more than 3 steps
  if (rows.length > 3) {
    const button = document.createElement('button');
    button.classList.add('recipe-steps-button');
    button.textContent = 'Read More';
    button.addEventListener('click', () => {
      // Find all hidden steps and show them
      stepsWrapper.querySelectorAll('.is-hidden').forEach((hiddenStep) => {
        hiddenStep.classList.remove('is-hidden');
      });
      // Remove the button itself
      button.remove();
    });
    stepsWrapper.append(button);
  }

  // Clean up the original table and add the new list
  block.textContent = '';
  block.append(stepsWrapper);
}