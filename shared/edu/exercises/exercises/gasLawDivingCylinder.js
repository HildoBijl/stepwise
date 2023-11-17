const { getRandomInteger } = require('../../../inputTypes/Integer')
const { Unit } = require('../../../inputTypes/Unit')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { oxygen: { Rs } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')

const data = {
	skill: 'gasLaw',
	steps: [['calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation'],

	comparison: {
		V: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		m: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		T: {
			absoluteMargin: 0.7,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Rs: {
			relativeMargin: 0.01,
			unitCheck: Unit.equalityTypes.sameUnitsAndPrefixes,
		},
		p: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const p = getRandomFloatUnit({ // Note: this is the final input.wer. It won't be part of the state.
		min: 180,
		max: 300,
		significantDigits: 2,
		unit: 'bar',
	})

	const V = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: getRandomInteger(2, 3),
		unit: 'l',
	})

	const T = getRandomFloatUnit({
		min: 3,
		max: 18,
		significantDigits: 2,
		unit: 'dC',
	})

	const m = p.multiply(V).divide(Rs.multiply(T.setUnit('K'))).setUnit('kg').roundToPrecision()

	return { V, m, T }
}

function getSolution({ V, m, T }) {
	V = V.simplify()
	T = T.simplify()
	const p = m.multiply(Rs).multiply(T).divide(V).setUnit('Pa')
	return { p, V, m, Rs, T }
}

function checkInput(state, input, step, substep) {
	const { p, V, m, Rs, T } = getSolution(state)

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return V.equals(input.V, data.comparison.V)
				case 2:
					return m.equals(input.m, data.comparison.m)
				case 3:
					return T.equals(input.T, data.comparison.T)
			}
		case 2:
			return Rs.equals(input.Rs, data.comparison.Rs)
		default:
			return p.equals(input.p, data.comparison.p)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
