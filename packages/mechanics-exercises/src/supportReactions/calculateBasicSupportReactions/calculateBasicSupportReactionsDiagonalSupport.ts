import { degreesToRadians, fromKeysAndValues, randomInteger } from '@step-wise/js-utils'
import { Vector } from '@step-wise/geometry'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { createForce, FBDComparison, reverseLoad } from '@step-wise/engineering-mechanics'

import { getInputDependency } from './common'

const metaData = {
	skill: 'calculateBasicSupportReactions',
	...stepsToSetup(['drawFreeBodyDiagram', 'calculateForceOrMoment', 'calculateForceOrMoment', undefined]),
	compare: {
		FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		loads: FBDComparison,
	},
}

function getStaticSolution(state: any) {
	const { l1, l2, P, angle } = state
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
	return { ...state, points, l, angleRad, anglePoints: [Vector.fromPolar(1, -angleRad), Vector.zero, Vector.fromPolar(1, 0)], loads, externalLoad: loads[0], loadNames, loadNameDefinitions, loadsToCheck: loadNames.slice(1), loadValues: [P, FAx, FAy, FC] }
}

function getDynamicSolution(inputDependency: unknown, solution: any) {
	const directionIndices = inputDependency as boolean[]
	const loads = solution.loads.map((load: any, index: number) => directionIndices[index] ? load : reverseLoad(load))
	const loadValues = solution.loadValues.map((value: any, index: number) => directionIndices[index] ? value : value.negate())
	const [, FAx, FAy, FC] = loadValues
	return { ...solution, directionIndices, hasAdjustedSolution: directionIndices.includes(false), loads, loadValues, ...fromKeysAndValues(solution.loadNames, loadValues), FAx, FAy, FC, FCx: FC.multiply(Math.sin(solution.angleRad)), FCy: FC.multiply(Math.cos(solution.angleRad)) }
}

export default buildStepExercise({
	metaData,
	generateState: () => ({
		l1: getRandomFloatUnit({ min: 2, max: 7, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 7, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		P: getRandomFloatUnit({ min: 2, max: 8, decimals: 0, unit: 'kN' }).setSignificantDigits(2),
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
			case 1: return compare('loads', data)
			case 2: return compare('FC', data)
			case 3: return compare('FAy', data)
			case 4: return compare('FAx', data)
			default: return compare('loads', data) && compare(['FAx', 'FAy', 'FC'], data)
		}
	},
})
