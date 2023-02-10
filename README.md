# EducationPerfected
#### Javascript program to automatically answer Education Perfect language questions at **high** speeds.
Works for word-to-word (translation) tasks and Dash mode.  
**Does not work with Audio-based tasks, YET.**


![example image](result.png)


**CURRECT STATUS: ALL intended features functional.~~*~~**  
~~_*There were some reports of anti-cheat detection, but reproduction is inconsistent_~~


## Introduction
This project began as a way automate tasks on [Education Perfect](https://www.educationperfect.com/) 
which teachers use to set students (of various ages) homework... and one of those students happened to be me.
As a perfectionist myself, I set out to perfect Education Perfect - making EducationPerfected.  
The main goal/target were and still are language tasks that require you to translate words/phrases from one language
to another.  
Of course, there are also tasks in the same format but with audio involved. _Unfortunately, we (me or any
other kind contributors) have not been able to automate those tasks._

The obvious approach was to write a simple userscript in Javascript that works by being injected into the browser 
debugger console. This is the classic method to perform simple automation in browsers. This method is simple, 
cross-platform, and required minimal skill to install & run the script - it was very easy and universal.  
_This was [V1](V1_Archive) of this project._  
It worked great, and most notably, at **high** speeds. However, Education Perfect, after a long while, released 
anti-cheat features that partially disabled the userscript.

To circumvent this, the script needed more control over the web page and must not run in the page debugger console.  
_This is now V2 of this project:_  
**At the current stage**, it is an independent Javascript ([node.js](https://nodejs.org/)) program uses the 
[Puppeteer](https://github.com/puppeteer/puppeteer) library to carry out web-browser automation. The goal is the same
as V1 and the functionality is largely the same. Unfortunately, the standalone structure does make installation slightly 
more complicated, but it is currently the only way to enable full anti-cheat bypass.  
Either way, I have provided detailed instructions for installation and usage below.


## Installation
1. download the EducationPerfected program and starter script ([index.js](index.js) and [start.cmd](start.cmd) or [start.sh](start.sh) found above) and place them in the same folder
2. install [node.js](https://nodejs.org/)
3. open Command Prompt/Terminal **in the folder where `index.js is` located** (right click -> open in terminal or use the `cd` command to change the directory)
4. install the Puppeteer library by running `npm i puppeteer` in your opened Command Prompt/Terminal window*
5. edit the downloaded script (using notepad) to fill in your **EP credentials** at **lines 7 & 8** if you want auto-login\*\*


_*...or whatever method is used to install js libraries on your platform... Google it if necessary._  
_\*\*yes, this program is completely safe and will not steal your password or anything... Ask anyone who understands
Javascript code. Make sure you replace only `YOUR EMAIL` with your exact email used to log in to EP (keep everything 
else in that line intact, including the quote characters); same for `YOUR PASSWORD`_

*NOTE: if Puppeteer complains about the lack of a Chromium browser the first time you run it, open up Terminal and run 
`node node_modules/puppeteer/install.js` to manually install the browser that is supposed to be bundled with Puppeteer.*


## Usage
### Running the script

Once installed, there are different ways to run the script using Node.js, but the basic way is to open up Terminal and 
type `node "[path to file]"` - e.g. `node "C:\index.js"` (unless .js when, double-clicked, executes with node by default)  

Alternatively, I have provided simple "start" scripts that basically saves the above command in a simple shell script
that you can double-click to run. [start.cmd](start.cmd) is for Windows, and [start.sh](start.sh) is for Linux/Mac (bash).
Save the appropriate starter script in the ***same** folder as index.js* and double-click it to run the script.

You can close the browser window or the popped-up terminal window whenever you are done.  
If you run into weird behavior, try restarting the program.

### Features
**Start Answering**: There is one main function - automatically answer questions when doing a task.  
It reads each question, finds the answer from the pre-learned dictionary, and submits it... all at **high** speeds.
There are also additional features such deleting popup modals when an answer is wrong to increase speed and learning
from mistakes.

**Toggle Mode**: There are (currently) two "modes" of auto-answer: fully-auto and semi-auto.  
Fully-auto will complete the task at **high** speeds once initiated, without intervention. Semi-auto will type the 
answer in for you, but leave pressing the enter key/submit button to you, so you can control how fast and when it 
answers. (Useful if you teacher checks how long you spend on tasks.)

**Refresh Words**: There is also a supplementary action which is learning the answers from the world lists present at the task starter
pages. (Where the words and translations are laid out.)  
This function must be manually triggered for each new task with new words, otherwise you will get a lot of questions
wrong when the program do not know the answers. (It will learn all of them eventually, thanks to error-correction
features, but it is a lot slower.)

All three functions (**Start Answering**, **Toggle Mode**, and **Refresh Words**) are triggered by keyboard shortcuts
outlined below.

### Hotkeys
Upon loading/injecting, the script does not do anything.  
**All functions are triggered via *hotkeys/keybindings* as listed below:**

- **Refresh Words -> <kbd>Opt/Alt</kbd> + <kbd>R</kbd>:**  
  *To be used on task-starter page with list of words and translations*  
  Will alert you when successfully triggered.

- **Mode Toggle -> <kbd>Opt/Alt</kbd> + <kbd>A</kbd>:**  
  *Can be used whenever*  
  Can toggle answering mode on-the-fly even with Auto Answering active.  
  Will alert you when successfully triggered.

- **Start Answering -> <kbd>Opt/Alt</kbd> + <kbd>S</kbd>:**  
  *To be used on a running task's page (after clicking start)*  
  The Auto Answering can be stopped by pressing the same hotkey again.  
  No Alerts because it is obvious when it is running.

*NOTE: due to how key combination detection works, the sequence you press the keys must be precise to trigger the
functions; PRESS Alt, PRESS & RELEASE letter key, RELEASE Alt... If you release Alt before releasing the letter key,
it won't be detected.*


## Details
### Expected behavior
When you run the script, it should:  
* Open a new browser window (that does not have any user data, so you must log in to EP manually. Alternatively, fill 
in your details in the script file at line 7 & 8 for auto-login);  
* Load EP home page;  
* All anto-answer functionality is loaded in the background, ready to be used whenever;  
* Log in for you if you provided your credentials.  

Then, you can:  
* Log in manually if you _really_ want to (why?);
* Navigate through or use EP as normal;  
* At appropriate pages (task starter, task page), use the hotkeys to answer questions.

When auto-answering is triggered, it should:
* Immediately start grinding through tasks at speeds of 5-20+ questions per second
* Stop when it finishes the task
* Stop when you press the same hotkeys again
* Quickly _delete_ the popup modals should it get any questions wrong

_NOTE: If you close the terminal window that pops up when you run the script, the browser window will close too_

### Feature-Explanation
- **Full Speed Auto Answer:**  
  The current speed is the maximum achievable so far. It will probably not be possible to go faster without a different concept.

- **Self-Learning/Error Correction:**  
  When an error is made (due to bad question/answer parsing, lag, or missing word list), the script handles the popup and extracts the correct answer information to stop making the same mistake again (hopefully).  
  The incorrect answer popup has a normal delay of 3 seconds before you can close it, but that's slow, so it instead gets delyeeted :P

- **Smart-ish Word Parsing:**  
  A big source of incorrect answers is when no answer is found due to unsatisfactory matching (of the question to an answer).  
  Education perfect is annoying in the sense of having horrendous formatting standards. The entries on the word list can 
  be displayed differently as a question (and there are many unique edge cases).  The script handles *most* of these 
  edge cases, and for those that still fail to match, the self-learning function will take care of that in *most* of the 
  remaining scenarios. There are still extreme cases of very bad formatting (such as commas with repeated words and 
  blatant disparities between displayed answer and expected answer) where a question may not get correctly answered. 
  These should also get fixed soon.



## Future plans
This is a purely hobby-driven project. This means I do not guarantee consistent development or continued maintenance of
this program. Everything depends on my own plans and interests. In any case, any existing resources here will remain
public and accessible indefinitely.  
In any case, you are very welcome to contribute to this project. Contributions can be in the form of new features, bug
fixes, anti-cheat bypass, or even simply fixing typos and documentation. I have to specifically thank 
[Garv](https://github.com/garv-shah) for his discovery of an exploit that made V1 fully-auto answer possible.

TODO list? or never-DO list? no one knows :P
- Auto navigation between tasks (temporarily achieved with script+.js during V1)
- Support for audio-based tasks
- Dedicated anti-cheat bypass features
- Even better answer parsing
