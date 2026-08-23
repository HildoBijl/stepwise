import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.argon

export default buildStepExercise({
	metadata: {
		skill: 'gasLaw',
		...createStepExerciseMetadata([['calculateWithVolume', 'calculateWithPressure', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation']),
		comparisons: {
			Vs: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			ps: { value: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Ts: { value: { absoluteTolerance: 0.7, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Rs: { value: { relativeTolerance: 0.01 }, unit: { target: 'unchanged' } },
			m: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const V = getRandomFloatUnit({ min: 40, max: 200, decimals: -1, unit: 'cm^3' }).adjustSignificantDigits(1)
		const p = getRandomFloatUnit({ min: 200, max: 800, significantDigits: 2, unit: 'mbar' }).adjustSignificantDigits(1)
		const T = getRandomFloatUnit({ min: 15, max: 30, decimals: 0, unit: 'dC' })
		return { V, p, T }
	},

	getSolution({ p, V, T }) {
		const Vs = V.simplify()
		const ps = p.simplify()
		const Ts = T.simplify()
		const m = ps.multiply(Vs).divide(Rs.multiply(Ts)).setUnit('kg')
		return { ps, Vs, m, Rs, Ts }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compareInputs('Vs', data)
					case 2: return compareInputs('ps', data)
					case 3: return compareInputs('Ts', data)
				}
			case 2: return compareInputs('Rs', data)
			default: return compareInputs('m', data)
		}
	},
})
