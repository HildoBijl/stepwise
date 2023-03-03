const { Unit } = require('../../../inputTypes/Unit')
const { getRandomFloatUnit } = require('../../../inputTypes/FloatUnit')
const { argon: { Rs } } = require('../../../data/gasProperties')

const { getStepExerciseProcessor, addSetupFromSteps } = require('../util/stepExercise')

const data = {
	skill: 'gasLaw',
	steps: [['calculateWithVolume', 'calculateWithPressure', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation'],

	comparison: {
		V: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		p: {
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
		m: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const V = getRandomFloatUnit({
		min: 40,
		max: 200,
		decimals: -1,
		unit: 'cm^3',
	}).adjustSignificantDigits(1)

	const p = getRandomFloatUnit({
		min: 200,
		max: 800,
		significantDigits: 2,
		unit: 'mbar',
	}).adjustSignificantDigits(1)

	const T = getRandomFloatUnit({
		min: 15,
		max: 30,
		decimals: 0,
		unit: 'dC',
	})

	return { V, p, T }
}

function getSolution({ p, V, T }) {
	V = V.simplify()
	p = p.simplify()
	T = T.simplify()
	const m = p.multiply(V).divide(Rs.multiply(T)).setUnit('kg')
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
					return p.equals(input.p, data.comparison.p)
				case 3:
					return T.equals(input.T, data.comparison.T)
			}
		case 2:
			return Rs.equals(input.Rs, data.comparison.Rs)
		default:
			return m.equals(input.m, data.comparison.m)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
