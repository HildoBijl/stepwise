import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloat, FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.air

export default buildStepExercise({
	metaData: {
		...stepsToSetup(['gasLaw', 'gasLaw']),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const p1 = new FloatUnit('1.0 bar')
		const V1 = getRandomFloatUnit({ min: 0.2, max: 1.2, significantDigits: 2, unit: 'l' })
		const T1 = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'dC' })
		const n = getRandomFloat({ min: 1.1, max: 1.4 }).number
		const p2 = getRandomFloatUnit({ min: 2, max: 5, significantDigits: 2, unit: 'bar' })
		const V2 = V1.multiply(Math.pow(p2.number / p1.number, -1 / n)).roundToPrecision()
		return { p1, p2, V1, V2, T1 }
	},

	getSolution({ p1, p2, V1, V2, T1 }) {
		const p1s = p1.simplify()
		const p2s = p2.simplify()
		const V1s = V1.simplify()
		const V2s = V2.simplify()
		const T1s = T1.simplify()
		const m = p1s.multiply(V1s).divide(Rs.multiply(T1s)).setUnit('kg')
		const T2 = T1s.multiply(p2s).multiply(V2s).divide(p1s.multiply(V1s)).setUnit('K')
		return { p1s, p2s, V1s, V2s, T1s, T2, m, Rs }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('m', data)
			default: return compare('T2', data)
		}
	},
})
