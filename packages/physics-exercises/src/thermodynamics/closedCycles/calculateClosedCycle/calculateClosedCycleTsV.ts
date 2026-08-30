import { sample } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

const metadata = {
	skill: 'calculateClosedCycle',
	...createStepExerciseMetadata(['calculateProcessStep', 'calculateProcessStep']),
	comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
}

export function generateParameters() {
		const medium = sample(media)
		const V1o = getRandomQuantity({ min: 1, max: 3, significantDigits: 2, unit: 'm^3' })
		const T1o = getRandomQuantity({ min: 1, max: 30, decimals: 0, unit: 'dC' })
		const p1o = getRandomQuantity({ min: 1, max: 2, significantDigits: 2, unit: 'bar' })
		const p2o = getRandomQuantity({ min: 6, max: 12, significantDigits: 2, unit: 'bar' })
		return { medium, p1o, V1o, T1o, p2o }
}

export function getSolution({ medium, p1o, V1o, T1o, p2o }: ReturnType<typeof generateParameters>) {
		const { Rs, k } = gasProperties[medium]
		const p1 = p1o.simplify()
		const V1 = V1o.simplify()
		const T1 = T1o.simplify()
		const p2 = p2o.simplify()
		const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
		const mRs = m.multiply(Rs)
		const T2 = T1
		const V2 = mRs.multiply(T2).divide(p2).setUnit('m^3')
		const V3 = V1
		const p3 = p2o.multiply(Math.pow(V2.number / V3.number, k.number))
		const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
		return { medium, m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], data)
			case 2: return compareInputs(['p3', 'V3', 'T3'], data)
			default: return compareInputs(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], data)
		}
	},
})
