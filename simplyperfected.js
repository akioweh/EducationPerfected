const puppeteer = require('puppeteer');

(async () => {
    const DIR = {
        loginUrl: 'https://app.educationperfect.com/app/login',
        selectors: {
            baseWords: 'div.baseLanguage.question-label.native-font.ng-binding',
            targetWords: 'div.targetLanguage.question-label.native-font.ng-binding',
            questionText: '#question-text.native-font',
            answerInput: 'input#answer-text',
            continueButton: 'button#continue-button',
            modal: 'div[uib-modal-window=modal-window]',
            modalFields: {
                question: 'td.field.native-font#question-field',
                correct: 'td.field.native-font#correct-answer-field'
            }
        }
    };

    let dict = {}, reverseDict = {}, audioMap = {};
    let running = false;
    let mode = 'delay';
    let question_mode = '';

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
        await notify('Please wait while the bot refreshes the word lists. This may take a few seconds.');
        await page.evaluate(() => {
            document.getElementById('refresh-btn').style.backgroundColor = 'lightyellow';
            document.getElementById('ep-control-panel').style.backgroundColor = 'lightyellow';
        }, running);
        dict = {};
        reverseDict = {};
        audioMap = {};

        try {
            const base = await page.$$eval(DIR.selectors.baseWords, els => els.map(e => e.textContent));
            const target = await page.$$eval(DIR.selectors.targetWords, els => els.map(e => e.textContent));
            base.forEach((bRaw, i) => {
                const t = cleanString(target[i] || '');
                const b = cleanString(bRaw);
                if (t && b) {
                    dict[t] = b;
                    reverseDict[b] = t.split(",")[0].trim();
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

        question_mode = await page.evaluate(() => {
            return document.querySelectorAll('.selected[ng-click="starter.selectLearningMode(item)"]')[0].children[1].children[0].children[0].textContent.toString();
        });

        let totalEntries = Object.keys(dict).length;
        let entriesWithAudio = Object.values(dict).filter(v =>
            Object.values(audioMap).includes(v)
        ).length;

        let message = `All word lists refreshed:\nTotal entries: ${totalEntries}\nWith audio: ${entriesWithAudio}\n\n`;
        // for (const [k, v] of Object.entries(dict)) {
        //     const link = Object.entries(audioMap).find(([, word]) => word === v)?.[0] || 'no audio';
        //     message += `${k} → ${v} (${link})\n\n`;
        // }
        await notify(message);
        await page.evaluate(() => {
            document.getElementById('refresh-btn').style.backgroundColor = '#f0f0f0';
            document.getElementById('ep-control-panel').style.backgroundColor = '#fff';
        }, running);
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
        let answer;
        let last_answer;
        let qText = '';

        if ((question_mode === 'Dictation' || question_mode === 'Listening') && mode !== "auto") {
            notify("Due to some vocabulary having multiple audio, semi and delay mode may get questions wrong. Auto mode is recommended for this.")
        }
        while (running) {
            try {
                qText = await page.$eval(DIR.selectors.questionText, el => el.textContent.trim());
            } catch {}

            if (qText) {
                const cleaned = cleanString(qText).split(/[;,]/)[0].trim();
                if (dict[cleaned]) {
                    answer = dict[cleaned];
                } else if (reverseDict[cleaned]) {
                    answer = reverseDict[cleaned]
                } else {
                    answer = randStr(8, 10);
                }
                //await notify(`Question: "${qText}"\nCleaned: "${cleaned}"\nAnswer: "${answer}"`);
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
                if (question_mode === "Dictation") {
                    answer = (src && reverseDict[audioMap[src]]) || randStr(8, 10);
                } else {
                    answer = (src && audioMap[src]) || randStr(8, 10);
                }
            //    await notify(`Audio question: src="${src}"\nAnswer: "${answer}"`);
            }
            
            if (answer === last_answer) {
                continue;
            } else {
                last_answer = answer;
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
        await page.evaluate(run => {
            document.getElementById('start-btn').style.backgroundColor = run ? 'lightgreen' : '#f0f0f0';
            document.getElementById('ep-control-panel').style.backgroundColor = run ? 'lightgreen' : '#fff';
        }, running);

        if (running) {
            await loopAnswers().catch(err => {
                running = false;
            });
            await page.evaluate(() => {
                document.getElementById('start-btn').style.backgroundColor = '#f0f0f0';
                document.getElementById('ep-control-panel').style.backgroundColor = '#fff';
            });
        }
    }

    async function setMode(newMode) {
        mode = newMode;
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

            window.currentMode = currentMode || 'delay';
            window.running = window.running || false;

            const panel = document.createElement('div');
            panel.id = 'ep-control-panel';
            Object.assign(panel.style, {
                position: 'fixed',
                top: '10px',
                right: '120px',
                padding: '10px',
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                zIndex: 9999,
                fontFamily: 'sans-serif',
                boxShadow: '0 0 10px rgba(0,0,0,0.1)'
            });

            const statusLine = `Mode: ${window.currentMode}`;

            panel.innerHTML = `
                <div id="status-line" style="font-size:24px; color:#333; margin-bottom:8px;">SimplyPerfected v1.0.1</div>
                <div style="margin-bottom:8px;">
                    <button id="refresh-btn" title="Refresh all (Alt+R)">🔄</button>
                    <button id="start-btn" title="Start/stop (Alt+S)">▶️</button>
                    <button id="mode-Auto" title="Instant (Alt+1)">⚡</button>
                    <button id="mode-Semi" title="Semi-auto (Alt+2)">⏸️</button>
                    <button id="mode-Delay" title="Delayed (Alt+3)" style="background-color:lightgreen;">⏱️</button>
                    <button id="hide-panel" title="Hide panel">❌</button>
                </div>
                <div id="status-line" style="font-size:12px; color:#333;">
                    ${statusLine}
                </div>
                <div style="font-size:11px; color:#666; margin-top:6px;">Alt+S to start/stop</div>
            `;

            document.body.appendChild(panel);

            const setStatus = msg => {
                const el = document.getElementById('status-line');
                if (el) el.textContent = msg;
            };
            window.setStatus = setStatus;

            document.getElementById('refresh-btn').onclick = window.refresh;
            document.getElementById('start-btn').onclick = window.startAnswer;
            document.getElementById('mode-Auto').onclick = window.setAuto;
            document.getElementById('mode-Semi').onclick = window.setSemi;
            document.getElementById('mode-Delay').onclick = window.setDelay;

            document.getElementById('hide-panel').onclick = () => {
                panel.style.display = 'none';
                const showBtn = document.createElement('button');
                showBtn.textContent = '📋';
                showBtn.title = 'Show panel';
                Object.assign(showBtn.style, {
                    position: 'fixed',
                    top: '10px',
                    right: '120px',
                    zIndex: 9999,
                    padding: '4px',
                    fontSize: '16px'
                });
                showBtn.onclick = () => {
                    panel.style.display = 'block';
                    showBtn.remove();
                };
                document.body.appendChild(showBtn);
            };

            document.addEventListener('keydown', e => {
                if (!e.altKey) return;
                if (e.key.toLowerCase() === 'r') window.refresh();
                if (e.key.toLowerCase() === 's') window.startAnswer();
                if (e.key === '1') window.setAuto();
                if (e.key === '2') window.setSemi();
                if (e.key === '3') window.setDelay();
            });
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
})();
