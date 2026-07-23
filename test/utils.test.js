'use strict';

const lookup = require('../lib/utils').lookup;

describe('lookup', function () {
	it('looks up nested fields with bracket notation', function () {
		const value = lookup({
			user: {
				token: 'nested-token'
			}
		}, 'user[token]');

		expect(value).to.equal('nested-token');
	});

	it('matches every nested segment case-insensitively when enabled', function () {
		const value = lookup({
			User: {
				Token: 'nested-token'
			}
		}, 'user[token]', {
			caseInsensitive: true
		});

		expect(value).to.equal('nested-token');
	});

	it('prefers an exact field over another case variant', function () {
		const value = lookup({
			token: 'exact-token',
			Token: 'alternate-token'
		}, 'token', {
			caseInsensitive: true
		});

		expect(value).to.equal('exact-token');
	});

	it('does not use a case variant when the exact field exists without a value', function () {
		const value = lookup({
			token: undefined,
			Token: 'alternate-token'
		}, 'token', {
			caseInsensitive: true
		});

		expect(value).to.equal(null);
	});

	it('rejects ambiguous case-insensitive fields without an exact match', function () {
		const value = lookup({
			TOKEN: 'first-token',
			Token: 'second-token'
		}, 'token', {
			caseInsensitive: true
		});

		expect(value).to.equal(null);
	});

	it('returns null when no case-insensitive field matches', function () {
		const value = lookup({
			other: 'value'
		}, 'token', {
			caseInsensitive: true
		});

		expect(value).to.equal(null);
	});

	it('returns null when a field resolves to an object instead of a token', function () {
		const value = lookup({
			token: {}
		}, 'token');

		expect(value).to.equal(null);
	});

	it('returns null when a nested lookup encounters a null value', function () {
		const value = lookup({
			user: null
		}, 'user[token]');

		expect(value).to.equal(null);
	});
});
