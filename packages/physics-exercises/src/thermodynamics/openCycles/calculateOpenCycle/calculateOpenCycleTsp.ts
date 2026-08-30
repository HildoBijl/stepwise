import { sample } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

const metadata = {
	skill: 'calculateOpenCycle',
	...createStepExerciseMetadata(['calculateOpenProcessStep', 'calculateOpenProcessStep']),
	comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
}

export function generateParameters() {
	const medium = sample(media)
	const T1o = getRandomQuantity({ min: 1, max: 30, decimals: 0, unit: 'dC' })
	const p1o = getRandomQuantity({ min: 1, max: 2, significantDigits: 2, unit: 'bar' })
	const p2o = getRandomQuantity({ min: 6, max: 12, significantDigits: 2, unit: 'bar' })
	return { medium, p1o, T1o, p2o }
}

export function getSolution({ medium, p1o, T1o, p2o }: ReturnType<typeof generateParameters>) {
	const { Rs, k } = gasProperties[medium]
	const p1 = p1o.simplify()
	const T1 = T1o.simplify()
	const p2 = p2o.simplify()
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const T2 = T1
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	const p3 = p1
	const v3 = v2.multiply(Math.pow(p2.number / p3.number, 1 / k.number))
	const T3 = p3.multiply(v3).divide(Rs).setUnit('K')
	return { medium, Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3 }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], data)
			case 2: return compareInputs(['p3', 'v3', 'T3'], data)
			default: return compareInputs(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3'], data)
		}
	},
})
