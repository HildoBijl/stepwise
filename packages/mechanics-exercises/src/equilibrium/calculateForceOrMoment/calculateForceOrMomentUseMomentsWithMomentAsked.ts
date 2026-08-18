import { degreesToRadians, randomBoolean, randomInteger, integerRange, isMultipleOf } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
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
			const points = integerRange(0, 3).map(() => new Vector(randomInteger(0, 4), randomInteger(0, 4)))
			const angle = randomInteger(5, 13, [9]) * 5
			const up = randomBoolean()
			const right = randomBoolean()
			const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			if (points[3].x === points[1].x || points[3].y === points[2].y) continue
			if (points[0].x === points[1].x && points[0].y === points[2].y) continue
			return { points, angle, up, right, FD }
		}
	},

	getSolution(state) {
		const { points, angle, up, right, FD } = state
		const [A, B, C, D] = points
		const angleRad = degreesToRadians(angle)
		const method = 4

		const FDx = FD.multiply(Math.sin(angleRad))
		const FDy = FD.multiply(Math.cos(angleRad))
		const intersection = new Vector(B.x, C.y)
		const rD = D.subtract(intersection)
		const rDx = new FloatUnit(`${Math.abs(rD.y)} m`).setSignificantDigits(2)
		const rDy = new FloatUnit(`${Math.abs(rD.x)} m`).setSignificantDigits(2)
		const MDx = FDx.multiply(rDx).multiply(right === (rD.y > 0) ? -1 : 1)
		const MDy = FDy.multiply(rDy).multiply(up === (rD.x > 0) ? -1 : 1)
		const MD = MDx.add(MDy)
		if (MD.number === 0) throw new Error('Invalid exercise state: the moment of the given force around the force intersection is zero.')

		const clockwise = MD.number < 0
		const loads = [
			createMoment({ position: A, clockwise }),
			createForce({ position: B, angle: Math.PI / 2 }),
			createForce({ position: C, angle: 0 }),
			createForce({ position: D, angle: (up ? -1 : 1) * Math.PI / 2 + (right === up ? 1 : -1) * angleRad }),
		]
		const namedPoints = points.map((position, index) => ({ name: ['A', 'B', 'C', 'D'][index], position }))
		const loadNames = deriveLoadNames(loads, namedPoints)
		const decomposedLoads = loads.flatMap(load => isForce(load) && !isMultipleOf(load.angle, Math.PI / 2) ? getAxisComponents(load) : load)
		const decomposedLoadNames = deriveLoadNames(decomposedLoads, namedPoints)

		const MA = MD.abs().setSignificantDigits(2)
		return { ...state, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, intersection, clockwise, FDx, FDy, rDx, rDy, MDx, MDy, MD, MA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('method', data)
			case 2: return compare(['FDx', 'FDy'], data)
			default: return compare('MA', data)
		}
	},
})
