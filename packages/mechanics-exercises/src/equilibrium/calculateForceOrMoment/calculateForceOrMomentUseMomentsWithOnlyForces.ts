import { degreesToRadians, randomBoolean, randomInteger, integerRange, isMultipleOf } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { Vector } from '@step-wise/geometry'
import { type Load, createForce, deriveLoadNames, decomposeForceIntoAxisComponents, isForce } from '@step-wise/engineering-mechanics'

import { buildStepExercise, createStepExerciseMetadata } from '#mechanicsExerciseBuilding/vectorPhysics'

export default buildStepExercise({
	metadata: {
		skill: 'calculateForceOrMoment',
		...createStepExerciseMetadata([undefined, undefined, undefined]), // ToDo later: add steps, once they have been implemented.
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		for (let attempt = 0; attempt < 100; attempt++) {
			const points = integerRange(0, 3).map(() => new Vector(randomInteger(0, 4), randomInteger(0, 4)))
			const angle = randomInteger(5, 13, { exclude: [9] }) * 5
			const up = randomBoolean()
			const right = randomBoolean()
			const horizontal = randomBoolean()
			const FD = getRandomQuantity({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			if (points[0].x === points[1].x || points[0].y === points[2].y) continue
			if (points[3].x === points[1].x || points[3].y === points[2].y) continue
			return { points, angle, up, right, horizontal, FD }
		}
		throw new Error('Failed to generate valid calculate-force-or-moment parameters after 100 attempts.')
	},

	getSolution(parameters) {
		const { points, angle, up, right, horizontal, FD } = parameters
		const [A, B, C, D] = points
		const angleRad = degreesToRadians(angle)
		const method = 4

		const FDx = FD.multiply(Math.sin(angleRad))
		const FDy = FD.multiply(Math.cos(angleRad))
		const intersection = new Vector(B.x, C.y)
		const rD = D.subtract(intersection)
		const rDx = new Quantity(`${Math.abs(rD.y)} m`).setSignificantDigits(2)
		const rDy = new Quantity(`${Math.abs(rD.x)} m`).setSignificantDigits(2)
		const MDx = FDx.multiply(rDx).multiply(right === (rD.y > 0) ? -1 : 1)
		const MDy = FDy.multiply(rDy).multiply(up === (rD.x > 0) ? -1 : 1)
		const MD = MDx.add(MDy)
		if (MD.number === 0) throw new Error('Invalid exercise parameters: the moment of the given force around the force intersection is zero.')

		const isFAInPositiveDirection = Math.sign(MD.number) === Math.sign(horizontal ? A.y - intersection.y : A.x - intersection.x)
		const loads = [
			createForce({ position: A, angle: (horizontal ? 0 : -Math.PI / 2) + (isFAInPositiveDirection ? 0 : Math.PI) }),
			createForce({ position: B, angle: Math.PI / 2 }),
			createForce({ position: C, angle: 0 }),
			createForce({ position: D, angle: (up ? -1 : 1) * Math.PI / 2 + (right === up ? 1 : -1) * angleRad }),
		]
		const namedPoints = points.map((position, index) => ({ name: ['A', 'B', 'C', 'D'][index], position }))
		const loadNames = deriveLoadNames(loads, namedPoints)
		const decomposedLoads = loads.flatMap(load => isForce(load) && !isMultipleOf(load.angle, Math.PI / 2) ? decomposeForceIntoAxisComponents(load) : load)
		const decomposedLoadNames = deriveLoadNames(decomposedLoads, namedPoints)

		const rA = new Quantity(`${Math.abs(horizontal ? A.y - intersection.y : A.x - intersection.x)} m`).setSignificantDigits(2)
		const FA = MD.divide(rA).abs().setSignificantDigits(2)
		return { ...parameters, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, intersection, isFAInPositiveDirection, FDx, FDy, rDx, rDy, MDx, MDy, MD, rA, FA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('method', data)
			case 2: return compareInputs(['FDx', 'FDy'], data)
			default: return compareInputs('FA', data)
		}
	},
})
