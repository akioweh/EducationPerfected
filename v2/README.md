# V2 with fixed auto-answer

### similar functionality as v1, but with a different approach to restore full-auto-answering feature  
hotkeys is same as v1. There are no alert pop-ups when you press they hotkeys though; you only get a message in console output. There is also no semi-automatic mode (alt a).  
  
**the script is no longer a userscript** (one that can be run by simply pasting into DevTools console)  
it is a **node.js script** that uses the [Puppeteer](https://github.com/puppeteer/puppeteer) library to acheive more control over the website  
therefore, installation and execution is different.  

## Installation & how to run  
1. install node.js from https://nodejs.org/en/
2. instapp the Puppeteer library by opening terminal/cmd and typing `npm i puppeteer`
3. download the script (edit it using notepad to fill in your EP log in details at line 48 if you want auto-login; see below)
4. run the script (`index.js`) using node

there are different ways to run the script using Node.js, but a simple way is to open up terminal and type `node [path to file]`  
e.g. `node C:\index.js`  
(for windows) if you are really lazy, download and save the `start.cmd` file in the same folder as `index.js` and double click `start.cmd` to run  
idk mac

## Expected behavior  
when you run the script, it should open a new browser window (that does not have any user data so you must log in to EP manually or fill in your details in the script for auto-login)  
education perfect website will load as normal  
nagivate through EP as normal  
the auto-answer functionality is loaded in the background  
trigger the functions in the same manner as V1 using the same hotkeys (read the readme on the main page)  
_if you close the terminal window running the script the browser window will close too_
