import { sample } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

const metadata = {
	skill: 'calculateClosedCycle',
	...createStepExerciseMetadata(['calculateProcessStep', 'calculateProcessStep', 'calculateProcessStep']),
	compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
}

export function generateParameters() {
	const medium = sample(media)
	const V1o = getRandomFloatUnit({ min: 4, max: 30, significantDigits: 2, unit: 'l' })
	const T1o = getRandomFloatUnit({ min: 1, max: 30, decimals: 0, unit: 'dC' })
	const p1o = getRandomFloatUnit({ min: 1, max: 2, significantDigits: 2, unit: 'bar' })
	const p2o = getRandomFloatUnit({ min: 6, max: 12, significantDigits: 2, unit: 'bar' })
	const p4o = getRandomFloatUnit({ min: 6, max: 12, significantDigits: 2, unit: 'bar' })
	const { Rs } = gasProperties[medium]
	const mo = p1o.setUnit('Pa').multiply(V1o.setUnit('m^3')).divide(Rs.multiply(T1o.setUnit('K'))).setUnit('g').roundToPrecision()
	return { medium, mo, p1o, V1o, p2o, p4o }
}

export function getSolution({ medium, mo, p1o, V1o, p2o, p4o }: ReturnType<typeof generateParameters>) {
	const { Rs, k } = gasProperties[medium]
	const m = mo.simplify()
	const p1 = p1o.simplify()
	const V1 = V1o.simplify()
	const p2 = p2o.simplify()
	const p4 = p4o.simplify()
	const mRs = mo.multiply(Rs)
	const T1 = p1.multiply(V1).divide(mRs).setUnit('K')
	const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
	const T2 = p2.multiply(V2).divide(mRs).setUnit('K')
	const T4 = T1
	const V4 = mRs.multiply(T4).divide(p4).setUnit('m^3')
	const T3 = T2
	const V3 = V4.multiply(Math.pow(T4.number / T3.number, 1 / (k.number - 1)))
	const p3 = mRs.multiply(T3).divide(V3).setUnit('Pa')
	return { medium, m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], data)
			case 2: return compare(['p4', 'V4', 'T4'], data)
			case 3: return compare(['p3', 'V3', 'T3'], data)
			default: return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'], data)
		}
	},
})
