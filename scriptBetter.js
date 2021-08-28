// ==UserScript==
// @name         Education Perfected (Auto-Answer)
// @namespace    http://tampermonkey.net/
// @version      1.5.0
// @updateURL    https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/scriptBetter.js
// @downloadURL  https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/scriptBetter.js
// @description  Basic Script to auto-answer Education Perfect Tasks
// @author       KEN_2000, Garv
// @match        *://www.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    let semiTOGGLE = false;
    let autoTOGGLE = false;
    let fullDict = {};
    let loopInterval = 100;
    let failCount = 0;
    let prevQuestion = null;

    console.log("Education Perfected by Garv and KEN Loading");

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function cutString(string) {
        string = String(string.replace(/ *\([^)]*\) */g, "").split("; ")[0]);
        string = String(string.split(", ")[0]);
        return string;
    }

    function wordList(className) {
        const elements = document.getElementsByClassName(className);
        let words = [];
        for (let i = 0; i < elements.length; i++) {
            let word = String(cutString(elements[i].innerText));
            words.push(word);
        }
        return words;
    }

    function mergeLists(l1, l2) {
        let merged = {};
        for (let i = 0; i < l1.length; i++) {
            merged[l2[i]] = l1[i];
            merged[l1[i]] = l2[i];
        }
        return merged;
    }

    function correctAnswer() {
        let correctQ = cutString(document.querySelector("#question-field").innerText);
        let correctA = cutString(document.querySelector("#correct-answer-field").innerText);
        fullDict[correctQ] = correctA;
        console.log('changed ' + correctQ + ' to ' + correctA);
    }

    function copyAnswer(answer) {
        navigator.clipboard.writeText(answer);
    }

    function submitAnswer(answer) {
        console.log('answering ' + answer);
        document.querySelector("#explanation-button").click();
        document.getElementsByTagName("input")[0].value = answer;
    }

    async function answerLoop(answerFunc) {
        while ((semiTOGGLE === true) || (autoTOGGLE === true)) {
            try {
                console.log('a');
                let question = cutString(document.querySelectorAll("#question-text")[0].innerText);

                if (question !== prevQuestion) {
                    failCount = 0;
                    prevQuestion = question;

                    let answer = fullDict[question];
                    answerFunc(answer);

                } else {
                    if (document.querySelector("#correct-answer-field") != null && document.querySelector("#question-field") != null) {
                        await sleep(1000);
                        correctAnswer();
                        await sleep(100);
                        document.querySelector("#continue-button").click();
                    }

                    failCount++;
                    if (failCount > 3) {
                        prevQuestion = null;
                    }
                }

                let keepRevisingButton = document.querySelector("#keep-revising");
                if (keepRevisingButton != null) {
                    keepRevisingButton.click();
                }

            } catch (err) {
                failCount++;
                if (failCount > 20) {
                    semiTOGGLE = false;
                    autoTOGGLE = false;
                    prevQuestion = null;
                    console.log("An Error has occurred.");
                    console.log(err);
                    alert("Error, Auto-Answer Stopped.");
                }
            }
            await sleep(5);
        }
    }

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 82) {
            fullDict = mergeLists(wordList("targetLanguage"), wordList("baseLanguage"));
            console.log(fullDict);
            alert("Word List Refreshed");
        }

        if (event.altKey && event.keyCode === 65) {
            if (semiTOGGLE === false) {
                alert("Starting Semi-Auto-Answer");
                autoTOGGLE = false;
                semiTOGGLE = true;
                answerLoop(copyAnswer);
            } else if (semiTOGGLE === true) {
                alert("Stopping Semi-Auto-Answer");
                semiTOGGLE = false;
            }
        }

        if (event.altKey && event.keyCode === 83) {
            if (autoTOGGLE === false) {
                alert("Starting Fully-Auto-Answer");
                semiTOGGLE = false;
                autoTOGGLE = true;
                answerLoop(submitAnswer);
            } else if (autoTOGGLE === true) {
                alert("Stopping Fully-Auto-Answer");
                autoTOGGLE = false;
            }
        }
    });

})();
