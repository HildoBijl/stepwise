import { deg2rad, getRandomBoolean, getRandomInteger, integerRange, isMultipleOf } from '@step-wise/utils'
import { type Expression, asExpression } from '@step-wise/cas'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { Vector } from '@step-wise/geometry'
import { type Load, createForce, getAxisComponents } from '@step-wise/engineering-mechanics'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

type LoadName = {
	load: Load
	variable: Expression
	point: Vector
	magnitude?: number
}

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
			const FD = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'kN' })
			if (points.some((point, index) => points.some((otherPoint, otherIndex) => index < otherIndex && point.equals(otherPoint)))) continue
			if (points[1].y === points[2].y) continue
			return { points, angle, up, FD }
		}
	},

	getSolution(state) {
		const { points, angle, up, FD } = state
		const [A, B, C, D] = points
		const angleRad = deg2rad(angle)
		const method = 1

		const loads = [
			createForce({ position: A, angle: (up ? 1 : -1) * Math.PI / 2 - angleRad }),
			createForce({ position: B, angle: 0 }),
			createForce({ position: C, angle: Math.PI }),
			createForce({ position: D, angle: (up ? -1 : 1) * Math.PI / 2 }),
		]
		const pointNames = ['A', 'B', 'C', 'D']
		const loadNames: LoadName[] = loads.map((load, index) => ({
			load,
			variable: asExpression(`F_(${pointNames[index]})`),
			point: points[index],
		}))

		const decomposedLoads: Load[] = []
		const decomposedLoadNames: LoadName[] = []
		loads.forEach((load, index) => {
			if (!isMultipleOf(load.angle, Math.PI / 2)) {
				const components = getAxisComponents(load)
				const magnitudes = [Math.abs(Math.cos(load.angle)), Math.abs(Math.sin(load.angle))]
				decomposedLoads.push(...components)
				decomposedLoadNames.push({ load: components[0], variable: asExpression(`F_(${pointNames[index]}x)`), point: points[index], magnitude: magnitudes[0] })
				decomposedLoadNames.push({ load: components[1], variable: asExpression(`F_(${pointNames[index]}y)`), point: points[index], magnitude: magnitudes[1] })
			} else {
				decomposedLoads.push(load)
				decomposedLoadNames.push({ load, variable: asExpression(`F_(${pointNames[index]})`), point: points[index] })
			}
		})

		const FAy = FD
		const FA = FAy.divide(Math.cos(angleRad))

		return { ...state, A, B, C, D, angleRad, method, loads, loadNames, decomposedLoads, decomposedLoadNames, FAy, FA }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('method', data)
			case 2: return compare('FAy', data)
			default: return compare('FA', data)
		}
	},
})
