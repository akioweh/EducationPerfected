# EducationPerfected
JS script to automatically answer Education Perfect language questions.  
Works for word-word tasks and dash as well.  

## Usage  
### Loading/installing the script  
__There are two versions of this script with the same functionality__:
 - **Plain script**; `console.js` - Load by copy pasting the contents of the `script.js` file into your browser's inspect mode console (for example ctrl-shift-i on chrome)  

 - **Tampermonkey browser extension script**; `tampermonkey.js` - Tampermonkey is a browser extension available for Edge, Chrome, etc. It automatically loads the script on the Education Perfect website so you will not have to open the console ans paste each time. Install by copy pasting the conctents  of `tampermonkey.js` file into a new script in the extension's dashboard, and press `ctrl/cmd + s` to save. After it is saved it should automatically load on the website, and the hotkeys should work.  

### Load Word/Answer List (`Alt + R`)
Before each task, Education Perfect provides a list of words and corresponding translations. This script utilizes the information from that screen to learn the answers for each question.  
**For it to correctly answer all questions, make sure to press `Alt + R` on the word list screen before each new task to refresh the word list.**

### Semi-Manual Answer (`Alt + A`)
Finds answers for each question and copies it to your clipboard. You can then simply press `ctrl/cmd + v` to paste it into the answer box. Press `Alt + A` in the questions screen to start the auto-answering.  

### Fully-Auto Answer (`Alt + S`)
(Thanks to Garv)  
By using `Alt + S`, it will fully-automatically answer and submit all questions (how wonderful!) It should ask you for a time interval (in milliseconds) at which it answers the questions (if you make this too low then it will submit before it has the chance to answer, and will subsequently fail; 100 is recommended), after which it will just answer through them until you either stop it again (Alt + S) or the list finishes.

### Hotkeys  
Alt + R refreshes question/answer list (When on the page with the word list)  
Alt + A starts the clipboard auto answer (When on the question page)  
Alt + S answers the questions at a one second interval each (When on the question page)  

**Note: does not work on Safari**

## To Do:  
- [ ] Create a salter (makes it so the interval between answering the questions isn't consistent)  
- [ ] Add Safari compatibility  
