/**
 * Created by kraigm on 1/19/16.
 */

var BridgeHelper = require('node-flower-bridge/lib/helpers');

var normalizeDeviceId = function(id) {
	if (!id) return id;
	return BridgeHelper.uuidCloudToPeripheral(id.replace(/:/g, "")).toLowerCase();
};

module.exports = {
	normalizeDeviceId: normalizeDeviceId
};