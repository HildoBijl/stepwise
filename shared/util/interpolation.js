import { ensureNumber, isNumber } from './numbers'

/* interpolate applies linear (or bilinear, trilinear, etcetera) interpolation between numbers. It has various use cases, depending on the number of input parameters.
 * - For a single parameter: interpolate(V1, [Vo_1min, Vo_1max], [V1_min, V1_max]). Here Vo_1min means the output at parameter 1's minimum value. Optionally you can use [V1] instead of V1.
 * - For two parameters: interpolate([V1, V2], [[Vo_1min_2min, Vo_1max_2min], [Vo_1min_2max, Vo_1max_2max]], [V1_min, V1_max], [V2_min, V2_max]).
 * - For three parameters: interpolate([V1, V2, V3], [[[Vo_1min_2min_3min, Vo_1max_2min_3min], [Vo_1min_2max_3min, Vo_1max_2max_3min]], [[Vo_1min_2min_3max, Vo_1max_2min_3max], [Vo_1min_2max_3max, Vo_1max_2max_3max]]], [V1_min, V1_max], [V2_min, V2_max], [V3_min, V3_max]).
 * - And so forth ...
 * The first two input parameters are obligatory. If a bounds array like [V1_min, V_1max] is not given, [0, 1] will be used as default. (Exception: in the single-parameter case also the default value of [Vo_1min, Vo_1max] is [0, 1]. For multi-parameter situations this output value array is obligatory.)
 * When the input does not fall within the input range, undefined is returned.
 */
export function interpolate(input, outputRange, ...inputRange) {
	// Is this the single-parameter case? Deal with it accordingly.
	if (!Array.isArray(input) || input.length === 1) {
		// Check the input parameter.
		input = ensureNumberLike(Array.isArray(input) ? input[0] : input)

		// Ensure the output range is an array with two numbers.
		outputRange = outputRange || [0, 1]
		if (!Array.isArray(outputRange) || outputRange.length !== 2)
			throw new Error(`Interpolate error: the output range was not an array of size 2. Instead, we received "${JSON.stringify(outputRange)}".`)
		outputRange = outputRange.map(bound => ensureNumberLike(bound))

		// Check that the inputRange spread only has one parameter and use it.
		if (inputRange.length > 1)
			throw new Error(`Interpolate error: too many parameters. We received a total of ${inputRange.length + 2} parameters for the interpolate function, for a simple one-dimensional problem. A maximum of 3 parameters is expected.`)
		inputRange = inputRange[0]

		// Ensure the input range is an array with two numbers.
		inputRange = inputRange || [0, 1]
		if (!Array.isArray(inputRange) || inputRange.length !== 2)
			throw new Error(`Interpolate error: the input range was not an array of size 2. Instead, we received "${JSON.stringify(inputRange)}".`)
		inputRange = inputRange.map(bound => ensureNumberLike(bound))

		// Apply the interpolation.
		if (isNumber(input) !== isNumber(inputRange[0]))
			throw new Error(`Invalid interpolation input: the input value must be of the same type as the input range, but this is not the case. The input value is "${input}" but the input range has values like "${inputRange[0]}".`)
		const part = isNumber(input) ?
			(input - inputRange[0]) / (inputRange[1] - inputRange[0]) :
			input.subtract(inputRange[0]).divide(inputRange[1].subtract(inputRange[0])).number
		if (part < 0 || part > 1)
			return undefined
		return isNumber(outputRange[0]) ?
			outputRange[0] + part * (outputRange[1] - outputRange[0]) :
			outputRange[0].add(outputRange[1].subtract(outputRange[0]).multiply(part))
	}

	// Reduce the problem to one with one parameter less. For this, we first separate the final parameter from the others, both in the input array and in the inputRange array.
	input = [...input] // Clone input array to prevent adjusting original.
	if (inputRange.length > input.length)
		throw new Error(`Interpolate error: too many parameters. We received a total of ${inputRange.length + 2} parameters for the interpolate function, for a ${input.length}-dimensional problem. A maximum of ${input.length + 2} parameters is expected.`)
	const paramInputRange = (inputRange.length < input.length ? [0, 1] : inputRange.pop()) // Remove last input range and store it. (Or use default if it doesn't exist.)
	const param = ensureNumberLike(input.pop()) // Remove last parameter and store it.

	// Check the output range while we're at it.
	if (!Array.isArray(outputRange) || outputRange.length !== 2)
		throw new Error(`Interpolate error: the output range was not an array of size 2. (These elements may be deeper arrays, depending on the dimensionality of the problem.) Instead, we received "${JSON.stringify(outputRange)}".`)

	// Next, we interpolate everything for the minimum value of our current parameter, and identically for the maximum value of our current parameter. Afterwards we interpolate between these values to get our final answer.
	const Vmin = interpolate(input, outputRange[0], ...inputRange)
	const Vmax = interpolate(input, outputRange[1], ...inputRange)
	return interpolate(param, [Vmin, Vmax], paramInputRange)
}

/* gridInterpolate applies linear (or bilinear, trilinear, etcetera) interpolation between a series or grid of numbers. It has various use cases, depending on the number of input parameters.
 * - For a single parameter: gridInterpolate(V1, [Vo-series], [V1-series]). It is assumed here that the input series V1-series is in ascending order. Optionally you can use [V1] instead of V1.
 * - For two parameters: interpolate([V1, V2], [[Vo-series for first V2-value], [V1-series for second V2-value], ...], [V1-series], [V2-series]).
 * - For three parameters: interpolate([V1, V2, V3], [[Vo-table for first V3-value], [Vo-table for second V3-value], ...], [V1-series], [V2-series], [V3-series]).
 * - And so forth ...
 * An example usage would be gridInterpolate([1963, 19], [[10, 11, 12, 13], [9, 12, 14, 17], [6, 7, 9, 10]], [1950, 1960, 1970, 1980], [18, 20, 22]). All parameters are obligatory.
 * It is possible to have undefined values in the grid. When this happens, and the input falls near such a value (that is, the value is needed for the interpolation) then undefined is returned. The return value is also undefined when the input value falls outside of the grid.
 */
export function gridInterpolate(input, outputSeries, ...inputSeries) {
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
				throw new Error(`Grid interpolate error: the input series must be an ascending array of numbers, but this is not the case. Received ${JSON.stringify(inputSeries)}.`)
		})

		// Ensure the output series is an array with numbers.
		if (!Array.isArray(outputSeries))
			throw new Error(`Grid interpolate error: the output series was not an array. Instead, we received "${JSON.stringify(outputRange)}".`)
		if (inputSeries.length !== outputSeries.length)
			throw new Error(`Grid interpolate error: the input series and output series do not have matching lengths. The input series has length ${inputSeries.length} while the output series has length ${outputSeries.length}. This must be equal.`)

		// Find the interval containing the input value through a binary search and apply interpolation to it.
		let min = 0, max = inputSeries.length - 1
		while (max - min > 1) {
			const trial = Math.floor((max + min) / 2)
			if (isNumber(input) ? input < inputSeries[trial] : input.compare(inputSeries[trial]) < 0)
				max = trial
			else
				min = trial
		}
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
	let min = 0, max = paramInputSeries.length - 1
	while (max - min > 1) {
		const trial = Math.floor((max + min) / 2)
		if (param < paramInputSeries[trial])
			max = trial
		else
			min = trial
	}

	// Grid-interpolate everything for the minimum value of our current parameter, and identically for the maximum value of our current parameter. Afterwards interpolate between these values to get the final answer.
	const Vmin = gridInterpolate(input, outputSeries[min], ...inputSeries)
	const Vmax = gridInterpolate(input, outputSeries[max], ...inputSeries)
	if (Vmin === undefined || Vmax === undefined)
		return undefined
	return interpolate(param, [Vmin, Vmax], [paramInputSeries[min], paramInputSeries[max]])
}

// tableInterpolate takes a table and interpolates in it. A table is an object of the form { grid: [ ... ], headers: [ ... ], ... }. Here, if the headers parameter has n sub-arrays (ranges), then the grid must be an n-dimensional array to match. Identically, the input must be an array with values for these n parameters. (If n = 1, a single parameter may be given instead of an array.)
export function tableInterpolate(input, table) {
	return gridInterpolate(input, table.grid, ...table.headers)
}

// inverseTableInterpolate takes a table with only one parameter (a 1D-table) and does inverse interpolation. The output is given and the input is found.
export function inverseTableInterpolate(output, table) {
	if (!table || !table.headers || !Array.isArray(table.headers))
		throw new Error(`Interpolation error: invalid table received.`)
	if (table.headers.length > 1)
		throw new Error(`Interpolation error: can only apply inverse table interpolation on a table with one input parameter. However, the given table has ${table.headers.length}.`)
	return gridInterpolate(output, table.headers[0], table.grid)
}

// ensureNumberLike checks if a given parameter is either a number or a number-like object with add/subtract/multiply/divide/compare functions and a number property.
export function ensureNumberLike(x) {
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
