const puppeteer = require('puppeteer');
const path = require('path');

/**
 * Generate Open Graph social media image (1200x630)
 * This creates a screenshot of the app for social sharing
 */

(async () => {
  console.log('📸 Creating Open Graph image for social media...\n');

  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();

  // Set viewport to 1200x630 for perfect OG image
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 2 // Retina quality
  });

  const indexPath = `file://${path.join(__dirname, 'index.html')}`;
  await page.goto(indexPath, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Inject some styling to make it look better at this size
  await page.evaluate(() => {
    // Hide mobile message, ensure main content shows
    const mobile = document.querySelector('.mobile-message');
    if (mobile) mobile.style.display = 'none';

    const main = document.querySelector('.main-content');
    if (main) main.style.display = 'block';

    // Adjust container for better framing
    const container = document.querySelector('.container');
    if (container) {
      container.style.padding = '30px';
      container.style.maxWidth = '1200px';
    }

    // Make title more prominent
    const h1 = document.querySelector('.branding h1');
    if (h1) {
      h1.style.fontSize = '2.2em';
      h1.textContent = 'Cronkiter';
    }

    // Hide footer for cleaner look
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';

    // Compact the form a bit
    const fieldsets = document.querySelectorAll('fieldset');
    fieldsets.forEach(fs => {
      fs.style.marginBottom = '15px';
      fs.style.padding = '15px';
    });

    const controls = document.querySelector('.controls');
    if (controls) controls.style.marginTop = '15px';
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // Take screenshot
  await page.screenshot({
    path: 'og-image.png',
    type: 'png'
  });

  console.log('✅ og-image.png created successfully!');
  console.log('   Size: 1200x630px');
  console.log('   Location: ./og-image.png');
  console.log('\n📤 This image is optimized for:');
  console.log('   - Facebook');
  console.log('   - LinkedIn');
  console.log('   - Twitter');
  console.log('   - WhatsApp');
  console.log('   - Discord');
  console.log('   - Slack\n');

  await browser.close();
})();
