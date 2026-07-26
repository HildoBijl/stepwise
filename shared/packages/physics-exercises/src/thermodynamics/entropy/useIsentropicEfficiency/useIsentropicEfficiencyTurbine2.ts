import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'

import { getCycle } from '../../steam/rankineCycle/tools'

export default buildStepExercise({
	metaData: {
		skill: 'useIsentropicEfficiency',
		...stepsToSetup(['calculateWithEnthalpy', 'solveLinearEquation', 'calculateWithEnthalpy']),
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } } },
	},

	generateState() {
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
			case 1: return compare('wti', data)
			case 2: return compare('wt', data)
			default: return compare('h2', data)
		}
	},
})
