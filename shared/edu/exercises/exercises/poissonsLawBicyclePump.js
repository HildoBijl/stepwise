const { getRandom } = require('../../../util/random')
const { getRandomFloat } = require('../../../inputTypes/Float')
const { Unit } = require('../../../inputTypes/Unit')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')

const data = {
	skill: 'poissonsLaw',
	steps: [['calculateWithTemperature', null, 'calculateWithVolume'], null, 'solveLinearEquation'],

	comparison: {
		V1: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
		},
		V2: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
		},
		VUnit: {
			type: Unit.equalityTypes.exact,
		},
		T1: {
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
addSetupFromSteps(data)

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
	const pressureRatio = getRandom(2, 5)
	const V2 = V1.multiply(Math.pow(pressureRatio, -1 / n.number)).roundToPrecision()

	return { n, T1, V1, V2 }
}

function getSolution({ n, T1, V1, V2 }) {
	T1 = T1.simplify()
	const T2 = T1.multiply(V1.float.divide(V2.float).toPower(n.subtract(1)))
	return { n, T1, T2, V1, V2 }
}

function checkInput(state, input, step, substep) {
	const { T1, T2, V1, V2 } = getSolution(state)
	const eo = data.comparison

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return T1.equals(input.T1, eo.T1)
				case 2:
					return V1.equals(input.V1, eo.V) && input.V1.unit.equals(input.V2.unit, eo.VUnit)
				case 3:
					return V2.equals(input.V2, eo.V) && input.V1.unit.equals(input.V2.unit, eo.VUnit)
			}
		case 2:
			return input.eq === 1
		default:
			return T2.equals(input.T2, eo.T2)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
