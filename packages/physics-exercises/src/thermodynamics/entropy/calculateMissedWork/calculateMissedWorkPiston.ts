import { randomNumber } from '@step-wise/js-utils'
import { compareInputs } from '@step-wise/exercise-grading'
import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { buildStepExercise, createStepExerciseMetadata } from '#exerciseBuilding'

const { k, Rs, cv } = gasProperties.air

export default buildStepExercise({
	metadata: {
		skill: 'calculateMissedWork',
		...createStepExerciseMetadata(['calculateEntropyChange', 'calculateEntropyChange', undefined, 'solveLinearEquation']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const pAtm = new Quantity('1.0 bar')
		const TAtm = getRandomQuantity({ min: 275, max: 300, decimals: 0, unit: 'K' })
		const Vmax = getRandomQuantity({ min: 300, max: 600, unit: 'cm^3' })
		const m = pAtm.multiply(Vmax).divide(Rs.multiply(TAtm)).setUnit('kg').setSignificantDigits(2).roundToPrecision()
		const V2 = Vmax
		const p2p = getRandomQuantity({ min: 1.3, max: 1.8, unit: 'bar' })
		const T2p = TAtm.multiply(p2p.divide(pAtm)).setUnit('K').setDecimals(-1).roundToPrecision().setDecimals(0)
		const volumeFactor = randomNumber(12, 20)
		const V1 = V2.divide(volumeFactor)
		const T1 = T2p.multiply(Math.pow(volumeFactor, k.number - 1)).setDecimals(-1).roundToPrecision().setDecimals(0)
		const n = getRandomQuantity({ min: 1.32, max: 1.39, unit: '' })
		const T2 = T1.multiply(Math.pow(volumeFactor, 1 - n.number)).setDecimals(-1).roundToPrecision().setDecimals(0)
		return { m, TAtm, T1, T2, T2p }
	},

	getSolution({ m, TAtm, T1, T2, T2p }) {
		const dS12p = new Quantity('0 J/K')
		const dS2p2 = m.multiply(cv).multiply(Math.log(T2.number / T2p.number)).setUnit('J/K')
		const dS = dS12p.add(dS2p2)
		const Wm = TAtm.multiply(dS).setUnit('J')
		return { cv, dS12p, dS2p2, dS, Wm }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('dS12p', data)
			case 2: return compareInputs('dS2p2', data)
			case 3: return compareInputs('dS', data)
			default: return compareInputs('Wm', data)
		}
	},
})
