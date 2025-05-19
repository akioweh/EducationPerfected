const puppeteer = require('puppeteer');

(async () => {
    const DIR = {
        email: process.argv[2],
        password: process.argv[3],
        loginUrl: 'https://app.educationperfect.com/app/login',
        selectors: {
            username: '#loginId',
            password: '#password',
            baseWords: 'div.baseLanguage.question-label.native-font.ng-binding',
            targetWords: 'div.targetLanguage.question-label.native-font.ng-binding',
            questionText: '#question-text',
            answerInput: 'input#answer-text',
            continueButton: 'button#continue-button',
            modal: 'div[uib-modal-window=modal-window]',
            modalFields: {
                question: 'td.field.native-font#question-field',
                correct: 'td.field.native-font#correct-answer-field'
            }
        }
    };

    let dict = {}, shortDict = {}, audioMap = {};
    let running = false;
    let mode = 'delay';

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const cleanString = s => String(s).replace(/\([^)]*\)/g, '').split(/[;]/)[0].trim();
    const randStr = (min, max) => {
        const len = Math.floor(Math.random() * (max - min + 1)) + min;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: len }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    async function notify(msg) {
        await page.evaluate(message => alert(message), msg);
    }

    async function refreshAll() {
        await notify('Please wait while the bot refreshes the word lists. This may take a minute.');
        dict = {};
        shortDict = {};
        audioMap = {};

        try {
            const base = await page.$$eval(DIR.selectors.baseWords, els => els.map(e => e.textContent));
            const target = await page.$$eval(DIR.selectors.targetWords, els => els.map(e => e.textContent));
            base.forEach((bRaw, i) => {
                const t = cleanString(target[i] || '');
                const b = cleanString(bRaw);
                if (t && b) {
                    dict[t] = b;
                    shortDict[t] = b;
                }
            });
        } catch {}

        try {
            const items = await page.$$('.preview-grid .stats-item');
            for (const item of items) {
                const icon = await item.$('.sound-icon.has-sound');
                if (!icon) continue;
                const rawA = await item.$eval('.baseLanguage', el => el.textContent.trim());
                const a = cleanString(rawA);
                await page.evaluate(el => el.click(), icon);
                await sleep(500);
                const src = await page.evaluate(() => window.lastAudioSrc || null);
                if (src) {
                    audioMap[src] = a;
                }
            }
        } catch {}

        await notify('All word lists refreshed.');
    }

    async function fixAnswer(lastAnswer) {
        try {
            await page.waitForFunction(sel => document.querySelector(sel)?.textContent.trim().length > 0, {}, DIR.selectors.modalFields.question);
            const correctText = await page.$eval(DIR.selectors.modalFields.correct, el => el.textContent);
            dict[lastAnswer] = cleanString(correctText);
            await page.$eval(DIR.selectors.continueButton, btn => btn.disabled = false);
            await page.click(DIR.selectors.continueButton);
        } catch (err) {}
    }

    async function loopAnswers() {
        while (running) {
            let answer;
            let qText = '';
            try {
                qText = await page.$eval(DIR.selectors.questionText, el => el.textContent.trim());
            } catch {}

            if (qText) {
                const cleaned = cleanString(qText);
                if (dict[cleaned]) {
                    answer = dict[cleaned];
                } else if (shortDict[cleaned]) {
                    answer = shortDict[cleaned];
                } else if (Object.values(dict).includes(cleaned)) {
                    answer = Object.keys(dict).find(k => dict[k] === cleaned);
                } else {
                    answer = randStr(8, 10);
                }
            } else {
                let src = null;
                try {
                    const speaker = await page.$('.voice-speaker');
                    if (speaker) {
                        await page.evaluate(el => el.click(), speaker);
                        await sleep(500);
                        src = await page.evaluate(() => window.lastAudioSrc || null);
                    }
                } catch {}
                answer = (src && audioMap[src]) || randStr(8, 10);
            }

            await page.click(DIR.selectors.answerInput, { clickCount: 3 });
            await page.keyboard.sendCharacter(answer);

            if (mode === 'auto') {
                await page.keyboard.press('Enter');
            } else if (mode === 'delay') {
                await sleep(Math.random() * 3000);
                await page.keyboard.press('Enter');
            }

            if (await page.$(DIR.selectors.modal)) {
                await fixAnswer(answer);
            }
        }
    }

    async function toggleRun() {
        running = !running;
        await notify(running ? 'Auto-answer started' : 'Auto-answer stopped');
        await page.evaluate(run => {
            document.getElementById('start-btn').style.backgroundColor = run ? 'lightgreen' : '#f0f0f0';
        }, running);

        if (running) {
            loopAnswers().catch(err => {
                running = false;
            });
        }
    }

    async function setMode(newMode) {
        mode = newMode;
        await notify(`Mode: ${newMode}`);
        await page.evaluate(active => {
            ['Auto', 'Semi', 'Delay'].forEach(l => {
                const btn = document.getElementById(`mode-${l}`);
                if (btn) {
                    btn.style.backgroundColor = l.toLowerCase() === active ? 'lightgreen' : '#f0f0f0';
                }
            });
        }, mode);
    }

    async function initPanel() {
        await page.evaluate(currentMode => {
            if (document.querySelector('#ep-control-panel')) return;
            const panel = document.createElement('div');
            panel.id = 'ep-control-panel';
            Object.assign(panel.style, {
                position: 'fixed',
                top: '3%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '8px',
                zIndex: 9999
            });
            const icons = ['🔄', '▶️', '⚡', '⏸️', '⏱️'];
            const ids = ['refresh-btn', 'start-btn', 'mode-Auto', 'mode-Semi', 'mode-Delay'];
            const tips = ['Refresh all word lists', 'Start/stop', 'Instant', 'Semi-auto', 'Delayed'];
            const fns = [window.refresh, window.startAnswer, window.setAuto, window.setSemi, window.setDelay];
            icons.forEach((icon, index) => {
                const btn = document.createElement('button');
                btn.id = ids[index];
                btn.textContent = icon;
                btn.title = tips[index];
                Object.assign(btn.style, {
                    margin: '4px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #aaa',
                    backgroundColor: ids[index] === 'mode-Delay' ? 'lightgreen' : '#f0f0f0',
                    cursor: 'pointer'
                });
                btn.onclick = fns[index];
                btn.onmouseover = () => btn.style.backgroundColor = '#e0e0e0';
                btn.onmouseout = () => btn.style.backgroundColor = ids[index] === 'mode-Delay' ? 'lightgreen' : '#f0f0f0';
                panel.appendChild(btn);
            });
            document.body.appendChild(panel);
        }, mode);
    }

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const [page] = await browser.pages();

    await page.evaluateOnNewDocument(() => {
        window.lastAudioSrc = null;
        const origPlay = HTMLAudioElement.prototype.play;
        HTMLAudioElement.prototype.play = function () {
            window.lastAudioSrc = this.src;
            return origPlay.call(this);
        };
    });

    await page.exposeFunction('refresh', refreshAll);
    await page.exposeFunction('startAnswer', toggleRun);
    await page.exposeFunction('setAuto', () => setMode('auto'));
    await page.exposeFunction('setSemi', () => setMode('semi'));
    await page.exposeFunction('setDelay', () => setMode('delay'));
    page.on('load', initPanel);

    await page.goto(DIR.loginUrl);
    await page.waitForSelector(DIR.selectors.username);
    await page.type(DIR.selectors.username, DIR.email);
    await page.type(DIR.selectors.password, DIR.password);
    await page.keyboard.press('Enter');
})();