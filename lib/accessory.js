/**
 * Created by kraigm on 1/16/16.
 */

var inherits = require('util').inherits;
var Service, Characteristic, Accessory, uuid;
var NobleDeviceAccessory;
var AsyncUtil = require('./async-util');

module.exports = function (_Accessory, _Service, _Characteristic, _uuid) {
	if (_Accessory) {
		Accessory = _Accessory;
		Service = _Service;
		Characteristic = _Characteristic;
		uuid = _uuid;
		NobleDeviceAccessory = require('./noble-accessory')(Accessory, Service, Characteristic, uuid);

		inherits(FlowerPowerAccessory, NobleDeviceAccessory);
		FlowerPowerAccessory.prototype.updateInfoAsync = updateInfoAsync;
		FlowerPowerAccessory.prototype.updateLiveDataAsync = updateLiveDataAsync;
		FlowerPowerAccessory.prototype.deviceKey = 'hbfp';
	}
	return FlowerPowerAccessory;
};
module.exports.FlowerPowerAccessory = FlowerPowerAccessory;

function FlowerPowerAccessory(deviceId, device, log) {
	NobleDeviceAccessory.call(this, device, log);
}

var updateInfoAsync = function() {
	var base = NobleDeviceAccessory.prototype.updateInfoAsync.bind(this)();
	return base
		.then(this.updateDataAsync.bind(this, 'FriendlyName', Characteristic.Name))
		;
};

var updateLiveDataAsync = function() {
	var self = this;
	return AsyncUtil.asyncSeries([

	]);
};
