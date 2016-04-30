const electron = require('electron')
var _ = require('lodash');
var Gesture = require('../lib/gesture');
var robot = require("robotjs");
var gesture = new Gesture.detector(0);

var camXmax = 640;
var camYmax = 480;

//setup detection options
gesture.setTimeToCountDetection(.3);
gesture.setDraw(true);
gesture.setShow(true);
gesture.setFrameFlip(true);
gesture.setOneHand(true);

gesture.detectTrackStream([Gesture.PALM, Gesture.THUMB_UP, Gesture.FIST]);

//Speed up the mouse.
robot.setMouseDelay(2);

var screenSize = robot.getScreenSize();
var screenHeight = screenSize.height;
var screenWidth = screenSize.width;
console.log("height: "+screenHeight);
console.log("width: "+screenWidth);

robot.moveMouse(0,0);

//events
gesture.on('error', console.log);
gesture.on('frame', function(data) {
	data = JSON.parse(data);
	//{"results":[{"hand_type":0,"height":167,"id":0,"width":167,"x":140,"xc":223,"y":147,"yc":230}]}
	if(data["results"]) {
		var hand = data["results"][0];
		if(hand.hand_type===0) {
			var xpos = (camXmax-hand["xc"]) * screenWidth / camXmax;
			var ypos = hand["yc"] * screenHeight / camYmax;
			console.log("Moving to " + xpos + " " + ypos);
			//robot.moveMouse(xpos, ypos);/
			robot.keyTap("a");

		}
		//console.log(hand);
		
	}
});
gesture.on('stop',  function(){
	console.log("Detection process was stopped");
});

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
    gesture.stop()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
