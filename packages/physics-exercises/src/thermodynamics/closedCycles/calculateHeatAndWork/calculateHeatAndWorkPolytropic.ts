import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs, cv } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateHeatAndWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, ['specificGasConstant', 'specificHeats'], undefined, ['calculateWithMass', 'calculateWithTemperature'], undefined]),
		comparisons: {
			ms: { value: { relativeTolerance: 0.001 }, unit: { target: 'unchanged' } },
			T1s: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			T2s: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			Rs: { value: { relativeTolerance: 0.01 } },
			cv: { value: { relativeTolerance: 0.01 } },
			c: { value: { relativeTolerance: 0.02, significantDigitTolerance: 2 } },
			Q: { value: { relativeTolerance: 0.02, significantDigitTolerance: 2 } },
			W: { value: { relativeTolerance: 0.02, significantDigitTolerance: 2 } },
		},
	},

	generateParameters() {
		const n = getRandomFloatUnit({ min: 1.1, max: 1.35, decimals: 2, unit: '' })
		const m = getRandomFloatUnit({ min: 0.3, max: 1.5, significantDigits: 2, unit: 'g' })
		const T1 = getRandomFloatUnit({ min: 5, max: 30, significantDigits: 2, unit: 'dC' })
		const pressureRatio = randomNumber(2, 4)
		const T2 = T1.setUnit('K').multiply(Math.pow(pressureRatio, 1 - 1 / n.number)).setUnit('dC').roundToPrecision()
		return { m, T1, T2, n }
	},

	getSolution({ m, T1, T2, n }) {
		const ms = m.simplify()
		const T1s = T1
		const T2s = T2
		const cvSimplified = cv.simplify()
		const c = cvSimplified.subtract(Rs.divide(n.number - 1))
		const mdT = m.multiply(T2s.subtract(T1s))
		const Q = mdT.multiply(c).setUnit('J')
		const W = mdT.multiply(Rs).divide(1 - n.number).setUnit('J')
		return { process: 4, eq: 9, Rs, cv: cvSimplified, n, ms, c, T1s, T2s, Q, W }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3:
				switch (substep) {
					case 1: return compareInputs('Rs', data)
					case 2: return compareInputs('cv', data)
				}
			case 4: return compareInputs('c', data)
			case 5:
				switch (substep) {
					case 1: return compareInputs('ms', data)
					case 2: return compareInputs(['T1s', 'T2s'], data)
				}
			default: return compareInputs(['Q', 'W'], data)
		}
	},
})
