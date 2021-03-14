// ==UserScript==
// @name         Education Perfected (Auto-Answer) DEV
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Shitty script to F**k Education Perfect Tasks (and learn basic js)
// @author       KEN_2000
// @match        *://www.educationperfect.com/app/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('Education Perfected by KEN Loading')

    function wordlistBase() {
        var elements = document.getElementsByClassName('baseLanguage');
        var words = []
        for (let i = 0; i < elements.length; i++) {
        words.push(elements[i].innerText)
        }
        console.log(words);
        return words
    }

    function wordlistTarget() {
        var elements = document.getElementsByClassName('targetLanguage');
        var words = []
        for (let i = 0; i < elements.length; i++) {
        words.push(elements[i].innerText)
        }
        console.log(words);
        return words
    }

    function mergeLists(l1, l2) {
        var mergedWords = {}
        for (let i = 0; i < l1.length; i++) {
            var w1 = l1[i].split('; ').slice(-1)
            var w2 = l2[i].split('; ').slice(-1)
            mergedWords[w2] = w1;
            mergedWords[w1] = w2;
        }
        return mergedWords
    }

    document.addEventListener("keydown", (event) => {
        if(event.shiftKey && event.keyCode === 84) {
            var fullDict = mergeLists(wordlistBase(), wordlistTarget());
            console.log(fullDict)
        }
    });

})();
