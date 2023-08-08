const { arraysToObject, getRandomBoolean } = require('../../../util')
const { FloatUnit, getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Vector } = require('../../../geometry')
const { Variable } = require('../../../CAS')

const { getStepExerciseProcessor, assembleSolution, addSetupFromSteps } = require('../util/stepExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, getDefaultForce, getDefaultMoment, FBDComparison, getLoadNames, getLoadMatching, isMatchingComplete, getDirectionIndicators, performLoadsComparison, reverseLoad } = require('../util/engineeringMechanics')

const { reaction, external } = loadSources

const data = {
	skill: 'calculateBasicSupportReactions',
	steps: ['drawFreeBodyDiagram', null, 'calculateForceOrMoment', 'calculateForceOrMoment'],
	comparison: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
		FAx: {}, // Default.
		loads: FBDComparison,
	},
}
addSetupFromSteps(data)

function generateState() {
	return {
		l1: getRandomFloatUnit({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l3: getRandomFloatUnit({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		M: getRandomFloatUnit({ min: 5, max: 30, decimals: 0, unit: 'kN*m' }).setSignificantDigits(2),
		clockwise: getRandomBoolean(),
	}
}

function getStaticSolution(state) {
	const { l1, l2, l3, M, clockwise } = state
	const l = l1.add(l2)

	// Define points.
	const A = new Vector(0, 0)
	const C = new Vector(l.number, -l3.number)
	const B = A.interpolate(C, l1.number / l.number)
	const points = { A, B, C }
	const Bx = new Vector(B.x, A.y)
	const Cx = new Vector(C.x, A.y)
	const angle = Math.atan2(l3.number, l.number)

	// Define loads.
	const loads = [
		getDefaultMoment(B, clockwise, -angle, external),
		getDefaultForce(A, 0, reaction),
		getDefaultForce(A, (clockwise ? 1 : -1) * Math.PI / 2, reaction, !clockwise),
		getDefaultForce(C, (clockwise ? -1 : 1) * Math.PI / 2, reaction, !clockwise),
	]
	const loadNames = ['M', 'FAx', 'FAy', 'FC']
	const loadVariables = loadNames.map(Variable.ensureVariable)
	const prenamedLoads = [{ load: loads[0], variable: loadVariables[0] }]
	const loadsToCheck = loadNames.slice(1, 4)

	// Calculate solution values.
	const loadValues = [
		M,
		new FloatUnit('0 kN'),
		M.divide(l),
		M.divide(l),
	]

	return {
		...state, points, l, Bx, Cx, angle, loads, loadNames, loadVariables, prenamedLoads, loadsToCheck, loadValues,
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
		return performComparison('FC', input, solution, data.comparison)
	if (step === 4)
		return performComparison('FAy', input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	...dependencyData,
}
