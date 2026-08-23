import { and } from '@step-wise/skill-setup'
import { buildMonoExercise } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

export default buildMonoExercise({
	metadata: {
		setup: and('calculateWithSpecificQuantities', 'massFlowTrick'),
		comparisons: { FloatUnit: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const rho = getRandomFloatUnit({ min: 0.35, max: 0.6, unit: 'kg/m^3', significantDigits: 2 })
		const mdot = getRandomFloatUnit({ min: 20, max: 80, unit: 'kg/s', significantDigits: 2 })
		return { rho, mdot }
	},

	getSolution({ rho, mdot }) {
		const v = rho.invert()
		const Vdot = mdot.multiply(v).setUnit('m^3/s')
		return { v, Vdot }
	},

	checkInput(data) {
		return compareInputs('Vdot', data)
	},
})
