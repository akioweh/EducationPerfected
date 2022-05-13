// v1.0

const puppeteer = require('puppeteer');

(async () => {
    const DIR = {
        login_url: 'https://app.educationperfect.com/app/login',

        // log-in page elements
        username_css: '#login-username',
        password_css: '#login-password',
        login_button_css: '#login-submit-button',

        // task-starter page elements
        baseList_css: 'div.baseLanguage',
        targetList_css: 'div.targetLanguage',
        start_button_css: 'button#start-button-main',

        // task page elements
        modal_question_css: 'td#question-field',
        modal_correct_answer_css: 'td#correct-answer-field',
        modal_user_answered_css: 'td#users-answer-field',
        modal_css: 'div[uib-modal-window=modal-window]',
        modal_backdrop_css: 'div[uib-modal-backdrop=modal-backdrop]',

        question_css: '#question-text',
        answer_box_css: 'input#answer-text',

        exit_button_css: 'button.exit-button',
        exit_continue_button_css: 'button.continue-button',

        continue_button_css: 'button#continue-button',
    }

    // specify chrome version
    const browserFetcher = puppeteer.createBrowserFetcher()
    const revisionInfo = await browserFetcher.download('991974');

    // launch browser
    puppeteer.launch({
        executablePath: revisionInfo.executablePath,
        headless: false,
        defaultViewport: null,
        handleSIGINT: false
    })
        .then(async browser => {
            const page = (await browser.pages())[0];

            // open EP page and log in
            await page.goto(DIR.login_url);
            await page.waitForSelector(DIR.username_css);

            // FILL IN YOUR DETAILS HERE TO LOG IN AUTOMATICALLY
            await page.type(DIR.username_css, 'YOUR EMAIL');
            await page.type(DIR.password_css, 'YOUR PASSWORD');
            await page.click(DIR.login_button_css);

            await page.waitForSelector(DIR.start_button_css, {timeout: 0});


            // auto-answer code starts here
            let TOGGLE = false;
            let fullDict = {};
            let cutDict = {};

            function cleanString(string) {
                return String(string)
                    .replace(/\([^)]*\)/g, "").trim()
                    .split(";")[0].trim()
                    .split(",")[0].trim()
                    .split("|")[0].trim();
            }

            async function wordList(selector) {
                return await page.$$eval(selector, els => {
                    let words = [];
                    els.forEach(i => words.push(i.textContent));
                    return words;
                });
            }

            async function refreshWords() {
                const l1 = await wordList(DIR.baseList_css);
                const l2 = await wordList(DIR.targetList_css);
                for (let i = 0; i < l1.length; i++) {
                    fullDict[l2[i]] = cleanString(l1[i]);
                    fullDict[l1[i]] = cleanString(l2[i]);
                    cutDict[cleanString(l2[i])] = cleanString(l1[i]);
                    cutDict[cleanString(l1[i])] = cleanString(l2[i]);
                }
                console.log('Word Lists Refreshed.')
            }


            // extracts what (EP detected as) the user typed, from the fancy multicolored display
            async function getModalAnswered() {
                return await page.$$eval('td#users-answer-field > *', el => {
                    let answered = '';
                    el.forEach(i => {
                        if (i.textContent !== null && i.style.color !== 'rgba(0, 0, 0, 0.25)') answered = answered + i.textContent;
                    })
                    return answered;
                });
            }

            async function correctAnswer(question, answer) {
                // wait until modal content is fully loaded
                await page.waitForFunction((css) => {
                    return document.querySelector(css).textContent !== "blau";
                }, {}, DIR.modal_question_css);

                // extract modal contents (for debugging and correcting answers)
                let modalQuestion = await page.$eval(DIR.modal_question_css, el => el.textContent);
                let modalAnswer = await page.$eval(DIR.modal_correct_answer_css, el => el.textContent);
                let modalCutAnswer = cleanString(modalAnswer);
                let modalAnswered = await getModalAnswered();

                // dismisses the modal (bypasses the required cooldown)
                await page.$eval(DIR.continue_button_css, el => el.disabled = false);
                await page.click(DIR.continue_button_css);

                // update/correct answer dictionary
                fullDict[question] = modalCutAnswer;

                let log = "===== Details after Incorrect Answer: =====\n"
                log = log + `Detected Question: \n => ${question}\n`;
                log = log + `Inputted Answer: \n => ${answer}\n\n`;
                log = log + `Modal Question: \n => ${modalQuestion}\n`;
                log = log + `Modal Full Answer: \n => ${modalAnswer}\n`;
                log = log + `Modal Cut Answer: \n => ${modalCutAnswer}\n`;
                log = log + `Modal Detected Answered: \n => ${modalAnswered}\n\n\n`;

                console.log(log);
            }

            // deletes all existing modals and backdrops. Used to force-speed things up
            async function deleteModals() {
                await page.$$eval(DIR.modal_css, el => {
                    el.forEach(i => i.remove())
                });
                await page.$$eval(DIR.modal_backdrop_css, el => {
                    el.forEach(i => i.remove())
                });
            }

            // very advanced logic (ofc) used to find matching answer
            function findAnswer(question) {
                let answer = fullDict[question];
                if (answer) return answer;
                answer = fullDict[question.replace(",", ";")];
                if (answer) return answer;
                answer = cutDict[cleanString(question)];
                if (answer) return answer;
                console.log(`No answer found for ${question}`);
                return undefined;
            }

            // main function that continually answers questions until completion modal pops up or hotkey pressed again
            async function answerLoop() {
                if (TOGGLE) throw Error("Tried to initiate answerLoop while it is already running");

                TOGGLE = true;
                console.log("answerLoop entered.");

                while (TOGGLE) {
                    let question = await page.$eval(DIR.question_css, el => el.textContent);
                    let answer = findAnswer(question);

                    await page.click(DIR.answer_box_css, {clickCount: 3});
                    page.keyboard.sendCharacter(answer);
                    page.keyboard.press('Enter');

                    // special case: modal pops up
                    if (await page.$(DIR.modal_css)) {
                        // incorrect answer and modal pops up; initiate answer-correction procedure
                        if (await page.$(DIR.modal_question_css) !== null) {
                            await correctAnswer(question, answer);
                            await deleteModals();
                            // list complete; clicks button to exit
                        } else if (await page.$(DIR.exit_button_css)) {
                            await page.click(DIR.exit_button_css);
                            break;
                        } else if (await page.$(DIR.exit_continue_button_css)) {
                            await page.click(DIR.exit_continue_button_css);
                            break;
                        } else {
                            // no idea what the modal is for so let's just pretend it doesn't exist
                            await deleteModals();
                        }
                    }
                }

                await deleteModals();
                console.log('answerLoop Exited.');
            }

            // takes care of answerLoop toggling logic
            function toggle() {
                if (TOGGLE) {
                    TOGGLE = false;
                    console.log("Stopping answerLoop.");
                } else {
                    console.log("Starting answerLoop.");
                    answerLoop().catch(e => {
                        console.error(e);
                        TOGGLE = false
                    });
                }
            }

            function print(key) {
                console.log(key);
            }

            await page.exposeFunction('refresh', refreshWords);
            await page.exposeFunction('start', toggle);
            await page.exposeFunction('print', print);

            await page.evaluate(() => {
                document.addEventListener("keyup", async (event) => {
                    let key = event.key.toLowerCase();
                    if (key !== 'alt') {
                        if ((event.altKey && key === "r") || (key === "®")) {
                            await window.refresh();
                        } else if ((event.altKey && key === "s") || (key === "ß")) {
                            window.start();
                        }
                    }
                });
            });
            console.log('Education Perfected V2 Loaded.');
        });
})();
