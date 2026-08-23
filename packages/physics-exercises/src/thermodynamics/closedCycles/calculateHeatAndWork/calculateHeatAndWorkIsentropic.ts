import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateHeatAndWork',
		...createStepExerciseMetadata(['recognizeProcessTypes', undefined, 'specificHeatRatio', ['calculateWithVolume', 'calculateWithPressure'], undefined]),
		comparisons: {
			Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 2 } },
			V1s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			V2s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p1s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
			p2s: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { checkSize: true } },
		},
	},

	generateParameters() {
		let V1 = getRandomQuantity({ min: 150, max: 900, decimals: -1, unit: 'm^3' })
		const pressureRatio = randomNumber(7, 11)
		const V2 = V1.multiply(Math.pow(pressureRatio, 1 / k.number)).roundToPrecision()
		V1 = V1.setDecimals(0)
		const p2 = new Quantity('1.0 bar')
		const p1 = p2.multiply(Math.pow(V2.number / V1.number, k.number)).setDecimals(1).roundToPrecision()
		return { p1, p2, V1, V2 }
	},

	getSolution({ p1, p2, V1, V2 }) {
		const V1s = V1
		const V2s = V2
		const p1s = p1.simplify()
		const p2s = p2.simplify()
		const Q = new Quantity('0 J')
		const W = p2s.multiply(V2s).subtract(p1s.multiply(V1s)).multiply(-1 / (k.number - 1)).setUnit('J')
		return { process: 3, eq: 6, k, p1s, p2s, V1s, V2s, Q, W }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compareInputs('process', data)
			case 2: return compareInputs('eq', data)
			case 3: return compareInputs('k', data)
			case 4:
				switch (substep) {
					case 1: return compareInputs(['V1s', 'V2s'], data)
					case 2: return compareInputs(['p1s', 'p2s'], data)
				}
			default: return compareInputs(['Q', 'W'], data)
		}
	},
})
