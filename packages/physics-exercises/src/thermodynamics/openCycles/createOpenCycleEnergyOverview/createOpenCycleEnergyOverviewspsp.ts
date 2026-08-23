import { or } from '@step-wise/skill-setup'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { generateParameters, getSolution as getCycleParametersRaw } from '../calculateOpenCycle/calculateOpenCyclespsp'

const { cv, cp } = gasProperties.air

const metadata = {
	skill: 'createOpenCycleEnergyOverview',
	...createStepExerciseMetadata(['calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', or('calculateSpecificHeatAndMechanicalWork', 'calculateWithEnthalpy')]),
	compare: { FloatUnit: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } } },
}

function getCycleParameters(parameters: ReturnType<typeof generateParameters>) {
	let { k, Rs, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 } = getCycleParametersRaw(parameters)
	p1 = p1.setSignificantDigits(3); v1 = v1.setSignificantDigits(3); T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3); v2 = v2.setSignificantDigits(3); T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3); v3 = v3.setSignificantDigits(3); T3 = T3.setSignificantDigits(3)
	p4 = p4.setSignificantDigits(3); v4 = v4.setSignificantDigits(3); T4 = T4.setSignificantDigits(3)
	return { k, Rs, p1, v1, T1, p2, v2, T2, p3, v3, T3, p4, v4, T4 }
}

export function getSolution(parameters: ReturnType<typeof generateParameters>) {
	const cycleParameters = getCycleParameters(parameters)
	const { T1, T2, T3, T4 } = cycleParameters
	const cvSimplified = cv.simplify()
	const cpSimplified = cp.simplify()
	const q12 = new FloatUnit('0 J/kg')
	const wt12 = cpSimplified.multiply(T1.subtract(T2)).setUnit('J/kg')
	const q23 = cpSimplified.multiply(T3.subtract(T2)).setUnit('J/kg')
	const wt23 = new FloatUnit('0 J/kg')
	const q34 = new FloatUnit('0 J/kg')
	const wt34 = cpSimplified.multiply(T3.subtract(T4)).setUnit('J/kg')
	const q41 = cpSimplified.multiply(T1.subtract(T4)).setUnit('J/kg')
	const wt41 = new FloatUnit('0 J/kg')
	const qn = q12.add(q23).add(q34).add(q41).setMinimumSignificantDigits(2)
	const wn = wt12.add(wt23).add(wt34).add(wt41).setMinimumSignificantDigits(2)
	return { ...cycleParameters, cv: cvSimplified, cp: cpSimplified, q12, wt12, q23, wt23, q34, wt34, q41, wt41, qn, wn }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['q12', 'wt12'], data)
			case 2: return compareInputs(['q23', 'wt23'], data)
			case 3: return compareInputs(['q34', 'wt34'], data)
			case 4: return compareInputs(['q41', 'wt41'], data)
			default: return compareInputs(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], data)
		}
	},
})
