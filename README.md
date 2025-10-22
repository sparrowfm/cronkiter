# Cronkiter

> **"And that's the way it sounds."**

Transform your audio into nostalgic, old-timey broadcasts! Make any recording sound like it's crackling through a 1940s radio or vintage TV set.

🎙️ **[Try it live →](https://sparrowfm.github.io/cronkiter/)**

![Cronkiter Screenshot](https://img.shields.io/badge/status-live-success?style=for-the-badge)
![No Dependencies](https://img.shields.io/badge/dependencies-none-blue?style=for-the-badge)
![Privacy Friendly](https://img.shields.io/badge/privacy-friendly-green?style=for-the-badge)

---

## ✨ Features

- 🎚️ **4 Vintage Presets** - From raw audio to full old-timey broadcast sound
- 🎛️ **Manual Controls** - Fine-tune echo, filters, and atmospheric hiss
- 🔊 **Live Preview** - Hear your audio before rendering
- 💾 **WAV Export** - Download high-quality processed audio files
- 🔒 **100% Private** - Everything runs in your browser, no uploads
- 📱 **Desktop Optimized** - Best experience on desktop browsers
- 🆓 **Completely Free** - No accounts, no subscriptions, no limits

## 🎨 Audio Presets

### Raw / No Processing
Clean baseline with no vintage effects applied.

### Newsroom
Subtle slapback echo reminiscent of 1960s-70s broadcast studios. Perfect for that Walter Cronkite sound.

### Old TV / AM Radio
Narrowband, mono sound with pronounced echo. Sounds like it's coming through a vintage television or AM radio receiver.

### Old TV + Light Hiss
Everything from "Old TV" plus gentle background noise for extra authenticity. The full vintage experience.

## 🎛️ Manual Controls

- **Echo Delay** (20-140ms) - Timing of the slapback echo
- **Echo Wet Mix** (0-1) - How much echo to blend in
- **Feedback** (0-0.9) - Echo repeats and decay
- **High-Pass Filter** (20-800 Hz) - Remove low frequencies
- **Low-Pass Filter** (1000-8000 Hz) - Remove high frequencies
- **Hiss Level** (0-0.3) - Add vintage background noise

## 🚀 How to Use

1. **Upload an audio file** or click "Load Sample Audio"
2. **Choose a preset** (or tweak parameters manually)
3. **Click Preview** to hear the effect
4. **Click Render WAV** to process and download

That's it! No account required, no data collected.

## 🛠️ Technical Details

**Built with:**
- Vanilla JavaScript (no frameworks!)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for real-time audio processing
- Pure CSS for styling
- [GoatCounter](https://www.goatcounter.com/) for privacy-friendly analytics

**Audio Processing Chain:**
1. Optional mono fold-down (for oldtv presets)
2. High-pass and low-pass biquad filters
3. Dynamic range compression (broadcast-style)
4. Delay node with feedback loop for echo
5. Optional white noise generator for hiss
6. Offline rendering to WAV format

**Browser Compatibility:**
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (desktop)
- ⚠️ Mobile browsers have limited audio processing support

## 📦 Running Locally

No build process needed! Just serve the files:

```bash
# Clone the repository
git clone https://github.com/sparrowfm/cronkiter.git
cd cronkiter

# Start a simple HTTP server
python3 -m http.server 8000
# or
npx serve

# Open http://localhost:8000
```

## 🧪 Testing

Comprehensive Puppeteer test suite included:

```bash
npm install
npm run test:upload    # Test file upload workflow
npm run test:e2e       # Full end-to-end tests with HTTP server
npm run test:all       # Run all tests
```

See [TEST_RESULTS.md](TEST_RESULTS.md) for detailed test documentation.

## 🎭 Why "Cronkiter"?

Named after the legendary CBS news anchor **Walter Cronkite**, whose authoritative voice and iconic sign-off *"And that's the way it is"* defined American broadcast journalism for decades. This tool lets you give any audio that classic mid-century broadcast sound.

## 📄 License

MIT License - feel free to use, modify, and share!

## 🙏 Credits

- Audio processing powered by the [Web Audio API](https://www.w3.org/TR/webaudio/)
- Analytics by [GoatCounter](https://www.goatcounter.com/) (privacy-friendly, open-source)
- Inspired by vintage broadcast equipment and the golden age of radio/television

## 🤝 Contributing

Issues and pull requests welcome! This is a simple, single-file project perfect for learning Web Audio API.

---

**Made with 🎙️ by [sparrowfm](https://github.com/sparrowfm)**

*And that's the way it sounds.*
