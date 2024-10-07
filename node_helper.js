'use strict';

/* Magic Mirror
 * Module: MMM-Verisure
 *
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const Verisure = require('verisure');
var request = require('request');

module.exports = NodeHelper.create({

	start: function() {
		console.log('Starting node helper for: ' + this.name);
		this.config = null;
        },

	socketNotificationReceived: function(notification, payload) {
		var self = this;
		if (notification === 'CONFIG') {
			self.config = payload;
			self.getData();
			self.started = true;
			self.sendSocketNotification("STARTED", true);
		}
	},

	getData: function() {
		var self = this;
		var flagDebug = true;

		async function fetchClimates(installation) {
	                const results = await installation.client({
       	                 operationName: 'doorWindows',
       	                 query: `query doorWindows($giid: String!) {
       	                         installation(giid: $giid) {
       	                                 climates {
       	                                         device {
       	                                                 area
       	                                                 gui {
       	                                                         label
       	                                                          __typename
       	                                                 }
       	                                                 __typename
       	                                         }
       	                                         humidityEnabled
       	                                         humidityTimestamp
       	                                         humidityValue
       	                                         temperatureTimestamp
       	                                         temperatureValue
       	                                 }   
       	                         }
       	                 }`});
       	         return results.installation.climates;
	        }

		function getVerisure(config) {
			try {
				console.log("Contacting verisure");
				const verisure = new Verisure(config.username, null, config.tokens);
				let installationClimates = [];
				verisure.getInstallations()
					.then((installations) => {
						for(let counter = 0; counter < installations.length; counter++) {
							const installation = installations[counter];
							fetchClimates(installation)
								.then(results => {
									const installationClimate = {
										name: installation.config.alias,
										sensors: results
									};
									installationClimates.push(installationClimate);
									console.log("Sending data for " + installationClimate.name);
									self.sendSocketNotification("DATA", installationClimates);
								})
						}
					})
			} catch (err) {
				console.log('Error 2: ', err.message);
			}
		}	
		
		getVerisure(this.config);

		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

});
