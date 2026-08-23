import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'
import { getRandomFloatUnit } from '@step-wise/physics-core'

const metadata = {
	skill: 'calculateEntropyChange',
	...createStepExerciseMetadata(['calculateWithTemperature', 'solveLinearEquation', 'solveLinearEquation', undefined]),
	comparisons: {
		FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
		Tw: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
		Tc: { float: { absoluteTolerance: 0.7, significantDigitTolerance: 1 }, unit: { target: 'unchanged' } },
	},
}

export function generateParameters() {
	const Qo = getRandomFloatUnit({ min: 2, max: 10, significantDigits: 2, unit: 'kJ' })
	const Two = getRandomFloatUnit({ min: 500, max: 1000, decimals: -2, unit: 'dC' }).setDecimals(0)
	const Tco = getRandomFloatUnit({ min: 5, max: 30, decimals: 0, unit: 'dC' })
	return { Qo, Two, Tco }
}

export function getSolution({ Qo, Two, Tco }: ReturnType<typeof generateParameters>) {
	const Q = Qo.simplify()
	const Tw = Two.simplify()
	const Tc = Tco.simplify()
	const Qw = Q.multiply(-1)
	const Qc = Q
	const dSw = Qw.divide(Tw)
	const dSc = Qc.divide(Tc)
	const dS = dSw.add(dSc)
	return { Q, Tw, Tc, Qw, Qc, dSw, dSc, dS }
}

export default buildStepExercise({
	metadata,
	generateParameters,
	getSolution,
	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['Tw', 'Tc'], data)
			case 2: return compareInputs('dSc', data)
			case 3: return compareInputs('dSw', data)
			default: return compareInputs('dS', data)
		}
	},
})
