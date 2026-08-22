import { or } from '@step-wise/skill-setup'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { generateParameters, getSolution as getCycleParametersRaw } from '../calculateClosedCycle/calculateClosedCycleSTST'

const metadata = {
	skill: 'createClosedCycleEnergyOverview',
	...createStepExerciseMetadata(['calculateHeatAndWork', 'calculateHeatAndWork', 'calculateHeatAndWork', or('calculateHeatAndWork', 'calculateWithInternalEnergy')]),
	compare: { FloatUnit: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } } },
}

function getCycleParameters(parameters: Parameters<typeof getCycleParametersRaw>[0]) {
	let { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCycleParametersRaw(parameters)
	p1 = p1.setSignificantDigits(3); V1 = V1.setSignificantDigits(3); T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3); V2 = V2.setSignificantDigits(3); T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3); V3 = V3.setSignificantDigits(3); T3 = T3.setSignificantDigits(3)
	p4 = p4.setSignificantDigits(3); V4 = V4.setSignificantDigits(3); T4 = T4.setSignificantDigits(3)
	return { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

export function getSolution(parameters: ReturnType<typeof generateParameters>) {
	const cycleParameters = getCycleParameters(parameters)
	const { m, Rs, V1, T1, V2, T2, V3, T3, V4, T4 } = cycleParameters
	const cv = gasProperties[parameters.medium].cv.simplify()
	const cp = gasProperties[parameters.medium].cp.simplify()
	const mcv = m.multiply(cv)
	const mRs = m.multiply(Rs)
	const Q12 = new FloatUnit('0 J')
	const W12 = mcv.multiply(T1.subtract(T2)).setUnit('J').setMinimumSignificantDigits(2)
	const Q23 = mRs.multiply(T2).multiply(Math.log(V3.number / V2.number)).setUnit('J').setMinimumSignificantDigits(2)
	const W23 = Q23
	const Q34 = new FloatUnit('0 J')
	const W34 = mcv.multiply(T3.subtract(T4)).setUnit('J').setMinimumSignificantDigits(2)
	const Q41 = mRs.multiply(T4).multiply(Math.log(V1.number / V4.number)).setUnit('J').setMinimumSignificantDigits(2)
	const W41 = Q41
	const Qn = Q12.add(Q23).add(Q34).add(Q41).setMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W34).add(W41).setMinimumSignificantDigits(2)
	return { ...cycleParameters, cv, cp, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Qn, Wn }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['Q12', 'W12'], data)
			case 2: return compare(['Q23', 'W23'], data)
			case 3: return compare(['Q34', 'W34'], data)
			case 4: return compare(['Q41', 'W41'], data)
			default: return compare(['Q12', 'W12', 'Q23', 'W23', 'Q34', 'W34', 'Q41', 'W41'], data)
		}
	},
})
