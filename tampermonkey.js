// ==UserScript==
// @name         Education Perfected (Auto-Answer) DEV
// @namespace    http://tampermonkey.net/
// @version      0.3.0
// @updateURL    https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/tampermonkey.js
// @downloadURL  https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/tampermonkey.js
// @description  Basic Script to auto-answer Education Perfect Tasks (and learn basic js)
// @author       KEN_2000, Garv
// @match        *://www.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let TOGGLE = false;
    let fullDict;
    const loopInterval = 100;

    console.log('Education Perfected by Garv and KEN Loading');

    function wordList(className) {
        const elements = document.getElementsByClassName(className);
        let words = []
        for (let i = 0; i < elements.length; i++) {
            let word = String(elements[i].innerText.replace(/ *\([^)]*\) */g, "").split('; ').slice(0, 1))
            word = String(word.split(', ').slice(0, 1))
            words.push(word);
        }
        return words;
    }

    function mergeLists(l1, l2) {
        var merged = {};
        for (let i = 0; i < l1.length; i++) {
            merged[l2[i]] = l1[i];
            merged[l1[i]] = l2[i];
        }
        return merged;
    }

    function findAnswerLoop() {
        try {
            let question = document.querySelectorAll('#question-text')[0].innerText

            if (question != undefined) {
                question = question.replace(/ *\([^)]*\) */g, "").split(', ').slice(0, 1);
                let answer = fullDict[question];
                navigator.clipboard.writeText(answer);
            } else {
                console.log('No Question Found');
            }
            if (TOGGLE === true) {
                setTimeout(findAnswerLoop, loopInterval)
            }
        } catch {
            TOGGLE = false;
            console.log('An Error has occured.');
            alert('Error, Auto-Answer Stopped.');
        }
    }

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 82) {
            fullDict = mergeLists(wordList("targetLanguage"), wordList("baseLanguage"));
            console.log(fullDict);
            alert('Word List Refreshed');
        }
    })

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 65) {
            if (TOGGLE === false) {
                alert('Starting Semi-Auto-Answer');
                TOGGLE = true;
                findAnswerLoop();
            } else if (TOGGLE === true) {
                alert('Stopping Semi-Auto-Answer');
                TOGGLE = false;
            };
        };
    });
})();
