const { FloatUnit } = require('../inputTypes/FloatUnit')
module.exports = {
	air: new FloatUnit('287.05 J / kg * K'),
	argon: new FloatUnit('208.13 J / kg * K'),
	carbonDioxide: new FloatUnit('188.92 J / kg * K'),
	carbonMonoxide: new FloatUnit('296.84 J / kg * K'),
	helium: new FloatUnit('2077.1 J / kg * K'),
	hydrogen: new FloatUnit('4124.2 J / kg * K'),
	methane: new FloatUnit('518.28 J / kg * K'),
	nitrogen: new FloatUnit('296.80 J / kg * K'),
	oxygen: new FloatUnit('259.84 J / kg * K'),
}