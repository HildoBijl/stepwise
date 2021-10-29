import { FloatUnit } from '../../../inputTypes/FloatUnit'
import { getStepExerciseProcessor } from '../util/stepExercise'
import { combinerAnd, combinerRepeat } from '../../../skillTracking'
import * as gasProperties from '../../../data/gasProperties'
const { air: { k, cp } } = gasProperties
import { checkParameter } from '../util/check'
import { getCycle } from './support/gasTurbineCycle'

export const data = {
	skill: 'analyseGasTurbine',
	setup: combinerAnd('calculateOpenCycle', combinerRepeat('useIsentropicEfficiency', 2), 'createOpenCycleEnergyOverview', 'calculateWithEfficiency', 'massFlowTrick'),
	steps: ['calculateOpenCycle', 'useIsentropicEfficiency', 'useIsentropicEfficiency', 'createOpenCycleEnergyOverview', ['calculateWithEfficiency', 'massFlowTrick']],

	equalityOptions: {
		default: {
			relativeMargin: 0.01,
			significantDigitMargin: 1,
			accuracyFactor: 1.5,
		},
		eta: {
			relativeMargin: 0.02,
			significantDigitMargin: 1,
			accuracyFactor: 1.5,
		},
	},
}

export function generateState() {
	let { p1, T1, p2, T2, T3, mdot } = getCycle()
	p1 = p1.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	p2 = p2.setDecimals(0).roundToPrecision().setMinimumSignificantDigits(2)
	T1 = T1.setDecimals(0).roundToPrecision()
	T2 = T2.setDecimals(-1).roundToPrecision().setDecimals(0)
	T3 = T3.setDecimals(-1).roundToPrecision().setDecimals(0)
	mdot = mdot.setSignificantDigits(2).roundToPrecision()
	return { p1, T1, p2, T2, T3, mdot }
}

export function getCorrect({ p1, T1, p2, T2, T3, mdot }) {
	// Pressure.
	const p3 = p2
	const p4 = p1
	const ratio = p2.number / p1.number

	// Temperature in ideal case.
	const T2p = T1.multiply(Math.pow(ratio, 1 - 1 / k.number)).setDecimals(0)
	const T4p = T3.divide(Math.pow(ratio, 1 - 1 / k.number)).setDecimals(0)

	// Isentropic efficiency.
	etai = T2p.subtract(T1).divide(T2.subtract(T1)).setUnit('')
	const T4 = T3.add(T4p.subtract(T3).multiply(etai)).setDecimals(0)

	// Heat and work.
	const q12 = new FloatUnit('0 J/kg')
	const wt12 = cp.multiply(T1.subtract(T2)).setUnit('J/kg')
	const q23 = cp.multiply(T3.subtract(T2)).setUnit('J/kg')
	const wt23 = new FloatUnit('0 J/kg')
	const q34 = new FloatUnit('0 J/kg')
	const wt34 = cp.multiply(T3.subtract(T4)).setUnit('J/kg')
	const q41 = cp.multiply(T1.subtract(T4)).setUnit('J/kg')
	const wt41 = new FloatUnit('0 J/kg')
	const wn = wt12.add(wt23).add(wt34).add(wt41)
	const qin = q23
	const eta = wn.divide(qin).setUnit('')

	// Power.
	const P = mdot.multiply(wn).setUnit('W')

	return { k, cp, p1, T1, p2, T2, T2p, p3, T3, p4, T4, T4p, etai, q12, wt12, q23, wt23, q34, wt34, q41, wt41, wn, qin, eta, mdot, P }
}

export function checkInput(state, input, step, substep) {
	const correct = getCorrect(state)
	switch (step) {
		case 1:
			return checkParameter(['p1', 'T1', 'p2', 'T2p', 'p3', 'T3', 'p4', 'T4p'], correct, input, data.equalityOptions)
		case 2:
			return checkParameter(['etai'], correct, input, data.equalityOptions)
		case 3:
			return checkParameter(['T4'], correct, input, data.equalityOptions)
		case 4:
			return checkParameter(['q12', 'wt12', 'q23', 'wt23', 'q34', 'wt34', 'q41', 'wt41'], correct, input, data.equalityOptions)
		case 5:
			switch (substep) {
				case 1:
					return checkParameter(['eta'], correct, input, data.equalityOptions)
				case 2:
					return checkParameter(['P'], correct, input, data.equalityOptions)
			}
		default:
			return checkParameter(['eta', 'P'], correct, input, data.equalityOptions)
	}
}

export const processAction = getStepExerciseProcessor(checkInput, data)
