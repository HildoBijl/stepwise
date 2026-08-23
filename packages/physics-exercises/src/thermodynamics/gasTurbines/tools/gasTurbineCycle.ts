import { Quantity, getRandomQuantity } from '@step-wise/physics-core'
import { gasProperties } from '@step-wise/physics-data'

const { k, cp } = gasProperties.air

export function getCycle() {
	const p1 = new Quantity('1.0 bar')
	const p2 = getRandomQuantity({ min: 6, max: 12, unit: 'bar', decimals: 0 })
	const p3 = p2
	const p4 = p1
	const ratio = p2.number / p1.number
	const etai = getRandomQuantity({ min: 0.85, max: 0.98, unit: '' })
	const T1 = getRandomQuantity({ min: 275, max: 300, unit: 'K' })
	const T2p = T1.multiply(Math.pow(ratio, 1 - 1 / k.number))
	const T2 = T1.add(T2p.subtract(T1).divide(etai))
	const T3 = getRandomQuantity({ min: 800, max: 1200, unit: 'K' })
	const T4p = T3.divide(Math.pow(ratio, 1 - 1 / k.number))
	const T4 = T3.add(T4p.subtract(T3).multiply(etai))
	const q12 = new Quantity('0 J/kg')
	const wt12 = cp.multiply(T1.subtract(T2)).setUnit('J/kg')
	const q23 = cp.multiply(T3.subtract(T2)).setUnit('J/kg')
	const wt23 = new Quantity('0 J/kg')
	const q34 = new Quantity('0 J/kg')
	const wt34 = cp.multiply(T3.subtract(T4)).setUnit('J/kg')
	const q41 = cp.multiply(T1.subtract(T4)).setUnit('J/kg')
	const wt41 = new Quantity('0 J/kg')
	const wn = wt12.add(wt23).add(wt34).add(wt41)
	const qin = q23
	const eta = wn.divide(qin).setUnit('')
	const mdot = getRandomQuantity({ min: 10, max: 50, unit: 'kg/s' })
	const P = mdot.multiply(wn).setUnit('MW')
	return { p1, T1, p2, T2, p3, T3, p4, T4, etai, q12, wt12, q23, wt23, q34, wt34, q41, wt41, wn, qin, eta, mdot, P }
}
