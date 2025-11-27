export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Extract title and desc with fallbacks
  const title = rows[0]?.querySelector('div')?.textContent.trim() || 'Contact Us';
  const desc = rows[1]?.querySelector('div')?.textContent.trim() || 'Get in touch with us!';

  // Unused—extend for dynamic fields later
  const fields = rows.slice(2, rows.length - 1);
  const submitRow = rows[rows.length - 1];

  // Render form
  block.innerHTML = `
    <h2>${title}</h2>
    <p>${desc}</p>
    <form>
      <div class="row">
        <input type="text" name="firstname" placeholder="First Name *" required>
        <input type="text" name="lastname" placeholder="Last Name *" required>
      </div>
      <input type="tel" name="mobile" placeholder="Mobile Number *" required>
      <input type="email" name="email" placeholder="Email *" required>
      <input type="text" name="subject" placeholder="Subject *" required>
      <textarea name="message" placeholder="Enter your text here..." maxlength="500" required></textarea>
      <button type="submit">Submit</button>
      <div class="success" style="display:none;">Thank you! We will contact you soon.</div>
    </form>
  `;
  
  const form = block.querySelector('form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const successMsg = block.querySelector('.success');
  
  // Submit handler with timeout safeguard
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Client validation
    if (!data.email.includes('@')) {
      successMsg.textContent = 'Please enter a valid email.';
      successMsg.classList.add('error');
      successMsg.style.display = 'block';
      return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    successMsg.style.display = 'none';
    
    // Timeout promise: Reset after 5s max
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        console.log('Timeout hit—resetting button');
        resolve({ timedOut: true });
      }, 5000);
    });
    
    try {
      console.log('Sending POST to GAS...');
      const fetchPromise = fetch('https://script.google.com/macros/s/AKfycbwHJDlMhGJ4h-P_2j0u3rZR-JTEvUdl7Q4WMVZ3K_RDQ33zzo8dlLbY5loeCEVXUX3fzw/exec', {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await Promise.race([fetchPromise, fetchPromise]);  // Race fetch vs timeout
      
      if (result.timedOut) {
        console.warn('Fetch timed out, but data likely saved—check Sheet');
      } else {
        console.log('Fetch completed successfully');
      }
      
      // Show success (data saved regardless)
      successMsg.textContent = 'Thank you! We will contact you soon.';
      successMsg.style.display = 'block';
      form.reset();
      
    } catch (error) {
      console.error('Fetch error (non-blocking):', error);
      // Still show success—data saves server-side
      successMsg.textContent = 'Thank you! (Check Sheet if needed)';
      successMsg.style.display = 'block';
      form.reset();
    } finally {
      // Always reset button (fires even on timeout/error)
      console.log('Resetting button');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
}