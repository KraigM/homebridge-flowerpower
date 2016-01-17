/**
 * Created by kraigm on 1/17/16.
 */

var Promise = require('promise');
var async = require('async');

var readAsyncCallback = function(resolve, reject) {
	var self = this;
	return function(err, rtn) {
		if (err) reject(err);
		else resolve(rtn);
	};
};

var readAsync = function(func) {
	return new Promise(function (resolve, reject) {
		func(readAsyncCallback(resolve, reject));
	});
};

var asyncSeries = function(tasks){
	return new Promise(function (resolve, reject) {
		async.series(tasks, readAsyncCallback(resolve, reject));
	});
};

var fromCallback = function(func){
	return new Promise(function (resolve, reject){
		func(readAsyncCallback(resolve, reject));
	});
};

module.exports = {
	readAsync: readAsync,
	readAsyncCallback: readAsyncCallback,
	asyncSeries: asyncSeries,
	fromCallback: fromCallback
};