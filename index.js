
module.exports = function (homebridge) {
	var Service = homebridge.hap.Service;
	var Characteristic = homebridge.hap.Characteristic;
	var Accessory = homebridge.hap.Accessory;
	var uuid = homebridge.hap.uuid;

	var FlowerPowerPlatform = require('./lib/platform')(Accessory, Service, Characteristic, uuid);

	homebridge.registerPlatform("homebridge-flowerpower", "FlowerPower", FlowerPowerPlatform);
};
