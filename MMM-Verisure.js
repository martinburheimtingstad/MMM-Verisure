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
		refreshInterval: 1000 * 60 * 5, // refresh every 5 seconds
		updateInterval: 1000 * 60 * 5, // update every 1 seconds
		timeFormat: config.timeFormat,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500
	},

	start: function() {
		console.log('Starting module: ' + this.name);
		var self = this;
		var data = null;
		var overviews = null;
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

		var installations = document.createElement("div");

		var toAdd = document.createDocumentFragment();
		for (var i = 0; i < this.data.length; i++) {
			var installation = this.data[i];
			var overview = this.overviews[i];

			var installationDiv = document.createElement("div");
			installationDiv.id = 'installation'+i;
			installationDiv.classList.add("medium");
			installationDiv.classList.add("light");

			if(overview.armState.statusType === "DISARMED") {
				installationDiv.innerHTML = installation.config.alias+': Av';
			}
			else if(overview.armState.statusType === "ARMED_HOME") {
				installationDiv.innerHTML = installation.config.alias+': Skall';
			}
			else if(overview.armState.statusType === "ARMED_AWAY") {
				installationDiv.innerHTML = installation.config.alias+': Full';
			}
			else {
				installationDiv.innerHTML = installation.config.alias+': Ukjent';
			}

			var temperaturerDiv = document.createElement("div");
			
			if(typeof overview !== "undefined") {
				overview.climateValues.forEach(climateValue => {
					var sensorDiv = document.createElement("div");
					sensorDiv.classList.add("small");
					sensorDiv.classList.add("light");
//					sensorDiv.innerHTML = `${climateValue.deviceArea}`+JSON.stringify(climateValue);
					sensorDiv.innerHTML = `${climateValue.deviceArea}`+': '+`${climateValue.temperature}`+'&deg;';
					sensorDiv.id = installation.config.alias+'sensor'+i;
					temperaturerDiv.appendChild(sensorDiv);
				})
			};
			installationDiv.id = 'installation'+i;

			toAdd.appendChild(installationDiv);
			toAdd.appendChild(temperaturerDiv);
		}
		installations.appendChild(toAdd);
		wrapper.appendChild(installations);

		return wrapper;
	},

	processData: function(data) {
		var self = this;
		this.data = data;
		if (this.loaded === false) {
			 self.updateDom(self.config.animationSpeed);
		}
		this.loaded = true;

		// the data if load
		// send notification to helper
		this.sendSocketNotification("DATA", data);
	},

	processOverviews: function(data) {
		var self = this;
		this.overviews = data;
		if (this.loaded === true) {
			 self.updateDom(self.config.animationSpeed);
		}
	},

 	socketNotificationReceived: function(notification, payload) {
		if (notification === "STARTED") {
			this.updateDom();
		}
		else if(notification === "DATA") {
			// set dataNotification
			this.dataNotification = payload;
			this.processData(payload);
			this.updateDom();
		}
		else if(notification === "OVERVIEWS") {
			this.dataNotification = payload;
			this.processOverviews(payload);
			this.updateDom();
		}
	},

});
