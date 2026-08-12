import { or } from '@step-wise/skill-setup'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { generateState, getSolution as getCycleParametersRaw } from '../calculateClosedCycle/calculateClosedCycleVTp'

const metaData = {
	skill: 'createClosedCycleEnergyOverview',
	...stepsToSetup(['calculateHeatAndWork', 'calculateHeatAndWork', or('calculateHeatAndWork', 'calculateWithInternalEnergy')]),
	compare: { FloatUnit: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } } },
}

function getCycleParameters(state: Parameters<typeof getCycleParametersRaw>[0]) {
	let { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParametersRaw(state)
	p1 = p1.setSignificantDigits(3); V1 = V1.setSignificantDigits(3); T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3); V2 = V2.setSignificantDigits(3); T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3); V3 = V3.setSignificantDigits(3); T3 = T3.setSignificantDigits(3)
	return { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

export function getSolution(state: ReturnType<typeof generateState>) {
	const cycleParameters = getCycleParameters(state)
	const { m, V1, T1, p2, V2, T2, p3, V3, T3 } = cycleParameters
	const cv = gasProperties[state.medium].cv.simplify()
	const cp = gasProperties[state.medium].cp.simplify()
	const Q12 = m.multiply(cv).multiply(T2.subtract(T1)).setUnit('J').setMinimumSignificantDigits(2)
	const W12 = new FloatUnit('0 J')
	const Q23 = p2.multiply(V2).multiply(Math.log(V3.number / V2.number)).setUnit('J').setMinimumSignificantDigits(2)
	const W23 = Q23
	const Q31 = m.multiply(cp).multiply(T1.subtract(T3)).setUnit('J').setMinimumSignificantDigits(2)
	const W31 = p3.multiply(V1.subtract(V3)).setUnit('J').setMinimumSignificantDigits(2)
	const Qn = Q12.add(Q23).add(Q31).setMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W31).setMinimumSignificantDigits(2)
	return { ...cycleParameters, cv, cp, Q12, W12, Q23, W23, Q31, W31, Qn, Wn }
}

export default buildStepExercise({
	metaData,
	generateState,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compare(['Q12', 'W12'], data)
			case 2: return compare(['Q23', 'W23'], data)
			case 3: return compare(['Q31', 'W31'], data)
			default: return compare(['Q12', 'W12', 'Q23', 'W23', 'Q31', 'W31'], data)
		}
	},
})
