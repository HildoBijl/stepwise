const { FloatUnit } = require('../inputTypes/FloatUnit')
const { Float } = require('../inputTypes/Float')

// Define initial properties.
const gases = {
	air: {
		Rs: new FloatUnit('287.05 J / kg * K'),
		k: new FloatUnit('1.40'),
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
		k: new FloatUnit('1.40'),
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
}

// Calculate derived properties.
Object.values(gases).forEach(gas => {
	gas.cv = gas.Rs.divide(gas.k.number - 1).useSignificantDigits(3)
	gas.cp = gas.cv.multiply(gas.k)
})

module.exports = gases