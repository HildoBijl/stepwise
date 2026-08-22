import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { air } = gasProperties

const metadata = {
	skill: 'calculateClosedCycle',
	...createStepExerciseMetadata(['calculateProcessStep', 'calculateProcessStep', 'calculateProcessStep']),
	compare: { FloatUnit: { float: { relativeTolerance: 0.015, significantDigitTolerance: 1 } } },
}

export function generateParameters() {
		const p1o = getRandomFloatUnit({ min: 0.9, max: 1.0, decimals: 2, unit: 'bar' })
		const V1o = getRandomFloatUnit({ min: 300, max: 600, significantDigits: 2, unit: 'cm^3' }).setDecimals(0)
		const T1o = getRandomFloatUnit({ min: 1, max: 30, decimals: 0, unit: 'dC' })
		const volumeFactor = randomNumber(15, 25)
		const p2o = p1o.multiply(Math.pow(volumeFactor, air.k.number)).setDecimals(0).roundToPrecision()
		const pressureFactor = randomNumber(1.3, 1.6)
		const p3o = p2o.multiply(pressureFactor).setDecimals(0).roundToPrecision()
		return { p1o, V1o, T1o, p2o, p3o }
}

export function getSolution({ p1o, V1o, T1o, p2o, p3o }: ReturnType<typeof generateParameters>) {
		const { Rs, k } = air
		const p1 = p1o.simplify()
		const V1 = V1o.simplify()
		const T1 = T1o.simplify()
		const p2 = p2o.simplify()
		const p3 = p3o.simplify()
		const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
		const mRs = m.multiply(Rs)
		const V2 = V1.multiply(Math.pow(p1.number / p2.number, 1 / k.number))
		const T2 = p2.multiply(V2).divide(mRs).setUnit('K')
		const V3 = V2
		const T3 = p3.multiply(V3).divide(mRs).setUnit('K')
		const V4 = V1
		const p4 = p3.multiply(Math.pow(V3.number / V4.number, k.number))
		const T4 = p4.multiply(V4).divide(mRs).setUnit('K')
		return { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2'], data)
			case 2: return compare(['p3', 'V3', 'T3'], data)
			case 3: return compare(['p4', 'V4', 'T4'], data)
			default: return compare(['p1', 'V1', 'T1', 'p2', 'V2', 'T2', 'p3', 'V3', 'T3', 'p4', 'V4', 'T4'], data)
		}
	},
})
