// ==UserScript==
// @name         Education Perfected (Auto-Answer) DEV
// @namespace    http://tampermonkey.net/
// @version      0.2.4
// @updateURL    https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @downloadURL  https://raw.githubusercontent.com/KEN-2000l/EducationPerfected/main/script.js
// @description  Basic Script to auto-answer Education Perfect Tasks (and learn basic js)
// @author       KEN_2000
// @match        *://www.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var TOGGLE = false;
    var fullDict;

    console.log('Education Perfected by KEN Loading');

    function wordlistBase() {
        var elements = document.getElementsByClassName('baseLanguage');
        var words = [];
        for (let i = 0; i < elements.length; i++) {
            words.push(elements[i].innerText);
        };
        return words;
    };

    function wordlistTarget() {
        var elements = document.getElementsByClassName('targetLanguage');
        var words = [];
        for (let i = 0; i < elements.length; i++) {
            words.push(elements[i].innerText);
        };
        return words;
    };

    function mergeLists(l1, l2) {
        var mergedWords = {};
        for (let i = 0; i < l1.length; i++) {
            var w1 = l1[i].replace(/ *\([^)]*\) */g, "").split('; ').slice(0, 1);
            var w2 = l2[i].replace(/ *\([^)]*\) */g, "").split('; ').slice(0, 1);
            mergedWords[w2] = w1;
            mergedWords[w1] = w2;
        };
        return mergedWords;
    };

    function nextQuestion() {
        if (TOGGLE = true) {
            setTimeout(answerQuestion, 100);
        };
    };

    function answerQuestion() {
        try {
            var question = document.querySelectorAll('#question-text')[0].innerText;

            if (question != undefined) {
                question = question.replace(/ *\([^)]*\) */g, "").split(', ').slice(0, 1);
                var answer = String(fullDict[question]);

                navigator.clipboard.writeText(answer);

            } else {
                console.log('No Question Found');
            };
            nextQuestion();
        } catch {
            TOGGLE = false;
            console.log('Error');
            alert('Auto-Answer Stopped');
        };
    };

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 82) {
            fullDict = mergeLists(wordlistBase(), wordlistTarget());
            console.log(fullDict);
            alert('Word List Refreshed');
        };
    });

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 65) {
            if (TOGGLE === false) {
                alert('Starting Auto-Answer');
                TOGGLE = true;
                answerQuestion();
            } else if (TOGGLE === true) {
                alert('Stopping Auto-Answer');
                TOGGLE = false;
            };
        };
    });
})();

//End
