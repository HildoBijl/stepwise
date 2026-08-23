import { sample } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metadata: {
		skill: 'calculateHeatAndWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, ['specificHeats', 'specificGasConstant'], ['calculateWithMass', 'calculateWithTemperature'], undefined]),
		comparisons: {
			FloatUnit: { float: { relativeTolerance: 0.015, significantDigitTolerance: 2 } },
			ms: { float: { relativeTolerance: 0.001 }, unit: { target: 'unchanged' } },
			T1s: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			T2s: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
		},
	},

	generateParameters() {
		const gas = sample(gases)
		const m = getRandomFloatUnit({ min: 20, max: 200, significantDigits: 2, unit: 'g' })
		const T1 = getRandomFloatUnit({ min: 1, max: 10, decimals: 0, unit: 'dC' })
		const T2 = getRandomFloatUnit({ min: 30, max: 60, decimals: 0, unit: 'dC' })
		return { gas, m, T1, T2 }
	},

	getSolution({ gas, m, T1, T2 }) {
		const { Rs } = gasProperties[gas]
		const cp = gasProperties[gas].cp.simplify()
		const T1s = T1
		const T2s = T2
		const ms = m.simplify()
		const dT = T2s.subtract(T1s)
		const Q = ms.multiply(cp).multiply(dT).setUnit('J')
		const W = ms.multiply(Rs).multiply(dT).setUnit('J')
		return { gas, process: 0, eq: 1, ms, T1s, T2s, cp, Rs, Q, W }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3:
				switch (substep) {
					case 1: return compareInputs('cp', data)
					case 2: return compareInputs('Rs', data)
				}
			case 4:
				switch (substep) {
					case 1: return compareInputs('ms', data)
					case 2: return compareInputs(['T1s', 'T2s'], data)
				}
			default: return compareInputs(['Q', 'W'], data)
		}
	},
})
