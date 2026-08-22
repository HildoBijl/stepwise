import { buildStepExercise, createStepExerciseMetadata } from '@step-wise/input-exercises'
import { compare } from '@step-wise/exercise-grading'
import { FloatUnit } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

import { getCycle } from '../tools'

const { k, cp } = gasProperties.air

export default buildStepExercise({
	metaData: {
		skill: 'analyseGasTurbine',
		...createStepExerciseMetadata(['poissonsLaw', 'useIsentropicEfficiency', 'calculateSpecificHeatAndMechanicalWork', 'poissonsLaw', 'useIsentropicEfficiency', 'calculateSpecificHeatAndMechanicalWork', ['calculateWithEfficiency', 'massFlowTrick']]),
		compare: {
			FloatUnit: { float: { relativeTolerance: 0.01, significantDigitTolerance: 1 } },
			eta: { float: { relativeTolerance: 0.02, significantDigitTolerance: 1 } },
		},
	},

	generateParameters() {
		let { p1, T1, p2, q23, etai: etaio, mdot } = getCycle()
		p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
		p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
		T1 = T1.setDecimals(0).roundToPrecision()
		q23 = q23.setSignificantDigits(3).roundToPrecision()
		etaio = etaio.setUnit('%').setDecimals(0).roundToPrecision()
		mdot = mdot.setSignificantDigits(2).roundToPrecision()
		return { p1, T1, p2, q23, etaio, mdot }
	},

	getSolution({ p1, T1, p2, q23, etaio, mdot }) {
		const etai = etaio.simplify()
		const p3 = p2
		const p4 = p1
		const factor = Math.pow(p2.number / p1.number, 1 - 1 / k.number)
		const T2p = T1.multiply(factor).setDecimals(0)
		const T2 = T1.add(T2p.subtract(T1).divide(etai)).setDecimals(0)
		const T3 = T2.add(q23.divide(cp)).setUnit('K')
		const T4p = T3.divide(factor).setDecimals(0)
		const T4 = T3.add(T4p.subtract(T3).multiply(etai)).setDecimals(0)
		const q12 = new FloatUnit('0 J/kg')
		const wt12 = cp.multiply(T1.subtract(T2)).setUnit('J/kg')
		const wt23 = new FloatUnit('0 J/kg')
		const q34 = new FloatUnit('0 J/kg')
		const wt34 = cp.multiply(T3.subtract(T4)).setUnit('J/kg')
		const q41 = cp.multiply(T1.subtract(T4)).setUnit('J/kg')
		const wt41 = new FloatUnit('0 J/kg')
		const wn = wt12.add(wt23).add(wt34).add(wt41)
		const qin = q23
		const eta = wn.divide(qin).setUnit('')
		const P = mdot.multiply(wn).setUnit('W')
		return { k, cp, p1, T1, p2, T2, T2p, p3, T3, p4, T4, T4p, etai, q12, wt12, q23, wt23, q34, wt34, q41, wt41, wn, qin, eta, mdot, P }
	},

	checkInput(data, step, substep) {
		switch (step) {
			case 1: return compare('T2p', data)
			case 2: return compare('T2', data)
			case 3: return compare('T3', data)
			case 4: return compare('T4p', data)
			case 5: return compare('T4', data)
			case 6: return compare('wn', data)
			case 7:
				switch (substep) {
					case 1: return compare('eta', data)
					case 2: return compare('P', data)
				}
			default: return compare(['eta', 'P'], data)
		}
	},
})
