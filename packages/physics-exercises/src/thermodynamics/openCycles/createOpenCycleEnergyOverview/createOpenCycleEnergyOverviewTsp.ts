import { or } from '@step-wise/skill-setup'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#physicsExerciseBuilding'

import { generateParameters, getSolution as getCycleParametersRaw } from '../calculateOpenCycle/calculateOpenCycleTsp.ts'

const metadata = {
	skill: 'createOpenCycleEnergyOverview',
	...createStepExerciseMetadata(['calculateSpecificHeatAndMechanicalWork', 'calculateSpecificHeatAndMechanicalWork', or('calculateSpecificHeatAndMechanicalWork', 'calculateWithEnthalpy')]),
	comparisons: { Quantity: { value: { relativeTolerance: 0.02, significantDigitTolerance: 1 } } },
}

function getCycleParameters(parameters: ReturnType<typeof generateParameters>) {
	let { p1, v1, T1, p2, v2, T2, p3, v3, T3 } = getCycleParametersRaw(parameters)
	p1 = p1.setSignificantDigits(3); v1 = v1.setSignificantDigits(3); T1 = T1.setSignificantDigits(3)
	p2 = p2.setSignificantDigits(3); v2 = v2.setSignificantDigits(3); T2 = T2.setSignificantDigits(3)
	p3 = p3.setSignificantDigits(3); v3 = v3.setSignificantDigits(3); T3 = T3.setSignificantDigits(3)
	return { p1, v1, T1, p2, v2, T2, p3, v3, T3 }
}

export function getSolution(parameters: ReturnType<typeof generateParameters>) {
	const cycleParameters = getCycleParameters(parameters)
	const { p1, v1, T1, v2, T2, T3 } = cycleParameters
	const cv = gasProperties[parameters.medium].cv.simplify()
	const cp = gasProperties[parameters.medium].cp.simplify()
	const q12 = p1.multiply(v1).multiply(Math.log(v2.number / v1.number)).setUnit('J/kg').setMinimumSignificantDigits(2)
	const wt12 = q12
	const q23 = new Quantity('0 J/kg')
	const wt23 = cp.multiply(T2.subtract(T3)).setUnit('J/kg').setMinimumSignificantDigits(2)
	const q31 = cp.multiply(T1.subtract(T3)).setUnit('J/kg').setMinimumSignificantDigits(2)
	const wt31 = new Quantity('0 J/kg')
	const qn = q12.add(q23).add(q31).setMinimumSignificantDigits(2)
	const wn = wt12.add(wt23).add(wt31).setMinimumSignificantDigits(2)
	return { ...cycleParameters, cv, cp, q12, wt12, q23, wt23, q31, wt31, qn, wn }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['q12', 'wt12'], data)
			case 2: return compareInputs(['q23', 'wt23'], data)
			case 3: return compareInputs(['q31', 'wt31'], data)
			default: return compareInputs(['q12', 'wt12', 'q23', 'wt23', 'q31', 'wt31'], data)
		}
	},
})
