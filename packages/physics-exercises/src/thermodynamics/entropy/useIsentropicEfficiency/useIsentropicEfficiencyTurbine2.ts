import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compareInputs } from '@step-wise/exercise-grading'

import { getCycle } from '../../steam/rankineCycle/tools'

export default buildStepExercise({
	metadata: {
		skill: 'useIsentropicEfficiency',
		...createStepExerciseMetadata(['calculateWithEnthalpy', 'solveLinearEquation', 'calculateWithEnthalpy']),
		comparisons: { Quantity: { value: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateParameters() {
		let { etai: etaio, h2: h1, h3p: h2p } = getCycle()
		etaio = etaio.setUnit('%').setDecimals(0).roundToPrecision()
		h1 = h1.setDecimals(-1).roundToPrecision().setDecimals(0)
		h2p = h2p.setDecimals(-1).roundToPrecision().setDecimals(0)
		return { h1, h2p, etaio }
	},

	getSolution({ h1, h2p, etaio }) {
		const etai = etaio.simplify()
		const wti = h1.subtract(h2p)
		const wt = wti.multiply(etai).setDecimals(0)
		const h2 = h1.subtract(wt)
		return { etai, wti, wt, h2 }
	},

	checkInput(data, step) {
		switch (step) {
			case 1: return compareInputs('wti', data)
			case 2: return compareInputs('wt', data)
			default: return compareInputs('h2', data)
		}
	},
})
