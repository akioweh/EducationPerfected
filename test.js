// ==UserScript==
// @name         Education Perfected (Auto-Answer)
// @namespace    http://tampermonkey.net/
// @version      0
// @description  Auto-answer Education Perfect Tasks at HIGH Speeds
// @author       KEN_2000, Garv
// @match        *://*.educationperfect.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
    let TOGGLE = false;
    let fullDict = {};
    let cutDict = {};

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function sleepUntil(func, timeout) {
        return new Promise((resolve, reject) => {
            let wait = setInterval(function () {
                if (func()) {
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

    function cleanString(string) {
        return String(string)
            .replace(/ *\([^)]*\) */g, "").trim()
            .split(";")[0].trim()
            .split(",")[0].trim()
            .split("|")[0].trim();
    }

    function wordList(className) {
        let words = [];
        document.querySelectorAll("div." + className).forEach(i => words.push(i.innerText));
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

    function deleteModals() {
        document.querySelectorAll("div[uib-modal-window=modal-window]").forEach(i => i.remove());
        document.querySelectorAll("div[uib-modal-backdrop=modal-backdrop]").forEach(i => i.remove());
    }

    function findAnswer(question) {
        let answer = fullDict[question];
        if (answer === undefined) answer = fullDict[question.replace(",", ";")];
        if (answer === undefined) answer = cutDict[cleanString(question)];
        if (answer === undefined) console.log(`No answer found for ${question}`);
        return answer;
    }

    function getModalAnswered() {
        let answered = ""
        Array.from(document.querySelector("td#users-answer-field").children).forEach((el) => {
            if (el.innerText !== null && el.style.color !== "rgba(0, 0, 0, 0.25)") answered = answered + el.innerText
        });
        return answered
    }

    async function correctAnswer(question, answer) {
        await sleepUntil(() => {
            return document.querySelector("td#question-field").innerText !== "blau"
        }, 3000);

        let modalQuestion = document.querySelector("td#question-field").innerText;
        let modalAnswer = document.querySelector("td#correct-answer-field").innerText;
        let modalCutAnswer = cleanString(modalAnswer);
        let modalAnswered = getModalAnswered();

        document.querySelector("button#continue-button").disabled = false;
        document.querySelector("button#continue-button").click();

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

    async function answerLoop() {
        if (TOGGLE) throw Error("Tried to initiate answerLoop while it is already running");

        TOGGLE = true;
        console.log("answerLoop entered.");

        while (TOGGLE) {
            let question = document.querySelector("#question-text").innerText;
            let answer = findAnswer(question);

            document.querySelector("button#explanation-button").click();
            document.querySelector("input#answer-text").value = answer;

            if (document.querySelector("td#question-field") !== null) {
                await correctAnswer(question, answer);
                deleteModals();
            }

            await sleep(0);
        }

        deleteModals();
        console.log('answerLoop Exited.')
    }

    document.addEventListener("keydown", async (event) => {
        let key = event.key.toLowerCase();
        if ((event.altKey && key === "r") || (key === "®")) {
            mergeLists(wordList("targetLanguage"), wordList("baseLanguage"));
            console.log(fullDict, cutDict);
            alert("Word List Refreshed");

        } else if ((event.altKey && key === "s") || (key === "ß")) {
            if (TOGGLE) {
                TOGGLE = false;
                alert("Stopping answerLoop");
            } else {
                alert("Starting answerLoop");
                answerLoop().catch(() => {
                    TOGGLE = false;
                });
            }

        }

    });

    console.log("Education Perfected (optimized.js) by KEN and Garv Loaded.");
})();
