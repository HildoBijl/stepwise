const { arraysToObject } = require('../../../util/objects')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Vector } = require('../../../geometry')
const { Variable } = require('../../../CAS')
const { combinerAnd, combinerRepeat } = require('../../../skillTracking')

const { getStepExerciseProcessor, assembleSolution } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, getDefaultForce, getDefaultMoment, FBDComparison, getLoadNames, getLoadMatching, isMatchingComplete, getDirectionIndicators, performLoadsComparison, reverseLoad } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'calculateBasicSupportReactions',
	setup: combinerAnd('drawFreeBodyDiagram', combinerRepeat('calculateForceOrMoment', 2)),
	steps: ['drawFreeBodyDiagram', 'calculateForceOrMoment', null, 'calculateForceOrMoment'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		FAy: {}, // Default.
		loads: FBDComparison,
	},
}

function generateState() {
	return {
		l1: getRandomFloatUnit({ min: 4, max: 8, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 4, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		P: getRandomFloatUnit({ min: 2, max: 8, decimals: 0, unit: 'kN' }).setSignificantDigits(2),
	}
}

function getStaticSolution(state) {
	const { l1, l2, P } = state

	// Define points.
	const A = new Vector(0, 0)
	const B = new Vector(l1.number, 0)
	const C = new Vector(l1.number, -l2.number)
	const points = { A, B, C }

	// Define loads.
	const loads = [
		getDefaultForce(C, 0, external),
		getDefaultForce(A, Math.PI, reaction, true),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultMoment(A, false, 0, reaction),
	]
	const loadNames = ['P', 'FAx', 'FAy', 'MA']
	const loadVariables = loadNames.map(Variable.ensureVariable)
	const prenamedLoads = [{ load: loads[0], variable: loadVariables[0] }]
	const loadsToCheck = loadNames.slice(1, 4)

	// Calculate solution values.
	const loadValues = [
		P,
		P,
		P.multiply(0),
		P.multiply(l2),
	]

	return {
		...state, points, loads, loadNames, loadVariables, prenamedLoads, loadsToCheck, loadValues,
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
	return { directionIndices, hasAdjustedSolution, loads, loadValues, ...loadValuesObj }
}

const dependencyData = { dependentFields: ['loads'], getStaticSolution, getInputDependency, getDynamicSolution }

function checkInput(state, input, step) {
	const solution = assembleSolution(dependencyData, state, input)
	if (step === 0)
		return performLoadsComparison('loads', input, solution, data.comparison) && performComparison(solution.loadsToCheck, input, solution, data.comparison)
	if (step === 1)
		return performLoadsComparison('loads', input, solution, data.comparison)
	if (step === 2)
		return performComparison('FAx', input, solution, data.comparison)
	if (step === 3)
		return performComparison('FAy', input, solution, data.comparison)
	if (step === 4)
		return performComparison('MA', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	...dependencyData,
}
