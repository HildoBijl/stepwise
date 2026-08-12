import { mapValues } from '@step-wise/utils'
import { FloatUnit } from '@step-wise/physics-core'

export type GasProperties = {
	Rs: FloatUnit // Specific gas constant.
	k: FloatUnit // Heat capacity ratio.
	cv: FloatUnit // Specific heat at constant volume.
	cp: FloatUnit // Specific heat at constant pressure.
}

// Define only Rs and k for the gases.
const baseGasProperties = {
	air: {
		Rs: new FloatUnit('287.05 J / kg * K'),
		k: new FloatUnit('1.400'),
	},
	argon: {
		Rs: new FloatUnit('208.13 J / kg * K'),
		k: new FloatUnit('1.667'),
	},
	carbonDioxide: {
		Rs: new FloatUnit('188.92 J / kg * K'),
		k: new FloatUnit('1.289'),
	},
	carbonMonoxide: {
		Rs: new FloatUnit('296.84 J / kg * K'),
		k: new FloatUnit('1.410'),
	},
	helium: {
		Rs: new FloatUnit('2077.1 J / kg * K'),
		k: new FloatUnit('1.667'),
	},
	hydrogen: {
		Rs: new FloatUnit('4124.2 J / kg * K'),
		k: new FloatUnit('1.405'),
	},
	methane: {
		Rs: new FloatUnit('518.28 J / kg * K'),
		k: new FloatUnit('1.304'),
	},
	nitrogen: {
		Rs: new FloatUnit('296.80 J / kg * K'),
		k: new FloatUnit('1.400'),
	},
	oxygen: {
		Rs: new FloatUnit('259.84 J / kg * K'),
		k: new FloatUnit('1.395'),
	},
} as const
export type GasName = keyof typeof baseGasProperties

// Derive cp and cv for the gases.
export const gasProperties: Record<GasName, GasProperties> = mapValues(baseGasProperties, (gas) => {
		const Rs = gas.Rs.setSignificantDigits(4)
		const cv = Rs.divide(gas.k.float.subtract(1)).setMinimumSignificantDigits(4)
		const cp = cv.multiply(gas.k).setMinimumSignificantDigits(4)
		return { Rs, k: gas.k, cv, cp }
})
