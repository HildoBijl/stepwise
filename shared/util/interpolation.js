const { ensureNumber, isNumber } = require('./numbers')
const { lastOf } = require('./arrays')
const { isObject } = require('./objects')

/* interpolate applies linear (or bilinear, trilinear, etcetera) interpolation between numbers. It has various use cases, depending on the number of input parameters.
 * - For a single parameter: interpolate(V1, [Vo_1min, Vo_1max], [V1_min, V1_max]). Here Vo_1min means the output at parameter 1's minimum value. Optionally you can use [V1] instead of V1.
 * - For two parameters: interpolate([V1, V2], [[Vo_1min_2min, Vo_1max_2min], [Vo_1min_2max, Vo_1max_2max]], [V1_min, V1_max], [V2_min, V2_max]).
 * - For three parameters: interpolate([V1, V2, V3], [[[Vo_1min_2min_3min, Vo_1max_2min_3min], [Vo_1min_2max_3min, Vo_1max_2max_3min]], [[Vo_1min_2min_3max, Vo_1max_2min_3max], [Vo_1min_2max_3max, Vo_1max_2max_3max]]], [V1_min, V1_max], [V2_min, V2_max], [V3_min, V3_max]).
 * - And so forth ...
 * The first two input parameters are obligatory. If a bounds array like [V1_min, V_1max] is not given, [0, 1] will be used as default. (Exception: in the single-parameter case also the default value of [Vo_1min, Vo_1max] is [0, 1]. For multi-parameter situations this output value array is obligatory.)
 * When the input does not fall within the input range, undefined is returned.
 */
function interpolate(input, outputRange, ...inputRange) {
	// Is this the single-parameter case? Deal with it accordingly.
	if (!Array.isArray(input) || input.length === 1) {
		// Check the input parameter.
		input = ensureNumberLike(Array.isArray(input) ? input[0] : input)

		// Ensure the output range is an array with two numbers.
		outputRange = outputRange || getDefaultInputRange()
		if (!Array.isArray(outputRange) || outputRange.length !== 2)
			throw new Error(`Interpolate error: the output range was not an array of size 2. Instead, we received "${JSON.stringify(outputRange)}".`)
		outputRange = outputRange.map(bound => ensureNumberLike(bound))

		// Check that the inputRange spread only has one parameter and use it.
		if (inputRange.length > 1)
			throw new Error(`Interpolate error: too many parameters. We received a total of ${inputRange.length + 2} parameters for the interpolate function, for a simple one-dimensional problem. A maximum of 3 parameters is expected.`)
		inputRange = inputRange[0]

		// Apply the interpolation. Take into account the accuracy of the part when possible.
		const part = getPart(input, inputRange)
		if (!isValidPart(part))
			return undefined
		return isNumber(outputRange[0]) ?
			outputRange[0] + (isNumber(part) ? part : part.number) * (outputRange[1] - outputRange[0]) :
			outputRange[0].add(outputRange[1].subtract(outputRange[0]).multiply(part))
	}

	// Reduce the problem to one with one parameter less. For this, we first separate the final parameter from the others, both in the input array and in the inputRange array.
	input = [...input] // Clone input array to prevent adjusting original.
	if (inputRange.length > input.length)
		throw new Error(`Interpolate error: too many parameters. We received a total of ${inputRange.length + 2} parameters for the interpolate function, for a ${input.length}-dimensional problem. A maximum of ${input.length + 2} parameters is expected.`)
	const paramInputRange = (inputRange.length < input.length ? getDefaultInputRange(lastOf(input)) : inputRange.pop()) // Remove last input range and store it. (Or use default if it doesn't exist.)
	const param = ensureNumberLike(input.pop()) // Remove last parameter and store it.

	// Check the output range while we're at it.
	if (!Array.isArray(outputRange) || outputRange.length !== 2)
		throw new Error(`Interpolate error: the output range was not an array of size 2. (These elements may be deeper arrays, depending on the dimensionality of the problem.) Instead, we received "${JSON.stringify(outputRange)}".`)

	// Next, we interpolate everything for the minimum value of our current parameter, and identically for the maximum value of our current parameter. Afterwards we interpolate between these values to get our final answer.
	const Vmin = interpolate(input, outputRange[0], ...inputRange)
	const Vmax = interpolate(input, outputRange[1], ...inputRange)
	return interpolate(param, [Vmin, Vmax], paramInputRange)
}
module.exports.interpolate = interpolate

function getDefaultInputRange(value) {
	if (!value || isNumber(value))
		return [0, 1]
	return [value.multiply(0), value.multiply(0).add(1)]
}

function getPart(input, range) {
	// Ensure the input range is an array with two numbers.
	range = range || getDefaultInputRange(input)
	if (!Array.isArray(range) || range.length !== 2)
		throw new Error(`Interpolate error: the input range was not an array of size 2. Instead, we received "${JSON.stringify(range)}".`)
	range = range.map(bound => ensureNumberLike(bound))

	// Ensure that the input is of proper type.
	if (isNumber(input) !== isNumber(range[0]))
		throw new Error(`Invalid interpolation input: the input value must be of the same type as the input range, but this is not the case. The input value is "${input}" but the input range has values like "${range[0]}".`)

	// Calculate the part at which the input is.
	if (isNumber(input))
		return (input - range[0]) / (range[1] - range[0])
	return input.subtract(range[0]).divide(range[1].subtract(range[0]))
}
module.exports.getPart = getPart

// isValidPart checks if the given part is a valid part: that it is a number between 0 and 1.
function isValidPart(part) {
	const partNumber = (isNumber(part) ? part : part.number)
	return partNumber >= 0 && partNumber <= 1
}
module.exports.isValidPart = isValidPart

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

		// Ensure the input series is an array of ascending numbers.
		inputSeries = inputSeries
		if (!Array.isArray(inputSeries))
			throw new Error(`Interpolate error: the input series was not an array. Instead, we received "${JSON.stringify(inputSeries)}".`)
		inputSeries = inputSeries.map(value => ensureNumberLike(value))
		inputSeries.forEach((value, index) => {
			if (index > 0 && (isNumber(value) ? inputSeries[index - 1] >= value : inputSeries[index - 1].compare(value) >= 0))
				throw new Error(`Grid interpolate error: the input series must be an ascending array of numbers, but this is not the case.`)
		})

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

// getClosestIndices takes a value, a function through which values can be extracted from a series, and a series length, and finds the two indices in the series closest to the value. This is done through a binary search. It is assumed (but not checked) that the series is in ascending order.
function getClosestIndices(value, getSeriesValue, seriesLength) {
	let min = 0
	let max = seriesLength - 1
	while (max - min > 1) {
		const trial = Math.floor((max + min) / 2)
		const comparisonValue = getSeriesValue(trial)
		if (isNumber(value) ? value < comparisonValue : value.compare(comparisonValue) < 0)
			max = trial
		else
			min = trial
	}
	return [min, max]
}
module.exports.getClosestIndices = getClosestIndices

// tableInterpolate takes a table and interpolates in it. A table is an object of the form { grid: [ ... ], headers: [ ... ], ... }. Here, if the headers parameter has n sub-arrays (ranges), then the grid must be an n-dimensional array to match. Identically, the input must be an array with values for these n parameters. (If n = 1, a single parameter may be given instead of an array.)
function tableInterpolate(input, table) {
	return gridInterpolate(input, table.grid, ...table.headers)
}
module.exports.tableInterpolate = tableInterpolate

// inverseTableInterpolate takes a table with only one parameter (a 1D-table) and does inverse interpolation. The output is given and the input is found.
function inverseTableInterpolate(output, table) {
	if (!table || !table.headers || !Array.isArray(table.headers))
		throw new Error(`Interpolation error: invalid table received.`)
	if (table.headers.length > 1)
		throw new Error(`Interpolation error: can only apply inverse table interpolation on a table with one input parameter. However, the given table has ${table.headers.length}.`)
	return gridInterpolate(output, table.headers[0], table.grid)
}
module.exports.inverseTableInterpolate = inverseTableInterpolate

// columnTableInterpolate takes a table with various columns. Think of { pressure: [...], volume: [...], temperature: [...] }. It then takes the input value (for instance "300 K") and tries to interpolate it within the given inputLabel column (for instance "temperature"). Optionally also output labels can be provided, like "volume". If not, all values are returned.
function columnTableInterpolate(input, inputLabel, table, outputLabels) {
	// Verify the table and input label.
	if (!isObject(table))
		throw new Error(`Interpolation error: invalid table received. It was not an object.`)
	if (!inputLabel || !table[inputLabel] || !Array.isArray(table[inputLabel]))
		throw new Error(`Interpolation error: invalid input label "${inputLabel}" received. It was not a column of the given column table.`)

	// Verify the output labels.
	if (!outputLabels)
		outputLabels = Object.keys(table)
	const outputLabelsOriginal = outputLabels
	if (!Array.isArray(outputLabels))
		outputLabels = [outputLabels]
	outputLabels.forEach(outputLabel => {
		if (!outputLabel || !table[outputLabel] || !Array.isArray(table[outputLabel]))
			throw new Error(`Interpolation error: invalid output label "${outputLabel}" received. It was not a column of the given column table.`)
	})

	// For each output label, use the grid interpolate function to determine the corresponding value.
	const result = {}
	outputLabels.forEach(outputLabel => {
		if (inputLabel === outputLabel)
			result[outputLabel] = input
		else
			result[outputLabel] = gridInterpolate(input, table[outputLabel], table[inputLabel])
	})

	// Was a single output label received? If so, also return a single number.
	if (!Array.isArray(outputLabelsOriginal))
		return result[outputLabelsOriginal]
	return result
}
module.exports.columnTableInterpolate = columnTableInterpolate

// shiftingTableInterpolate takes a set of varying tables and interpolates between them. For instance, if you have a table for p = 1 bar, p = 2 bar, p = 4 bar, and so forth, then we can interpolate between them. The first parameter is the one for said table, with the second parameter indicating the corresponding label. The remaining parameters are the same as for the columnTableInterpolate function. The result is an object with the respective parameters.
function shiftingTableInterpolate(shiftingParameter, shiftingLabel, input, inputLabel, table, outputLabels) {
	// Check the outputLabels parameter.
	const originalOutputLabels = outputLabels
	if (!Array.isArray(outputLabels))
		outputLabels = [outputLabels]

	// Check the shifting parameter.
	shiftingParameter = ensureNumberLike(shiftingParameter)

	// Find the two closest tables through a binary search.
	const [min, max] = getClosestIndices(shiftingParameter, (index) => table[index][shiftingLabel], table.length)
	const closestTables = [table[min], table[max]]

	// Determine on which part we are between these two tables. If we are outside of the range, return undefined.
	const shiftingPart = getPart(shiftingParameter, closestTables.map(closestTable => closestTable[shiftingLabel]))
	if (!isValidPart(shiftingPart))
		return Array.isArray(originalOutputLabels) ? originalOutputLabels.map(_ => undefined) : undefined

	// For the input parameter, find the two closest numbers within each table.
	const closestIndices = closestTables.map(closestTable => getClosestIndices(input, (index) => closestTable[inputLabel][index], closestTable[inputLabel].length))
	const inputRange = [0, 1].map(startEndIndex => {
		const itemIndicesPerTable = [0, 1].map(tableIndex => closestIndices[tableIndex][startEndIndex])
		const itemValues = closestTables.map((columnTable, tableIndex) => columnTable[inputLabel][itemIndicesPerTable[tableIndex]])
		return interpolate(shiftingPart, itemValues)
	})
	const inputPart = getPart(input, inputRange)

	// For each requested output parameter, apply the proper interpolation, using the same indices as for the input.
	const result = {}
	outputLabels.forEach(outputLabel => {
		const outputRange = [0, 1].map(startEndIndex => {
			const itemIndicesPerTable = [0, 1].map(tableIndex => closestIndices[tableIndex][startEndIndex])
			const itemValues = closestTables.map((closestTable, tableIndex) => closestTable[outputLabel][itemIndicesPerTable[tableIndex]])
			return interpolate(shiftingPart, itemValues)
		})
		result[outputLabel] = interpolate(inputPart, outputRange)
	})

	// All done. Return the result.
	if (!Array.isArray(originalOutputLabels))
		return result[originalOutputLabels]
	return result
}
module.exports.shiftingTableInterpolate = shiftingTableInterpolate

// ensureNumberLike checks if a given parameter is either a number or a number-like object with add/subtract/multiply/divide/compare functions and a number property.
function ensureNumberLike(x) {
	// If we do not have an object, then it must be a number. Ensure it is.
	if (typeof x !== 'object')
		return ensureNumber(x)

	// We have an object. Check if it is number-like.
	const functions = ['add', 'subtract', 'multiply', 'divide', 'compare']
	functions.forEach(func => {
		if (typeof x[func] !== 'function')
			throw new Error(`Invalid parameter: expected a number or number-like object. Such a number-like object must have a "${func}" function, but the given parameter does not. Instead, it equals "${JSON.stringify(x)}".`)
	})
	if (x.number === undefined)
		throw new Error(`Invalid parameter: expected a number or number-like object. Such a number-like object must have a "number" property, but the given parameter does not. Instead, it equals "${JSON.stringify(x)}".`)

	// All good! Return the object.
	return x
}
module.exports.ensureNumberLike = ensureNumberLike