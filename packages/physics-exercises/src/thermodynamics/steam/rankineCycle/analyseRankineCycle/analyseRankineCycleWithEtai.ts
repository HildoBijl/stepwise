import { randomInteger } from '@step-wise/js-utils'
import { multiOutputTableInterpolate } from '@step-wise/interpolation'
import { buildStepExercise, stepsToSetup } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { saturatedSteamByPressure, superheatedSteam } from '@step-wise/physics-data'

import { getCycle } from '../tools'

export default buildStepExercise({
	metaData: {
		skill: 'analyseRankineCycle',
		...stepsToSetup(['createRankineCycleOverview', 'useIsentropicEfficiency', ['calculateWithEfficiency', 'massFlowTrick']]),
		compare: { FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 2 } } },
	},

	generateParameters() {
		let { pc, pe, T2, etai, mdot, P } = getCycle()
		pc = pc.setSignificantDigits(2).roundToPrecision()
		pe = pe.setDecimals(0).roundToPrecision()
		T2 = T2.setDecimals(0).roundToPrecision()
		etai = etai.setUnit('%').setDecimals(0).roundToPrecision().setDecimals(1)
		const type = randomInteger(1, 2)
		if (type === 1) {
			mdot = mdot.setSignificantDigits(2).roundToPrecision()
			return { type, pc, pe, T2, etai, mdot }
		}
		P = P.setSignificantDigits(2).roundToPrecision()
		return { type, pc, pe, T2, etai, P }
	},

	getSolution({ type, pc, pe, T2, etai, mdot, P }) {
		const saturatedProperties = multiOutputTableInterpolate(pc, saturatedSteamByPressure)
		const hx0 = saturatedProperties.enthalpyLiquid!
		const hx1 = saturatedProperties.enthalpyVapor!
		const sx0 = saturatedProperties.entropyLiquid!
		const sx1 = saturatedProperties.entropyVapor!
		const h1 = hx0
		const s1 = sx0
		const h4 = h1
		const s4 = s1

		const superheatedProperties = multiOutputTableInterpolate([pe, T2], superheatedSteam)
		const h2 = superheatedProperties.enthalpy!
		const s2 = superheatedProperties.entropy!
		const s3p = s2
		const x3p = s3p.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
		const h3p = hx0.add(x3p.multiply(hx1.subtract(hx0)))
		const h3 = h2.subtract(etai.simplify().multiply(h2.subtract(h3p)))
		const wt = h2.subtract(h3)
		const q = h2.subtract(h1)
		const eta = wt.divide(q).setUnit('')

		if (type === 1) P = mdot!.multiply(wt).setUnit('MW')
		else mdot = P!.divide(wt).setUnit('kg/s')
		return { hx0, hx1, sx0, sx1, h1, s1, h2, s2, h3p, s3p, x3p, h3, h4, s4, wt, q, eta, mdot, P }
	},

	checkInput(data, step, substep) {
		const toCheck = data.parameters.type === 1 ? 'P' : 'mdot'
		switch (step) {
			case 1: return compare(['h1', 'h2', 'h3p', 'h4'], data)
			case 2: return compare('h3', data)
			case 3:
				switch (substep) {
					case 1: return compare('eta', data)
					case 2: return compare(toCheck, data)
				}
			default: return compare(['eta', toCheck], data)
		}
	},
})
