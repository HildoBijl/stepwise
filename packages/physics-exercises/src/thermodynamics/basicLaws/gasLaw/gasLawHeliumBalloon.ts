import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.helium

export default buildStepExercise({
	metadata: {
		skill: 'gasLaw',
		...createStepExerciseMetadata([['calculateWithMass', 'calculateWithTemperature', 'calculateWithPressure'], 'specificGasConstant', 'solveLinearEquation']),
		comparisons: {
			ms: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Ts: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			ps: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Rs: { float: { relativeTolerance: 0.01 }, unit: { target: 'normalizedPrefixes' } },
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
					case 1: return compareInputs('ms', data)
					case 2: return compareInputs('Ts', data)
					case 3: return compareInputs('ps', data)
				}
			case 2: return compareInputs('Rs', data)
			default: return compareInputs('V', data)
		}
	},
})
