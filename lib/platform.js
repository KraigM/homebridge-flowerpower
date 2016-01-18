/**
 * Created by kraigm on 1/16/16.
 */
var Service, Characteristic, Accessory, uuid;
var FlowerPowerAccessory;

var FlowerPower = require('flower-power');
var async = require('async');

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
}

FlowerPowerPlatform.prototype.accessories = function (callback) {
	var self = this;
	var foundAccessories = [];
	FlowerPower.discover(function(device){
		var acc = new FlowerPowerAccessory(null, device, self.log);
		acc.initAsync()
			.then(function(){
				foundAccessories.push(acc);
				self.flowerPowers = foundAccessories;
				callback(self.flowerPowers);
			})
			.then(acc.updateLiveDataAsync.bind(acc))
			.catch(function(err){
				self.log.error(err);
			});
	});
};
