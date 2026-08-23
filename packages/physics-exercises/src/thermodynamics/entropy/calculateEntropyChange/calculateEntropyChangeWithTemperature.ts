import { randomInteger, sample } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metadata: {
		skill: 'calculateEntropyChange',
		...createStepExerciseMetadata(['calculateWithTemperature', 'specificHeats', 'solveLinearEquation']),
		weight: 2,
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.015, significantDigitTolerance: 1 } },
			c: { value: { relativeTolerance: 0.015 } },
			T1: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
			T2: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
		},
	},

	generateParameters() {
		const type = randomInteger(0, 2)
		const medium = sample(gases)
		const T1o = getRandomQuantity({ min: 200, max: 400, decimals: -1, unit: 'dC' }).setDecimals(0)
		const T2o = getRandomQuantity({ min: 5, max: 30, decimals: 0, unit: 'dC' })
		const mo = getRandomQuantity({ min: 100, max: 800, decimals: -1, unit: 'g' }).setDecimals(0)
		return { type, medium, T1o, T2o, mo }
	},

	getSolution({ type, medium, T1o, T2o, mo }) {
		const T1 = T1o.simplify()
		const T2 = T2o.simplify()
		const m = mo.simplify()
		const c = type === 0 ? gasProperties[medium].cp : type === 1 ? gasProperties[medium].cv : new Quantity('0 J/kg*K')
		const dS = m.multiply(c).multiply(Math.log(T2.number / T1.number)).setUnit('J/K')
		return { T1, T2, m, c, dS }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['T1', 'T2'], data)
			case 2: return compareInputs('c', data)
			default: return compareInputs('dS', data)
		}
	},
})
