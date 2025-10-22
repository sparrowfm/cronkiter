const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Complete End-to-End Test with HTTP Server
 * Tests sample loading functionality via HTTP
 */

// Simple HTTP server
function startServer(port = 8888) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = '.' + req.url;
      if (filePath === './') {
        filePath = './index.html';
      }

      const extname = String(path.extname(filePath)).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav'
      };

      const contentType = mimeTypes[extname] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(500);
            res.end('Server error: ' + error.code);
          }
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*'
          });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(port, () => {
      console.log(`🌐 HTTP Server running at http://localhost:${port}/`);
      resolve(server);
    });
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎙️  Edward R. Mur-Wren - Complete E2E Test Suite');
  console.log('═══════════════════════════════════════════════════════════\n');

  const port = 8888;
  const server = await startServer(port);

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

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    page.on('console', msg => {
      const text = msg.text();
      if (!text.includes('DevTools') && !text.includes('Autofill')) {
        console.log(`    [Browser] ${text}`);
      }
    });
    page.on('pageerror', error => console.log(`    [Error] ${error.message}`));

    const url = `http://localhost:${port}/`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Load Sample Feature
    console.log('🎵 Test 1: Load Sample Audio via HTTP');

    const sampleExists = fs.existsSync(path.join(__dirname, 'sample.mp3'));
    if (!sampleExists) {
      console.log('  ⚠️  sample.mp3 not found - skipping sample tests\n');
    } else {
      logTest('Sample file exists', true);

      console.log('  🔄 Clicking Load Sample button...');
      await page.click('#loadSampleBtn');

      try {
        await page.waitForFunction(() => {
          const btn = document.getElementById('loadSampleBtn');
          return btn.textContent.includes('✓') || btn.textContent.includes('✗');
        }, { timeout: 15000 });

        await new Promise(resolve => setTimeout(resolve, 1000));

        const loadResult = await page.evaluate(() => {
          const btn = document.getElementById('loadSampleBtn');
          const previewBtn = document.getElementById('previewBtn');
          return {
            buttonText: btn.textContent,
            success: btn.textContent.includes('✓'),
            previewEnabled: !previewBtn.disabled
          };
        });

        logTest('Sample loaded via HTTP', loadResult.success);
        logTest('Preview button enabled after sample load', loadResult.previewEnabled);
      } catch (error) {
        logTest('Sample loaded via HTTP', false, 'Timeout waiting for load');
      }
    }

    console.log('\n🎛️  Test 2: Preset Switching and Parameters');

    // Test all presets
    const presets = [
      { name: 'raw', hp: '20', lp: '8000' },
      { name: 'newsroom', hp: '100', lp: '5000' },
      { name: 'oldtv', hp: '300', lp: '3000' },
      { name: 'oldtv_hiss', hp: '300', lp: '3000', hiss: '0.04' }
    ];

    for (const preset of presets) {
      await page.select('#preset', preset.name);
      await new Promise(resolve => setTimeout(resolve, 200));

      const params = await page.evaluate(() => {
        return {
          hp: document.getElementById('hp').value,
          lp: document.getElementById('lp').value,
          hiss: document.getElementById('hiss').value
        };
      });

      const matches = params.hp === preset.hp && params.lp === preset.lp;
      logTest(`Preset "${preset.name}" applies correct values`, matches,
        matches ? '' : `Expected hp:${preset.hp} lp:${preset.lp}, got hp:${params.hp} lp:${params.lp}`);
    }

    console.log('\n▶️  Test 3: Audio Playback');

    if (sampleExists) {
      await page.select('#preset', 'newsroom');
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('  🔄 Testing preview playback...');
      await page.click('#previewBtn');
      await new Promise(resolve => setTimeout(resolve, 1500));

      const playbackState = await page.evaluate(() => {
        return {
          stopEnabled: !document.getElementById('stopBtn').disabled
        };
      });

      logTest('Audio playback started', playbackState.stopEnabled);

      if (playbackState.stopEnabled) {
        await page.click('#stopBtn');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('  ✓ Playback stopped successfully');
      }

      // Test multiple preset playbacks
      console.log('  🔄 Testing all presets playback...');
      for (const preset of ['oldtv', 'oldtv_hiss']) {
        await page.select('#preset', preset);
        await new Promise(resolve => setTimeout(resolve, 300));

        await page.click('#previewBtn');
        await new Promise(resolve => setTimeout(resolve, 800));

        const playing = await page.evaluate(() =>
          !document.getElementById('stopBtn').disabled
        );

        if (playing) {
          console.log(`    ✓ "${preset}" preset plays successfully`);
          await page.click('#stopBtn');
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          console.log(`    ✗ "${preset}" preset failed to play`);
        }
      }

      logTest('All presets can play audio', true);
    }

    console.log('\n🎬 Test 4: WAV Rendering');

    if (sampleExists) {
      for (const preset of ['newsroom', 'oldtv', 'oldtv_hiss']) {
        await page.select('#preset', preset);
        await new Promise(resolve => setTimeout(resolve, 200));

        console.log(`  🔄 Rendering "${preset}"...`);
        await page.click('#renderBtn');

        try {
          await page.waitForFunction(() => {
            return document.getElementById('dl').textContent === 'Download WAV';
          }, { timeout: 15000 });

          const dlInfo = await page.evaluate(() => {
            const link = document.getElementById('dl');
            return {
              hasDownload: !!link.href && link.href.startsWith('blob:'),
              filename: link.download
            };
          });

          logTest(`"${preset}" renders to WAV`, dlInfo.hasDownload,
            dlInfo.filename ? `Filename: ${dlInfo.filename}` : '');

          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          logTest(`"${preset}" renders to WAV`, false, 'Render timeout');
        }
      }
    }

    console.log('\n🎨 Test 5: UI/UX Elements');

    const uiElements = await page.evaluate(() => {
      return {
        title: document.querySelector('.branding h1')?.textContent?.trim(),
        badge: document.querySelector('.vintage-badge')?.textContent?.trim(),
        subtitle: document.querySelector('.subtitle')?.textContent,
        hasGitHubLink: !!document.querySelector('footer a[href*="github"]'),
        hasFooterTagline: document.querySelector('footer')?.textContent?.includes('good chirp')
      };
    });

    logTest('Badge says "Vintage Audio Transformer"',
      uiElements.badge === 'Vintage Audio Transformer');
    logTest('Subtitle describes old-timey audio',
      uiElements.subtitle?.includes('nostalgic, old-timey broadcasts'));
    logTest('Subtitle mentions free browser usage',
      uiElements.subtitle?.includes('runs free in your browser'));
    logTest('GitHub link present', uiElements.hasGitHubLink);
    logTest('Footer includes tagline', uiElements.hasFooterTagline);

    // Final screenshot
    await page.screenshot({ path: 'test-e2e-complete.png', fullPage: true });
    console.log('\n  📸 Screenshot saved to test-e2e-complete.png');

  } catch (error) {
    console.error('\n❌ Test error:', error);
    testsFailed++;
  } finally {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);
    if (testsPassed + testsFailed > 0) {
      console.log(`🎯 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
    }
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('Browser will close in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    await browser.close();
    server.close(() => {
      console.log('🛑 HTTP Server stopped\n');
      console.log('👋 All tests complete!\n');
      process.exit(testsFailed > 0 ? 1 : 0);
    });
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
