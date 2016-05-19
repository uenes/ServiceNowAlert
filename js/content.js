function log(str) {
	console.log(str);
}

var delay = 10000;

function myTimer() {
	loadIconNumber()
}

function checkDelay () {
	chrome.storage.sync.get('favoriteDelay', function (items) {
		delay = parseInt(items.favoriteDelay);
		if (delay == 999) {
			delay = 30000;
		} else {
			delay = delay*10000*6;
		}
	});
	setTimeout(function(){
		console.log("delay final " + delay);		
		return delay;
	}, 20);
}

function getDelayOption() {
	chrome.storage.sync.get('favoriteDelay', function (items) {
		fdelay = parseInt(items.favoriteDelay);
		if (fdelay == 999) {
			delay = 30000;
		} else {
			delay = fdelay*10000*6;
		}
	});
}

getDelayOption()


// class highcharts-axis-labels ---------------------
