'use strict';

/**
 * Resolves a property name while preserving exact-match precedence.
 *
 * Ambiguous case-insensitive matches are rejected so an attacker cannot choose
 * between differently cased token fields by relying on object insertion order.
 *
 * @param {Object} obj The object containing the property.
 * @param {String} field The requested property name.
 * @param {Boolean} caseInsensitive Whether case-insensitive matching is enabled.
 * @returns {String|null} The resolved property name.
 */
function resolvePropertyName(obj, field, caseInsensitive) {
	if (!caseInsensitive || Object.prototype.hasOwnProperty.call(obj, field)) {
		return field;
	}

	const normalizedField = field.toLowerCase(),
		matchingFields = Object.keys(obj).filter(function (candidate) {
			return candidate.toLowerCase() === normalizedField;
		});

	return matchingFields.length === 1 ? matchingFields[0] : null;
}

/**
 * Looks up a value on the object.
 * @param {Object} obj The object to look through.
 * @param {String} field The name of the field to check.
 * @param {Object} [options] The lookup options.
 * @param {Boolean} options.caseInsensitive Whether or not to do case insensitive checking.
 * @returns {*} The resolved value, or `null` when the field is not found.
 */
exports.lookup = function (obj, field, options) {
	if (!obj) {
		return null;
	}

	options = options || {};

	const chain = field.split(']').join('').split('[');

	for (let i = 0, len = chain.length; i < len; i++) {
		if (!obj) {
			return null;
		}

		const propertyName = resolvePropertyName(obj, chain[i], options.caseInsensitive);

		if (propertyName === null) {
			return null;
		}

		const prop = Reflect.get(obj, propertyName);

		if (typeof prop === 'undefined') {
			return null;
		}

		if (typeof prop !== 'object') {
			return prop;
		}

		obj = prop;
	}

	return null;
};
