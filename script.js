// ==UserScript==
// @name         Education Perfected (Auto-Answer)
// @namespace    mailto:gshah.6110@gmail.com
// @version      0.5.2
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
    let fullDict;
    let loopInterval = 10;
    let answerSub = ""

    console.log("Education Perfected by Garv and KEN Loaded");

    // These are all internal functions which are usd quite frequently

    // Sets both toggles
    function setToggle(semiState, autoState) {
        semiTOGGLE = semiState;
        autoTOGGLE = autoState;
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

    // Submits the answer
    function submitAnswer(answer) {
        if (document.querySelector("#question-field") != null) {
            setTimeout(function(){ fullDict[cutString(document.querySelector("#question-field").innerText)] = document.querySelector("#correct-answer-field").innerText.split(" | ")[0]; }, 1500);
            setTimeout(function(){ document.querySelector("#continue-button").click(); }, 2000);
        } else {
            document.getElementsByTagName('button')[7].click();
            document.getElementsByTagName("input")[0].value = answer;
        }
    }

    // The main loop, which runs as specified in the loopInterval
    function answerLoop() {
        // Presuming there's a question, it grabs the relevant answer from fullDict
        try {
            let question = document.querySelectorAll("#question-text")[0].innerText;

            if (question !== undefined) {
                answerSub = fullDict[cutString(question)];

                if (autoTOGGLE === true) {
                    // If we are in fully-automatic, the script automatically submits the answer
                    submitAnswer(answerSub)
                }
            } else {
                console.log("No Question Found");
            }

            // Calls the loop again
            if ((semiTOGGLE === true) || (autoTOGGLE === true)) {
                setTimeout(function(){answerLoop()}, loopInterval);
            }
        } catch (err) {
            setToggle(false, false)
            console.log("An Error has occurred.");
            console.log(err);
            alert("Error, Auto-Answer Stopped.");
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
