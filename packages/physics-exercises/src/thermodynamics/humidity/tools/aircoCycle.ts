import { interpolateTable, interpolateTableInput } from '@step-wise/interpolation'
import { getRandomQuantity } from '@step-wise/physics-core'
import { maximumHumidityByTemperature } from '@step-wise/physics-data'

export function getCycle() {
	const T1 = getRandomQuantity({ min: 22, max: 35, unit: 'dC', decimals: 0 })
	const T4 = getRandomQuantity({ min: 14, max: 20, unit: 'dC', decimals: 0 })
	const startAHmax = interpolateTable(T1, maximumHumidityByTemperature)!
	const endAHmax = interpolateTable(T4, maximumHumidityByTemperature)!
	const endRH = getRandomQuantity({ min: 0.45, max: 0.6, unit: '' })
	const endAH = endRH.multiply(endAHmax)
	const startAH = getRandomQuantity({ min: Math.min(endAH.number * 1.2, startAHmax.number), max: startAHmax.number, unit: endAH.unit })
	const startRH = startAH.divide(startAHmax).simplify()
	const T2 = interpolateTableInput(startAH, maximumHumidityByTemperature)!
	const T3 = interpolateTableInput(endAH, maximumHumidityByTemperature)!
	return { T1, T2, T3, T4, startRH, startAH, startAHmax, endRH, endAH, endAHmax }
}
