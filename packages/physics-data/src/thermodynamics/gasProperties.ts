import { mapValues } from '@step-wise/js-utils'
import { Quantity } from '@step-wise/physics-core'

export type GasProperties = {
	Rs: Quantity // Specific gas constant.
	k: Quantity // Heat capacity ratio.
	cv: Quantity // Specific heat at constant volume.
	cp: Quantity // Specific heat at constant pressure.
}

// Define only Rs and k for the gases.
const baseGasProperties = {
	air: {
		Rs: new Quantity('287.05 J / kg * K'),
		k: new Quantity('1.400'),
	},
	argon: {
		Rs: new Quantity('208.13 J / kg * K'),
		k: new Quantity('1.667'),
	},
	carbonDioxide: {
		Rs: new Quantity('188.92 J / kg * K'),
		k: new Quantity('1.289'),
	},
	carbonMonoxide: {
		Rs: new Quantity('296.84 J / kg * K'),
		k: new Quantity('1.410'),
	},
	helium: {
		Rs: new Quantity('2077.1 J / kg * K'),
		k: new Quantity('1.667'),
	},
	hydrogen: {
		Rs: new Quantity('4124.2 J / kg * K'),
		k: new Quantity('1.405'),
	},
	methane: {
		Rs: new Quantity('518.28 J / kg * K'),
		k: new Quantity('1.304'),
	},
	nitrogen: {
		Rs: new Quantity('296.80 J / kg * K'),
		k: new Quantity('1.400'),
	},
	oxygen: {
		Rs: new Quantity('259.84 J / kg * K'),
		k: new Quantity('1.395'),
	},
} as const
export type GasName = keyof typeof baseGasProperties

// Derive cp and cv for the gases.
export const gasProperties: Record<GasName, GasProperties> = mapValues(baseGasProperties, (gas) => {
		const Rs = gas.Rs.setSignificantDigits(4)
		const cv = Rs.divide(gas.k.value.subtract(1)).setMinimumSignificantDigits(4)
		const cp = cv.multiply(gas.k).setMinimumSignificantDigits(4)
		return { Rs, k: gas.k, cv, cp }
})
