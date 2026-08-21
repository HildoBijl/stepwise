import { sample } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metaData: {
		skill: 'calculateHeatAndWork',
		...stepsToSetup(['recognizeProcessTypes', undefined, 'specificGasConstant', 'gasLaw', ['calculateWithMass', 'calculateWithTemperature'], undefined]),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 2 } },
			ms: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Ts: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 2 }, unit: { target: 'unchanged' } },
		},
	},

	generateParameters() {
		const gas = sample(gases)
		const m = getRandomFloatUnit({ min: 0.5, max: 6, significantDigits: 2, unit: 'kg' })
		const T = getRandomFloatUnit({ min: 6, max: 30, decimals: 0, unit: 'dC' })
		const p1 = getRandomFloatUnit({ min: 2, max: 9, decimals: 1, unit: 'bar' })
		const p2 = getRandomFloatUnit({ min: 10, max: 30, decimals: 0, unit: 'bar' })
		return { gas, m, T, p1, p2 }
	},

	getSolution({ gas, m, T, p1, p2 }) {
		const { Rs } = gasProperties[gas]
		const Ts = T.simplify()
		const ms = m
		const ratio = p1.divide(p2).simplify()
		const Q = ms.multiply(Rs).multiply(Ts).multiply(Math.log(ratio.number)).setUnit('J')
		const W = Q
		return { gas, process: 2, eq: 5, Rs, ratio, ms, Ts, p1, p2, Q, W }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare('process', data)
			case 2: return compare('eq', data)
			case 3: return compare('Rs', data)
			case 4: return compare('ratio', data)
			case 5:
				switch (substep) {
					case 1: return compare('ms', data)
					case 2: return compare('Ts', data)
				}
			default: return compare(['Q', 'W'], data)
		}
	},
})
