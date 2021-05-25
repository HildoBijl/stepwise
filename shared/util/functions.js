const { ensureInt } = require('./numbers')

function noop() {}
module.exports.noop = noop

function repeat(times, func) {
	ensureInt(times, true)
	const arr = (new Array(times)).fill(0)
	arr.forEach((_, index) => func(index))
}
module.exports.repeat = repeat