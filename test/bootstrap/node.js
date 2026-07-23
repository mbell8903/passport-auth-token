'use strict';

const nodeTest = require('node:test');

global.chai = require('chai');
global.chai.use(require('chai-passport-strategy'));

/*
 * Preserve the existing Mocha-style test globals while using Node's built-in
 * runner across every supported CI version.
 */
global.describe = nodeTest.describe;
global.it = nodeTest.it;

/**
 * Registers a callback-based setup hook with Node's promise-based test runner.
 *
 * @param {Function} hook The legacy setup callback.
 * @returns {void}
 */
global.before = function (hook) {
	nodeTest.before(function () {
		return new Promise(function (resolve, reject) {
			hook(function (err) {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		});
	});
};

global.expect = chai.expect;
