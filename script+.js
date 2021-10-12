// ==UserScript==
// @name         Education Perfectionist
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Auto-answer Education Perfect Tasks at HIGH Speeds
// @author       KEN_2000, Garv
// @match        *://*.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

let fullDict = {};
let cutDict = {};
let msg = '';
let urlCache = '';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ifExistsDo(selector, func) {
    const element = document.querySelector(selector);
    if (element) await func(element);
    return Boolean(element);
}

async function sleepUntil(f, timeout) {
    return new Promise((resolve, reject) => {
        let wait = setInterval(function() {
            if (f()) {
                clearInterval(wait);
                resolve();
            }
        }, 10);

        setTimeout(() => {
            clearInterval(wait);
            reject();
        }, timeout)
    });
}

function untilElement(selector, timeout) {
    let hasChanged = false;

    return new Promise((resolve, reject) => {
        Array.from(document.querySelectorAll(selector)).forEach((el) => {
            hasChanged = true;
            resolve(el);
        });
        const observer = new MutationObserver(() => {
            Array.from(document.querySelectorAll(selector)).forEach((el) => {
                hasChanged = true;
                resolve(el);
                observer.disconnect();
            });
        });

        setTimeout(() => {
            if (!hasChanged) {
                observer.disconnect();
                reject(selector)
            }
        }, timeout);

        observer.observe(document.documentElement, {childList: true, subtree: true});
    });
}

async function untilURLChange(timeout) {
    urlCache = window.location.href;
    return new Promise(resolve => sleepUntil(() => {
        return window.location.href !== urlCache;
    }, timeout).then(resolve).catch(resolve));
}

function cleanString(string) {
    string = String(string.replace(/ *\([^()]*\) */g, '').split('; ')[0]);
    string = string.split(', ')[0];
    return string;
}

function wordList(selector) {
    const words = [];
    document.querySelectorAll(selector).forEach(i => words.push(i.innerText));
    return words;
}

function mergeLists(l1, l2) {
    for (let i = 0; i < l1.length; i++) {
        fullDict[l2[i]] = cleanString(l1[i]);
        fullDict[l1[i]] = cleanString(l2[i]);
        cutDict[cleanString(l2[i])] = cleanString(l1[i]);
        cutDict[cleanString(l1[i])] = cleanString(l2[i]);
    }
}

function submitButton() {
    if (!ifExistsDo('button#explanation-button', (el) => {el.click()}) ) {
        document.querySelector('button.submit-button').click();
    }
}

function deleteModals() {
    document.querySelectorAll('div[uib-modal-window=modal-window]').forEach(i => i.remove());
    document.querySelectorAll('div[uib-modal-backdrop=modal-backdrop]').forEach(i => i.remove());
}

function findAnswer(question) {
    let answer = fullDict[question];
    if (answer === undefined) answer = fullDict[question.replace(',', ';')];
    if (answer === undefined) answer = cutDict[cleanString(question)];
    return answer;
}

async function correctAnswer(question) {
    await sleepUntil(() => {return document.querySelector('td#question-field').innerText !== 'blau'}, 3000).catch();
    msg = msg + `Extracted Question: ${question}\n`;
    msg = msg + `Correct question: ${document.querySelector('td#question-field').innerText}\n`;

    const answer = document.querySelector('td#correct-answer-field').innerText;
    document.querySelector('button#continue-button').disabled = false;
    document.querySelector('button#continue-button').click();

    fullDict[question] = answer;
    msg = msg + `Correct answer: ${answer}\n`;
    console.log(msg);
    deleteModals();
}

async function answerLoop() {
    let fails = 0;
    while (true) {
        try {
            let question = document.querySelector('#question-text').innerText;
            let answer = findAnswer(question);

            msg = `Extracted answer: ${answer}\n`;
            submitButton();
            document.querySelector('input#answer-text').value = answer;

            await ifExistsDo('td#correct-answer-field', async () => await correctAnswer(question));
            await ifExistsDo('button.continue-button', el => el.click());
            fails = 0;
        } catch (err) {
            fails++;
            console.log(err);
            if (fails > 30) break;
        }
        await sleep(0);
    }

    await sleepUntil(() => {
        const continueButton = document.querySelector('#start-button-main');
        return continueButton !== null && continueButton.innerText === 'Continue'
    }, 3000).catch();
    document.querySelector('#start-button-main').disabled = false;
    document.querySelector('#start-button-main').click();

    deleteModals();
}

async function startAnswer() {
    await ifExistsDo('#full-list-switcher', async el => {el.click(); await sleep(200)});

    await sleep(400);
    await mergeLists(wordList('div.targetLanguage'), wordList('div.baseLanguage'));
    console.log(fullDict, cutDict);

    document.querySelector('.main-text.ng-binding.infinity').click();

    document.querySelector('#start-button-main').click(); await sleep(100);

    if (document.querySelector('.modal-header.ng-scope') !== null && document.querySelector('.modal-header.ng-scope').innerText === 'No more stars available') {
        await sleep(200);
        document.querySelector('#modal-close-button').click();
        deleteModals();
        return;
    }
    await answerLoop();
    await untilElement('li.mode-0', 5000).catch();
}

async function completeTask() {
    await ifExistsDo('li.mode-0', async el => {
        el.click();
        await startAnswer();
    });
    await ifExistsDo('li.mode-1', async el => {
        el.click();
        await startAnswer();
    });
    console.log('Completed one task.');
}

// let subjects = document.querySelectorAll('div.subject-title');

const notLoading = () => {
    let spins = Array.from(document.querySelectorAll('.EdsSpinner_eds-component_2tfd5'));
    let unspins = Array.from(document.querySelectorAll('.EdsSpinner_eds-component_2tfd5[block="true"]'));
    spins = spins.filter(el => !unspins.includes(el));
    return spins.length === 0;
};

async function completeFolder() {
    await sleepUntil(notLoading, 7000).catch();
    console.log(`Called with url ${window.location.href}`);
    const items = document.querySelectorAll('div.crumb-child.item');
    // const activities = [];
    // Array.from(document.querySelectorAll('path[fill="#ffb100"]')).forEach(
    //     el => activities.push(el.parentNode.parentNode.parentNode.parentNode.parentNode));
    const vocabs = [];
    Array.from(document.querySelectorAll('path[fill="#3838ea"]')).forEach(
        el => vocabs.push(el.parentNode.parentNode.parentNode.parentNode.parentNode));
    const folders = [];
    Array.from(document.querySelectorAll('div.folder-icon')).forEach(
        el => folders.push(el.parentNode.parentNode));

    for (let j = 0; j < items.length; j++) {
        const i = items[j];
        if (vocabs.includes(i)) {
            document.querySelectorAll('div.crumb-child.item')[j].click();
            await untilURLChange(30000).catch();
            await sleepUntil(notLoading, 7000).catch();
            await completeTask();
        } else if (folders.includes(i)) {
            document.querySelectorAll('div.crumb-child.item')[j].click();
            await sleepUntil(notLoading, 7000).catch();
            await completeFolder();
            console.log('Completed one folder.');
        } else {
            continue;
        }
        await untilElement('div.back-arrow', 3000).then(el => el.click()).catch();
        await sleepUntil(notLoading, 7000).catch();
    }
}

async function completeSubject() {
    untilElement('#subject-browse-button', 5000)
        .then(el => el.click())
        .catch();
    await untilURLChange(30000).catch();
    await completeFolder(window.location.href);
}

const epHome = () => {return Boolean(window.location.href.match(/^https?:\/\/app.educationperfect.com\/app\/#\/dashboard\/$/gi))};
const subjectHome = () => {return Boolean(window.location.href.match(/^https?:\/\/app.educationperfect.com\/app\/#\/dashboard\/(?!(tasks|competitions|history)\b)\b\w+\/$/gi))};
const subjectBrowser = () => {return Boolean(window.location.href.match(/^https?:\/\/app.educationperfect.com\/app\/#\/dashboard\/(?!(tasks|competitions|history)\b)\b\w+\/content\//gi))};

(async function () {
    document.addEventListener('keydown', async (event) => {
        if ((event.altKey && event.key.toLowerCase() === "s") || (event.key.toLowerCase() === "ß")) {
            // if (epHome()) await completeAll();
            if (subjectHome()) await completeSubject();
            if (subjectBrowser()) await completeFolder();
            if (window.location.href.includes('/list-starter')) await completeTask();
        }
    });
})();
