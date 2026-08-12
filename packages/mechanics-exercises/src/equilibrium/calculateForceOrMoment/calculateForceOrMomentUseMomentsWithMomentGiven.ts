import { deg2rad, getRandomBoolean, getRandomInteger } from '@step-wise/utils'
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
			const getRandomPoint = () => new Vector(getRandomInteger(0, 4), getRandomInteger(0, 4))
			const intersection = getRandomPoint()
			const lowerBound = Math.max(-intersection.x, -intersection.y)
			const upperBound = Math.min(4 - intersection.x, 4 - intersection.y)
			if (lowerBound === 0 && upperBound === 0) continue
			const shift = getRandomInteger(lowerBound, upperBound, [0])
			const points = [
				new Vector(getRandomInteger(0, 4, [intersection.x]), intersection.y),
				new Vector(intersection.x, getRandomInteger(0, 4, [intersection.y])),
				new Vector(intersection.x + shift, intersection.y + shift),
				getRandomPoint(),
			]
			const angle = getRandomInteger(5, 13) * 5
			const up = getRandomBoolean()
			const right = getRandomBoolean()
			const MD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN*m' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			if (intersection.equals(points[0])) continue
			return { points, angle, up, right, MD }
		}
	},

	getSolution(state) {
		const { points, angle, up, right, MD } = state
		const [A, B, C, D] = points
		const angleRad = deg2rad(angle)
		const method = 4

		const intersection = new Vector(B.x, C.y + B.x - C.x)
		const rA = A.x - intersection.x
		const rAy = new FloatUnit(`${Math.abs(rA)} m`).setSignificantDigits(2)
		const FAy = MD.divide(rAy)
		const FA = FAy.divide(Math.cos(angleRad))
		const clockwise = (rA > 0) === up

		const loads = [
			createForce({ position: A, angle: (up ? -1 : 1) * Math.PI / 2 + (up === right ? 1 : -1) * angleRad }),
			createForce({ position: B, angle: Math.PI / 2 }),
			createForce({ position: C, angle: -3 * Math.PI / 4 }),
			createMoment({ position: D, clockwise }),
		]
		const namedPoints = points.map((position, index) => ({ name: ['A', 'B', 'C', 'D'][index], position }))
		const loadNames = deriveLoadNames(loads, namedPoints)
		const decomposedLoads = loads.flatMap((load, index) => index === 0 && isForce(load) ? getAxisComponents(load) : load)
		const decomposedLoadNames = deriveLoadNames(decomposedLoads, namedPoints)

		return { ...state, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, intersection, clockwise, rA, rAy, FAy, FA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('method', data)
			case 2: return compare('FAy', data)
			default: return compare('FA', data)
		}
	},
})
