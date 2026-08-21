import { Vector } from '@step-wise/geometry'
import { getRandomFloatUnit, FloatUnit } from '@step-wise/physics-core'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { createForce, createMoment, FBDComparison } from '@step-wise/engineering-mechanics'

import { getDynamicSolution, getInputDependency } from './common'

const metaData = {
	skill: 'calculateBasicSupportReactions',
	...stepsToSetup(['drawFreeBodyDiagram', 'calculateForceOrMoment', undefined, 'calculateForceOrMoment']),
	compare: {
		FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		loads: FBDComparison,
	},
}

function getStaticSolution(parameters: any) {
	const { l1, l2, P } = parameters
	const A = Vector.zero
	const B = new Vector(l1.number, 0)
	const C = new Vector(l1.number, -l2.number)
	const points = { A, B, C }

	const loads = [
		createForce({ position: C, angle: 0 }),
		createForce({ position: A, angle: Math.PI, applicationPointAt: 'start' }),
		createForce({ position: A, angle: -Math.PI / 2 }),
		createMoment({ position: A, clockwise: false }),
	]
	const loadNames = ['P', 'FAx', 'FAy', 'MA']
	const loadNameDefinitions = [
		{ symbol: 'P' },
		{ symbol: 'F', point: 'A', suffix: 'x' },
		{ symbol: 'F', point: 'A', suffix: 'y' },
		{ symbol: 'M', point: 'A' },
	]

	const loadValues = [P, P, new FloatUnit('0 kN'), P.multiply(l2)]
	return { ...parameters, points, loads, externalLoad: loads[0], loadNames, loadNameDefinitions, loadsToCheck: loadNames.slice(1), loadValues }
}

export default buildStepExercise({
	metaData,
	generateParameters: () => ({
		l1: getRandomFloatUnit({ min: 4, max: 8, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 4, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		P: getRandomFloatUnit({ min: 2, max: 8, decimals: 0, unit: 'kN' }).setSignificantDigits(2),
	}),
	getSolution: {
		dependentFields: ['loads'],
		getStaticSolution,
		getInputDependency,
		getDynamicSolution,
	},
	checkInput(data, step) {
		switch (step) {
			case 1: return compare('loads', data)
			case 2: return compare('FAx', data)
			case 3: return compare('FAy', data)
			case 4: return compare('MA', data)
			default: return compare('loads', data) && compare(['FAx', 'FAy', 'MA'], data)
		}
	},
})
