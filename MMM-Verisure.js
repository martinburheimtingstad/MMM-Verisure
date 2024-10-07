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
		refreshInterval: 1000 * 60 * 30, // refresh every 30 minutes
		updateInterval: 1000 * 60 * 30, // update every 30 minutes
		timeFormat: config.timeFormat,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,
		position: 'top_left'
	},

	start: function() {
		var self = this;
		let data = [];
		let installations = [];
		var dataNotification = null;

		// Flag for check if module is loaded
		this.loaded = false;

		// Schedule update timer.
		this.sendSocketNotification("CONFIG", this.config);
		
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

	sensorsDiv: function(sensors) {
		let temperaturerDiv = document.createElement("div");
		for(var sensorcounter = 0; sensorcounter < sensors.length; sensorcounter++) {
			var sensor = sensors[sensorcounter];
			var sensorDiv = document.createElement("div");
			sensorDiv.innerHTML = sensor.device.area + ": " + sensor.temperatureValue + "&deg;C";
			temperaturerDiv.append(sensorDiv);
		}
		return temperaturerDiv;
	},

	getDom: function() {
		var wrapper = document.createElement("div");

		if (!this.loaded) {
			wrapper.innerHTML = this.translate('LOADING');
			return wrapper;
		}

		var installations = document.createElement("div");

		var toAdd = document.createDocumentFragment();
		for (var i = 0; i < this.installations.length; i++) {
			var installation = this.installations[i];

			var installationDiv = document.createElement("div");
			installationDiv.id = 'installation' + i;
			installationDiv.classList.add("medium");
			installationDiv.classList.add("bright");
			installationDiv.classList.add("light");
			installationDiv.innerHTML = installation.name;
			
			installationDiv.id = 'installation'+i;

			toAdd.appendChild(installationDiv);
			toAdd.appendChild(this.sensorsDiv(installation.sensors));
		}


		installations.appendChild(toAdd);
		wrapper.appendChild(installations);

		return wrapper;
	},

	processData: function(data) {
		var self = this;
		this.installations = data;
		this.loaded = true;

		if (this.loaded === false) {
                         self.updateDom(self.config.animationSpeed);
                }
                this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("DATA", data);
	},

 	socketNotificationReceived: function(notification, payload) {
		if (notification === "STARTED") {
			this.updateDom();
		}
		else if(notification === "DATA") {
			payload.position = 'test';
			// set dataNotification
			this.dataNotification = payload;
			this.processData(payload);
			this.updateDom();
		}
	},

});
