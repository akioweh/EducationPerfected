# EducationPerfected

**Automatic answer bot for Education Perfect language tasks using Puppeteer**

<p align="center">
  <img src="result.png" alt="Example" />
</p>

## Introduction

EducationPerfected automates word-to-word translation tasks on [Education Perfect](https://www.educationperfect.com/). It logs you in, presents a small floating control panel, and answers translation questions in one of three modes:

* **Instant**: submits answers immediately
* **Semi-Auto**: types answers but waits for you to press Enter
* **Delayed** (default): types answers then submits after a random 0–3s delay

The bot also learns from incorrect answers via modal dialogs and updates its dictionary on the fly.

## Installation

1. Clone or download this repo.
2. Install [Node.js](https://nodejs.org/) (v14+).
3. In the project folder, run:

   ```bash
   npm install puppeteer
   ```
4. Edit `index.js`, set your `email` and `password` in the `DIR` config at top.

## Usage

```bash
node index.js
```

1. A Chrome window opens and logs in automatically.
2. On any translation task page, use the floating panel:

   * 🔄 **Refresh Words**: load current word list into the bot’s dictionary
   * ▶️ **Start/Stop**: begin or end auto-answering
   * ⚡ **Instant** / ⏸️ **Semi-Auto** / ⏱️ **Delayed**: choose answer mode (Delayed is default)
3. Once done, close the browser or Ctrl-C in the terminal.

## Features

* **Control Panel** with icons and tooltips
* **Default Delay Mode** (0–3 s random delay) for human‑like timing
* **Instant Mode** (submits immediately)
* **Semi‑Auto Mode** (types only)
* **Auto‑Learn** from incorrect answers via modal dialogs
* **No custom timeouts** — uses default Puppeteer settings

## Development

* Code is in `index.js` (v1.11)
* Uses `await page.exposeFunction` to bind panel buttons
* Cleaned up with docstrings and comments

## Future Plans

* Support audio‑based tasks
* Persist settings between sessions
* User‑configurable delay range

---

*Author: André Nijman*
