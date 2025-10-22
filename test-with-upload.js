const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Test Suite with File Upload
 * Tests functionality using file upload instead of sample loading
 */

(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎙️  Edward R. Mur-Wren - Upload Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  let testsPassed = 0;
  let testsFailed = 0;

  function logTest(name, passed, details = '') {
    if (passed) {
      console.log(`  ✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`  ❌ ${name}`);
      if (details) console.log(`     ${details}`);
      testsFailed++;
    }
  }

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('DevTools')) {
      console.log(`    [Browser Log] ${text}`);
    }
  });
  page.on('pageerror', error => console.log(`    [Error] ${error.message}`));

  const indexPath = `file://${path.join(__dirname, 'index.html')}`;
  await page.goto(indexPath, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check sample.mp3 exists
  const samplePath = path.join(__dirname, 'sample.mp3');
  const sampleExists = fs.existsSync(samplePath);

  if (!sampleExists) {
    console.log('⚠️  sample.mp3 not found - cannot run upload tests');
    await browser.close();
    process.exit(1);
  }

  console.log('📁 Test: File Upload');
  logTest('Sample file exists', sampleExists);

  // Upload the sample file
  console.log('  🔄 Uploading sample.mp3...');
  const fileInput = await page.$('#file');
  await fileInput.uploadFile(samplePath);
  await new Promise(resolve => setTimeout(resolve, 2000));

  const afterUpload = await page.evaluate(() => {
    return {
      previewEnabled: !document.getElementById('previewBtn').disabled,
      renderEnabled: !document.getElementById('renderBtn').disabled
    };
  });

  logTest('Preview button enabled after upload', afterUpload.previewEnabled);
  logTest('Render button enabled after upload', afterUpload.renderEnabled);

  if (!afterUpload.previewEnabled) {
    console.log('\n❌ Upload failed - cannot continue with playback tests');
    await browser.close();
    process.exit(1);
  }

  console.log('\n▶️  Test: Preview Playback');

  // Select newsroom preset
  await page.select('#preset', 'newsroom');
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('  🔄 Starting preview...');
  await page.click('#previewBtn');
  await new Promise(resolve => setTimeout(resolve, 1500));

  const duringPreview = await page.evaluate(() => {
    return {
      stopEnabled: !document.getElementById('stopBtn').disabled
    };
  });

  logTest('Stop button enabled during preview', duringPreview.stopEnabled);

  if (duringPreview.stopEnabled) {
    console.log('  🛑 Stopping preview...');
    await page.click('#stopBtn');
    await new Promise(resolve => setTimeout(resolve, 500));

    const afterStop = await page.evaluate(() => {
      return {
        stopDisabled: document.getElementById('stopBtn').disabled
      };
    });

    logTest('Stop button disabled after stopping', afterStop.stopDisabled);
  }

  console.log('\n🎬 Test: WAV Rendering');

  // Test each preset rendering
  const presetsToTest = ['newsroom', 'oldtv', 'oldtv_hiss'];

  for (const presetName of presetsToTest) {
    console.log(`  🔄 Rendering "${presetName}" preset...`);
    await page.select('#preset', presetName);
    await new Promise(resolve => setTimeout(resolve, 300));

    await page.click('#renderBtn');

    try {
      await page.waitForFunction(() => {
        const link = document.getElementById('dl');
        return link.textContent === 'Download WAV';
      }, { timeout: 15000 });

      const downloadInfo = await page.evaluate(() => {
        const link = document.getElementById('dl');
        return {
          text: link.textContent,
          hasHref: link.href.startsWith('blob:'),
          downloadAttr: link.download
        };
      });

      logTest(`"${presetName}" rendered successfully`,
        downloadInfo.text === 'Download WAV' && downloadInfo.hasHref);

      if (downloadInfo.downloadAttr) {
        console.log(`    Download filename: ${downloadInfo.downloadAttr}`);
      }
    } catch (error) {
      logTest(`"${presetName}" rendered successfully`, false, 'Timeout or error during rendering');
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n🎛️  Test: All Presets with Custom Parameters');

  // Test manual parameter adjustment
  await page.select('#preset', 'raw');
  await new Promise(resolve => setTimeout(resolve, 300));

  // Adjust parameters manually
  await page.evaluate(() => {
    document.getElementById('hp').value = 200;
    document.getElementById('hp').dispatchEvent(new Event('input', { bubbles: true }));

    document.getElementById('lp').value = 4000;
    document.getElementById('lp').dispatchEvent(new Event('input', { bubbles: true }));

    document.getElementById('delayMs').value = 100;
    document.getElementById('delayMs').dispatchEvent(new Event('input', { bubbles: true }));

    document.getElementById('wet').value = 0.4;
    document.getElementById('wet').dispatchEvent(new Event('input', { bubbles: true }));

    document.getElementById('fb').value = 0.2;
    document.getElementById('fb').dispatchEvent(new Event('input', { bubbles: true }));
  });

  await new Promise(resolve => setTimeout(resolve, 300));

  const customParams = await page.evaluate(() => {
    return {
      hp: document.getElementById('hpLabel').textContent,
      lp: document.getElementById('lpLabel').textContent,
      delay: document.getElementById('delayLabel').textContent,
      wet: document.getElementById('wetLabel').textContent,
      fb: document.getElementById('fbLabel').textContent
    };
  });

  logTest('Custom HP parameter updates label', customParams.hp === '200');
  logTest('Custom LP parameter updates label', customParams.lp === '4000');
  logTest('Custom delay parameter updates label', customParams.delay === '100');
  logTest('Custom wet parameter updates label', customParams.wet === '0.4');
  logTest('Custom feedback parameter updates label', customParams.fb === '0.2');

  // Test preview with custom parameters
  console.log('  🔄 Testing preview with custom parameters...');
  await page.click('#previewBtn');
  await new Promise(resolve => setTimeout(resolve, 1000));

  const customPreviewWorks = await page.evaluate(() => {
    return !document.getElementById('stopBtn').disabled;
  });

  logTest('Preview works with custom parameters', customPreviewWorks);

  if (customPreviewWorks) {
    await page.click('#stopBtn');
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Final screenshot
  await page.screenshot({ path: 'test-upload-complete.png', fullPage: true });
  console.log('\n  📸 Final screenshot saved to test-upload-complete.png');

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);
  console.log(`🎯 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Browser will close in 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
  console.log('\n👋 Test complete!\n');

  process.exit(testsFailed > 0 ? 1 : 0);
})();
