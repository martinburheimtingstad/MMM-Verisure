/* global Module */

/* Magic Mirror
 * Module: MMM-Verisure
 *
 * By Martin Burheim Tingstad
 * MIT Licensed.
 */

Module.register("MMM-Verisure",{

	defaults: {
		// Read config and secrets from environment variables
		refreshInterval: 1000 * 60 * 5, // refresh every 5 minutes
		updateInterval: 1000 * 15, // update every 15 seconds
		timeFormat: config.timeFormat,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500
	},

	start: function() {
		console.log('Starting module: ' + this.name);
		var self = this;
		var deviceData = null;
		var dataNotification = null;

		// Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.sendSocketNotification("CONFIG", this.config);
		console.log('Sending socket notification: CONFIG');
		
		setInterval(function() {
			self.updateDom();
		}, this.config.updateInterval);
	},
	
	// Define required scripts.
	getScripts: function() {
		return [];
	},
	
	getStyles: function() {
		return [];
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},

	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			return wrapper;
		}

		var operationIcon = document.createElement('img');
		operationIcon.src = "https://aquarea-smart.panasonic.com/remote/images/heat_pump.png";
		operationIcon.style = "width: 25px; height: 25px;"

		var outdoorDiv = document.createElement("div");
		outdoorDiv.align = 'center';

		var outdoorIcon = document.createElement('img');
		outdoorIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/outdoors.png';
		outdoorIcon.width = 50;
		outdoorIcon.height = 50;
		var outdoorTemperature = document.createElement("div");
		outdoorTemperature.innerHTML = this.deviceData.status[0].outdoorNow+'&deg;';

		outdoorDiv.appendChild(outdoorIcon);
		outdoorDiv.appendChild(outdoorTemperature);

		

		var tankDiv = document.createElement("div");
		tankDiv.align = 'center';

		var tankIcon = document.createElement('img');
		tankIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/icon_tank.png';
		tankIcon.width = 100;
		tankIcon.height = 100;
		tankIcon.style = "filter: grayscale(50%)";
		var tankTemperature = document.createElement("div");
		tankTemperature.classList.add("medium");
		tankTemperature.classList.add("light");
		tankTemperature.innerHTML = this.deviceData.status[0].tankStatus[0].temparatureNow+'&deg;';

		tankDiv.appendChild(tankIcon);
		if(this.deviceData.status[0].direction === 2) {
			tankDiv.appendChild(operationIcon);
		}
		tankDiv.appendChild(tankTemperature);

		var zoneDiv = document.createElement("div");
		zoneDiv.align = 'center';

		var zoneIcon = document.createElement('img');
		zoneIcon.src = 'https://aquarea-smart.panasonic.com/remote/images/icon_sun.png';
		zoneIcon.width = 100;
		zoneIcon.height = 100;
		zoneIcon.style = "filter: grayscale(50%)";

		if(this.deviceData.status[0].direction === 1) {
			zoneDiv.appendChild(operationIcon);
		}

		var zoneTemperature = document.createElement("div");
		zoneTemperature.classList.add("medium");
		zoneTemperature.classList.add("light");

		zoneTemperature.innerHTML = this.deviceData.status[0].zoneStatus[0].temparatureNow+'&deg;';
		
		zoneDiv.appendChild(zoneIcon);
		zoneDiv.appendChild(zoneTemperature);

		wrapper.appendChild(outdoorDiv);
		wrapper.appendChild(tankDiv);
		wrapper.appendChild(zoneDiv);

		return wrapper;
	},

	processData: function(data) {
		var self = this;
		this.deviceData = data;
		if (this.loaded === false) {
			 self.updateDom(self.config.animationSpeed);
		}
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("DEVICE_DATA", data);
	},

 	socketNotificationReceived: function(notification, payload) {
		if (notification === "STARTED") {
			this.updateDom();
		}
		else if(notification === "DEVICE_DATA") {
			// set dataNotification
			this.dataNotification = payload;
			this.processData(payload);
			this.updateDom();
		}
	},

});
