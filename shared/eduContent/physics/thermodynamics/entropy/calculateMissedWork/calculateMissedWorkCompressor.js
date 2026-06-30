const { getStepExerciseProcessor, addSetupFromSteps, performComparison } = require('../../../../../eduTools')

const { generateState, getSolution: getSolutionPrevious } = require('../calculateEntropyChange/calculateEntropyChangeWithProperties')

const metaData = {
	skill: 'calculateMissedWork',
	steps: ['poissonsLaw', 'calculateEntropyChange', 'calculateSpecificHeatAndMechanicalWork', 'calculateEntropyChange', null, 'solveLinearEquation'],
	comparison: {
		default: {
			float: {
				relativeTolerance: 0.01,
				significantDigitTolerance: 1,
			},
		},
	},
}
addSetupFromSteps(metaData)

function getSolution(state) {
	const solution = getSolutionPrevious(state)
	let { T1, T2, ds: dsIn, c } = solution
	dsIn = dsIn.setDecimals(0)
	const q = c.multiply(T2.subtract(T1)).multiply(-1).setUnit('J/kg')
	const dsOut = q.divide(T1).setUnit('J/kg * K').setDecimals(0)
	const ds = dsIn.add(dsOut)
	const wm = T1.multiply(ds).setUnit('J/kg')
	return { ...solution, q, dsIn, dsOut, ds, wm }
}

function checkInput(exerciseData, step) {
	switch (step) {
		case 1:
			return performComparison(exerciseData, 'T2')
		case 2:
			return performComparison(exerciseData, 'dsIn')
		case 3:
			return performComparison(exerciseData, 'q')
		case 4:
			return performComparison(exerciseData, 'dsOut')
		case 5:
			return performComparison(exerciseData, 'ds')
		default:
			return performComparison(exerciseData, 'wm')
	}
}

module.exports = buildStepExercise({ metaData, generateState, getSolution, checkInput })
