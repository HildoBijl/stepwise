const { deg2rad, arraysToObject, getRandomInteger } = require('../../../util')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Variable } = require('../../../CAS')
const { Vector } = require('../../../geometry')
const { getStepExerciseProcessor, assembleSolution, addSetupFromSteps, performComparison } = require('../../../eduTools')

const { loadSources, getDefaultForce, FBDComparison, getLoadNames, getLoadMatching, isMatchingComplete, getDirectionIndicators, performLoadsComparison, reverseLoad } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'calculateBasicSupportReactions',
	steps: ['drawFreeBodyDiagram', 'calculateForceOrMoment', 'calculateForceOrMoment', null],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		loads: FBDComparison,
	},
}
addSetupFromSteps(data)

function generateState() {
	return {
		l1: getRandomFloatUnit({ min: 2, max: 7, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 7, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		P: getRandomFloatUnit({ min: 2, max: 8, decimals: 0, unit: 'kN' }).setSignificantDigits(2),
		angle: getRandomInteger(4, 14) * 5,
	}
}

function getStaticSolution(state) {
	const { l1, l2, P, angle } = state
	const l = l1.add(l2)
	const angleRad = deg2rad(angle)

	// Define points.
	const A = new Vector(0, 0)
	const B = new Vector(l1.number, 0)
	const C = new Vector(l.number, 0)
	const points = { A, B, C }
	const anglePoints = [Vector.fromPolar(1, -angleRad), Vector.zero, Vector.fromPolar(1, 0)]

	// Define loads.
	const loads = [
		getDefaultForce(B, Math.PI / 2, external),
		getDefaultForce(A, 0, reaction),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultForce(C, -Math.PI / 2 - angleRad, reaction),
	]
	const loadNames = ['P', 'FAx', 'FAy', 'FC']
	const loadVariables = loadNames.map(Variable.ensureVariable)
	const prenamedLoads = [{ load: loads[0], variable: loadVariables[0] }]
	const loadsToCheck = loadNames.slice(1, 4)

	// Calculate solution values.
	const FCy = P.multiply(l1.number / l.number)
	const FC = FCy.divide(Math.cos(angleRad))
	const FCx = FCy.multiply(Math.tan(angleRad))
	const FAx = FCx
	const FAy = P.subtract(FCy)
	const loadValues = [P, FAx, FAy, FC]

	return {
		...state, points, l, angleRad, anglePoints, loads, loadNames, loadVariables, prenamedLoads, loadsToCheck, loadValues,
		getLoadNames: loads => getLoadNames(loads, points, prenamedLoads, data.comparison.loads),
	}
}

// The input dependency is the direction indicators: an array of true/false whether the force/moment should be in the expected direction.
function getInputDependency(input, solution) {
	const defaultDependency = new Array(solution.loads.length).fill(true)
	if (!input.loads)
		return defaultDependency
	const matching = getLoadMatching(input.loads, solution.loads, data.comparison.loads)
	if (!isMatchingComplete(matching))
		return defaultDependency
	return getDirectionIndicators(solution.loads, matching)
}

function getDynamicSolution(directionIndices, solution, state) {
	const hasAdjustedSolution = directionIndices.find(value => !value) === false // There is a false value.
	const loads = solution.loads.map((load, index) => directionIndices[index] ? load : reverseLoad(load))
	const loadValues = solution.loadValues.map((value, index) => directionIndices[index] ? value : value.applyMinus())
	const loadValuesObj = arraysToObject(solution.loadNames, loadValues)

	// Recalculate components of FC.
	const [, FAx, FAy, FC] = loadValues
	const FCx = FC.multiply(Math.sin(solution.angleRad))
	const FCy = FC.multiply(Math.cos(solution.angleRad))

	return { directionIndices, hasAdjustedSolution, loads, loadValues, ...loadValuesObj, FAx, FAy, FC, FCx, FCy }
}

const dependencyData = { dependentFields: ['loads'], getStaticSolution, getInputDependency, getDynamicSolution }

function checkInput(state, input, step) {
	const solution = assembleSolution(dependencyData, state, input)
	if (step === 0)
		return performLoadsComparison('loads', input, solution, data.comparison) && performComparison(solution.loadsToCheck, input, solution, data.comparison)
	if (step === 1)
		return performLoadsComparison('loads', input, solution, data.comparison)
	if (step === 2)
		return performComparison('FC', input, solution, data.comparison)
	if (step === 3)
		return performComparison('FAy', input, solution, data.comparison)
	if (step === 4)
		return performComparison('FAx', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	...dependencyData,
}
