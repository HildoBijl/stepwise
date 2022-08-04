const { deg2rad } = require('../../../util/numbers')
const { getRandomBoolean, getRandomInteger } = require('../../../util/random')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { Vector } = require('../../../geometry')
const { Variable } = require('../../../CAS')

const { getSimpleExerciseProcessor } = require('../util/simpleExercise')
const { performComparison } = require('../util/comparison')
const { loadSources, getDefaultForce, FBDComparison, getLoadNames, performLoadsComparison } = require('../util/engineeringMechanics')

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
		l1: getRandomInteger(2, 4),
		l2: getRandomInteger(2, 4),
		theta: getRandomInteger(6, 16) * 5,
		P: getRandomFloatUnit({ min: 2, max: 8, significantDigits: 1, unit: 'kN' }).setSignificantDigits(2),
		fixA: getRandomBoolean(),
	}
}

function getSolution(state) {
	const { l1, l2, theta, P, fixA } = state

	const A = new Vector(0, 0)
	const B = new Vector(l1, 0)
	const C = new Vector(l1 + l2, 0)
	const points = { A, B, C }

	const loads = [
		getDefaultForce(B, deg2rad(theta), external),
		getDefaultForce(fixA ? A : C, Math.PI, reaction, fixA),
		getDefaultForce(A, -Math.PI / 2, reaction),
		getDefaultForce(C, -Math.PI / 2, reaction),
	]
	const prenamedLoads = [{ load: loads[0], variable: new Variable('P') }]

	const Px = P.multiply(Math.cos(deg2rad(theta)))
	const Py = P.multiply(Math.sin(deg2rad(theta)))
	const loadValues = {
		[fixA ? 'FAy' : 'FA']: Py.multiply(l2 / (l1 + l2)),
		[fixA ? 'FC' : 'FCy']: Py.multiply(l1 / (l1 + l2)),
		[fixA ? 'FAx' : 'FCx']: Px,
	}

	return {
		...state, points, loads, Px, Py, loadValues, ...loadValues,
		getLoadNames: loads => getLoadNames(loads, points, prenamedLoads, data.comparison.loads),
	}
}

function checkInput(state, input) {
	const solution = getSolution(state)
	const { loadValues } = solution
	console.log(input)
	console.log(performLoadsComparison('loads', input, solution, data.comparison))
	return performLoadsComparison('loads', input, solution, data.comparison) && performComparison(Object.keys(loadValues), input, solution, data.comparison)
}

module.exports = {
	data,
	generateState,
	processAction: getSimpleExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
