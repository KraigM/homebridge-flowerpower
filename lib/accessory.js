/**
 * Created by kraigm on 1/16/16.
 */

var inherits = require('util').inherits;
var Service, Characteristic, Accessory, uuid;
var NobleDeviceAccessory;
var IdUtil = require('./id-util');

const SunlightLuxConversion = 54;

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
		FlowerPowerAccessory.prototype.updateInitialDataAsync = updateInitialDataAsync;
		FlowerPowerAccessory.prototype.updateInfoWithCloudData = updateInfoWithCloudData;
		FlowerPowerAccessory.prototype.deviceKey = 'fp';
	}
	return FlowerPowerAccessory;
};
module.exports.FlowerPowerAccessory = FlowerPowerAccessory;

function FlowerPowerAccessory(deviceId, log) {
	deviceId = IdUtil.normalizeDeviceId(deviceId);
	NobleDeviceAccessory.call(this, deviceId, log);
	this.hasUpdatedName = false;
	this.addService(Service.LightSensor);
	this.addService(Service.TemperatureSensor);
	this.addService(Service.BatteryService);
}

var updateInfoWithCloudData = function(cloudData) {
	if (!cloudData) return;
	if (cloudData.nickname) {
		var name = cloudData.nickname;
		this.setServiceCharacteristic(Service.AccessoryInformation, Characteristic.Name, name);
		this.name = name;
		this.hasUpdatedName = true;
	}
};

var updateInfoAsync = function() {
	var self = this;
	return this.updateDataAsync('FriendlyName', Characteristic.Name)
		.then(function(){
			self.name = self
				.getService(Service.AccessoryInformation)
				.getCharacteristic(Characteristic.Name).value;
			self.hasUpdatedName = true;
		})
		.then(NobleDeviceAccessory.prototype.updateInfoAsync.bind(this))
		;
};

var updateInitialDataAsync = function() {
	var base = NobleDeviceAccessory.prototype.updateInitialDataAsync.bind(this)();
	return base
		.then(this.updateLiveDataAsync.bind(this))
		;
};

var updateLiveDataAsync = function() {
	var self = this;
	return this.updateDataAsync('Sunlight', Characteristic.CurrentAmbientLightLevel, Service.LightSensor, function (sunlight) {
			self.debug('sunlight = ' + sunlight.toFixed(2) + ' mol/m²/d');
			return sunlight * SunlightLuxConversion;
		})
		.then(this.updateDataAsync.bind(this, 'AirTemperature', Characteristic.CurrentTemperature, Service.TemperatureSensor, function (temperature) {
			self.debug('air temperature = ' + temperature.toFixed(2) + '°C');
			return temperature;
		}))
	;
};
