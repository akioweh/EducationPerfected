# EducationPerfectedAgain

**Automatic answer bot for Education Perfect language tasks using Puppeteer + Electron**

<p align="center">
  <img src="result.png" alt="Example" />
</p>

## Overview

EducationPerfected automates translation and listening tasks on [Education Perfect](https://www.educationperfect.com/). It provides a login UI, saves your credentials, and launches a full-featured answer bot in a maximized browser window.

Modes include:

- **Instant** – submits answers immediately  
- **Semi-Auto** – types answers, waits for Enter  
- **Delayed** (default) – types answers, submits after 0–3 s  

It handles text and audio questions and learns from mistakes using the modal dialogs.

## Getting Started

**Download the latest `.zip` file from the [Releases page](https://github.com/YOUR_USERNAME/EducationPerfected/releases).**

1. Extract the zip.  
2. Open the folder.  
3. Run `EducationPerfectedBot.exe`.

You’ll see a login screen. Enter your Education Perfect credentials and click start. Chrome will open and the bot will begin.

## Control Panel

Once on a task, the floating panel lets you:

- 🔄 **Refresh Words** – Reload the translation dictionary for reading and writing tasks
- 🔊 **Refresh Audio** – Map audio clips to words for listening tasks
- ▶️ **Start/Stop** – Toggle the bot  
- ⚡ / ⏸️ / ⏱️ – Choose answer mode (Instant, Semi, Delayed)

## Development

To build locally:

```bash
npm install
npm run package
```

The packaged bot will appear in a folder named `EducationPerfectedBot`.

## Notes

- Login details are saved locally unless deleted  
- The login UI closes when the bot launches  
- Browser runs in non-headless, maximized mode  

---

*Author: André Nijman*
