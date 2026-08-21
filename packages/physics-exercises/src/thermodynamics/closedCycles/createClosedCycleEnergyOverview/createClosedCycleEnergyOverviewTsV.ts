import { or } from '@step-wise/skill-setup'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { generateParameters, getSolution as getCycleParametersRaw } from '../calculateClosedCycle/calculateClosedCycleTsV'

const metaData = {
	skill: 'createClosedCycleEnergyOverview',
	...stepsToSetup(['calculateHeatAndWork', 'calculateHeatAndWork', or('calculateHeatAndWork', 'calculateWithInternalEnergy')]),
	compare: { FloatUnit: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } } },
}

function getCycleParameters(parameters: Parameters<typeof getCycleParametersRaw>[0]) {
	let { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 } = getCycleParametersRaw(parameters)
	p1 = p1.setSignificantDigits(3); V1 = V1.setSignificantDigits(3); T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3); V2 = V2.setSignificantDigits(3); T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3); V3 = V3.setSignificantDigits(3); T3 = T3.setSignificantDigits(3)
	return { m, p1, V1, T1, p2, V2, T2, p3, V3, T3 }
}

export function getSolution(parameters: ReturnType<typeof generateParameters>) {
	const cycleParameters = getCycleParameters(parameters)
	const { m, p1, V1, T1, V2, T2, T3 } = cycleParameters
	const cv = gasProperties[parameters.medium].cv.simplify()
	const cp = gasProperties[parameters.medium].cp.simplify()
	const Q12 = p1.multiply(V1).multiply(Math.log(V2.number / V1.number)).setUnit('J').setMinimumSignificantDigits(2)
	const W12 = Q12
	const Q23 = new FloatUnit('0 J')
	const W23 = m.multiply(cv).multiply(T2.subtract(T3)).setUnit('J').setMinimumSignificantDigits(2)
	const Q31 = m.multiply(cv).multiply(T1.subtract(T3)).setUnit('J').setMinimumSignificantDigits(2)
	const W31 = new FloatUnit('0 J')
	const Qn = Q12.add(Q23).add(Q31).setMinimumSignificantDigits(2)
	const Wn = W12.add(W23).add(W31).setMinimumSignificantDigits(2)
	return { ...cycleParameters, cv, cp, Q12, W12, Q23, W23, Q31, W31, Qn, Wn }
}

export default buildStepExercise({
	metaData,
	generateParameters,
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
