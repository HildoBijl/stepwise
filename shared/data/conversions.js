const { FloatUnit } = require('../inputTypes/FloatUnit')
module.exports = {
	pressure: new FloatUnit('10^5 Pa/bar'),
	temperature: new FloatUnit('273.15 K'),
	massGram: new FloatUnit('10^3 g/kg'),
	volumeLiter: new FloatUnit('10^3 l/m^3'),
	volumeCubicCentimeter: new FloatUnit('10^6 cm^3/m^3'),
}