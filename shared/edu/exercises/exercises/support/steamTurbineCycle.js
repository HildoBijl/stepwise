const { getRandomFloatUnit } = require('../../../../inputTypes/FloatUnit')
const { withPressure, enthalpy, entropy } = require('../../../../data/steamProperties')
const { numberArray } = require('../../../../util/arrays')
const { selectRandomly, getRandomInteger } = require('../../../../util/random')
const { tableInterpolate } = require('../../../../util/interpolation')

function getCycle() {
	// Pressure in the condensor and evaporator.
	const pressureRangeTable1 = withPressure.boilingTemperature.headers[0]
	const condenserIndex = getRandomInteger(3, 8) // Index in the pressure tables.
	const pc = pressureRangeTable1[condenserIndex] // 0.1 to 1 bar
	const Tc = withPressure.boilingTemperature.grid[condenserIndex]
	const pressureRangeTable2 = enthalpy.headers[0]
	const evaporatorIndex = getRandomInteger(13, 19) // Index in the enthalpy tables.
	const pe = pressureRangeTable2[evaporatorIndex] // 50 to 120 bar
	const Te = tableInterpolate(pe, withPressure.boilingTemperature)

	// Turbine output state.
	const x3 = getRandomFloatUnit({
		min: 0.95,
		max: 1.00,
		unit: '',
	})

	// Check which row (that is, temperature) from the enthalpy table is suitable. Pick one randomly from it.
	const temperatureIndexOptions = numberArray(3, 25).filter(temperatureIndex => {
		// Check that the temperature is above the evaporator temperature.
		const T = enthalpy.headers[1][temperatureIndex]
		if (T < Te)
			return false

		// Calculate cycle properties and check if they match important requirements.
		const { h0, h1, s0, s1, h2, s2, s3p, x3p, h3p, s3, h3, etai } = getCycleProperties(condenserIndex, evaporatorIndex, temperatureIndex, x3)
		if (x3p.number >= x3.number)
			return false
		if (etai < 0.8 || etai > 1.0)
			return false
		return true
	})
	const temperatureIndex = selectRandomly(temperatureIndexOptions)
	const T2 = enthalpy.headers[1][temperatureIndex]

	// Find all remaining properties.
	const { hx0, hx1, sx0, sx1, h2, s2, s3p, x3p, h3p, s3, h3, etai } = getCycleProperties(condenserIndex, evaporatorIndex, temperatureIndex, x3)

	// Find points 1 and 4.
	const h4 = hx0
	const s4 = sx0
	const T4 = Tc
	const p4 = pc
	const h1 = h4
	const s1 = s4
	const T1 = T4
	const p1 = pe

	// Find remaining data.
	const p2 = pe
	const p3 = pc
	const T3 = Tc

	// Define mass flow and use it to find other parameters.
	const mdot = getRandomFloatUnit({
		min: 20*2,
		max: 80*2,
		decimals: -1,
		unit: 'kg/s',
	}).divide(2).setDecimals(0) // Apply intervals of 5 kg/s.
	const P = mdot.multiply(h2.subtract(h3)).setUnit('MW')
	const Ph = mdot.multiply(h2.subtract(h1)).setUnit('MW')
	const eta = h2.subtract(h3).divide(h2.subtract(h1)).setUnit('')

	// Gather all data and return it.
	return { pc, Tc, pe, Te, hx0, hx1, sx0, sx1, h1, s1, p1, T1, h2, s2, p2, T2, x3p, h3p, s3p, x3, h3, s3, p3, T3, h4, s4, p4, T4, etai, mdot, P, Ph, eta }
}
module.exports.getCycle = getCycle

function getCycleProperties(condenserIndex, evaporatorIndex, temperatureIndex, x3) {
	// Find liquid and vapor points.
	const hx0 = withPressure.enthalpyLiquid.grid[condenserIndex]
	const hx1 = withPressure.enthalpyVapor.grid[condenserIndex]
	const sx0 = withPressure.entropyLiquid.grid[condenserIndex]
	const sx1 = withPressure.entropyVapor.grid[condenserIndex]

	// Find properties of point 2.
	const h2 = enthalpy.grid[temperatureIndex][evaporatorIndex]
	const s2 = entropy.grid[temperatureIndex][evaporatorIndex]
	
	// Find properties of point 3p.
	const s3p = s2
	const x3p = s3p.subtract(sx0).divide(sx1.subtract(sx0)).setUnit('')
	const h3p = hx0.add(x3p.multiply(hx1.subtract(hx0)))

	// Find properties of point 3.
	const h3 = hx0.add(x3.multiply(hx1.subtract(hx0)))
	const s3 = sx0.add(x3.multiply(sx1.subtract(sx0)))

	// Find isentropic efficiency.
	const etai = h2.subtract(h3).divide(h2.subtract(h3p)).setUnit('')

	return { hx0, hx1, sx0, sx1, h2, s2, s3p, x3p, h3p, s3, x3, h3, etai }
}