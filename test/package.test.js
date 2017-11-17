'use strict';

const strategy = require('..');

describe('passport-auth-token', function () {
	it('should export Strategy constructor directly from package', function () {
		expect(strategy).to.be.a('function');
		expect(strategy).to.equal(strategy.Strategy);
	});
});
