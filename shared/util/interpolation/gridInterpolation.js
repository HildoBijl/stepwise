const { ensureNumberLike, getClosestIndices } = require('./support')
const { interpolate } = require('./rangeInterpolation')

/* gridInterpolate applies linear (or bilinear, trilinear, etcetera) interpolation between a series or grid of numbers. It has various use cases, depending on the number of input parameters.
 * - For a single parameter: gridInterpolate(V1, [Vo-series], [V1-series]). It is assumed here that the input series V1-series is in ascending order. Optionally you can use [V1] instead of V1.
 * - For two parameters: interpolate([V1, V2], [[Vo-series for first V2-value], [V1-series for second V2-value], ...], [V1-series], [V2-series]).
 * - For three parameters: interpolate([V1, V2, V3], [[Vo-table for first V3-value], [Vo-table for second V3-value], ...], [V1-series], [V2-series], [V3-series]).
 * - And so forth ...
 * An example usage would be gridInterpolate([1963, 19], [[10, 11, 12, 13], [9, 12, 14, 17], [6, 7, 9, 10]], [1950, 1960, 1970, 1980], [18, 20, 22]). All parameters are obligatory.
 * It is possible to have undefined values in the grid. When this happens, and the input falls near such a value (that is, the value is needed for the interpolation) then undefined is returned. The return value is also undefined when the input value falls outside of the grid.
 */
function gridInterpolate(input, outputSeries, ...inputSeries) {
	// Is this the single-parameter case? Deal with it accordingly.
	if (!Array.isArray(input) || input.length === 1) {
		// Check the input parameter.
		input = ensureNumberLike(Array.isArray(input) ? input[0] : input)

		// Check that the input series spread only has one parameter and use it.
		if (inputSeries.length > 1)
			throw new Error(`Grid interpolate error: too many parameters. We received a total of ${inputSeries.length + 2} parameters for the grid interpolate function, for a simple one-dimensional problem. A maximum of 3 parameters is expected.`)
		inputSeries = inputSeries[0]

		// Ensure the input series is an array.
		inputSeries = inputSeries
		if (!Array.isArray(inputSeries))
			throw new Error(`Interpolate error: the input series was not an array. Instead, we received "${JSON.stringify(inputSeries)}".`)

		// Ensure the output series is an array with numbers.
		if (!Array.isArray(outputSeries))
			throw new Error(`Grid interpolate error: the output series was not an array. Instead, we received "${JSON.stringify(outputRange)}".`)
		if (inputSeries.length !== outputSeries.length)
			throw new Error(`Grid interpolate error: the input series and output series do not have matching lengths. The input series has length ${inputSeries.length} while the output series has length ${outputSeries.length}. This must be equal.`)

		// Find the interval containing the input value through a binary search and apply interpolation to it.
		const [min, max] = getClosestIndices(input, (index) => inputSeries[index], inputSeries.length)
		if (outputSeries[min] === undefined || outputSeries[max] === undefined)
			return undefined
		return interpolate(input, [outputSeries[min], outputSeries[max]], [inputSeries[min], inputSeries[max]])
	}

	// Reduce the problem to one with one parameter less. For this, we first separate the final parameter from the others, both in the input array and in the inputSeries array.
	input = [...input] // Clone input array to prevent adjusting original.
	if (inputSeries.length !== input.length)
		throw new Error(`Grid interpolate error: incorrect number of parameters given. A ${input.length}-dimensional problem should have ${input.length} input series given (after the input value and output table) but we received ${inputSeries.length} input series.`)
	const paramInputSeries = inputSeries.pop() // Remove last input series and store it.
	const param = ensureNumberLike(input.pop()) // Remove last parameter and store it.

	// Check the output table while we're at it.
	if (!Array.isArray(outputSeries))
		throw new Error(`Grid interpolate error: the outputSeries parameter must be an array. Instead, we received "${JSON.stringify(outputSeries)}".`)
	if (paramInputSeries.length !== outputSeries.length)
		throw new Error(`Grid interpolate error: incorrect size of the output table. The input series of the last parameter has ${paramInputSeries.length} entries. Hence, the output series/table should be an array with ${paramInputSeries.length} elements (sub-tables) but it has ${outputSeries.length} elements.`)

	// Find the interval containing the parameter value through a binary search.
	const [min, max] = getClosestIndices(param, (index) => paramInputSeries[index], paramInputSeries.length)

	// Grid-interpolate everything for the minimum value of our current parameter, and identically for the maximum value of our current parameter. Afterwards interpolate between these values to get the final answer.
	const Vmin = gridInterpolate(input, outputSeries[min], ...inputSeries)
	const Vmax = gridInterpolate(input, outputSeries[max], ...inputSeries)
	if (Vmin === undefined || Vmax === undefined)
		return undefined
	return interpolate(param, [Vmin, Vmax], [paramInputSeries[min], paramInputSeries[max]])
}
module.exports.gridInterpolate = gridInterpolate
