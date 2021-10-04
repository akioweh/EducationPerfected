// ==UserScript==
// @name         Education Perfected (Auto-Answer)
// @namespace    http://tampermonkey.net/
// @version      1.1.3
// @updateURL    https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @downloadURL  https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @description  Auto-answer Education Perfect Tasks at HIGH Speeds
// @author       KEN_2000, Garv
// @match        *://*.educationperfect.com/*
// @grant        none
// ==/UserScript==

(async function () {
    "use strict";
    let semiTOGGLE = false;
    let autoTOGGLE = false;
    let fullDict = {};
    let cutDict = {};
    let answerSub = "";
    let msg = "";

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function cutString(string) {
        string = String(string.replace(/ *\([^)]*\) */g, "").split("; ")[0]);
        string = String(string.split(", ")[0]);
        return string;
    }

    function wordList(className) {
        let words = [];
        document.querySelectorAll("div." + className).forEach(i => words.push(i.innerText));
        return words;
    }

    function mergeLists(l1, l2) {
        for (let i = 0; i < l1.length; i++) {
            fullDict[l2[i]] = cutString(l1[i]);
            fullDict[l1[i]] = cutString(l2[i]);
            cutDict[cutString(l2[i])] = cutString(l1[i]);
            cutDict[cutString(l1[i])] = cutString(l2[i]);
        }
    }

    async function submitButton() {
        let explanation = document.querySelector("button#explanation-button");
        if (explanation) return explanation;
        console.log("didn't find hax button");
        return document.querySelector("button.submit-button");
    }

    function deleteModals() {
        document.querySelectorAll("div[uib-modal-window=modal-window]").forEach(i => i.remove());
        document.querySelectorAll("div[uib-modal-backdrop=modal-backdrop]").forEach(i => i.remove());
    }

    function findAnswer(question) {
        let answer = fullDict[question];
        if (answer === undefined) answer = fullDict[question.replace(",", ";")];
        if (answer === undefined) answer = cutDict[cutString(question)];
        return answer
    }

    async function correctAnswer(question) {
        msg = msg + "Thought question: \n" + question + "\n";
        for (let i = 0; i < 300; i++) {
            if (cutString(document.querySelector("td#question-field").innerText) === cutString(question)) break;
            await sleep(10);
        }
        msg = msg + "Modal question: " + document.querySelector("td#question-field").innerText + "\n";
        let answer = cutString(document.querySelector("td#correct-answer-field").innerText);
        document.querySelector("button#continue-button").disabled = false;
        document.querySelector("button#continue-button").click();
        msg = msg + "Modal cut answer: \n" + answer + "\n";
        fullDict[question] = answer;
    }

    async function submitAnswer(answer) {
        msg = "Thought answered: \n" + answer + "\n";
        (await submitButton()).click();
        document.querySelector("input#answer-text").value = answer;
    }

    async function answerLoop() {
        let failCount = 0;
        while (semiTOGGLE || autoTOGGLE) {
            try {
                let question = document.querySelector("#question-text").innerText;
                let answer = findAnswer(question);
                if (answer === undefined) console.log("no answer found");
                answerSub = answer
                if (autoTOGGLE === true) {
                    await submitAnswer(answerSub);
                }

                if (document.querySelector("td#correct-answer-field") != null && document.querySelector("#question-field") != null) {
                    await correctAnswer(question);
                    console.log(msg);
                    msg = "";
                    deleteModals();
                }
                failCount = 0;
            } catch (err) {
                failCount++;
                if (failCount > 30) {
                    semiTOGGLE = false;
                    autoTOGGLE = false;
                    console.log(err);
                    deleteModals();
                    alert("Error, Auto-Answer Stopped.");
                }
            }
            await sleep(0);
        }
    }

    document.addEventListener("keydown", async (event) => {
        if ((event.altKey && event.key.toLowerCase() === "r") || (event.key.toLowerCase() === "®")) {
            mergeLists(wordList("targetLanguage"), wordList("baseLanguage"));
            console.log(fullDict, cutDict);
            alert("Word List Refreshed");
        }

        else if ((event.altKey && event.key.toLowerCase() === "a") || (event.key.toLowerCase() === "å")) {
            if (semiTOGGLE === false) {
                autoTOGGLE = false;
                semiTOGGLE = true;
                await sleep(10);
                alert("Starting Semi-Auto-Answer");
                await answerLoop();
            } else {
                deleteModals();
                alert("Stopping Semi-Auto-Answer");
                semiTOGGLE = false;
            }
        }

        else if ((event.metaKey && semiTOGGLE === true) || (event.ctrlKey && semiTOGGLE === true)) {
            navigator.clipboard.writeText(answerSub).then(function(arr) {}, function(arr) {
                console.log(`Failed to Copy Answer: ${arr}`)
            });
        }

        else if ((event.altKey && event.key.toLowerCase() === "s") || (event.key.toLowerCase() === "ß")) {
            if (autoTOGGLE === false) {
                semiTOGGLE = false;
                autoTOGGLE = true;
                await sleep(10);
                alert("Starting Fully-Auto-Answer");
                await answerLoop();
            } else {
                deleteModals();
                alert("Stopping Fully-Auto-Answer");
                autoTOGGLE = false;
            }
        }
    });
    console.log("Education Perfected by KEN and Garv Loaded");
})();
