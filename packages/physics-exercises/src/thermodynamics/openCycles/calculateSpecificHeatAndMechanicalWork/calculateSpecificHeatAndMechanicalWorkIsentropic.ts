import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'calculateSpecificHeatAndMechanicalWork',
		...stepsToSetup(['recognizeProcessTypes', undefined, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], 'calculateWithSpecificQuantities']),
		compare: {
			k: { float: { relativeTolerance: 0.015 } },
			v1: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			v2: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p1: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p2: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			q: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
			wt: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateState() {
		const v2o = getRandomFloatUnit({ min: 1.5, max: 1.8, decimals: 1, unit: 'm^3/kg' })
		const pressureRatio = randomNumber(7, 11)
		const v1o = v2o.multiply(Math.pow(1 / pressureRatio, 1 / k.number)).roundToPrecision()
		const p2o = new FloatUnit('1.0 bar')
		const p1o = p2o.multiply(Math.pow(v2o.number / v1o.number, k.number)).setDecimals(1).roundToPrecision()
		return { p1o, p2o, v1o, v2o }
	},

	getSolution({ p1o, p2o, v1o, v2o }) {
		const p1 = p1o.simplify()
		const p2 = p2o.simplify()
		const v1 = v1o
		const v2 = v2o
		const q = new FloatUnit('0 J/kg')
		const wt = p2.multiply(v2).subtract(p1.multiply(v1)).multiply(-k.number / (k.number - 1)).setUnit('J/kg')
		return { process: 3, eq: 6, k, p1, p2, v1, v2, q, wt }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare('process', data)
			case 2: return compare('eq', data)
			case 3: return compare('k', data)
			case 4:
				switch (substep) {
					case 1: return compare(['v1', 'v2'], data)
					case 2: return compare(['p1', 'p2'], data)
				}
			default: return compare(['q', 'wt'], data)
		}
	},
})
