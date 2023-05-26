

export function usePlotSettingsFromPoints(points, options) {

	const bounds = getBoundsFromPoints(points)
	return usePlotSettingsFromBounds(bounds, options)
}

export function usePlotSettingsFromBounds(bounds, options) {
	// ToDo: dynamically calculate ticks.

	// Plot setting options include here: desiredNumGridPoints (default 7), plotEndsInGridPoints (default true). Future plot settings can also include logarithmic scales.
	// Use desiredNumGridPoints: 10 for x, 8 for y or so. Judge by ratio instead of difference.

	// Below is sample Quryo code that might be helpful.
	// // We first determine two possible step sizes. We want step sizes of 1, 2, 5, 10, 20, 50, 100, and so on, and similarly of 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01, and so on. We will check which two of these values are closest. Those will then be our two options for the step size.
	// var desiredNumSteps = desiredNumGridPoints - 1;
	// var range = maxVal - minVal;
	// var preferredStepSize = range/desiredNumSteps;
	// var stepSizeLog = log10(preferredStepSize); // We take the base 10 logarithm. (Somehow the function Math.log10(...) doesn't work in internet explorer.)
	// var stepSizeLogFloor = Math.floor(stepSizeLog);
	// var difference = stepSizeLog - stepSizeLogFloor;
	// if (0 <= difference && difference < Math.LN2/Math.LN10) {
	// 	var stepSize1 = Math.pow(10, stepSizeLogFloor);
	// 	var stepSize2 = Math.pow(10, stepSizeLogFloor)*2;
	// } else if (Math.LN2/Math.LN10 <= difference && difference < Math.log(5)/Math.LN10) {
	// 	var stepSize1 = Math.pow(10, stepSizeLogFloor)*2;
	// 	var stepSize2 = Math.pow(10, stepSizeLogFloor)*5;
	// } else {
	// 	var stepSize1 = Math.pow(10, stepSizeLogFloor)*5;
	// 	var stepSize2 = Math.pow(10, stepSizeLogFloor)*10;
	// }
	// // We look at the number of steps which we will actually have if we use our options for step sizes. We pick the one which is closest to the number of desired steps. On a tie, we prefer to have a bit too many steps than a bit too few, so we go for the smallest step size, being stepSize1.
	// var minVal1 = (expandMinimum ? Math.floor(minVal/stepSize1)*stepSize1 : minVal - eps); // This is the minimum value in case we expand the bounds to always end on a grid point.
	// var maxVal1 = (expandMaximum ? Math.ceil(maxVal/stepSize1)*stepSize1 : maxVal + eps); // This is the minimum value in case we expand the bounds to always end on a grid point.
	// var numSteps1 = (maxVal1 - minVal1)/stepSize1;
	// var minVal2 = (expandMinimum ? Math.floor(minVal/stepSize2)*stepSize2 : minVal - eps); // This is the minimum value in case we expand the bounds to always end on a grid point.
	// var maxVal2 = (expandMaximum ? Math.ceil(maxVal/stepSize2)*stepSize2 : maxVal + eps); // This is the minimum value in case we expand the bounds to always end on a grid point.
	// var numSteps2 = (maxVal2 - minVal2)/stepSize2;
	// if (Math.abs(numSteps1 - desiredNumSteps) <= Math.abs(numSteps2 - desiredNumSteps)) {
	// 	var stepSize = stepSize1;
	// 	minVal = minVal1;
	// 	maxVal = maxVal1;
	// } else {
	// 	var stepSize = stepSize2;
	// 	minVal = minVal2;
	// 	maxVal = maxVal2;
	// }
	// // Now we look at where exactly we need to put the grid points. We return the result.
	// var gridPoints = [];
	// var exponent = Math.floor(log10(stepSize)); // This is necessary for rounding the grid points. When the step size is written as c*10^e, then the exponent is e. (For example, when the step size is 500, then it equals 5*10^2 and the exponent is 2.)
	// var putGridPointAt = roundTo(Math.ceil(minVal/stepSize)*stepSize, -exponent); // We round the grid point to make sure that there are no strange numerical problems, like a number 0.600000000000001 or so.
	// while (putGridPointAt <= maxVal) {
	// 	gridPoints.push(putGridPointAt);
	// 	putGridPointAt+= stepSize;
	// 	putGridPointAt = roundTo(putGridPointAt, -exponent); // We round the grid point to make sure that there are no strange numerical problems, like a number 0.600000000000001 or so.
	// }
	// return gridPoints;


	// Return something of the form:
	return { bounds, xTicks, yTicks }
}

