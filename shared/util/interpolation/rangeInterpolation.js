const { isNumber } = require('../numbers')
const { lastOf } = require('../arrays')

const { ensureNumberLike, getDefaultInputRange, getInterpolationPart, isValidPart } = require('./support')

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
		const part = getInterpolationPart(input, inputRange)
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
