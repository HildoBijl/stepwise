const { Unit, getRandomFloatUnit } = require('../../../inputTypes')
const { helium: { Rs } } = require('../../../data/gasProperties')
const { getStepExerciseProcessor, addSetupFromSteps } = require('../../../eduTools')

const data = {
	skill: 'gasLaw',
	steps: [['calculateWithMass', 'calculateWithTemperature', 'calculateWithPressure'], 'specificGasConstant', 'solveLinearEquation'],

	comparison: {
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
		p: {
			relativeMargin: 0.001,
			significantDigitMargin: 1,
			unitCheck: Unit.equalityTypes.exact,
		},
		Rs: {
			relativeMargin: 0.01,
			unitCheck: Unit.equalityTypes.sameUnitsAndPrefixes,
		},
		V: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
		},
	},
}
addSetupFromSteps(data)

function generateState() {
	const m = getRandomFloatUnit({
		min: 0.4,
		max: 2,
		significantDigits: 2,
		unit: 'g',
	})

	const T = getRandomFloatUnit({
		min: 10,
		max: 25,
		significantDigits: 2,
		unit: 'dC',
	})

	const p = getRandomFloatUnit({
		min: 1.0,
		max: 1.1,
		decimals: 2,
		unit: 'bar',
	})

	return { m, T, p }
}

function getSolution({ m, T, p }) {
	m = m.simplify()
	T = T.simplify()
	p = p.simplify()
	const V = m.multiply(Rs).multiply(T).divide(p).setUnit('m^3')
	return { p, V, m, Rs, T }
}

function checkInput(state, input, step, substep) {
	const { p, V, m, Rs, T } = getSolution(state)

	switch (step) {
		case 1:
			switch (substep) {
				case 1:
					return m.equals(input.m, data.comparison.m)
				case 2:
					return T.equals(input.T, data.comparison.T)
				case 3:
					return p.equals(input.p, data.comparison.p)
			}
		case 2:
			return Rs.equals(input.Rs, data.comparison.Rs)
		default:
			return V.equals(input.V, data.comparison.V)
	}
}

module.exports = {
	data,
	generateState,
	processAction: getStepExerciseProcessor(checkInput, data),
	checkInput,
	getSolution,
}
