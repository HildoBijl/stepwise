import { and } from '@step-wise/skill-setup'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'

import { buildMonoExercise } from '#exerciseBuilding'

export default buildMonoExercise({
	metadata: {
		setup: and('calculateWithSpecificQuantities', 'massFlowTrick'),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const rho = getRandomQuantity({ min: 0.35, max: 0.6, unit: 'kg/m^3', significantDigits: 2 })
		const mdot = getRandomQuantity({ min: 20, max: 80, unit: 'kg/s', significantDigits: 2 })
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
