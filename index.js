// v1.4

const puppeteer = require('puppeteer');

(async () => {
    const DIR = {
        email: 'Enter your email here',
        password: 'Enter your password here',
        login_url: 'https://app.educationperfect.com/app/login',
        username_css: '#loginId',
        password_css: '#password',
        home_css: 'div.view-segment-dashboard',
        baseList_css: 'div.baseLanguage.question-label.native-font.ng-binding',
        targetList_css: 'div.targetLanguage.question-label.native-font.ng-binding',
        question_css: '#question-text',
        answer_box_css: 'input#answer-text',
        continue_button_css: 'button#continue-button',
        modal_question_css: 'td#question-field',
        modal_correct_answer_css: 'td#correct-answer-field',
        modal_user_answered_css: 'td#users-answer-field',
        modal_css: 'div[uib-modal-window=modal-window]',
        modal_backdrop_css: 'div[uib-modal-backdrop=modal-backdrop]',
        exit_button_css: 'button.exit-button',
        exit_continue_button_css: 'button.continue-button',
    };

    // answer control state
    let fullDict = {};
    let cutDict = {};
    let TOGGLE = false;
    let ENTER = true;

    // helper: clean text
    function cleanString(string) {
        return String(string)
            .replace(/\([^)]*\)/g, "").trim()
            .split(";")[0].trim()
            .split(",")[0].trim()
            .split("|")[0].trim();
    }

    // extract list of words
    async function wordList(selector) {
        return await page.$$eval(selector, els => els.map(i => i.textContent));
    }

    // refresh dictionary from page
    async function refreshWords() {
        const l1 = await wordList(DIR.baseList_css);
        const l2 = await wordList(DIR.targetList_css);
        for (let i = 0; i < l1.length; i++) {
            fullDict[l2[i]] = cleanString(l1[i]);
            fullDict[l1[i]] = cleanString(l2[i]);
            console.log(`Added ${l2[i]} => ${l1[i]}`);
            console.log(`Added ${l1[i]} => ${l2[i]}`);
            cutDict[cleanString(l2[i])] = cleanString(l1[i]);
            cutDict[cleanString(l1[i])] = cleanString(l2[i]);
        }
        console.log('Word Lists Refreshed.');
        await alert('Word Lists Refreshed.');
    }

    // toggle answer loop
    async function toggleLoop() {
        TOGGLE = !TOGGLE;
        await alert(TOGGLE ? 'Starting auto-answer.' : 'Stopping auto-answer.');
        if (TOGGLE) answerLoop().catch(e => { console.error(e); TOGGLE = false });
    }

    // toggle enter mode
    async function toggleAuto() {
        ENTER = !ENTER;
        await alert(ENTER ? 'Switched to auto mode.' : 'Switched to semi-auto mode.');
    }

    // show alert in page
    async function alert(msg) {
        await page.evaluate(m => window.alert(m), msg);
    }

    // get modal answer text
    async function getModalAnswered() {
        return await page.$$eval(DIR.modal_user_answered_css + ' > *', els =>
            els.reduce((ans, i) => ans + ((i.textContent && i.style.color !== 'rgba(0, 0, 0, 0.25)') ? i.textContent : ''), '')
        );
    }

    // handle incorrect answer modal
    async function correctAnswer(question, answer) {
        await page.waitForFunction(css => document.querySelector(css).textContent !== 'blau', {}, DIR.modal_question_css);
        const modalAnswer = await page.$eval(DIR.modal_correct_answer_css, el => el.textContent);
        const modalCutAnswer = cleanString(modalAnswer);
        await page.$eval(DIR.continue_button_css, el => el.disabled = false);
        await page.click(DIR.continue_button_css);
        fullDict[question] = modalCutAnswer;
    }

    // cleanup any modals
    async function deleteModals() {
        await page.$$eval(DIR.modal_css, els => els.forEach(i => i.remove()));
        await page.$$eval(DIR.modal_backdrop_css, els => els.forEach(i => i.remove()));
    }

    // generate fallback answer
    function generateRandomString(minLength, maxLength) {
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    }

    // find answer in dict or random
    function findAnswer(question) {
        return fullDict[question] || fullDict[question.replace(',', ';')] || cutDict[cleanString(question)] || generateRandomString(8, 10);
    }

    // main loop
    async function answerLoop() {
        console.log('answerLoop started');
        while (TOGGLE) {
            const question = await page.$eval(DIR.question_css, el => el.textContent);
            const answer = findAnswer(question);
            await page.click(DIR.answer_box_css, { clickCount: 3 });
            await page.keyboard.sendCharacter(answer);
            if (ENTER) await page.keyboard.press('Enter');
            if (await page.$(DIR.modal_css)) {
                await correctAnswer(question, answer);
                await deleteModals();
            }
        }
        console.log('answerLoop stopped');
    }

    // launch browser
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null, handleSIGINT: false });
    const [page] = await browser.pages();

    // bind controls
    await page.exposeFunction('refresh', refreshWords);
    await page.exposeFunction('startAnswer', toggleLoop);
    await page.exposeFunction('toggleMode', toggleAuto);
    await page.exposeFunction('onBtnClick', name => console.log(`Button "${name}" clicked`));

    // inject panel
    page.on('load', async () => {
        try {
            await page.evaluate(() => {
                if (document.querySelector('#ep-control-panel')) return;
                const panel = document.createElement('div');
                panel.id = 'ep-control-panel';
                Object.assign(panel.style, {
                    position: 'fixed', top: '2%', left: '85%', transform: 'translate(-50%, -50%)', background: '#fff', border: '1px solid #ccc', padding: '8px', zIndex: 2147483647
                });
                function makeButton(text, fn) {
                    const btn = document.createElement('button');
                    btn.textContent = text;
                    btn.style.margin = '0 4px';
                    btn.addEventListener('click', () => {
                        window.onBtnClick(text);
                        fn();
                    });
                    return btn;
                }
                const r = makeButton('Refresh', () => window.refresh());
                const s = makeButton('Start/Stop', () => window.startAnswer());
                const m = makeButton('Toggle Mode', () => window.toggleMode());
                panel.append(r, s, m);
                document.body.append(panel);
            });
        } catch (e) { console.error('Panel injection failed:', e); }
    });

    // open and login
    await page.goto(DIR.login_url);
    await page.waitForSelector(DIR.username_css);
    await page.type(DIR.username_css, DIR.email);
    await page.type(DIR.password_css, DIR.password);
    await page.keyboard.press('Enter');
    await page.waitForSelector(DIR.home_css, { timeout: 0 });
    console.log('Logged in and ready');
})();
