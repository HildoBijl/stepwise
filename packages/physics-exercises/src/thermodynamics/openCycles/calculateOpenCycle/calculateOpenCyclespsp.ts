import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, k } = gasProperties.air

const metadata = {
	skill: 'calculateOpenCycle',
	...createStepExerciseMetadata(['calculateOpenProcessStep', 'calculateOpenProcessStep', 'calculateOpenProcessStep']),
	compare: { FloatUnit: { float: { relativeTolerance: 0.015, significantDigitTolerance: 1 } } },
}

export function generateParameters() {
	const T1o = getRandomFloatUnit({ min: 1, max: 30, decimals: 0, unit: 'dC' })
	const p1o = new FloatUnit('1.0 bar')
	const p2o = getRandomFloatUnit({ min: 6, max: 12, significantDigits: 2, unit: 'bar' })
	const T3o = getRandomFloatUnit({ min: 900, max: 1200, decimals: -1, unit: 'dC' })
	return { p1o, T1o, p2o, T3o }
}

export function getSolution({ p1o, T1o, p2o, T3o }: ReturnType<typeof generateParameters>) {
	const p1 = p1o.simplify()
	const T1 = T1o.simplify()
	const p2 = p2o.simplify()
	const T3 = T3o.simplify()
	const p3 = p2
	const p4 = p1
	const factor = Math.pow(p2.number / p1.number, 1 - 1 / k.number)
	const T2 = T1.multiply(factor)
	const T4 = T3.divide(factor)
	const v1 = Rs.multiply(T1).divide(p1).setUnit('m^3/kg')
	const v2 = Rs.multiply(T2).divide(p2).setUnit('m^3/kg')
	const v3 = Rs.multiply(T3).divide(p3).setUnit('m^3/kg')
	const v4 = Rs.multiply(T4).divide(p4).setUnit('m^3/kg')
	return { Rs, k, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['p1', 'v1', 'T1', 'p2', 'v2', 'T2'], data)
			case 2: return compareInputs(['p3', 'v3', 'T3'], data)
			case 3: return compareInputs(['p4', 'v4', 'T4'], data)
			default: return compareInputs(['p1', 'v1', 'T1', 'p2', 'v2', 'T2', 'p3', 'v3', 'T3', 'p4', 'v4', 'T4'], data)
		}
	},
})
