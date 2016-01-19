/**
 * Created by kraigm on 1/16/16.
 */
var Service, Characteristic, Accessory, uuid;
var FlowerPowerAccessory;

var FlowerPower = require('flower-power');
var Promise = require('promise');

module.exports = function (_Accessory, _Service, _Characteristic, _uuid) {
	if (_Accessory) {
		Accessory = _Accessory;
		Service = _Service;
		Characteristic = _Characteristic;
		uuid = _uuid;

		FlowerPowerAccessory = require('./accessory')(Accessory, Service, Characteristic, uuid);
	}
	return FlowerPowerPlatform;
};
module.exports.FlowerPowerPlatform = FlowerPowerPlatform;

function FlowerPowerPlatform(log, config) {
	this.log = log;
	this.debug = log.debug;
	this.flowerPowers = { };
	if (config.username) {
		this.credentials = {
			username: config.username,
			password: config.password,
			client_id: config.client_id,
			client_secret: config.client_secret
		};
	} else {
		this.autoAdd = true;
	}
}

FlowerPowerPlatform.prototype.accessories = function (callback) {
	var self = this;
	this.refreshAllAsync()
		.then(function(){
			var foundAccessories = [];
			for (var k in self.flowerPowers) {
				foundAccessories.push(self.flowerPowers[k]);
			}
			callback(foundAccessories);
		})
		.catch(function(err){
			self.log.error(err);
		})
		.done(function(){
			self.autoAdd = false;
		});
};

FlowerPowerPlatform.prototype.refreshAllAsync = function(timeout) {
	var self = this;
	return new Promise(function(resolve, reject) {
		var needsRefresh = {};
		for (var k in self.flowerPowers) {
			needsRefresh[k] = true;
		}
		var cancel = function () {
			if (!cancel) return;
			FlowerPower.stopDiscoverAll(onDiscover);
			cancel = null;
			resolve();
		};
		var cancelIfDone = function () {
			for (var k in needsRefresh) {
				if (needsRefresh[k]) return;
			}
			var c = cancel;
			if (c) c();
		};
		var onDiscover = function (device) {
			try {
				var acc;
				var deviceId = device.uuid;
				acc = self.flowerPowers[deviceId];
				if (!acc && self.autoAdd) {
					acc = new FlowerPowerAccessory(deviceId, self.log);
					self.flowerPowers[deviceId] = acc;
				}
				if (acc) {
					acc.initAsync(device)
						.catch(function(err){
							self.log.error(err);
						})
						.done(cancelIfDone);
				}
			} catch (err) {
				reject(err);
			}
		};
		setTimeout(cancel, timeout || 10000);
		FlowerPower.discoverAll(onDiscover);
	});
};
