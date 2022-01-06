const { getRandomFloatUnit } = require('../../../../inputTypes/FloatUnit')
const refrigerantProperties = require('../../../../data/refrigerantProperties')

function getTemperatures() {
	const Tcold = getRandomFloatUnit({
		min: 1,
		max: 8,
		unit: 'dC',
		decimals: 0,
	})
	const Twarm = getRandomFloatUnit({
		min: 18,
		max: 25,
		unit: 'dC',
		decimals: 0,
	})
	const dTcold = getRandomFloatUnit({
		min: 4,
		max: 12,
		unit: 'dC',
		decimals: 0,
	})
	const dTwarm = getRandomFloatUnit({
		min: 6,
		max: 16,
		unit: 'dC',
		decimals: 0,
	})

	const Tevap = Tcold.subtract(dTcold)
	const Tcond = Twarm.add(dTwarm)

	return { Tcold, Twarm, dTcold, dTwarm, Tevap, Tcond }
}
module.exports.getTemperatures = getTemperatures

function getBasicCycle() {
	// Determine refrigerant type.
	const refrigerant = selectRandomly(refrigerantProperties.types)
	const refrigerantData = refrigerantProperties[refrigerant]

	// Determine temperatures.
	const temperatures = getTemperatures()
	const { Tevap, Tcond } = temperatures
	const dTSuperheating = getRandomFloatUnit({ min: 4, max: 12, unit: 'dC', decimals: 0 })
	const dTSubcooling = getRandomFloatUnit({ min: 4, max: 12, unit: 'dC', decimals: 0 })
	const T1 = Tevap.add(dTSuperheating)
	const T3 = Tcond.subtract(dTSubcooling)

	// Determine pressures.
	const pEvap = refrigerantProperties.getBoilingPressure(Tevap, refrigerantData)
	const pCond = refrigerantProperties.getBoilingPressure(Tcond, refrigerantData)

	// Determine the relevant points.
	const point1 = refrigerantProperties.getProperties(pEvap, T1, refrigerantData)
	const point2 = refrigerantProperties.getProperties(pCond, point1.entropy, refrigerantData)
	const point3 = refrigerantProperties.getProperties(pCond, T3, refrigerantData)
	const point4 = refrigerantProperties.getProperties(pEvap, point3.enthalpy, refrigerantData)

	// Export everything together.
	return { ...temperatures, pEvap, pCond, dTSuperheating, dTSubcooling, point1, point2, point3, point4 }
}
module.exports.getBasicCycle = getBasicCycle

function getCycle() {
	const basicCycle = getBasicCycle()
	const { point1, point2: point2p, point3, point4 } = basicCycle

	// Determine and apply isentropic efficiency.
	const etai = getRandomFloatUnit({ min: 0.85, max: 0.98, unit: '' })
	const wtp = point2p.enthalpy.subtract(point1.enthalpy)
	const wt = wtp.divide(etai)
	const h2 = point1.enthalpy.add(wt)
	const point2 = refrigerantProperties.getProperties(pCond, h2, refrigerantData)

	// Determine heat, work and efficiency.
	const qin = point1.enthalpy.subtract(point4.enthalpy)
	const qout = point2.enthalpy.subtract(point3.enthalpy)
	const epsilon = qin.divide(wt).setUnit('')
	const COP = qout.divide(wt).setUnit('')

	// Determine and apply mass flow.
	const mdot = getRandomFloatUnit({ min: 20, max: 200, unit: 'g/s', decimals: -1 }).setDecimals(0)
	const P = mdot.multiplyBy(wt).setUnit('kW')

	// Assemble all data.
	return { ...basicCycle, point2, point2p, epsilon, wt, qin, qout, COP, mdot, P }
}
module.exports.getCycle = getCycle