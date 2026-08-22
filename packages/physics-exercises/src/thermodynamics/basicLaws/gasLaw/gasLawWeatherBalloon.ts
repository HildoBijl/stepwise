import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.helium

export default buildStepExercise({
	metadata: {
		...createStepExerciseMetadata(['gasLaw', 'gasLaw']),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const p1 = new FloatUnit('1.0 bar')
		const V1 = getRandomFloatUnit({ min: 20, max: 300, significantDigits: 2, unit: 'm^3' })
		const T1 = getRandomFloatUnit({ min: 275, max: 295, significantDigits: 3, unit: 'K' })
		const p2 = getRandomFloatUnit({ min: 5, max: 20, significantDigits: 2, unit: 'mbar' })
		const T2 = getRandomFloatUnit({ min: 200, max: 250, significantDigits: 3, unit: 'K' })
		return { p1, p2, T1, T2, V1 }
	},

	getSolution({ p1, p2, T1, T2, V1 }) {
		const p1s = p1.simplify()
		const p2s = p2.simplify()
		const T1s = T1.simplify()
		const T2s = T2.simplify()
		const V1s = V1.simplify()
		const m = p1.multiply(V1).divide(Rs.multiply(T1)).setUnit('kg')
		const V2 = m.multiply(Rs).multiply(T2).divide(p2).setUnit('m^3')
		return { p1s, p2s, V1s, V2, T1s, T2s, m, Rs }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('m', data)
			default: return compare('V2', data)
		}
	},
})
