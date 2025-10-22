const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Comprehensive Test Suite for Edward R. Mur-Wren
 * Tests all functionality including:
 * - UI rendering (desktop and mobile)
 * - File upload and sample loading
 * - All audio presets
 * - Parameter controls
 * - Preview playback
 * - WAV rendering
 * - Visual design elements
 */

(async () => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎙️  Edward R. Mur-Wren - Comprehensive Test Suite');
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
  const testResults = [];

  function logTest(name, passed, details = '') {
    if (passed) {
      console.log(`  ✅ ${name}`);
      testsPassed++;
      testResults.push({ name, passed: true, details });
    } else {
      console.log(`  ❌ ${name}`);
      if (details) console.log(`     ${details}`);
      testsFailed++;
      testResults.push({ name, passed: false, details });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // TEST 1: Desktop Layout and Branding
  // ═══════════════════════════════════════════════════════════
  console.log('📱 Test 1: Desktop Layout and Branding');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1920, height: 1080 });

  // Enable console logging for debugging
  desktopPage.on('console', msg => {
    const text = msg.text();
    if (!text.includes('DevTools')) {
      console.log(`    [Browser Log] ${text}`);
    }
  });
  desktopPage.on('pageerror', error => console.log(`    [Error] ${error.message}`));

  const indexPath = `file://${path.join(__dirname, 'index.html')}`;
  await desktopPage.goto(indexPath, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check main content is visible (not mobile message)
  const mainContentVisible = await desktopPage.evaluate(() => {
    const mainContent = document.querySelector('.main-content');
    const mobileMessage = document.querySelector('.mobile-message');
    return window.getComputedStyle(mainContent).display !== 'none' &&
           window.getComputedStyle(mobileMessage).display === 'none';
  });
  logTest('Main content visible on desktop', mainContentVisible);

  // Check branding elements
  const branding = await desktopPage.evaluate(() => {
    const h1 = document.querySelector('.branding h1');
    const tagline = document.querySelector('.tagline');
    const badge = document.querySelector('.vintage-badge');
    return {
      title: h1?.textContent?.trim(),
      tagline: tagline?.textContent?.trim(),
      badge: badge?.textContent?.trim()
    };
  });

  logTest('Title is "Edward R. Mur-Wren"',
    branding.title === 'Edward R. Mur-Wren',
    `Got: "${branding.title}"`);

  logTest('Tagline is correct',
    branding.tagline === '"Good night, and good chirp."',
    `Got: "${branding.tagline}"`);

  logTest('Badge says "Vintage Audio Transformer"',
    branding.badge === 'Vintage Audio Transformer',
    `Got: "${branding.badge}"`);

  // Check subtitle mentions the new description
  const subtitle = await desktopPage.evaluate(() => {
    return document.querySelector('.subtitle')?.textContent;
  });
  logTest('Subtitle mentions "nostalgic, old-timey broadcasts"',
    subtitle?.includes('nostalgic, old-timey broadcasts'),
    `Subtitle: "${subtitle}"`);
  logTest('Subtitle mentions "runs free in your browser"',
    subtitle?.includes('runs free in your browser'));

  await desktopPage.screenshot({ path: 'test-desktop-full.png', fullPage: true });
  console.log('  📸 Desktop screenshot saved to test-desktop-full.png\n');

  // ═══════════════════════════════════════════════════════════
  // TEST 2: Mobile Responsiveness
  // ═══════════════════════════════════════════════════════════
  console.log('📱 Test 2: Mobile Responsiveness');
  const mobilePage = await browser.newPage();
  await mobilePage.setViewport({ width: 375, height: 667 });
  await mobilePage.goto(indexPath, { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mobileView = await mobilePage.evaluate(() => {
    const mainContent = document.querySelector('.main-content');
    const mobileMessage = document.querySelector('.mobile-message');
    return {
      mobileMessageVisible: window.getComputedStyle(mobileMessage).display !== 'none',
      mainContentHidden: window.getComputedStyle(mainContent).display === 'none'
    };
  });

  logTest('Mobile message visible on small screens', mobileView.mobileMessageVisible);
  logTest('Main content hidden on mobile', mobileView.mainContentHidden);

  const mobileText = await mobilePage.evaluate(() => {
    const h2 = document.querySelector('.mobile-message h2');
    const paragraphs = Array.from(document.querySelectorAll('.mobile-message p'))
      .map(p => p.textContent);
    return {
      heading: h2?.textContent,
      text: paragraphs.join(' ')
    };
  });

  logTest('Mobile message mentions "vintage audio transformer"',
    mobileText.text?.toLowerCase().includes('vintage audio transformer'));

  await mobilePage.screenshot({ path: 'test-mobile-full.png', fullPage: true });
  console.log('  📸 Mobile screenshot saved to test-mobile-full.png\n');
  await mobilePage.close();

  // ═══════════════════════════════════════════════════════════
  // TEST 3: UI Controls Present
  // ═══════════════════════════════════════════════════════════
  console.log('🎛️  Test 3: UI Controls and Elements');
  const controls = await desktopPage.evaluate(() => {
    return {
      fileInput: !!document.getElementById('file'),
      loadSampleBtn: !!document.getElementById('loadSampleBtn'),
      presetSelect: !!document.getElementById('preset'),
      delaySlider: !!document.getElementById('delayMs'),
      wetSlider: !!document.getElementById('wet'),
      fbSlider: !!document.getElementById('fb'),
      hpSlider: !!document.getElementById('hp'),
      lpSlider: !!document.getElementById('lp'),
      hissSlider: !!document.getElementById('hiss'),
      previewBtn: !!document.getElementById('previewBtn'),
      stopBtn: !!document.getElementById('stopBtn'),
      renderBtn: !!document.getElementById('renderBtn'),
      downloadLink: !!document.getElementById('dl'),
      presetOptions: Array.from(document.querySelectorAll('#preset option')).map(o => o.value)
    };
  });

  logTest('File input present', controls.fileInput);
  logTest('Load Sample button present', controls.loadSampleBtn);
  logTest('Preset selector present', controls.presetSelect);
  logTest('All sliders present',
    controls.delaySlider && controls.wetSlider && controls.fbSlider &&
    controls.hpSlider && controls.lpSlider && controls.hissSlider);
  logTest('Preview button present', controls.previewBtn);
  logTest('Stop button present', controls.stopBtn);
  logTest('Render button present', controls.renderBtn);
  logTest('Download link present', controls.downloadLink);

  // Check all presets exist
  const expectedPresets = ['raw', 'newsroom', 'oldtv', 'oldtv_hiss'];
  logTest('All 4 presets available',
    expectedPresets.every(p => controls.presetOptions.includes(p)),
    `Found: ${controls.presetOptions.join(', ')}`);

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 4: Initial State
  // ═══════════════════════════════════════════════════════════
  console.log('🔄 Test 4: Initial State');
  const initialState = await desktopPage.evaluate(() => {
    return {
      previewDisabled: document.getElementById('previewBtn').disabled,
      stopDisabled: document.getElementById('stopBtn').disabled,
      renderDisabled: document.getElementById('renderBtn').disabled,
      downloadText: document.getElementById('dl').textContent,
      selectedPreset: document.getElementById('preset').value
    };
  });

  logTest('Preview button initially disabled', initialState.previewDisabled);
  logTest('Stop button initially disabled', initialState.stopDisabled);
  logTest('Render button initially disabled', initialState.renderDisabled);
  logTest('Download link initially empty', initialState.downloadText === '');
  logTest('Default preset is "raw"', initialState.selectedPreset === 'raw');

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 5: Load Sample Audio
  // ═══════════════════════════════════════════════════════════
  console.log('🎵 Test 5: Load Sample Audio');

  // Check if sample.mp3 exists
  const sampleExists = fs.existsSync(path.join(__dirname, 'sample.mp3'));
  if (!sampleExists) {
    console.log('  ⚠️  sample.mp3 not found - skipping sample load test');
    testResults.push({ name: 'Sample file exists', passed: false, details: 'sample.mp3 not found' });
  } else {
    logTest('Sample file exists', true);

    console.log('  🔄 Clicking Load Sample button...');
    await desktopPage.click('#loadSampleBtn');

    // Wait for loading to complete (button text changes)
    await desktopPage.waitForFunction(() => {
      const btn = document.getElementById('loadSampleBtn');
      return btn.textContent.includes('✓') || btn.textContent.includes('✗');
    }, { timeout: 10000 });

    await new Promise(resolve => setTimeout(resolve, 2500));

    const afterLoad = await desktopPage.evaluate(() => {
      return {
        previewEnabled: !document.getElementById('previewBtn').disabled,
        renderEnabled: !document.getElementById('renderBtn').disabled,
        buttonText: document.getElementById('loadSampleBtn').textContent
      };
    });

    logTest('Sample loaded successfully',
      afterLoad.buttonText.includes('✓') || afterLoad.previewEnabled,
      `Button text: "${afterLoad.buttonText}"`);
    logTest('Preview button enabled after load', afterLoad.previewEnabled);
    logTest('Render button enabled after load', afterLoad.renderEnabled);
  }

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 6: Preset Switching
  // ═══════════════════════════════════════════════════════════
  console.log('🎛️  Test 6: Preset Parameter Changes');

  const presetTests = [
    {
      name: 'raw',
      expected: { hp: '20', lp: '8000', delay: '20', wet: '0', fb: '0', hiss: '0' }
    },
    {
      name: 'newsroom',
      expected: { hp: '100', lp: '5000', delay: '80', wet: '0.3', fb: '0.05', hiss: '0' }
    },
    {
      name: 'oldtv',
      expected: { hp: '300', lp: '3000', delay: '110', wet: '0.32', fb: '0.12', hiss: '0' }
    },
    {
      name: 'oldtv_hiss',
      expected: { hp: '300', lp: '3000', delay: '110', wet: '0.32', fb: '0.12', hiss: '0.04' }
    }
  ];

  for (const preset of presetTests) {
    await desktopPage.select('#preset', preset.name);
    await new Promise(resolve => setTimeout(resolve, 300));

    const params = await desktopPage.evaluate(() => {
      return {
        hp: document.getElementById('hp').value,
        lp: document.getElementById('lp').value,
        delay: document.getElementById('delayMs').value,
        wet: document.getElementById('wet').value,
        fb: document.getElementById('fb').value,
        hiss: document.getElementById('hiss').value
      };
    });

    const paramsMatch = Object.keys(preset.expected).every(key =>
      params[key] === preset.expected[key]
    );

    logTest(`Preset "${preset.name}" sets correct parameters`,
      paramsMatch,
      paramsMatch ? '' : `Expected ${JSON.stringify(preset.expected)}, got ${JSON.stringify(params)}`);
  }

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 7: Slider Interaction
  // ═══════════════════════════════════════════════════════════
  console.log('🎚️  Test 7: Slider Controls');

  // Test delay slider
  await desktopPage.evaluate(() => {
    const slider = document.getElementById('delayMs');
    slider.value = 75;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await new Promise(resolve => setTimeout(resolve, 100));

  const delayLabel = await desktopPage.evaluate(() =>
    document.getElementById('delayLabel').textContent
  );
  logTest('Delay slider updates label', delayLabel === '75', `Label: "${delayLabel}"`);

  // Test wet mix slider
  await desktopPage.evaluate(() => {
    const slider = document.getElementById('wet');
    slider.value = 0.5;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await new Promise(resolve => setTimeout(resolve, 100));

  const wetLabel = await desktopPage.evaluate(() =>
    document.getElementById('wetLabel').textContent
  );
  logTest('Wet mix slider updates label', wetLabel === '0.5', `Label: "${wetLabel}"`);

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 8: Preview Functionality (if sample loaded)
  // ═══════════════════════════════════════════════════════════
  if (sampleExists) {
    console.log('▶️  Test 8: Preview Playback');

    // Make sure we're on newsroom preset for testing
    await desktopPage.select('#preset', 'newsroom');
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log('  🔄 Starting preview...');
    await desktopPage.click('#previewBtn');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const duringPreview = await desktopPage.evaluate(() => {
      return {
        stopEnabled: !document.getElementById('stopBtn').disabled
      };
    });

    logTest('Stop button enabled during preview', duringPreview.stopEnabled);

    console.log('  🛑 Stopping preview...');
    await desktopPage.click('#stopBtn');
    await new Promise(resolve => setTimeout(resolve, 500));

    const afterStop = await desktopPage.evaluate(() => {
      return {
        stopDisabled: document.getElementById('stopBtn').disabled
      };
    });

    logTest('Stop button disabled after stopping', afterStop.stopDisabled);
  } else {
    console.log('▶️  Test 8: Preview Playback - SKIPPED (no sample file)\n');
  }

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 9: Render WAV Functionality
  // ═══════════════════════════════════════════════════════════
  if (sampleExists) {
    console.log('🎬 Test 9: WAV Rendering');

    console.log('  🔄 Rendering WAV file...');
    await desktopPage.click('#renderBtn');

    // Wait up to 10 seconds for render to complete
    try {
      await desktopPage.waitForFunction(() => {
        const link = document.getElementById('dl');
        return link.textContent === 'Download WAV';
      }, { timeout: 10000 });

      const downloadInfo = await desktopPage.evaluate(() => {
        const link = document.getElementById('dl');
        return {
          text: link.textContent,
          hasHref: link.href.startsWith('blob:'),
          hasDownload: !!link.download
        };
      });

      logTest('Render completed successfully', downloadInfo.text === 'Download WAV');
      logTest('Download link has blob URL', downloadInfo.hasHref);
      logTest('Download attribute set', downloadInfo.hasDownload);
    } catch (error) {
      logTest('Render completed within timeout', false, 'Render took too long or failed');
    }
  } else {
    console.log('🎬 Test 9: WAV Rendering - SKIPPED (no sample file)\n');
  }

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 10: Visual Design Elements
  // ═══════════════════════════════════════════════════════════
  console.log('🎨 Test 10: Visual Design Elements');

  const visualElements = await desktopPage.evaluate(() => {
    const body = document.body;
    const container = document.querySelector('.container');
    const footer = document.querySelector('footer');
    const githubLink = document.querySelector('footer a[href*="github"]');

    const bodyStyle = window.getComputedStyle(body);
    const containerStyle = window.getComputedStyle(container);

    return {
      hasGradientBg: bodyStyle.background.includes('gradient') || bodyStyle.background.includes('667eea'),
      containerBorderRadius: containerStyle.borderRadius,
      containerBoxShadow: containerStyle.boxShadow !== 'none',
      hasFooter: !!footer,
      footerHasTagline: footer?.textContent.includes('Good night, and good chirp'),
      hasGitHubLink: !!githubLink,
      githubUrl: githubLink?.href
    };
  });

  logTest('Body has gradient background', visualElements.hasGradientBg);
  logTest('Container has rounded corners',
    visualElements.containerBorderRadius !== '0px');
  logTest('Container has box shadow', visualElements.containerBoxShadow);
  logTest('Footer exists', visualElements.hasFooter);
  logTest('Footer includes tagline', visualElements.footerHasTagline);
  logTest('GitHub link present', visualElements.hasGitHubLink);
  logTest('GitHub link points to correct repo',
    visualElements.githubUrl?.includes('sparrowfm/edward-r-mur-wren'));

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 11: Fieldsets and Labels
  // ═══════════════════════════════════════════════════════════
  console.log('📋 Test 11: Form Structure');

  const formStructure = await desktopPage.evaluate(() => {
    const legends = Array.from(document.querySelectorAll('legend')).map(l => l.textContent);
    const labels = Array.from(document.querySelectorAll('label')).map(l => l.textContent);

    return {
      legends,
      legendCount: legends.length,
      hasAudioFileLegend: legends.includes('Audio File'),
      hasPresetLegend: legends.includes('Preset'),
      labelCount: labels.length
    };
  });

  logTest('Has "Audio File" fieldset', formStructure.hasAudioFileLegend);
  logTest('Has "Preset" fieldset', formStructure.hasPresetLegend);
  logTest('All parameter labels present', formStructure.labelCount >= 6,
    `Found ${formStructure.labelCount} labels`);

  console.log('');

  // ═══════════════════════════════════════════════════════════
  // TEST 12: Accessibility Features
  // ═══════════════════════════════════════════════════════════
  console.log('♿ Test 12: Accessibility');

  const a11y = await desktopPage.evaluate(() => {
    return {
      hasLang: document.documentElement.hasAttribute('lang'),
      lang: document.documentElement.lang,
      hasTitle: !!document.title,
      title: document.title,
      hasMetaCharset: !!document.querySelector('meta[charset]'),
      hasViewport: !!document.querySelector('meta[name="viewport"]'),
      hasFavicon: !!document.querySelector('link[rel="icon"]')
    };
  });

  logTest('HTML has lang attribute', a11y.hasLang);
  logTest('Document has title', a11y.hasTitle && a11y.title === 'Edward R. Mur-Wren');
  logTest('Has charset meta tag', a11y.hasMetaCharset);
  logTest('Has viewport meta tag', a11y.hasViewport);
  logTest('Has favicon', a11y.hasFavicon);

  console.log('');

  // Final screenshot
  await desktopPage.screenshot({ path: 'test-final-state.png', fullPage: true });
  console.log('  📸 Final screenshot saved to test-final-state.png\n');

  // ═══════════════════════════════════════════════════════════
  // TEST SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📈 Total Tests: ${testsPassed + testsFailed}`);
  console.log(`🎯 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('═══════════════════════════════════════════════════════════\n');

  // Show failed tests if any
  if (testsFailed > 0) {
    console.log('Failed Tests:');
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`  ❌ ${t.name}`);
      if (t.details) console.log(`     ${t.details}`);
    });
    console.log('');
  }

  console.log('Browser will close in 5 seconds...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  await browser.close();
  console.log('\n👋 Test suite complete!\n');

  // Exit with appropriate code
  process.exit(testsFailed > 0 ? 1 : 0);
})();
