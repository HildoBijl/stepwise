import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'

export default buildStepExercise({
	metadata: {
		skill: 'calculateWithEnthalpy',
		...createStepExerciseMetadata(['massFlowTrick', 'calculateSpecificHeatAndMechanicalWork', 'solveLinearEquation']),
		comparisons: { FloatUnit: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const mdot = getRandomFloatUnit({ min: 10, max: 50, decimals: 0, unit: 'kg/s' })
		const wt = getRandomFloatUnit({ min: 600, max: 1200, unit: 'kJ/kg' })
		const P = mdot.multiply(wt).setUnit('MW').roundToPrecision()
		return { P, mdot }
	},

	getSolution({ P, mdot }) {
		const Ps = P.simplify()
		const wt = P.divide(mdot).setUnit('kJ/kg')
		const q = new FloatUnit('0 kJ/kg')
		const dh = q.subtract(wt)
		return { Ps, q, wt, dh }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('wt', data)
			case 2: return compareInputs('q', data)
			default: return compareInputs('dh', data)
		}
	},
})
