# EducationPerfected

**Automatic answer bot for Education Perfect language tasks using Puppeteer**

<p align="center">
  <img src="result.png" alt="Example" />
</p>

## Introduction

EducationPerfected automates translation and listening tasks on [Education Perfect](https://www.educationperfect.com/). It logs you in, injects a floating control panel, and answers questions in one of three modes:

* **Instant**: submits answers immediately
* **Semi-Auto**: types answers and waits for you to press Enter
* **Delayed** (default): types answers then submits after a random 0–3 s delay

For listening questions it builds the audio map by clicking each speaker icon in turn (with a short delay), then matches the audio URL against its dictionary. It also learns from mistakes via modal dialogs and updates its dictionary on the fly.

## Installation

1. Clone or download this repo.

2. Install [Node.js](https://nodejs.org/) v14+.

3. In the project folder, run:

   ```bash
   npm install puppeteer
   ```

4. Open `index.js` and set your `email` and `password` in the `DIR` config at the top.

## Usage

```bash
node index.js
```

1. A Chrome window opens and logs you in automatically.

2. On any task page, use the floating panel:

   * 🔄 **Refresh Words**: clears and reloads the text translation dictionary
   * 🔊 **Refresh Audio**: clears dictionaries and rebuilds audio map by automatically clicking each speaker icon
   * ▶️ **Start/Stop**: begin or end auto-answering
   * ⚡ **Instant** / ⏸️ **Semi-Auto** / ⏱️ **Delayed**: choose how answers are submitted

3. When done, close the browser or hit Ctrl +C in your terminal.

## Features

* **Translation & Listening** support
* **Audio map builder** via automatic controlled clicks and playback capture
* **Control Panel** with clear icons and tooltips
* **Instant**, **Semi‑Auto**, and **Delayed** submission modes
* **Auto‑Learn** from wrong answers via modal dialogs
* **Dictionary reset** on each refresh to avoid stale entries
* **No custom timeouts** — uses default Puppeteer settings

## Development

* Main code in `index.js` (v1.11+)
* Uses `page.exposeFunction` to bind panel controls
* Clean, commented code with simple helper functions

## Future Plans

* User‑configurable delay ranges

---

*Author: André Nijman*
