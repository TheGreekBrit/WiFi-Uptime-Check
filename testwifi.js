
const EventEmitter = require('events');
const https = require('https');
const notification = new EventEmitter();

let isUp = true;
let startTime = undefined;
let timeNow = new Date();

function tryToConnect() {
	const options = {
		hostname: 'google.com',
		port: 443,
		path: '/',
		method: 'GET'
	};

	const req = https.request(options, res => {
		res.on('data', chunk => {
			//return if no change
			if (isUp) {
				notification.emit('wifiStillUp');
			} else {
				//handler for wifi coming back up
				notification.emit('wifiBackUp');
			}
		});
	});

	req.on('error', err => {
		if (!startTime) {
			startTime = new Date();
			notification.emit('wifiWentDown', err);
		} else {
			notification.emit('wifiStillDown', err);
		}
	});
	
	req.end();
}

notification.on('wifiBackUp', () => {
	//wifi came back up
	const deltaSeconds = (timeNow - startTime) / 1000;

	let downSeconds = deltaSeconds % 60;
	let downMinutes = parseInt(deltaSeconds / 60);
	
	console.log('BACK UP!');
	console.log('Downtime start:', startTime);
	console.log('Downtime end:', timeNow);
	console.log(`TOTAL DOWNTIME: ${downMinutes} minutes ${downSeconds} seconds`);
	isUp = true;
	startTime = undefined;
});

notification.on('wifiStillUp', () => {
	console.log(timeNow, 'still up');
});

notification.on('wifiStillDown', err => {
	//ignore the router actually being off
	//todo find code next time wifi goes down
//	if (err.code === 'EAI_AGAIN')
//		return;
	isUp = false;
	console.log(timeNow, 'still down');
	tryToConnect();
});

notification.on('wifiWentDown', err => {
	//if (err.code === 'EAI_AGAIN')
	//	return;
	isUp = false;
	console.error(startTime, 'wifi went down');
	tryToConnect();
});

//check if up every 60 seconds
//if it's up, start testing tryToConnect() again
//if it's down, don't do anything (tryToConnect() will still be running)
setInterval(() => {
	timeNow = new Date();
	if (isUp) {
		//startTime = new Date();
		tryToConnect(); 	//start new string of tests
	}
}, 1000 * 25);
//tryToConnect();
