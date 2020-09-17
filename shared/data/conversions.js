const { FloatUnit } = require('../inputTypes/FloatUnit')
module.exports = {
	pressure: new FloatUnit('10^5 Pa/bar'),
	temperature: new FloatUnit('273.15 K'),
}