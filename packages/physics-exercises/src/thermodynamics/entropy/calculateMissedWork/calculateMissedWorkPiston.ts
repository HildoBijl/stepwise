import { randomNumber } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k, Rs, cv } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'calculateMissedWork',
		...createStepExerciseMetadata(['calculateEntropyChange', 'calculateEntropyChange', undefined, 'solveLinearEquation']),
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		const pAtm = new FloatUnit('1.0 bar')
		const TAtm = getRandomFloatUnit({ min: 275, max: 300, decimals: 0, unit: 'K' })
		const Vmax = getRandomFloatUnit({ min: 300, max: 600, unit: 'cm^3' })
		const m = pAtm.multiply(Vmax).divide(Rs.multiply(TAtm)).setUnit('kg').setSignificantDigits(2).roundToPrecision()
		const V2 = Vmax
		const p2p = getRandomFloatUnit({ min: 1.3, max: 1.8, unit: 'bar' })
		const T2p = TAtm.multiply(p2p.divide(pAtm)).setUnit('K').setDecimals(-1).roundToPrecision().setDecimals(0)
		const volumeFactor = randomNumber(12, 20)
		const V1 = V2.divide(volumeFactor)
		const T1 = T2p.multiply(Math.pow(volumeFactor, k.number - 1)).setDecimals(-1).roundToPrecision().setDecimals(0)
		const n = getRandomFloatUnit({ min: 1.32, max: 1.39, unit: '' })
		const T2 = T1.multiply(Math.pow(volumeFactor, 1 - n.number)).setDecimals(-1).roundToPrecision().setDecimals(0)
		return { m, TAtm, T1, T2, T2p }
	},

	getSolution({ m, TAtm, T1, T2, T2p }) {
		const dS12p = new FloatUnit('0 J/K')
		const dS2p2 = m.multiply(cv).multiply(Math.log(T2.number / T2p.number)).setUnit('J/K')
		const dS = dS12p.add(dS2p2)
		const Wm = TAtm.multiply(dS).setUnit('J')
		return { cv, dS12p, dS2p2, dS, Wm }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compare('dS12p', data)
			case 2: return compare('dS2p2', data)
			case 3: return compare('dS', data)
			default: return compare('Wm', data)
		}
	},
})
