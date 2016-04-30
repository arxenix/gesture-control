const electron = require('electron')
var _ = require('lodash');
var socket = require('socket.io-client')('http://localhost:3535');

socket.on('connect', function(){console.log("connected to robot socket");});
socket.on('event', function(data){console.log(data);});
socket.on('disconnect', function(){console.log("dc");});

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

var nA = {name: 'None'}
var eventMap = {'palm_to_fist': nA,'palm_to_thumbsup': nA,'move_palm': nA};

//temporarily hardcoded.. should be set through UI
eventMap['move_palm']={'name': 'move_mouse'};
eventMap['palm_to_fist']={'name': 'key_press', 'key': 'space'};


var actionList = ['move_mouse', 'type'];
var callEvent = function(eventName, data) {
	var action = eventMap[eventName];
	var actionName = action['name'];
	if(actionName) {
		console.log("executing action -> " + actionName);
		if(actionName!=='None') {
			if(actionName==='move_mouse') {
				moveMouse(data.x, data.y);
			}
			else if(actionName==='key_press') {
				robot.keyTap(action.key);
			}
		}
	}
	
}


var moveMouse = function(x, y) {
	socket.emit('mouse', {x: x, y:y});
};


//events
gesture.on('error', console.log);
lastGesture = {"hand_type": -1};
gesture.on('frame', function(data) {
	data = JSON.parse(data);
	//{"results":[{"hand_type":0,"height":167,"id":0,"width":167,"x":140,"xc":223,"y":147,"yc":230}]}
	if(data["results"]) {
		var hand = data["results"][0];
		if(hand.hand_type===0) {
			var xpos = (camXmax-hand["xc"]) * screenWidth / camXmax;
			var ypos = hand["yc"] * screenHeight / camYmax;
			callEvent('move_palm', {x: xpos, y: ypos});
		}
		if(hand.hand_type===1 && lastGesture.hand_type===0) {
			callEvent('palm_to_fist', {});
		}
		if(hand.hand_type===2 && lastGesture.hand_type===0) {
			callEvent('palm_to_thumbsup', {});
		}
		lastGesture = hand;
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
