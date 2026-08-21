import { sample, randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const media = ['air', 'argon', 'carbonMonoxide', 'helium', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

const metaData = {
	skill: 'calculateClosedCycle',
	...stepsToSetup(['calculateProcessStep', 'calculateProcessStep']),
	compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
}

export function generateParameters() {
	const medium = sample(media)
	const V1o = getRandomFloatUnit({ min: 20, max: 80, significantDigits: 2, unit: 'l' })
	const T1o = getRandomFloatUnit({ min: 1, max: 30, decimals: 0, unit: 'dC' })
	const p1o = getRandomFloatUnit({ min: 2, max: 3, significantDigits: 2, unit: 'bar' })
	const scale = randomNumber(2, 4)
	const V3o = V1o.multiply(scale).roundToPrecision()
	const { Rs } = gasProperties[medium]
	const mo = p1o.setUnit('Pa').multiply(V1o.setUnit('m^3')).divide(Rs.multiply(T1o.setUnit('K'))).setUnit('g').roundToPrecision()
	return { medium, mo, p1o, T1o, V3o }
}

export function getSolution({ medium, mo, p1o, T1o, V3o }: ReturnType<typeof generateParameters>) {
	const { Rs } = gasProperties[medium]
	const m = mo.simplify()
	const p1 = p1o.simplify()
	const T1 = T1o.simplify()
	const V3 = V3o.simplify()
	const mRs = m.multiply(Rs)
	const V1 = mRs.multiply(T1).divide(p1).setUnit('m^3')
	const p3 = p1
	const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
	const T2 = T3
	const V2 = V1
	const p2 = mo.multiply(Rs).multiply(T2).divide(V2).setUnit('Pa')
	return { m, Rs, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

export default buildStepExercise({
	metaData,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['p1', 'V1', 'T1', 'p3', 'V3', 'T3'], data)
			case 2: return compare(['p2', 'V2', 'T2'], data)
			default: return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3'], data)
		}
	},
})
