# EducationPerfected
JS script to automatically answer Education Perfect language questions.  
Works for word-word tasks and dash as well.  

Load by copy pasting the contents of the script.js file into your browser's inspect mode console (for example ctrl-shift-i on chrome)

## Semi-Manual Answer
*By using Alt + A, you the correct answer is auto-copied to your clipboard so that it can be pasted into the answer box (assuming you've refreshed the word list to include them all)*

## Auto Answer
*By using Alt + S, you can automatically answer the questions and submit too (how wonderful!) It should ask you for a time interval at which it answers the questions (if you make this too low then it will submit before it has the chance to answer, and will subsequently fail), after which it will just answer through them until you either stop it again (Alt + S) or the list finishes.*

## Hotkeys
Alt + R refreshes question/answer list (When on the page with the word list)  
Alt + A starts the non-funcitonal auto answer (When on the question page)
Alt + S answers the questions at a one second interval each (When on the question page)

**Note: doesn't work on Safari**

### To Do:
- [ ] Create a salter (makes it so the interval between answering the questions isn't consistent)
- [ ] Add Safari compatibility
