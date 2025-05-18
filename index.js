const puppeteer = require('puppeteer');

(async () => {
    /**
     * Configuration for login and DOM selectors
     */
    const DIR = {
        email: '##ENTER EMAIL HERE##',
        password: '##ENTER PASSWORD HERE##',
        // URL for EP login page
        loginUrl: 'https://app.educationperfect.com/app/login',
        selectors: {
            username: '#loginId',
            password: '#password',
            home: 'div.view-segment-dashboard',
            baseWords: 'div.baseLanguage.question-label.native-font.ng-binding',
            targetWords: 'div.targetLanguage.question-label.native-font.ng-binding',
            questionText: '#question-text',
            answerInput: 'input#answer-text',
            continueButton: 'button#continue-button',
            modal: 'div[uib-modal-window=modal-window]',
            modalBackdrop: 'div[uib-modal-backdrop=modal-backdrop]',
            modalFields: {
                question: 'td.field.native-font#question-field',
                correct: 'td.field.native-font#correct-answer-field'
            }
        }
    };

    // State for dictionaries and control flags
    let dict = {}, shortDict = {};
    let running = false;
    let mode = 'delay'; // default answer mode

    /**
     * Normalize a string by stripping parentheses and separators.
     */
    function cleanString(str) {
        return String(str).replace(/\([^)]*\)/g, '').split(/[;,|]/)[0].trim();
    }

    /**
     * Populate dictionaries from the page word lists.
     */
    async function updateDicts() {
        const base = await page.$$eval(DIR.selectors.baseWords, els => els.map(e => e.textContent));
        const target = await page.$$eval(DIR.selectors.targetWords, els => els.map(e => e.textContent));
        base.forEach((bRaw, i) => {
            const b = cleanString(bRaw);
            const t = cleanString(target[i]);
            dict[bRaw] = t;
            dict[t] = b;
            shortDict[b] = t;
            shortDict[t] = b;
        });
        console.log('Dictionaries updated');
        await notify('Word lists refreshed');
    }

    /**
     * Show a browser alert with a message.
     */
    async function notify(message) {
        await page.evaluate(msg => alert(msg), message);
    }

    /**
     * Determine answer for a question or fallback.
     */
    function findAnswer(question) {
        return dict[question] || dict[question.replace(',', ';')] || shortDict[cleanString(question)] || randStr(8, 10);
    }

    /**
     * Generate a random alphanumeric string.
     */
    function randStr(min, max) {
        const len = Math.floor(Math.random() * (max - min + 1)) + min;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: len }).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    /**
     * Pause execution.
     */
    const sleep = ms => new Promise(res => setTimeout(res, ms));

    /**
     * Handle incorrect-answer modal to update dicts.
     */
    async function fixAnswer(question) {
        try {
            await page.waitForFunction(sel => document.querySelector(sel)?.textContent.trim().length > 0, {}, DIR.selectors.modalFields.question);
        } catch {
            console.warn('Skipping fix: modal not found');
            return;
        }
        const correctText = await page.$eval(DIR.selectors.modalFields.correct, el => el.textContent);
        dict[question] = cleanString(correctText);
        await page.$eval(DIR.selectors.continueButton, btn => btn.disabled = false);
        await page.click(DIR.selectors.continueButton);
    }

    /**
     * Remove any open modals.
     */
    async function clearModals() {
        await page.$$eval(DIR.selectors.modal, els => els.forEach(e => e.remove()));
        await page.$$eval(DIR.selectors.modalBackdrop, els => els.forEach(e => e.remove()));
    }

    /**
     * Main loop: submit answers and handle modes.
     */
    async function loopAnswers() {
        console.log('Answer loop started');
        while (running) {
            const q = await page.$eval(DIR.selectors.questionText, el => el.textContent);
            const a = findAnswer(q);
            await page.click(DIR.selectors.answerInput, { clickCount: 3 });
            await page.keyboard.sendCharacter(a);
            if (mode === 'auto') await page.keyboard.press('Enter');
            else if (mode === 'delay') { await sleep(Math.random() * 3000); await page.keyboard.press('Enter'); }
            if (await page.$(DIR.selectors.modal)) { await fixAnswer(q); await clearModals(); }
        }
        console.log('Answer loop stopped');
    }

    /**
     * Toggle auto-answer loop and update start button color.
     */
    async function toggleRun() {
        running = !running;
        await notify(running ? 'Auto-answer started' : 'Auto-answer stopped');
        await page.evaluate(r => { const btn = document.getElementById('start-btn'); if (btn) btn.style.backgroundColor = r ? 'lightgreen' : '#f0f0f0'; }, running);
        if (running) loopAnswers().catch(e => { console.error(e); running = false });
    }

    /**
     * Change mode and highlight active mode button.
     */
    async function setMode(newMode) {
        mode = newMode;
        await notify(`Mode: ${mode}`);
        await page.evaluate(active => { ['Auto','Semi','Delay'].forEach(l => { const b = document.getElementById(`mode-${l}`); if (b) b.style.backgroundColor = l.toLowerCase()===active?'lightgreen':'#f0f0f0'; }); }, mode);
    }

    /**
     * Create and style control panel buttons and tooltips.
     */
    async function initPanel() {
        await page.evaluate(defaultMode => {
            if (document.querySelector('#ep-control-panel')) return;
            const panel = document.createElement('div'); panel.id='ep-control-panel';
            Object.assign(panel.style,{position:'fixed',top:'3%',left:'50%',transform:'translate(-50%,-50%)',background:'transparent',padding:'8px',zIndex:2147483647});
            const makeButton=(id,icon,tip,fn,act=false)=>{const b=document.createElement('button');b.id=id;b.innerHTML=icon;b.title=tip;Object.assign(b.style,{margin:'4px',padding:'6px 10px',borderRadius:'6px',border:'1px solid #aaa',backgroundColor:act?'lightgreen':'#f0f0f0',cursor:'pointer',fontSize:'14px'});b.onclick=()=>fn();b.onmouseover=()=>b.style.backgroundColor='#e0e0e0';b.onmouseout=()=>b.style.backgroundColor=act?'lightgreen':'#f0f0f0';return b};
            panel.append(makeButton('refresh-btn','🔄','Refresh words',window.refresh),makeButton('start-btn','▶️','Start/stop',window.startAnswer),makeButton('mode-Auto','⚡','Instant submit',window.setAuto,false),makeButton('mode-Semi','⏸️','Enter only',window.setSemi,false),makeButton('mode-Delay','⏱️','0-3s delay',window.setDelay,true));
            document.body.append(panel);
        }, mode);
    }

    // Launch and open page
    const browser = await puppeteer.launch({headless:false,defaultViewport:null});
    const [page] = await browser.pages();

    // Expose functions in page context
    await page.exposeFunction('refresh', updateDicts);
    await page.exposeFunction('startAnswer', toggleRun);
    await page.exposeFunction('setAuto', () => setMode('auto'));
    await page.exposeFunction('setSemi', () => setMode('semi'));
    await page.exposeFunction('setDelay', () => setMode('delay'));

    // Attach panel init
    page.on('load', initPanel);

    // Login without waiting for home selector
    await page.goto(DIR.loginUrl);
    await page.waitForSelector(DIR.selectors.username);
    await page.type(DIR.selectors.username, DIR.email);
    await page.type(DIR.selectors.password, DIR.password);
    await page.keyboard.press('Enter');
    console.log('Login attempted, ready to start automation');
})();
