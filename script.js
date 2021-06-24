// ==UserScript==
// @name         Education Perfected (Auto-Answer) DEV
// @namespace    http://tampermonkey.net/
// @version      0.4.0
// @updateURL    https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/tampermonkey.js
// @downloadURL  https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/tampermonkey.js
// @description  Basic Script to auto-answer Education Perfect Tasks (and learn basic js)
// @author       KEN_2000, Garv
// @match        *://www.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";
    let TOGGLE = false;
    let fullDict;
    let loopInterval = 100;

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

    function copyAnswer(answer) {
        if (document.querySelector("#question-field") != null) {
            setTimeout(function(){ fullDict[cutString(document.querySelector("#question-field").innerText)] = document.querySelector("#correct-answer-field").innerText; }, 1500);
        } else {
            navigator.clipboard.writeText(answer);
        }
    }

    function submitAnswer(answer) {
        if (document.querySelector("#question-field") != null) {
            setTimeout(function(){ fullDict[cutString(document.querySelector("#question-field").innerText)] = document.querySelector("#correct-answer-field").innerText; }, 1500);
            setTimeout(function(){ document.querySelector("#continue-button").click(); }, 500);
        } else {
            document.getElementById("#submit-button").click();
            document.getElementsByTagName("input")[0].value = answer;
        }
    }

    function answerLoop(answerFunc) {
        try {
            let question = document.querySelectorAll("#question-text")[0].innerText;

            if (question !== undefined) {
                question = question.replace(/ *\([^)]*\) */g, "").split(", ").slice(0, 1);
                let answer = fullDict[question];

                answerFunc(answer)

            } else {
                console.log("No Question Found");
            }
            if (TOGGLE === true) {
                setTimeout(function(){answerLoop(answerFunc)}, loopInterval);
            }
        } catch {
            TOGGLE = false;
            console.log("An Error has occured.");
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
            if (TOGGLE === false) {
                alert("Starting Semi-Auto-Answer");
                TOGGLE = true;
                answerLoop(copyAnswer);
            } else if (TOGGLE === true) {
                alert("Stopping Semi-Auto-Answer");
                TOGGLE = false;
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 83) {
            if (TOGGLE === false) {
                loopInterval = parseInt(prompt("How fast would you like to answer the questions (in milliseconds)"))
                alert("Starting Fully-Auto-Answer");
                TOGGLE = true;
                answerLoop(submitAnswer);
            } else if (TOGGLE === true) {
                alert("Stopping Fully-Auto-Answer");
                TOGGLE = false;
            }
        }
    });

})();
