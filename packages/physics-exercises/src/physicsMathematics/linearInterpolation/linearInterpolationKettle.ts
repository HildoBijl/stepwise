import { randomInteger } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomPrecisionNumber, getRandomQuantity } from '@step-wise/physics-core'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

export default buildStepExercise({
	metadata: {
		skill: 'linearInterpolation',
		...createStepExerciseMetadata(['solveLinearEquation', 'solveLinearEquation']),
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			x: { absoluteTolerance: 0.005, significantDigitTolerance: 1 },
		},
	},

	generateParameters() {
		const type = randomInteger(1, 2)
		const T1 = getRandomQuantity({ min: 20, max: 40, unit: 'dC', decimals: 0 })
		const T2 = getRandomQuantity({ min: 80, max: 100, unit: 'dC', decimals: 0 })
		const t1 = getRandomQuantity({ min: 10, max: 30, unit: 's', decimals: 0 })
		const t2 = getRandomQuantity({ min: 80, max: 160, unit: 's', decimals: 0 })
		const x = getRandomPrecisionNumber({ min: 0.1, max: 0.9 })

		if (type === 1) {
			const T = T1.add(T2.subtract(T1).multiply(x)).roundToPrecision()
			return { type, T1, T2, t1, t2, T }
		}
		const t = t1.add(t2.subtract(t1).multiply(x)).roundToPrecision()
		return { type, T1, T2, t1, t2, t }
	},

	getSolution({ type, T1, T2, t1, t2, T, t }) {
		let x
		if (type === 1) {
			x = T!.subtract(T1).divide(T2.subtract(T1)).value
			t = t1.add(t2.subtract(t1).multiply(x)).roundToPrecision()
		} else {
			x = t!.subtract(t1).divide(t2.subtract(t1)).value
			T = T1.add(T2.subtract(T1).multiply(x)).roundToPrecision()
		}
		return { type, T1, T2, t1, t2, x, T, t }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('x', data)
			default: return compareInputs(data.parameters.type === 1 ? 't' : 'T', data)
		}
	},
})
