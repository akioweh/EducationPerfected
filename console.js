(function() {
    'use strict';
    let TOGGLE = false;
    let fullDict;
    let globalTime = 0;

    console.log('Education Perfected by Garv and KEN');

    function wordlistBase() {
        const elements = document.getElementsByClassName('baseLanguage');
        let words = [];
        for (let i = 0; i < elements.length; i++) {
            words.push(elements[i].innerText);
        }
        return words;
    }

    function wordlistTarget() {
        const elements = document.getElementsByClassName('targetLanguage');
        let words = [];
        for (let i = 0; i < elements.length; i++) {
            words.push(elements[i].innerText);
        }
        return words;
    }

    function mergeLists(l1, l2) {
        const mergedWords = {};
        for (let i = 0; i < l1.length; i++) {
            let w1 = l1[i].replace(/ *\([^)]*\) */g, "").split('; ').slice(0, 1);
            w1 = w1[0].replace(/ *\([^)]*\) */g, "").split(', ').slice(0, 1);
            let w2 = l2[i].replace(/ *\([^)]*\) */g, "").split('; ').slice(0, 1);
            w2 = w2[0].replace(/ *\([^)]*\) */g, "").split(', ').slice(0, 1);
            mergedWords[w2] = w1;
            mergedWords[w1] = w2;
        }
        return mergedWords;
    }

    function nextQuestion() {
        if (TOGGLE === true) {
            setTimeout(answerQuestion, 100);
        }
    }

    let doAnswers = () => {
        if (TOGGLE === true) {
            let question = document.querySelectorAll('#question-text')[0].innerText;

            if (question !== undefined) {
                question = question.replace(/ *\([^)]*\) */g, "").split(', ').slice(0, 1);
                const answer = String(fullDict[question]);

                document.getElementsByTagName('button')[7].click();
                document.getElementsByTagName("input")[0].value = answer
                setTimeout(doAnswers, globalTime);
            }
        } else {
            TOGGLE = false
            console.log("the program has been terminated");
        }
    }

    function answerQuestion() {
        try {
            let question = document.querySelectorAll('#question-text')[0].innerText;

            if (question !== undefined) {
                question = question.replace(/ *\([^)]*\) */g, "").split(', ').slice(0, 1);
                const answer = String(fullDict[question]);

                navigator.clipboard.writeText(answer);

            } else {
                console.log('No Question Found');
            }
            nextQuestion();
        } catch {
            TOGGLE = false;
            console.log('Error');
            alert('Auto-Answer Stopped');
        }
    }

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 82) {
            fullDict = mergeLists(wordlistBase(), wordlistTarget());
            console.log(fullDict);
            alert('Word List Refreshed');
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 65) {
            if (TOGGLE === false) {
                alert('Starting Semi-Manual Answer');
                TOGGLE = true;
                answerQuestion();
            } else if (TOGGLE === true) {
                alert('Stopping Semi-Manual Answer');
                TOGGLE = false;
            }
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.altKey && event.keyCode === 83) {
            if (TOGGLE === false) {
                alert('Starting Auto-Answer');
                TOGGLE = true;
                globalTime = prompt("How fast would you like to answer the questions (in milliseconds)")
                doAnswers();
            } else if (TOGGLE === true) {
                alert('Stopping Auto-Answer');
                TOGGLE = false;
            }
        }
    });
})();
