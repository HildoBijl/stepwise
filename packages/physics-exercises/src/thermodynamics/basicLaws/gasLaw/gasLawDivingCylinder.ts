import { randomInteger } from '@step-wise/js-utils'
import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { Rs } = gasProperties.oxygen

export default buildStepExercise({
	metadata: {
		skill: 'gasLaw',
		...createStepExerciseMetadata([['calculateWithVolume', 'calculateWithMass', 'calculateWithTemperature'], 'specificGasConstant', 'solveLinearEquation']),
		comparisons: {
			Vs: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			ms: { float: { relativeTolerance: 0.001, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Ts: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
			Rs: { float: { relativeTolerance: 0.01 }, unit: { target: 'noPrefixes' } },
			p: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		const p = getRandomFloatUnit({ min: 180, max: 300, significantDigits: 2, unit: 'bar' })
		const V = getRandomFloatUnit({ min: 3, max: 18, significantDigits: randomInteger(2, 3), unit: 'l' })
		const T = getRandomFloatUnit({ min: 3, max: 18, significantDigits: 2, unit: 'dC' })
		const m = p.multiply(V).divide(Rs.multiply(T.setUnit('K'))).setUnit('kg').roundToPrecision()
		return { V, m, T }
	},

	getSolution({ V, m, T }) {
		const Vs = V.simplify()
		const Ts = T.simplify()
		const ms = m
		const p = ms.multiply(Rs).multiply(Ts).divide(Vs).setUnit('Pa')
		return { p, Vs, ms, Rs, Ts }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1:
				switch (substep) {
					case 1: return compareInputs('Vs', data)
					case 2: return compareInputs('ms', data)
					case 3: return compareInputs('Ts', data)
				}
			case 2: return compareInputs('Rs', data)
			default: return compareInputs('p', data)
		}
	},
})
