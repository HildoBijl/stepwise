import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit, getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { cv, cp, Rs } = gasProperties.air
const metaData = {
	skill: 'calculateEntropyChange',
	...stepsToSetup(['calculateWithTemperature', ['specificGasConstant', 'specificHeats'], 'solveLinearEquation']),
	compare: {
		FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		Rs: { float: { relativeTolerance: 0.02 } },
		cp: { float: { relativeTolerance: 0.02 } },
	},
}

export function generateParameters() {
	const n = getRandomFloatUnit({ min: 1.26, max: 1.38, significantDigits: 3, unit: '' })
	const T1o = getRandomFloatUnit({ min: 5, max: 30, decimals: 0, unit: 'dC' })
	const p1o = new FloatUnit('1.0 bar')
	const p2o = getRandomFloatUnit({ min: 6, max: 11, significantDigits: 2, unit: 'bar' })
	return { p1o, T1o, p2o, n }
}

export function getSolution({ p1o, T1o, p2o, n }: ReturnType<typeof generateParameters>) {
	const p1 = p1o
	const p2 = p2o
	const T1 = T1o.simplify()
	const T2 = T1.multiply(p2.divide(p1).float.toPower((n.number - 1) / n.number)).setDecimals(0)
	const ds = cp.multiply(Math.log(T2.number / T1.number)).subtract(Rs.multiply(Math.log(p2.number / p1.number))).setSignificantDigits(2)
	const c = cv.subtract(Rs.divide(n.number - 1)).setSignificantDigits(3)
	return { p1, p2, T1, T2, ds, cv, cp, Rs, c }
}

export default buildStepExercise({
	metaData,
	generateParameters,
	getSolution,
	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare('T2', data)
			case 2:
				switch (substep) {
					case 1: return compare('Rs', data)
					case 2: return compare('cp', data)
				}
			default: return compare('ds', data)
		}
	},
})
