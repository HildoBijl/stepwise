import { degreesToRadians, randomInteger } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { createForce, createMoment, FBDComparison } from '@step-wise/engineering-mechanics'

import { getDynamicSolution, getInputDependency } from './common'

const metadata = {
	skill: 'calculateBasicSupportReactions',
	...createStepExerciseMetadata(['drawFreeBodyDiagram', 'calculateForceOrMoment', undefined, 'calculateForceOrMoment']),
	compare: {
		FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		loads: FBDComparison,
	},
}

function getStaticSolution(parameters: any) {
	const { l1, l2, P, angle } = parameters
	const angleRad = degreesToRadians(angle)
	const A = Vector.zero
	const B = new Vector(l1.number, 0)
	const C = new Vector(l1.number + l2.number, 0)
	const points = { A, B, C }

	const loads = [
		createForce({ position: B, angle: angleRad }),
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
	
	const Px = P.multiply(Math.cos(angleRad))
	const Py = P.multiply(Math.sin(angleRad))
	const FAx = Px
	const FAy = Py
	const MA = Py.multiply(l1)
	return { ...parameters, angleRad, points, loads, externalLoad: loads[0], Px, Py, loadNames, loadNameDefinitions, loadsToCheck: loadNames.slice(1), loadValues: [P, FAx, FAy, MA] }
}

export default buildStepExercise({
	metadata,
	generateParameters: () => ({
		l1: getRandomFloatUnit({ min: 4, max: 8, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 4, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		P: getRandomFloatUnit({ min: 2, max: 8, decimals: 0, unit: 'kN' }).setSignificantDigits(2),
		angle: randomInteger(6, 16) * 5,
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
