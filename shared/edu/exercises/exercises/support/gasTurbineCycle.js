import FloatUnit, { getRandomFloatUnit } from '../../../../inputTypes/FloatUnit'
import * as gasProperties from '../../../../data/gasProperties'
const { air: { k, cp } } = gasProperties

export function getCycle() {
	// Pressure.
	const p1 = new FloatUnit('1.0 bar')
	const p2 = getRandomFloatUnit({
		min: 6,
		max: 12,
		unit: 'bar',
	})
	const p3 = p2
	const p4 = p1
	const ratio = p2.number / p1.number

	// Isentropic efficiency.
	const etai = getRandomFloatUnit({
		min: 0.85,
		max: 0.98,
		unit: '',
	})

	// Temperature.
	const T1 = getRandomFloatUnit({
		min: 275,
		max: 300,
		unit: 'K',
	})
	const T2p = T1.multiply(Math.pow(ratio, 1 - 1 / k.number))
	const T2 = T1.add(T2p.subtract(T1).divide(etai))
	const T3 = getRandomFloatUnit({
		min: 800,
		max: 1200,
		unit: 'K',
	})
	const T4p = T3.divide(Math.pow(ratio, 1 - 1 / k.number))
	const T4 = T3.add(T4p.subtract(T3).multiply(etai))

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

	// Mass flow and power.
	const mdot = getRandomFloatUnit({
		min: 10,
		max: 50,
		unit: 'kg/s',
	})
	const P = mdot.multiply(wn).setUnit('MW')

	return { p1, T1, p2, T2, p3, T3, p4, T4, etai, q12, wt12, q23, wt23, q34, wt34, q41, wt41, wn, qin, eta, mdot, P }
}
