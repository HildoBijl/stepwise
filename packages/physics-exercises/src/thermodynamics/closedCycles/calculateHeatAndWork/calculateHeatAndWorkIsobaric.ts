import { sample } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metaData: {
		skill: 'calculateHeatAndWork',
		...stepsToSetup(['recognizeProcessTypes', undefined, ['specificHeats', 'specificGasConstant'], ['calculateWithMass', 'calculateWithTemperature'], undefined]),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.015, significantDigitTolerance: 2 } },
			ms: { float: { relativeTolerance: 0.001 }, unit: { target: 'unchanged' } },
			T1s: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
			T2s: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 } },
		},
	},

	generateState() {
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
			case 1: return compare('process', data)
			case 2: return compare('eq', data)
			case 3:
				switch (substep) {
					case 1: return compare('cp', data)
					case 2: return compare('Rs', data)
				}
			case 4:
				switch (substep) {
					case 1: return compare('ms', data)
					case 2: return compare(['T1s', 'T2s'], data)
				}
			default: return compare(['Q', 'W'], data)
		}
	},
})
