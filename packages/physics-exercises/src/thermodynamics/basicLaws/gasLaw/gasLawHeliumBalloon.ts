import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.helium

export default buildStepExercise({
	metaData: {
		skill: 'gasLaw',
		...createStepExerciseMetadata([['calculateWithMass', 'calculateWithTemperature', 'calculateWithPressure'], 'specificGasConstant', 'solveLinearEquation']),
		compare: {
			ms: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Ts: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			ps: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Rs: { float: { relativeTolerance: 0.01 }, unit: { target: 'noPrefixes' } },
			V: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const m = getRandomFloatUnit({ min: 0.4, max: 2, significantDigits: 2, unit: 'g' })
		const T = getRandomFloatUnit({ min: 10, max: 25, significantDigits: 2, unit: 'dC' })
		const p = getRandomFloatUnit({ min: 1.0, max: 1.1, decimals: 2, unit: 'bar' })
		return { m, T, p }
	},

	getSolution({ m, T, p }) {
		const ms = m.simplify()
		const Ts = T.simplify()
		const ps = p.simplify()
		const V = ms.multiply(Rs).multiply(Ts).divide(ps).setUnit('m^3')
		return { ps, V, ms, Rs, Ts }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compare('ms', data)
					case 2: return compare('Ts', data)
					case 3: return compare('ps', data)
				}
			case 2: return compare('Rs', data)
			default: return compare('V', data)
		}
	},
})
