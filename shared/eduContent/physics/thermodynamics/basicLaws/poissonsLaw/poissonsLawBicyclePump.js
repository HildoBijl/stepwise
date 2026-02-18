const { getRandomNumber } = require('../../../../../util')
const { getRandomFloat, Unit, getRandomFloatUnit } = require('../../../../../inputTypes')
const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const metaData = {
	skill: 'poissonsLaw',
	steps: [['calculateWithTemperature', null, 'calculateWithVolume'], null, 'solveLinearEquation'],
	comparison: {
		V1s: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
		},
		V2s: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
		},
		T1s: {
			absoluteMargin: 0.7,
			significantDigitMargin: 2,
			unitCheck: Unit.equalityTypes.exact,
		},
		T2: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(metaData)

function generateState() {
	const n = getRandomFloat({
		min: 1.1,
		max: 1.3,
		decimals: 1,
	})
	const T1 = getRandomFloatUnit({
		min: 5,
		max: 30,
		significantDigits: 2,
		unit: 'dC',
	})
	const V1 = getRandomFloatUnit({
		min: 0.2,
		max: 1.2,
		significantDigits: 2,
		unit: 'l',
	})

	// Use Poisson's law to calculate the final volume for a realistic pressure ratio.
	const pressureRatio = getRandomNumber(2, 5)
	const V2 = V1.multiply(Math.pow(pressureRatio, -1 / n.number)).roundToPrecision()

	return { n, T1, V1, V2 }
}

function getSolution({ n, T1, V1, V2 }) {
	const T1s = T1.simplify()
	const V1s = V1
	const V2s = V2
	const eq = 1
	const T2 = T1s.multiply(V1.float.divide(V2.float).toPower(n.subtract(1)))
	return { n, T1s, T2, V1s, V2s, eq }
}

function checkInput(exerciseData, step, substep) {
	const { input } = exerciseData
	const { V1s, V2s } = input
	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return performComparison(exerciseData, 'T1s')
				case 2:
					return performComparison(exerciseData, 'V1s') && V1s.unit.equals(V2s.unit, { type: Unit.equalityTypes.exact })
				case 3:
					return performComparison(exerciseData, 'V2s') && V1s.unit.equals(V2s.unit, { type: Unit.equalityTypes.exact })
			}
		case 2:
			return performComparison(exerciseData, 'eq')
		default:
			return performComparison(exerciseData, 'T2')
	}
}

const exercise = { metaData, generateState, checkInput, getSolution }
module.exports = {
	...exercise,
	processAction: getStepExerciseProcessor(exercise),
}
