import { randomBoolean } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { compareInputs } from '@step-wise/exercise-grading'
import { createForce, createMoment, freeBodyDiagramComparisonOptions } from '@step-wise/engineering-mechanics'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding/freeBodyDiagramPhysics'

import { getDynamicSolution, getInputDependency } from './common.ts'

const metadata = {
	skill: 'calculateBasicSupportReactions',
	...createStepExerciseMetadata(['drawFreeBodyDiagram', undefined, 'calculateForceOrMoment', 'calculateForceOrMoment']),
	comparisons: {
		Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		loads: freeBodyDiagramComparisonOptions
	},
}

function getStaticSolution(parameters: any) {
	const { l1, l2, l3, M, clockwise } = parameters
	const l = l1.add(l2)
	const A = Vector.zero
	const C = new Vector(l.number, -l3.number)
	const B = A.interpolate(C, l1.number / l.number)
	const points = { A, B, C }
	const Bx = new Vector(B.x, A.y)
	const Cx = new Vector(C.x, A.y)
	const angle = Math.atan2(l3.number, l.number)

	const loads = [
		createMoment({ position: B, clockwise, openingDirection: -angle }),
		createForce({ position: A, angle: 0 }),
		createForce({ position: A, angle: (clockwise ? 1 : -1) * Math.PI / 2, applicationPointAt: clockwise ? 'end' : 'start' }),
		createForce({ position: C, angle: (clockwise ? -1 : 1) * Math.PI / 2, applicationPointAt: clockwise ? 'start' : 'end' }),
	]
	const loadNames = ['M', 'FAx', 'FAy', 'FC']
	const loadNameDefinitions = [
		{ symbol: 'M' },
		{ symbol: 'F', point: 'A', suffix: 'x' },
		{ symbol: 'F', point: 'A', suffix: 'y' },
		{ symbol: 'F', point: 'C' },
	]

	const loadsToCheck = loadNames.slice(1)
	const loadValues = [M, new Quantity('0 kN'), M.divide(l), M.divide(l)]
	return { ...parameters, points, l, Bx, Cx, angle, loads, externalLoad: loads[0], loadNames, loadNameDefinitions, loadsToCheck, loadValues }
}

export default buildStepExercise({
	metadata,
	generateParameters: () => ({
		l1: getRandomQuantity({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomQuantity({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l3: getRandomQuantity({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		M: getRandomQuantity({ min: 5, max: 30, decimals: 0, unit: 'kN*m' }).setSignificantDigits(2),
		clockwise: randomBoolean(),
	}),
	getSolution: {
		dependentFields: ['loads'],
		getStaticSolution,
		getInputDependency,
		getDynamicSolution,
	},
	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('loads', data)
			case 2: return compareInputs('FAx', data)
			case 3: return compareInputs('FC', data)
			case 4: return compareInputs('FAy', data)
			default: return compareInputs('loads', data) && compareInputs(['FAx', 'FAy', 'FC'], data)
		}
	},
})
