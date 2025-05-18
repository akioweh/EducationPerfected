# EducationPerfected

#### JavaScript program to automatically answer Education Perfect language questions at **high** speeds.

Works for word-to-word (translation) tasks and Dash mode.
**Does not work with Audio-based tasks, YET.**

![example image](result.png)

**CURRENT STATUS: ALL intended features functional.

## Introduction

This project began as a way to automate tasks on [Education Perfect](https://www.educationperfect.com/) which teachers use to set students homework. One of those students happened to be me. I set out to perfect Education Perfect, making EducationPerfected.
The main goal was and still is language tasks that require translating words or phrases.
Audio tasks are not supported yet.

V1 was a userscript injected in the browser console. It was simple and fast. But anti-cheat features broke it.
V2 is a Node.js program using Puppeteer. It runs outside the page and bypasses those limits.

## Installation

1. Download `index.js` and the start script (`start.cmd` or `start.sh`) into one folder.
2. Install [Node.js](https://nodejs.org/).
3. Open a terminal in that folder.
4. Run `npm i puppeteer` to install Puppeteer.
5. Edit `index.js` at lines 7–8 to add your EP email and password.

Note: If Chromium is missing, run `node node_modules/puppeteer/install.js`.

## Usage

1. Run the start script or `node index.js`.
2. A browser window will open and log you in.
3. A control panel appears in the top right with three buttons:

   * **Refresh Words**: Learn the current task's word list.
   * **Start/Stop**: Begin or end auto-answering.
   * **Toggle Mode**: Switch between full-auto (auto enter) and semi-auto (you press enter).
4. Use the panel on any task page:

   * First click **Refresh Words** on the word list page.
   * Then click **Start/Stop** on the question page to begin.
   * If you want to type but not auto-submit, click **Toggle Mode**.

Close the browser or terminal when done. Restart if you see odd behavior.

## Features

* **Control Panel**: Easy buttons for all actions.
* **Full-Speed Auto Answer**: Answers at 5–20+ questions per second.
* **Semi-Auto Mode**: Types answers but waits for you to submit.
* **Error Correction**: Detects wrong answers, learns from modals, and updates its dictionary.
* **Smart Parsing**: Cleans up formatting edge cases so more answers match correctly.

## Future Plans

* Support for audio-based tasks.
* Better anti-cheat bypass.
* More parsing improvements.
* Community contributions welcome.

*Thank you to [Garv](https://github.com/garv-shah) for his V1 exploit discovery.*
