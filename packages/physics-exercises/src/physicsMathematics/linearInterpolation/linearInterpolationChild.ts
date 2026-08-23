import { randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloat, getRandomFloatUnit } from '@step-wise/physics-core'

export default buildStepExercise({
	metadata: {
		skill: 'linearInterpolation',
		...createStepExerciseMetadata(['solveLinearEquation', 'solveLinearEquation']),
		comparisons: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			x: { absoluteTolerance: 0.005, significantDigitTolerance: 1 },
		},
	},

	generateParameters() {
		const type = randomInteger(1, 2)
		const h1 = getRandomFloatUnit({ min: 80, max: 110, unit: 'cm', decimals: 0 })
		const h2 = getRandomFloatUnit({ min: 130, max: 160, unit: 'cm', decimals: 0 })
		const BMI1 = getRandomFloatUnit({ min: 15, max: 18, unit: 'kg/m^2' })
		const BMI2 = getRandomFloatUnit({ min: 17, max: 20, unit: 'kg/m^2' })
		const W1 = BMI1.multiply(h1.toPower(2)).setUnit('kg').setDecimals(0).roundToPrecision()
		const W2 = BMI2.multiply(h2.toPower(2)).setUnit('kg').setDecimals(0).roundToPrecision()
		const x = getRandomFloat({ min: 0.1, max: 0.9 })

		if (type === 1) {
			const h = h1.add(h2.subtract(h1).multiply(x)).roundToPrecision()
			return { type, h1, h2, W1, W2, h }
		}
		const W = W1.add(W2.subtract(W1).multiply(x)).roundToPrecision()
		return { type, h1, h2, W1, W2, W }
	},

	getSolution({ type, h1, h2, W1, W2, h, W }) {
		let x
		if (type === 1) {
			x = h!.subtract(h1).divide(h2.subtract(h1)).float
			W = W1.add(W2.subtract(W1).multiply(x)).roundToPrecision()
		} else {
			x = W!.subtract(W1).divide(W2.subtract(W1)).float
			h = h1.add(h2.subtract(h1).multiply(x)).roundToPrecision()
		}
		return { type, h1, h2, W1, W2, x, h, W }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('x', data)
			default: return compareInputs(data.parameters.type === 1 ? 'W' : 'h', data)
		}
	},
})
