import { interpolateTable, interpolateTableInput } from '@step-wise/interpolation'
import { getRandomQuantity } from '@step-wise/physics-core'
import { maximumHumidity } from '@step-wise/physics-data'

export function getCycle() {
	const T1 = getRandomQuantity({ min: 22, max: 35, unit: 'dC', decimals: 0 })
	const T4 = getRandomQuantity({ min: 14, max: 20, unit: 'dC', decimals: 0 })
	const startAHmax = interpolateTable(T1, maximumHumidity)!
	const endAHmax = interpolateTable(T4, maximumHumidity)!
	const endRH = getRandomQuantity({ min: 0.45, max: 0.6, unit: '' })
	const endAH = endRH.multiply(endAHmax)
	const startAH = getRandomQuantity({ min: Math.min(endAH.number * 1.2, startAHmax.number), max: startAHmax.number, unit: endAH.unit })
	const startRH = startAH.divide(startAHmax).simplify()
	const T2 = interpolateTableInput(startAH, maximumHumidity)!
	const T3 = interpolateTableInput(endAH, maximumHumidity)!
	return { T1, T2, T3, T4, startRH, startAH, startAHmax, endRH, endAH, endAHmax }
}
