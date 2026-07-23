'use strict';

const Strategy = require('../lib/strategy');

/**
 * Authenticates one synthetic request and reports the Passport outcome.
 *
 * @param {Strategy} strategy The strategy under test.
 * @param {Object} request The request properties to apply.
 * @param {Object} [options] Request-specific authentication options.
 * @returns {Promise<Object>} The authentication outcome.
 */
function authenticate(strategy, request, options) {
	return new Promise(function (resolve, reject) {
		chai.passport.use(strategy)
			.success(function (user, info) {
				resolve({ type: 'success', user: user, info: info });
			})
			.fail(function (info, status) {
				resolve({ type: 'fail', info: info, status: status });
			})
			.error(reject)
			.request(function (req) {
				// Copy only the request containers consumed by this strategy.
				req.headers = request.headers;
				req.body = request.body;
				req.query = request.query;
				req.params = request.params;
			})
			.authenticate(options);
	});
}

describe('Strategy token lookup', function () {
	it('preserves case-sensitive field lookup by default', async function () {
		const strategy = new Strategy({
			headerFields: ['Authorization']
		}, function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			headers: { authorization: 'lowercase-header' }
		});

		expect(outcome.type).to.equal('fail');
		expect(outcome.status).to.equal(400);
	});

	it('supports explicitly configured case-insensitive lookup', async function () {
		const strategy = new Strategy({
			headerFields: ['Authorization'],
			caseInsensitive: true
		}, function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			headers: { authorization: 'lowercase-header' }
		});

		expect(outcome.type).to.equal('success');
		expect(outcome.user.token).to.equal('lowercase-header');
	});

	it('allows request-specific case-insensitive lookup', async function () {
		const strategy = new Strategy({
			tokenFields: ['ApiToken']
		}, function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			body: { apitoken: 'body-token' }
		}, {
			caseInsensitive: true
		});

		expect(outcome.type).to.equal('success');
		expect(outcome.user.token).to.equal('body-token');
	});

	it('allows a request to disable strategy-level case-insensitive lookup', async function () {
		const strategy = new Strategy({
			tokenFields: ['ApiToken'],
			caseInsensitive: true
		}, function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			body: { apitoken: 'body-token' }
		}, {
			caseInsensitive: false
		});

		expect(outcome.type).to.equal('fail');
		expect(outcome.status).to.equal(400);
	});

	it('preserves header priority over body, query, and route parameters', async function () {
		const strategy = new Strategy({
			headerFields: ['x-token'],
			tokenFields: ['token']
		}, function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			headers: { 'x-token': 'header-token' },
			body: { token: 'body-token' },
			query: { token: 'query-token' },
			params: { token: 'params-token' }
		}, {
			params: true
		});

		expect(outcome.type).to.equal('success');
		expect(outcome.user.token).to.equal('header-token');
	});

	it('does not replace a body token when route-parameter lookup is enabled', async function () {
		const strategy = new Strategy(function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			body: { token: 'body-token' },
			query: {},
			params: {}
		}, {
			params: true
		});

		expect(outcome.type).to.equal('success');
		expect(outcome.user.token).to.equal('body-token');
	});

	it('does not replace a query token when route-parameter lookup is enabled', async function () {
		const strategy = new Strategy(function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			body: {},
			query: { token: 'query-token' },
			params: { token: 'params-token' }
		}, {
			params: true
		});

		expect(outcome.type).to.equal('success');
		expect(outcome.user.token).to.equal('query-token');
	});

	it('uses a route parameter when earlier token sources are empty', async function () {
		const strategy = new Strategy(function (token, done) {
			done(null, { token: token });
		});

		const outcome = await authenticate(strategy, {
			body: {},
			query: {},
			params: { token: 'params-token' }
		}, {
			params: true
		});

		expect(outcome.type).to.equal('success');
		expect(outcome.user.token).to.equal('params-token');
	});

	it('keeps the UV passReqToCallback contract unchanged', async function () {
		let suppliedRequest;
		const strategy = new Strategy({
			headerFields: ['x-token', 'X-Token', 'authorization', 'Authorization'],
			tokenFields: ['apikey', 'apitoken', 'token'],
			passReqToCallback: true
		}, function (req, token, done) {
			suppliedRequest = req;
			done(null, { token: token });
		});
		const request = {
			headers: { authorization: 'uv-token' },
			body: {},
			query: {}
		};

		const outcome = await authenticate(strategy, request);

		expect(outcome.type).to.equal('success');
		expect(outcome.user.token).to.equal('uv-token');
		expect(suppliedRequest.headers).to.equal(request.headers);
	});

	it('allows verification to continue without a token when optional', async function () {
		let suppliedToken = 'not-called';
		const strategy = new Strategy(function (token, done) {
			suppliedToken = token;
			done(null, false, { anonymous: true });
		});

		const outcome = await authenticate(strategy, {
			headers: {},
			body: {},
			query: {}
		}, {
			optional: true
		});

		expect(outcome.type).to.equal('success');
		expect(outcome.user).to.equal(false);
		expect(outcome.info.anonymous).to.equal(true);
		expect(suppliedToken).to.equal(null);
	});
});
