// ==UserScript==
// @name         Education Perfected (Auto-Answer)
// @namespace    mailto:gshah.6110@gmail.com
// @version      1.0.0
// @updateURL    https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @downloadURL  https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @description  Basic Script to auto-answer Education Perfect Tasks
// @author       KEN_2000, Garv
// @match        *://www.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    // List of global variables
    let semiTOGGLE = false;
    let autoTOGGLE = false;
    let fullDict = {};
    let failCount = 0;
    let prevQuestion = null;
    let loopInterval = 10;
    let answerSub = ""

    console.log("Education Perfected by Garv and KEN Loaded");

    // These are all internal functions which are usd quite frequently

    // Sets both toggles
    function setToggle(semiState, autoState) {
        semiTOGGLE = semiState;
        autoTOGGLE = autoState;
    }

    // Simple sleep function used for **speed**
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Gets the list of words from the specified class. Used solely to declare fullDict
    function wordList(className) {
        const elements = document.getElementsByClassName(className);
        let words = [];
        for (let i = 0; i < elements.length; i++) {
            let word = String(elements[i].innerText.replace(/ *\([^)]*\) */g, "").split("; ").slice(0, 1));
            word = String(word.split(", ").slice(0, 1));
            words.push(word);
        }
        return words;
    }

    // Merges to lists
    function mergeLists(l1, l2) {
        let merged = {};
        for (let i = 0; i < l1.length; i++) {
            merged[l2[i]] = l1[i];
            merged[l1[i]] = l2[i];
        }
        return merged;
    }

    // Cuts a string to be of the specified format so that they are all consistent
    function cutString(string) {
        string = String(string.replace(/ *\([^)]*\) */g, "").split("; ").slice(0, 1));
        string = String(string.split(", ").slice(0, 1));
        return string
    }

    // Submits the answer :D
    function submitAnswer(answer) {
        console.log('answering ' + answer);
        document.querySelector("#explanation-button").click();
        document.getElementsByTagName("input")[0].value = answer;
    }

    // The main loop, which runs as specified in the loopInterval
    async function answerLoop() {
        while ((semiTOGGLE === true) || (autoTOGGLE === true)) {
            try {
                let question = cutString(document.querySelectorAll("#question-text")[0].innerText);

                if (question !== prevQuestion) {
                    failCount = 0;
                    prevQuestion = question;

                    answerSub = fullDict[question];
                    if (autoTOGGLE === true) {
                        submitAnswer(answerSub);
                    }

                } else {
                    if (document.querySelector("#correct-answer-field") != null && document.querySelector("#question-field") != null) {
                        await sleep(1000);
                        let correctQ = cutString(document.querySelector("#question-field").innerText);
                        let correctA = cutString(document.querySelector("#correct-answer-field").innerText);
                        fullDict[correctQ] = correctA;
                        console.log('changed ' + correctQ + ' to ' + correctA);
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
            await sleep(loopInterval);
        }
    }

    // This adds an event listener which reacts appropriately based on the keyboard keys being clicked
    document.addEventListener("keydown", (event) => {
        // Opt/Alt + S
        if ((event.altKey && event.keyCode === 83) || (event.altKey && event.key === 's')) {
            if (autoTOGGLE === false) {
                loopInterval = parseInt(prompt("How fast would you like to answer the questions (in milliseconds)"))
                alert("Starting Fully-Auto-Answer");
                setToggle(false, true);
                answerLoop();
            } else if (autoTOGGLE === true) {
                alert("Stopping Fully-Auto-Answer");
                loopInterval = 10;
                setToggle(false, false);
            }
        }
        // Cmd/Ctrl
        else if ((event.metaKey && semiTOGGLE === true) || (event.ctrlKey && semiTOGGLE === true)) {
            navigator.clipboard.writeText(answerSub).then(function(arr) {}, function(arr) {
                console.log(`Failed to Copy Answer: ${arr}`)
            });
        }
        // Opt/Alt + A
        else if ((event.altKey && event.keyCode === 65) || (event.altKey && event.key === 'a')) {
            if (semiTOGGLE === false) {
                alert("Starting Semi-Auto-Answer");
                loopInterval = 10;
                setToggle(true, false);
                answerLoop();
            } else if (semiTOGGLE === true) {
                alert("Stopping Semi-Auto-Answer");
                setToggle(false, false);
            }
        }
        // Opt/Alt + R
        else if ((event.altKey && event.keyCode === 82) || (event.altKey && event.key === 'r')) {
            fullDict = mergeLists(wordList("targetLanguage"), wordList("baseLanguage"));
            console.log(fullDict);
            alert("Word List Refreshed");
        }
    });
})();
