const { deg2rad } = require('../../../util/numbers')
const { arraysToObject } = require('../../../util/objects')
const { getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Vector } = require('../../../geometry')
const { Variable } = require('../../../CAS')

const { getSimpleExerciseProcessor, assembleSolution } = require('../util/simpleExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, getDefaultForce, FBDComparison, getLoadNames, getLoadMatching, isMatchingComplete, getDirectionIndicators, performLoadsComparison, reverseLoad } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'demo',
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		loads: FBDComparison,
	},
}

function generateState() {
	return {
		l1: getRandomFloatUnit({ min: 2, max: 8, significantDigits: 1, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 8, significantDigits: 1, unit: 'm' }).setSignificantDigits(2),
		theta: getRandomInteger(6, 16) * 5,
		P: getRandomFloatUnit({ min: 2, max: 8, significantDigits: 1, unit: 'kN' }).setSignificantDigits(2),
		fixA: getRandomBoolean(),
	}
}

function getStaticSolution(state) {
	const { l1, l2, theta, P, fixA } = state
	const l = l1.add(l2)

	// Define points.
	const A = new Vector(0, 0)
	const B = new Vector(l1.number, 0)
	const C = new Vector(l.number, 0)
	const points = { A, B, C }

	// Define loads.
	const loads = [
		getDefaultForce(B, deg2rad(theta), external),
		getDefaultForce(fixA ? A : C, Math.PI, reaction, fixA),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultForce(C, -Math.PI / 2, reaction),
	]
	const loadNames = ['P', fixA ? 'FAx' : 'FCx', fixA ? 'FAy' : 'FA', fixA ? 'FC' : 'FCy']
	const loadVariables = loadNames.map(Variable.ensureVariable)
	const prenamedLoads = [{ load: loads[0], variable: loadVariables[0] }]
	const loadsToCheck = loadNames.slice(1, 4)

	// Calculate solution values.
	const Px = P.multiply(Math.cos(deg2rad(theta)))
	const Py = P.multiply(Math.sin(deg2rad(theta)))
	const loadValues = [
		P,
		Px,
		Py.multiply(l2.divide(l)),
		Py.multiply(l1.divide(l)),
	]

	return {
		...state, l, points, loads, loadNames, loadVariables, prenamedLoads, loadsToCheck, Px, Py, loadValues,
		getLoadNames: loads => getLoadNames(loads, points, prenamedLoads, data.comparison.loads),
	}
}

// The input dependency is the direction indicators: an array of true/false whether the force should be in the expected direction.
function getInputDependency(input, solution) {
	const defaultDependency = new Array(solution.loads.length).fill(true)
	if (!input.loads)
		return defaultDependency
	const matching = getLoadMatching(input.loads, solution.loads, data.comparison.loads)
	return isMatchingComplete(matching) ? getDirectionIndicators(solution.loads, matching) : defaultDependency
}

function getDynamicSolution(directionIndices, solution, state) {
	const hasAdjustedSolution = directionIndices.find(value => !value) === false // There is a false value.
	const loads = solution.loads.map((load, index) => directionIndices[index] ? load : reverseLoad(load))
	const loadValues = solution.loadValues.map((value, index) => directionIndices[index] ? value : value.applyMinus())
	const loadValuesObj = arraysToObject(solution.loadNames, loadValues)
	return { directionIndices, hasAdjustedSolution, loads, loadValues, ...loadValuesObj }
}

const dependencyData = { getStaticSolution, getInputDependency, dependentFields: ['loads'], getDynamicSolution }

function checkInput(state, input) {
	const solution = assembleSolution(dependencyData, state, input)
	return performLoadsComparison('loads', input, solution, data.comparison) && performComparison(solution.loadsToCheck, input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	...dependencyData,
}
