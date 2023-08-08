const { ensureInt } = require('../numbers')

// gcd returns the greatest common divisor of various integer numbers.
function gcd(...params) {
	// Check input.
	params = params.map(number => Math.abs(ensureInt(number)))
	if (params.length === 1)
		return params[0]
	if (params.length > 2)
		return gcd(gcd(params[0], params[1]), ...params.slice(2))

	// Calculate GCD through Euclides' algorithm.
	let a = params[0]
	let b = params[1]
	while (b > 0) {
		const c = b
		b = a % b
		a = c
	}
	return a
}
module.exports.gcd = gcd

// gcm returns the smallest common multiple of various integer numbers.
function scm(...params) {
	// Check input.
	params = params.map(number => Math.abs(ensureInt(number)))
	if (params.length === 1)
		return params[0]
	if (params.length > 2)
		return scm(scm(params[0], params[1]), ...params.slice(2))

	// Calculate SCM through GCD.
	const a = params[0]
	const b = params[1]
	return a * (b / gcd(a, b))
}
module.exports.scm = scm
