/**
 * Created by kraigm on 1/17/16.
 */

var inherits = require('util').inherits;
var Service, Characteristic, Accessory, uuid;
var NobleDevice = require('flower-power/node_modules/noble-device');
var Promise = require('promise');
var async = require('async');
var AsyncUtil = require('./async-util');

const DELAY_SEARCHING_ATTEMPT = 30000;
const DELAY_CONNECTION_ATTEMPT = 60000;

module.exports = function (_Accessory, _Service, _Characteristic, _uuid) {
	if (_Accessory) {
		Accessory = _Accessory;
		Service = _Service;
		Characteristic = _Characteristic;
		uuid = _uuid;

		inherits(NobleDeviceAccessory, Accessory);
		NobleDeviceAccessory.prototype.getServices = getServices;
		NobleDeviceAccessory.prototype.initAsync = initAsync;
		NobleDeviceAccessory.prototype.connectAsync = connectAsync;
		NobleDeviceAccessory.prototype.updateInfoAsync = updateInfoAsync;
		NobleDeviceAccessory.prototype.updateDataAsync = updateDataAsync;
		NobleDeviceAccessory.prototype.disconnectAsync = disconnectAsync;
		NobleDeviceAccessory.prototype.updateInitialDataAsync = updateInitialDataAsync;
		NobleDeviceAccessory.prototype.setServiceCharacteristic = setServiceCharacteristic;
		NobleDeviceAccessory.prototype.locate = locate;
		NobleDeviceAccessory.prototype.log = log;
		NobleDeviceAccessory.prototype.debug = debug;
		NobleDeviceAccessory.deviceKey = "nble";
	}
	return NobleDeviceAccessory;
};
module.exports.NobleDeviceAccessory = NobleDeviceAccessory;

function NobleDeviceAccessory(device, log) {
	this.device = device;
	this.deviceId = device.uuid;
	this._log = log;

	this.name = this.deviceKey + ':' + this.deviceId;
	var id = uuid.generate(this.name);
	Accessory.call(this, this.name, id);
	this.uuid_base = id;
}

var log = function(val){
	this._log('[' + this.deviceId.substring(0,4) + '] ' + val);
};
var debug = function(val){
	this._log.debug('[' + this.deviceId + '] ' + val);
};

var locate = function () {
	return new Promise(function (resolve, reject) {
		var self = this;
		var isSearching = true;
		self.log('Locating Device');
		var discover = function (device) {
			if (device.uuid == self.deviceId) {
				self.device = device;
				NobleDevice.stopDiscoverAll(discover);
				isSearching = false;
				self.log('Found');
				return resolve(device);
			}
			else self.destroy(device);
		};
		setTimeout(function () {
			if (isSearching) {
				NobleDevice.stopDiscoverAll(discover);
				self.log('Not found', true);
				return reject('Not found');
			}
		}, DELAY_SEARCHING_ATTEMPT);

		NobleDevice.discoverAll(discover);
	});
};

var initAsync = function() {
	return this.connectAsync(null, 3)
		.then(this.updateInfoAsync.bind(this))
		.then(this.disconnectAsync.bind(this));
};

var connectAsync = function(device, maxAttempts) {
	var self = this;
	maxAttempts = (maxAttempts && maxAttempts > 0) ? maxAttempts : 1;
	if (device) self.device = device;
	return AsyncUtil.fromCallback(function(callback){
		self.device.on('disconnect', function() {
			self.debug('disconnected!');
		});
		var onConnect = function(err){
			if (isConnecting) {
				isConnecting = false;
				callback(err);
			}
		};
		var isConnecting = true;
		var loop = function(){
			setTimeout(function() {
				if (!isConnecting) return;
				maxAttempts--;
				if (maxAttempts > 0) loop();
				self.log('Connection failed', true);
				//self.destroy(self.device);
				callback(new Error('Connection Failed'));
			}, DELAY_CONNECTION_ATTEMPT);
			self.device.connectAndSetup(onConnect);
		};
		self.debug('connectAndSetup');
		loop();
	});
};

var disconnectAsync = function(){
	var self = this;
	return AsyncUtil.fromCallback(function(callback){
		self.debug('disconnect');
		self.device.disconnect(callback);
	});
};

var updateInitialDataAsync = function() {
	return this.updateInfoAsync();
};

var updateDataAsync = function(prop, characteristic, service) {
	var self = this;
	return new Promise(function(resolve, reject){
		var fn = 'read' + prop;
		if (!self.device[fn]) {
			self.debug("Not Supported : " + prop);
			return resolve();
		}
		characteristic = characteristic || Characteristic[prop];
		service = service || Service.AccessoryInformation;
		self.debug(fn);
		self.device[fn](function (err, val) {
			if (err) reject(err);
			self.debug('\t' + prop + ' = ' + val);
			self.setServiceCharacteristic(service, characteristic, val);
			resolve();
		});
	});
};

var updateInfoAsync = function () {
	return this.updateDataAsync('SerialNumber')
		//.then(this.updateDataAsync.bind(this, 'SystemId', ???))
		.then(this.updateDataAsync.bind(this, 'ModelNumber', Characteristic.Model))
		.then(this.updateDataAsync.bind(this, 'FirmwareRevision'))
		.then(this.updateDataAsync.bind(this, 'HardwareRevision'))
		.then(this.updateDataAsync.bind(this, 'SoftwareRevision'))
		.then(this.updateDataAsync.bind(this, 'ManufacturerName', Characteristic.Manufacturer))
		.then(this.updateDataAsync.bind(this, 'BatteryLevel', Characteristic.BatteryLevel, Service.BatteryService))
	;
};

var getServices = function () {
	return this.services;
};

var setServiceCharacteristic = function(service, characteristic, value) {
	var svc = this.getService(service) || this.addService(service);
	return svc.setCharacteristic(characteristic, value);
};
