'use strict';

/**
 * Module dependencies.
 */
const passport = require('passport-strategy'),
	util = require('util'),
	lookup = require('./utils').lookup;

/**
 * `Strategy` constructor.
 *
 * The token authentication strategy authenticates requests based on the
 * credentials submitted through an authentication token.
 *
 * Applications must supply a `verify` callback which accepts `token`
 * credentials, and then calls the `done` callback supplying a
 * `user` associated with the token, which should be set to `false`
 * if the credentials are not valid.
 * If an exception occured, `err` should be set.
 * The token can be optional, so the strategy can support both authenticated and
 * not authenticated calls
 *
 * Optionally, `options` can be used to change the fields in which the
 * credentials are found.
 *
 * Options:
 *   - `tokenFields`  array of field names where the token is found, defaults to [token]
 *   - `headerFields`  array of field names where the token is found, defaults to []
 *   - `passReqToCallback`  when `true`, `req` is the first argument to the verify callback (default: `false`)
 *   - `params`  when `true` the request params are also included in the lookup
 *   - `optional`  when `true` the token is optional and the strategy doesn't return an error
 *   - `caseInsensitive`  when `true`, field-name lookup is case-insensitive (default: `false`)
 *
 * Examples:
 *
 *     passport.use(new AuthTokenStrategy(
 *       function(token, done) {
 *         AccessToken.findById(token, function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options Additional options.
 * @param {Function} verify A verification callback.
 * @constructor
 * @api public
 */
function Strategy(options, verify) {
	if (typeof options === 'function') {
		verify = options;
		options = {};
	}

	options = options || {};

	if (!verify) {
		throw new TypeError('AuthTokenStrategy requires a verify callback');
	}

	this._tokenFields = options.tokenFields || ['token'];
	this._headerFields = options.headerFields || [];
	this._caseInsensitive = options.caseInsensitive === true;

	passport.Strategy.call(this);
	this.name = 'authtoken';
	this._verify = verify;
	this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Finds the first configured token while preserving source precedence.
 *
 * Headers take priority over body and query fields. Route parameters are used
 * only as a fallback when explicitly enabled.
 *
 * @param {Object} req The HTTP request.
 * @param {Array<String>} headerFields The configured header field names.
 * @param {Array<String>} tokenFields The configured request field names.
 * @param {Object} options The request-specific authentication options.
 * @param {Object} lookupOptions The property lookup options.
 * @returns {*} The resolved token, or a falsey value when no token is found.
 */
function findToken(req, headerFields, tokenFields, options, lookupOptions) {
	let i, len, token;

	for (i = 0, len = headerFields.length; !token && i < len; i++) {
		token = lookup(req.headers, headerFields[i], lookupOptions);
	}

	for (i = 0, len = tokenFields.length; !token && i < len; i++) {
		token = lookup(req.body, tokenFields[i], lookupOptions) ||
			lookup(req.query, tokenFields[i], lookupOptions);

		// Route parameters are a fallback and must not replace a body or query token.
		if (!token && options.params) {
			token = lookup(req.params, tokenFields[i], lookupOptions);
		}
	}

	return token;
}

/**
 * Authenticate request based on the contents of a form submission.
 * @param {Object} req The HTTP request.
 * @param {Object} options The options.
 * @returns {Number} The error code.
 * @api protected
 */
Strategy.prototype.authenticate = function (req, options) {
	options = options || {};

	const lookupOptions = {
		// Request-specific Passport options may override the strategy setting.
		caseInsensitive: options.caseInsensitive === undefined ?
			this._caseInsensitive :
			options.caseInsensitive === true
	};
	const token = findToken(
		req,
		this._headerFields,
		this._tokenFields,
		options,
		lookupOptions
	);

	if (!options.optional) {
		if (!token) {
			return this.fail({
				message: options.badRequestMessage || 'Missing auth token'
			}, 400);
		}
	}

	const self = this;

	/**
	 * Implements the verified callback.
	 * @param {Error} err The error.
	 * @param {Object} user The user information.
	 * @param {Object|String|Number} info Additional carrier info
	 * @returns {Number} The error code.
	 */
	function verified(err, user, info) {
		if (err) {
			return self.error(err);
		}

		if (!options.optional) {
			if (!user) {
				return self.fail(info);
			}
		}

		self.success(user, info);
	}

	try {
		if (self._passReqToCallback) {
			this._verify(req, token, verified);
		} else {
			this._verify(token, verified);
		}
	} catch (ex) {
		return self.error(ex);
	}
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
