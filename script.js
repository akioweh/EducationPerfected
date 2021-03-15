// ==UserScript==
// @name         Education Perfected (Auto-Answer) DEV
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Shitty script to auto-answer Education Perfect Tasks (and learn basic js)
// @author       KEN_2000
// @match        *://www.educationperfect.com/app/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    var TOGGLE = false;
    var LOOP, fullDict;

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
            var w1 = l1[i].split('; ').slice(-1);
            var w2 = l2[i].split('; ').slice(-1);
            mergedWords[w2] = w1;
            mergedWords[w1] = w2;
        };
        return mergedWords;
    };

    function nextQuestion() {
        if (TOGGLE = true) {setTimeout(answerQuestion, 500)};
    };

    function answerQuestion() {
        try {
            var question = document.getElementById('question-text').childNodes[0].innerText;

            if (question != undefined) {
                console.log('QUESTION: ' + question);
                var answer = String(fullDict[question]);

                if (answer != undefined && answer != 'undefined') {
                    console.log('ANSWER: ' + answer);
                    var answerBox = document.querySelectorAll('#answer-text')[1];
                    // Find out how to input answer?!?!?! It apparently somehow always resets the textbox value if you do x.value = asdf
                    answerBox.value = answer;
                    document.querySelector('#submit-button').click();
                    nextQuestion();
                } else {
                    console.log('No Answer Found');
                    nextQuestion();
                };

            } else {
                console.log('No Question Found');
                nextQuestion();
            };
        } catch {
            TOGGLE = false
            alert('Auto-Answer Stopped')
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

