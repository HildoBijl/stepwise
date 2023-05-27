import { roundTo } from 'step-wise/util/numbers'
import { numberArray } from 'step-wise/util/arrays'

// getTicks takes a minimum and a maximum value (like -32 and 94) and gives an array of tick points as a result (like [-40,-20,0,20,40,60,80,100]). It always has tick sizes of sizes 0.1, 0.2, 0.5, 1, 2, 5, 10, etcetera: something of the form 1*10^c, 2*10^c or 5*10^c. It aims to pick the one such that we are (ratio-wise) as close as possible to the given desired nmber of ticks. If extendBoundsToTicks is true (default) then the minimum and maximum will be around the given interval, while if it's set to false the minimum and maximum will be inside the given interval.
export function getTicks(min, max, desiredNumTicks = 7, extendBoundsToTicks = true) {
	// Find the log of the step size to see what range of step sizes we need.
	const desiredNumSteps = desiredNumTicks - 1
	const range = max - min
	const preferredStepSize = range / desiredNumSteps
	const stepSizeLog = Math.log10(preferredStepSize)
	const stepSizeLogFloored = Math.floor(stepSizeLog)
	const difference = stepSizeLog - stepSizeLogFloored

	// Check in which interval we are: 1-2, 2-5 or 5-10. From this, find the two (adjacent) possible step sizes.
	let multipliers
	if (0 <= difference && difference < Math.LN2 / Math.LN10)
		multipliers = [1, 2]
	else if (Math.LN2 / Math.LN10 <= difference && difference < 1 - Math.LN2 / Math.LN10)
		multipliers = [2, 5]
	else
		multipliers = [5, 10]
	const stepSizes = multipliers.map(multiplier => multiplier * Math.pow(10, stepSizeLogFloored))

	// Define a handler that, for a given step size, determines the lowest and highest tick value index. (The index is the integer number which must still be multiplied by the step size to get the tick value.)
	const getMinMaxIndex = stepSize => ({
		minIndex: Math[extendBoundsToTicks ? 'floor' : 'ceil'](min / stepSize),
		maxIndex: Math[extendBoundsToTicks ? 'ceil' : 'floor'](max / stepSize),
	})

	// Check the number of steps needed if we apply these step sizes.
	const numTicksNeeded = stepSizes.map(stepSize => {
		const { minIndex, maxIndex } = getMinMaxIndex(stepSize)
		return (maxIndex - minIndex) + 1
	})

	// Evaluate which of the two step sizes is better. Use the ratio of num steps to ideal number of steps for comparison.
	const index = (numTicksNeeded[0] / desiredNumTicks) < (desiredNumTicks / numTicksNeeded[1]) ? 0 : 1
	const stepSize = stepSizes[index]
	const { minIndex, maxIndex } = getMinMaxIndex(stepSize)
	return numberArray(minIndex, maxIndex).map(index => roundTo(index * stepSize, -stepSizeLogFloored)) // Apply rounding to ensure no numerical inaccuracies occur. (In Javascript 6*0.1 is not 0.6, for instance.)
}
