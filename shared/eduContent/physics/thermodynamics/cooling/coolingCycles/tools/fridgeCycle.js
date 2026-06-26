const { sample } = require('@step-wise/utils')
const { getRandomFloatUnit } = require('@step-wise/physics-core')
const { refrigerants, getBoilingPressure, getRefrigerantPropertiesFromTemperature, getRefrigerantPropertiesFromEnthalpy, getRefrigerantPropertiesFromEntropy } = require('@step-wise/physics-data')

function getTemperatures() {
	const TCold = getRandomFloatUnit({
		min: -4,
		max: 6,
		unit: 'dC',
		decimals: 0,
	})
	const TWarm = getRandomFloatUnit({
		min: 18,
		max: 28,
		unit: 'dC',
		decimals: 0,
	})
	const dTCold = getRandomFloatUnit({
		min: 6,
		max: 16,
		unit: 'dC',
		decimals: 0,
	})
	const dTWarm = getRandomFloatUnit({
		min: 6,
		max: 16,
		unit: 'dC',
		decimals: 0,
	})

	const TEvap = TCold.subtract(dTCold)
	const TCond = TWarm.add(dTWarm)

	return { TCold, TWarm, dTCold, dTWarm, TEvap, TCond }
}
module.exports.getTemperatures = getTemperatures

function getBasicCycle() {
	// Determine refrigerant type.
	const refrigerant = sample(Object.keys(refrigerants))
	const refrigerantData = refrigerants[refrigerant]

	// Determine temperatures.
	const temperatures = getTemperatures()
	const { TEvap, TCond } = temperatures
	const dTSuperheating = getRandomFloatUnit({ min: 4, max: 12, unit: 'dC', decimals: 0 })
	const dTSubcooling = getRandomFloatUnit({ min: 4, max: 12, unit: 'dC', decimals: 0 })
	const T1 = TEvap.add(dTSuperheating)
	const T3 = TCond.subtract(dTSubcooling)

	// Determine pressures.
	const pEvap = getBoilingPressure(refrigerantData, TEvap)
	const pCond = getBoilingPressure(refrigerantData, TCond)

	// Determine the relevant points.
	const point1 = getRefrigerantPropertiesFromTemperature(refrigerantData, pEvap, T1)
	const point2 = getRefrigerantPropertiesFromEntropy(refrigerantData, pCond, point1.entropy)
	const point3 = getRefrigerantPropertiesFromTemperature(refrigerantData, pCond, T3)
	const point4 = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pEvap, point3.enthalpy)

	// Export everything together.
	return { ...temperatures, refrigerant, pEvap, pCond, dTSuperheating, dTSubcooling, point1, point2, point3, point4 }
}
module.exports.getBasicCycle = getBasicCycle

function getCycle() {
	const basicCycle = getBasicCycle()
	const { refrigerant, pCond, point1, point2: point2p, point3, point4 } = basicCycle
	const refrigerantData = refrigerants[refrigerant]

	// Determine and apply isentropic efficiency.
	const etai = getRandomFloatUnit({ min: 0.7, max: 0.85, unit: '' })
	const wtp = point2p.enthalpy.subtract(point1.enthalpy)
	const wt = wtp.divide(etai)
	const h2 = point1.enthalpy.add(wt)
	const point2 = getRefrigerantPropertiesFromEnthalpy(refrigerantData, pCond, h2)

	// Determine heat, work and efficiency.
	const qin = point1.enthalpy.subtract(point4.enthalpy)
	const qout = point2.enthalpy.subtract(point3.enthalpy)
	const epsilon = qin.divide(wt).setUnit('')
	const COP = qout.divide(wt).setUnit('')

	// Determine and apply mass flow.
	const mdot = getRandomFloatUnit({ min: 20, max: 200, unit: 'g/s', decimals: -1 }).setDecimals(0)
	const P = mdot.multiply(wt).setUnit('kW')

	// Assemble all data.
	return { ...basicCycle, point2, point2p, epsilon, wt, wtp, etai, qin, qout, epsilon, COP, mdot, P }
}
module.exports.getCycle = getCycle
