import { degreesToRadians, fromKeysAndValues, randomInteger } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'
import { getRandomQuantity } from '@step-wise/physics-core'
import { compareInputs } from '@step-wise/exercise-grading'
import { createForce, freeBodyDiagramComparisonOptions, reverseLoad } from '@step-wise/engineering-mechanics'

import { buildStepExercise, createStepExerciseMetadata } from '#mechanicsExerciseBuilding/freeBodyDiagramPhysics'

import { getInputDependency } from './common.ts'

const metadata = {
	skill: 'calculateBasicSupportReactions',
	...createStepExerciseMetadata(['drawFreeBodyDiagram', 'calculateForceOrMoment', 'calculateForceOrMoment', undefined]),
	comparisons: {
		Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		loads: freeBodyDiagramComparisonOptions,
	},
}

function getStaticSolution(parameters: any) {
	const { l1, l2, P, angle } = parameters
	const l = l1.add(l2)
	const angleRad = degreesToRadians(angle)
	const A = Vector.zero
	const B = new Vector(l1.number, 0)
	const C = new Vector(l.number, 0)
	const points = { A, B, C }

	const loads = [
		createForce({ position: B, angle: Math.PI / 2 }),
		createForce({ position: A, angle: 0 }),
		createForce({ position: A, angle: -Math.PI / 2 }),
		createForce({ position: C, angle: -Math.PI / 2 - angleRad }),
	]
	const loadNames = ['P', 'FAx', 'FAy', 'FC']
	const loadNameDefinitions = [
		{ symbol: 'P' },
		{ symbol: 'F', point: 'A', suffix: 'x' },
		{ symbol: 'F', point: 'A', suffix: 'y' },
		{ symbol: 'F', point: 'C' },
	]
	
	const FCy = P.multiply(l1.number / l.number)
	const FC = FCy.divide(Math.cos(angleRad))
	const FCx = FCy.multiply(Math.tan(angleRad))
	const FAx = FCx
	const FAy = P.subtract(FCy)
	return { ...parameters, points, l, angleRad, anglePoints: [Vector.fromPolar(1, -angleRad), Vector.zero, Vector.fromPolar(1, 0)], loads, externalLoad: loads[0], loadNames, loadNameDefinitions, loadsToCheck: loadNames.slice(1), loadValues: [P, FAx, FAy, FC] }
}

function getDynamicSolution(inputDependency: unknown, solution: any) {
	const directionIndices = inputDependency as boolean[]
	const loads = solution.loads.map((load: any, index: number) => directionIndices[index] ? load : reverseLoad(load))
	const loadValues = solution.loadValues.map((value: any, index: number) => directionIndices[index] ? value : value.negate())
	const [, FAx, FAy, FC] = loadValues
	return { ...solution, directionIndices, hasAdjustedSolution: directionIndices.includes(false), loads, loadValues, ...fromKeysAndValues(solution.loadNames, loadValues), FAx, FAy, FC, FCx: FC.multiply(Math.sin(solution.angleRad)), FCy: FC.multiply(Math.cos(solution.angleRad)) }
}

export default buildStepExercise({
	metadata,
	generateParameters: () => ({
		l1: getRandomQuantity({ min: 2, max: 7, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomQuantity({ min: 2, max: 7, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		P: getRandomQuantity({ min: 2, max: 8, decimals: 0, unit: 'kN' }).setSignificantDigits(2),
		angle: randomInteger(4, 14) * 5,
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
			case 2: return compareInputs('FC', data)
			case 3: return compareInputs('FAy', data)
			case 4: return compareInputs('FAx', data)
			default: return compareInputs('loads', data) && compareInputs(['FAx', 'FAy', 'FC'], data)
		}
	},
})
