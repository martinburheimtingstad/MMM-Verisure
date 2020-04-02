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

		function getVerisure(config) {
			try {
				var names = [];
				var overviews = [];
				var toReturn = [];
				const verisure = new Verisure(config.username, config.password);
				verisure.getToken()
				.then(() => verisure.getInstallations())
				.then((installations) => {
					self.sendSocketNotification("DATA", installations);
					return installations;
//					
				})
				.then((installations) => {
					for(var i = 0; i < installations.length; i++) {
						installations[i].getOverview().then((overview) => {
							overviews.unshift(overview);
							if(overviews.length === installations.length) {
								self.sendSocketNotification("OVERVIEWS", overviews);
							}
						});
					}
					self.sendSocketNotification("DATA", installations);
//					installations[0].getOverview().then((overview) => overviews.push(overview));
					//					names.push(installations[0].config.alias);
				})
//				.then((overview) => {
//					overviews = overviews.concat()
//					console.log(overview);
//				})
//					.then(installations => installations[1].getOverview()) 
//					.then((overview) => {
//						console.log(`${new Date()} : Polling Verisure API...`);
		
//						if (flagDebug) {
//							console.log('OVERVIEW:', overview);
//						}
						/*
		
						// Overall alarm state 
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/armState/STATE`,
							JSON.stringify(overview.armState), {
								"retain": true
							});
		
						// Alarm state compatible 
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/armstateCompatible/STATE`, overview.armstateCompatible.toString());
		
						// Control plugs
						overview.controlPlugs.forEach(controlPlug => {
							mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/controlPlug/STATE`, JSON.stringify(controlPlug));
						});
		
						// Smart plugs
						overview.smartPlugs.forEach(smartPlug => {
							mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/smartPlug/STATE`, JSON.stringify(smartPlug));
						});
		
						// Door locks
						overview.doorLockStatusList.forEach(doorLock => {
							mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/doorLock/STATE`, JSON.stringify(doorLock));
						});
		
						// SMS count
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/totalSmsCount/STATE`, overview.totalSmsCount.toString());
		
						// Environmental values
						overview.climateValues.forEach(climateValue => {
							mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/${climateValue.deviceArea}/SENSOR`, JSON.stringify(climateValue));
						});
		
						// Error list
						overview.installationErrorList.forEach(installationError => {
							mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/${installationError.area}/STATE`, JSON.stringify(installationError));
						});
		
						// Pending changes
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/pendingChanges/STATE`, overview.pendingChanges.toString());
		
						// Ethernet mode active
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/ethernetModeActive/STATE`, overview.ethernetModeActive.toString());
		
						// Ethernet connected now
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/ethernetConnectedNow/STATE`, overview.ethernetConnectedNow.toString());
		
						// Heat pumps
						// TODO 
		
						// Smart Cameras
						// TODO
		
						// Latest Ethernet status
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/latestEthernetStatus/STATE`, JSON.stringify(overview.latestEthernetStatus));
		
						// Customer image cameras
						// TODO
		
						// Battery process
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/batteryProcess/STATE`, JSON.stringify(overview.batteryProcess));
		
						// User tracking status
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/userTrackingStatus/STATE`, overview.userTracking.installationStatus.toString());
		
						// User tracking
						overview.userTracking.users.forEach(user => {
							mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/userTracking/STATE`, JSON.stringify(user));
						});
		
						// Event counts
						// TODO
		
						// Door/window report state
						mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/doorWindowReportState/STATE`, overview.doorWindow.reportState.toString());
		
						// Door/window devices
						overview.doorWindow.doorWindowDevice.forEach(doorWindow => {
							mqttClient.publish(`${config.mqttRootTopic}/${verisure_prefix}/tele/doorWindow/STATE`, JSON.stringify(doorWindow));
						}); */
					//})
					.catch((error) => {
						console.error('Error 1: ', error);
					});
		
			} catch (err) {
				console.log('Error 2: ', err.message);
			}
		}	
		
		getVerisure(this.config);

		setTimeout(function() { self.getData(); }, this.config.refreshInterval);
	},

});
