import { getRandomBoolean } from '@step-wise/utils'
import { Vector } from '@step-wise/geometry'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { createForce, createMoment, FBDComparison } from '@step-wise/engineering-mechanics'

import { getDynamicSolution, getInputDependency } from './common'

const metaData = {
	skill: 'calculateBasicSupportReactions',
	...stepsToSetup(['drawFreeBodyDiagram', undefined, 'calculateForceOrMoment', 'calculateForceOrMoment']),
	compare: {
		FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		loads: FBDComparison
	},
}

function getStaticSolution(state: any) {
	const { l1, l2, l3, M, clockwise } = state
	const l = l1.add(l2)
	const A = Vector.zero
	const C = new Vector(l.number, -l3.number)
	const B = A.interpolate(C, l1.number / l.number)
	const points = { A, B, C }
	const Bx = new Vector(B.x, A.y)
	const Cx = new Vector(C.x, A.y)
	const angle = Math.atan2(l3.number, l.number)

	const loads = [
		createMoment({ position: B, clockwise, openingAngle: -angle }),
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
	const loadValues = [M, new FloatUnit('0 kN'), M.divide(l), M.divide(l)]
	return { ...state, points, l, Bx, Cx, angle, loads, externalLoad: loads[0], loadNames, loadNameDefinitions, loadsToCheck, loadValues }
}

export default buildStepExercise({
	metaData,
	generateState: () => ({
		l1: getRandomFloatUnit({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l2: getRandomFloatUnit({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		l3: getRandomFloatUnit({ min: 2, max: 5, decimals: 0, unit: 'm' }).setSignificantDigits(2),
		M: getRandomFloatUnit({ min: 5, max: 30, decimals: 0, unit: 'kN*m' }).setSignificantDigits(2),
		clockwise: getRandomBoolean(),
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
			case 3: return compare('FC', data)
			case 4: return compare('FAy', data)
			default: return compare('loads', data) && compare(['FAx', 'FAy', 'FC'], data)
		}
	},
})
