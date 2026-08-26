import { sample } from '@step-wise/js-utils'
import { getRandomQuantity } from '@step-wise/physics-core'
import { refrigerantDatasets, getSaturationPressure, getRefrigerantPropertiesFromPressureAndTemperature, getRefrigerantPropertiesFromPressureAndEnthalpy, getRefrigerantPropertiesFromPressureAndEntropy } from '@step-wise/physics-data'

export function getTemperatures() {
	const TCold = getRandomQuantity({ min: -4, max: 6, unit: 'dC', decimals: 0 })
	const TWarm = getRandomQuantity({ min: 18, max: 28, unit: 'dC', decimals: 0 })
	const dTCold = getRandomQuantity({ min: 6, max: 16, unit: 'dC', decimals: 0 })
	const dTWarm = getRandomQuantity({ min: 6, max: 16, unit: 'dC', decimals: 0 })
	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)
	return { TCold, TWarm, dTCold, dTWarm, TEvap, TCond }
}

export function getBasicCycle() {
	for (let attempt = 0; attempt < 100; attempt++) {
		const refrigerant = sample(Object.keys(refrigerantDatasets))
		const refrigerantData = refrigerantDatasets[refrigerant]
		const temperatures = getTemperatures()
		const { TEvap, TCond } = temperatures
		const dTSuperheating = getRandomQuantity({ min: 4, max: 12, unit: 'dC', decimals: 0 })
		const dTSubcooling = getRandomQuantity({ min: 4, max: 12, unit: 'dC', decimals: 0 })
		const T1 = TEvap.add(dTSuperheating)
		const T3 = TCond.subtract(dTSubcooling)
		const pEvap = getSaturationPressure(refrigerantData, TEvap)
		const pCond = getSaturationPressure(refrigerantData, TCond)
		if (!pEvap || !pCond) continue
		const point1 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pEvap, T1)
		if (!point1) continue
		const point2 = getRefrigerantPropertiesFromPressureAndEntropy(refrigerantData, pCond, point1.entropy)
		const point3 = getRefrigerantPropertiesFromPressureAndTemperature(refrigerantData, pCond, T3)
		if (!point2 || !point3) continue
		const point4 = getRefrigerantPropertiesFromPressureAndEnthalpy(refrigerantData, pEvap, point3.enthalpy)
		if (!point4) continue
		return { ...temperatures, refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, point1, point2, point3, point4 }
	}
	throw new Error('Failed to generate a valid basic cooling cycle after 100 attempts.')
}

export function getCycle() {
	for (let attempt = 0; attempt < 100; attempt++) {
		const basicCycle = getBasicCycle()
		const { refrigerant, pCond, point1, point2: point2p, point3, point4 } = basicCycle
		const refrigerantData = refrigerantDatasets[refrigerant]
		const etai = getRandomQuantity({ min: 0.7, max: 0.85, unit: '' })
		const wtp = point2p.enthalpy.subtract(point1.enthalpy)
		const wt = wtp.divide(etai)
		const h2 = point1.enthalpy.add(wt)
		const point2 = getRefrigerantPropertiesFromPressureAndEnthalpy(refrigerantData, pCond, h2)
		if (!point2) continue
		const qin = point1.enthalpy.subtract(point4.enthalpy)
		const qout = point2.enthalpy.subtract(point3.enthalpy)
		const epsilon = qin.divide(wt).setUnit('')
		const COP = qout.divide(wt).setUnit('')
		const mdot = getRandomQuantity({ min: 20, max: 200, unit: 'g/s', decimals: -1 }).setDecimals(0)
		const P = mdot.multiply(wt).setUnit('kW')
		return { ...basicCycle, point2, point2p, wt, wtp, etai, qin, qout, epsilon, COP, mdot, P }
	}
	throw new Error('Failed to generate a valid cooling cycle after 100 attempts.')
}
