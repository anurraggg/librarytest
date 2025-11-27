// eslint-disable-next-line no-unused-vars
export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div');
  if (rows.length < 5) return;

  // Extract content from rows
  const [imageRow, titleRow, descriptionRow, packSizesRow, nutritionRow] = rows;

  const img = imageRow.querySelector('img') || document.createElement('img');
  if (!img.src) img.src = imageRow.textContent.trim() || 'https://via.placeholder.com/300x400';

  const title = document.createElement('h2');
  title.textContent = titleRow.textContent.replace('title ', '').trim();

  const description = document.createElement('p');
  description.classList.add('description');
  description.textContent =
    descriptionRow.textContent.replace('description ', '').trim() ||
    'Description not provided.';

  const packSizes = document.createElement('p');
  packSizes.classList.add('pack-sizes');

  const sizes = packSizesRow.textContent
    .replace('pack-sizes ', '')
    .trim()
    .split('|');

  /* -----------------------------------------------------------
     ADD GA4 CLICK TRACKING ATTRIBUTES TO PACK SIZE BUTTONS
  ------------------------------------------------------------ */
  packSizes.innerHTML = sizes
    .map(
      (size) => `
      <button
        data-ga-click="pack_size_select"
        data-ga-label="${size.trim()}"
      >
        ${size.trim()}
      </button>
    `
    )
    .join(' ');

  const nutrition = document.createElement('p');
  nutrition.classList.add('nutrition');
  nutrition.textContent =
    nutritionRow.textContent.replace('nutrition ', '').trim() ||
    'Nutrition not provided.';

  // Structure the block
  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('product-details');
  detailsDiv.append(title, description, packSizes, nutrition);

  block.innerHTML = '';
  block.append(img, detailsDiv);

  // Add classes and structure
  block.classList.add('aashirvaad-product-detail');

  // Add interactivity to pack size buttons
  const buttons = packSizes.querySelectorAll('button');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });

  // Set initial active button
  const initialActive = packSizes.querySelector('button:last-child');
  if (initialActive) initialActive.classList.add('active');
}
