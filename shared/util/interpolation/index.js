const { ensureNumberLike, getInterpolationPart, getClosestIndices } = require('./support')

module.exports = {
	// Only export select functions from the support, since not all of them are meant to be exported outside of this module.
	ensureNumberLike,
	getInterpolationPart,
	getClosestIndices,

	// Export the main functionalities.
	...require('./rangeInterpolation'),
	...require('./gridInterpolation'),
	...require('./tableInterpolation'),
}
