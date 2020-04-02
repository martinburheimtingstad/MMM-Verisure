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
		refreshInterval: 1000 * 30, // refresh every 5 seconds
		updateInterval: 1000 * 30, // update every 1 seconds
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
		return ['https://mypages.verisure.com/newapp/static/css/main.1cacec1b.chunk.css'];
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

			var installationDiv = document.createElement("div");
			installationDiv.id = 'installation'+i;
			installationDiv.innerHTML = installation.config.alias;

			var alarmState = document.createElement("div");
			alarmState.classList.add('ArmStateButton-arm-button-wrapper-fgZ6z');
			if(this.overviews[i].armState.statusType === "DISARMED") {
				var button = document.createElement("button");
				button.id = 'button'+i;
				button.classList.add('ArmStateButton-button-3SLXa');
				button.classList.add('ArmStateButton-disarmed-zJa8M');
				
				var icon = document.createElement("div");

				icon.classList.add('Icon-icon-font-1jSmW');
				icon.classList.add('icomoon-icon-disarmed-1xmI4');
				icon.classList.add('Icon-small-2VXAK');
				icon.classList.add('ArmStateButton-arm-icon-1Ul30');
				icon.innerHTML = '&#x1F513;'

				button.appendChild(icon);
				alarmState.appendChild(button);
			}

			toAdd.appendChild(installationDiv);
			toAdd.appendChild(alarmState);
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
