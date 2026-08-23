import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getCycle } from '../../steam/rankineCycle/tools'

export default buildStepExercise({
	metadata: {
		skill: 'useIsentropicEfficiency',
		...createStepExerciseMetadata(['calculateWithEnthalpy', 'solveLinearEquation']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		let { h2: h1, h3p: h2p, h3: h2 } = getCycle()
		h1 = h1.setDecimals(-1).roundToPrecision().setDecimals(0)
		h2p = h2p.setDecimals(-1).roundToPrecision().setDecimals(0)
		h2 = h2.setDecimals(-1).roundToPrecision().setDecimals(0)
		return { h1, h2p, h2 }
	},

	getSolution({ h1, h2p, h2 }) {
		const wti = h1.subtract(h2p)
		const wt = h1.subtract(h2)
		const etai = wt.divide(wti).setUnit('').setDecimals(3)
		return { wti, wt, etai }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs(['wti', 'wt'], data)
			default: return compareInputs('etai', data)
		}
	},
})
