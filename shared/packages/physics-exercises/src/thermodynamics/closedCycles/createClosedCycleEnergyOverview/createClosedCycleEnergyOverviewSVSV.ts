import { or } from '@step-wise/skill-setup'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { generateState, getSolution as getCycleParametersRaw } from '../calculateClosedCycle/calculateClosedCycleSVSV'

const metaData = {
	skill: 'createClosedCycleEnergyOverview',
	...stepsToSetup(['calculateHeatAndWork', 'calculateHeatAndWork', 'calculateHeatAndWork', or('calculateHeatAndWork', 'calculateWithInternalEnergy')]),
	compare: { FloatUnit: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } } },
}

function getCycleParameters(state: Parameters<typeof getCycleParametersRaw>[0]) {
	let { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 } = getCycleParametersRaw(state)
	p1 = p1.setSignificantDigits(3); V1 = V1.setSignificantDigits(3); T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3); V2 = V2.setSignificantDigits(3); T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3); V3 = V3.setSignificantDigits(3); T3 = T3.setSignificantDigits(3)
	p4 = p4.setSignificantDigits(3); V4 = V4.setSignificantDigits(3); T4 = T4.setSignificantDigits(3)
	return { m, Rs, k, p1, V1, T1, p2, V2, T2, p3, V3, T3, p4, V4, T4 }
}

export function getSolution(state: ReturnType<typeof generateState>) {
	const cycleParameters = getCycleParameters(state)
	const { m, T1, T2, T3, T4 } = cycleParameters
	const cv = gasProperties.air.cv.simplify()
	const cp = gasProperties.air.cp.simplify()
	const mcv = m.multiply(cv)
	const Q12 = new FloatUnit('0 J')
	const W12 = mcv.multiply(T1.subtract(T2)).setUnit('J').setMinimumSignificantDigits(2)
	const Q23 = mcv.multiply(T3.subtract(T2)).setUnit('J').setMinimumSignificantDigits(2)
	const W23 = new FloatUnit('0 J')
	const Q34 = new FloatUnit('0 J')
	const W34 = mcv.multiply(T3.subtract(T4)).setUnit('J').setMinimumSignificantDigits(2)
	const Q41 = mcv.multiply(T1.subtract(T4)).setUnit('J').setMinimumSignificantDigits(2)
	const W41 = new FloatUnit('0 J')
	const Qn = Q12.add(Q23).add(Q34).add(Q41).setMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W34).add(W41).setMinimumSignificantDigits(2)
	return { ...cycleParameters, cv, cp, Q12, W12, Q23, W23, Q34, W34, Q41, W41, Qn, Wn }
}

export default buildStepExercise({
	metaData,
	generateState,
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
