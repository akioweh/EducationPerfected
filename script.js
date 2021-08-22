// ==UserScript==
// @name         Education Perfected (Auto-Answer)
// @namespace    mailto:gshah.6110@gmail.com
// @version      0.5.0
// @updateURL    https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @downloadURL  https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @description  Basic Script to auto-answer Education Perfect Tasks
// @author       KEN_2000, Garv
// @match        *://www.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    let semiTOGGLE = false;
    let autoTOGGLE = false;
    let fullDict;
    let loopInterval = 100;
    let answerSub = ""

    console.log("Education Perfected by Garv and KEN Loading");

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

    function mergeLists(l1, l2) {
        let merged = {};
        for (let i = 0; i < l1.length; i++) {
            merged[l2[i]] = l1[i];
            merged[l1[i]] = l2[i];
        }
        return merged;
    }

    function cutString(string) {
        string = String(string.replace(/ *\([^)]*\) */g, "").split("; ").slice(0, 1));
        string = String(string.split(", ").slice(0, 1));
        return string
    }

    function copyAnswer(answer) {}

    function submitAnswer(answer) {
        if (document.querySelector("#question-field") != null) {
            setTimeout(function(){ fullDict[cutString(document.querySelector("#question-field").innerText)] = document.querySelector("#correct-answer-field").innerText.split(" | ")[0]; }, 1500);
            setTimeout(function(){ document.querySelector("#continue-button").click(); }, 2000);
        } else {
            document.getElementsByTagName('button')[7].click();
            document.getElementsByTagName("input")[0].value = answer;
        }
    }

    function answerLoop(answerFunc) {
        try {
            let question = document.querySelectorAll("#question-text")[0].innerText;

            if (question !== undefined) {
                question = question.replace(/ *\([^)]*\) */g, "").split(", ").slice(0, 1);
                answerSub = fullDict[question];

                answerFunc(answerSub)

            } else {
                console.log("No Question Found");
            }
            if ((semiTOGGLE === true) || (autoTOGGLE === true)) {
                setTimeout(function(){answerLoop(answerFunc)}, loopInterval);
            }
        } catch (err) {
            semiTOGGLE = false;
            autoTOGGLE = false;
            console.log("An Error has occurred.");
            console.log(err);
            alert("Error, Auto-Answer Stopped.");
        }
    }

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 82) {
            fullDict = mergeLists(wordList("targetLanguage"), wordList("baseLanguage"));
            console.log(fullDict);
            alert("Word List Refreshed");
        }
    })

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 65) {
            if (semiTOGGLE === false) {
                alert("Starting Semi-Auto-Answer");
                semiTOGGLE = true;
                answerLoop(copyAnswer);
            } else if (semiTOGGLE === true) {
                alert("Stopping Semi-Auto-Answer");
                semiTOGGLE = false;
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if ((event.metaKey && semiTOGGLE === true) || (event.ctrlKey && semiTOGGLE === true)) {
            navigator.clipboard.writeText(answerSub).then(function(arr) {}, function(arr) {
                console.log(`Failed to Copy Answer: ${arr}`)
            });
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 83) {
            if (autoTOGGLE === false) {
                loopInterval = parseInt(prompt("How fast would you like to answer the questions (in milliseconds)"))
                alert("Starting Fully-Auto-Answer");
                autoTOGGLE = true;
                answerLoop(submitAnswer);
            } else if (autoTOGGLE === true) {
                alert("Stopping Fully-Auto-Answer");
                autoTOGGLE = false;
            }
        }
    });

})();
