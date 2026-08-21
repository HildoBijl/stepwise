import { randomNumber, randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { Float } from '@step-wise/physics-core'

export default buildStepExercise({
	metaData: {
		skill: 'linearInterpolation',
		...stepsToSetup(['solveLinearEquation', 'solveLinearEquation']),
		compare: {
			Float: { absoluteTolerance: 1 },
			x: { absoluteTolerance: 0.005, relativeTolerance: 0.01 },
		},
	},

	generateParameters() {
		const type = randomInteger(1, 2)
		const year1 = randomInteger(1950, 1970)
		const year2 = randomInteger(1980, 2000)
		const pop1 = randomInteger(1500, 2500)
		const pop2 = randomInteger(3500, 5500)
		const x = randomNumber(0.1, 0.9)

		if (type === 1) {
			const year = Math.floor(year1 + x * (year2 - year1))
			return { type, year1, year2, pop1, pop2, year }
		}
		const pop = Math.round(pop1 + x * (pop2 - pop1))
		return { type, year1, year2, pop1, pop2, pop }
	},

	getSolution({ type, year1, year2, pop1, pop2, year, pop }) {
		let factor, popUnrounded, yearUnrounded
		if (type === 1) {
			factor = (year! - year1) / (year2 - year1)
			popUnrounded = pop1 + factor * (pop2 - pop1)
			pop = Math.round(popUnrounded)
		} else {
			factor = (pop! - pop1) / (pop2 - pop1)
			yearUnrounded = year1 + factor * (year2 - year1)
			year = Math.floor(yearUnrounded)
		}
		const x = new Float({ number: factor, significantDigits: 2 })
		return { type, year1, year2, pop1, pop2, x, year, pop, yearUnrounded, popUnrounded }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('x', data)
			default: return compare(data.parameters.type === 1 ? 'pop' : 'year', data)
		}
	},
})
