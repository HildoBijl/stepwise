import { deg2rad, getRandomBoolean, getRandomInteger, integerRange, isMultipleOf } from '@step-wise/utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { Vector } from '@step-wise/geometry'
import { type Load, createForce, createMoment, deriveLoadNames, getAxisComponents, isForce } from '@step-wise/engineering-mechanics'

export default buildStepExercise({
	metaData: {
		skill: 'calculateForceOrMoment',
		...stepsToSetup([undefined, undefined, undefined]), // ToDo later: add steps, once they have been implemented.
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateState() {
		while (true) {
			const points = integerRange(0, 3).map(() => new Vector(getRandomInteger(0, 4), getRandomInteger(0, 4)))
			const angle = getRandomInteger(5, 13) * 5
			const up = getRandomBoolean()
			const right = getRandomBoolean()
			const clockwise = getRandomBoolean()
			const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			return { points, angle, up, right, clockwise, FD }
		}
	},

	getSolution(state) {
		const { points, angle, up, right, clockwise, FD } = state
		const [A, B, C, D] = points
		const angleRad = deg2rad(angle)
		const method = 0

		// Set up loads and their names.
		const loads = [
			createForce({ position: A, angle: right ? 0 : Math.PI }),
			createForce({ position: B, angle: (up ? -1 : 1) * Math.PI / 2 }),
			createMoment({ position: C, clockwise }),
			createForce({ position: D, angle: (up ? 1 : -1) * Math.PI / 2 + (right === up ? 1 : -1) * angleRad }),
		]
		const pointNames = ['A', 'B', 'C', 'D']
		const namedPoints = points.map((position, index) => ({ name: pointNames[index], position }))
		const loadNames = deriveLoadNames(loads, namedPoints)

		// Decompose diagonal loads and add names.
		const decomposedLoads = loads.flatMap(load => isForce(load) && !isMultipleOf(load.angle, Math.PI / 2) ? getAxisComponents(load) : load)
		const decomposedLoadNames = deriveLoadNames(decomposedLoads, namedPoints)

		// Calculate the respective load.
		const FDx = FD.multiply(Math.sin(angleRad))
		const FA = FDx
		return { ...state, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FDx, FA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('method', data)
			case 2: return compare('FDx', data)
			default: return compare('FA', data)
		}
	},
})
