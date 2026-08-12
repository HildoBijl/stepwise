import { sample } from '@step-wise/utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const gases = ['air', 'carbonMonoxide', 'hydrogen', 'methane', 'nitrogen', 'oxygen'] as const

export default buildStepExercise({
	metaData: {
		skill: 'calculateHeatAndWork',
		...stepsToSetup(['recognizeProcessTypes', undefined, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], undefined]),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.015, significantDigitTolerance: 2 } },
			Vs: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p1s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p2s: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
		},
	},

	generateState() {
		const gas = sample(gases)
		const V = getRandomFloatUnit({ min: 20, max: 200, decimals: -1, unit: 'l' }).setDecimals(0)
		const p1 = getRandomFloatUnit({ min: 6, max: 12, decimals: 0, unit: 'bar' })
		const p2 = getRandomFloatUnit({ min: 13, max: 24, decimals: 0, unit: 'bar' })
		return { gas, V, p1, p2 }
	},

	getSolution({ gas, V, p1, p2 }) {
		const { k } = gasProperties[gas]
		const Vs = V.simplify()
		const p1s = p1.simplify()
		const p2s = p2.simplify()
		const Q = Vs.multiply(p2s.subtract(p1s)).multiply(1 / (k.number - 1)).setUnit('J')
		const W = new FloatUnit('0 J')
		return { gas, process: 1, eq: 2, k, Vs, p1s, p2s, Q, W }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare('process', data)
			case 2: return compare('eq', data)
			case 3: return compare('k', data)
			case 4:
				switch (substep) {
					case 1: return compare('Vs', data)
					case 2: return compare(['p1s', 'p2s'], data)
				}
			default: return compare(['Q', 'W'], data)
		}
	},
})
