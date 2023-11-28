const { SItoFO: floatSItoFO, FOtoSI: floatFOtoSI, SOtoFO: floatSOtoFO } = require('../Float')
const { SItoFO: unitSItoFO, FOtoSI: unitFOtoSI, SOtoFO: unitSOtoFO } = require('../Unit')

const { FloatUnit } = require('./FloatUnit')

module.exports.SItoFO = ({ float, unit }) => {
	return new FloatUnit({
		float: floatSItoFO(float || {}),
		unit: unitSItoFO(unit || {}),
	})
}

module.exports.FOtoSI = FO => ({
	float: floatFOtoSI(FO.float),
	unit: unitFOtoSI(FO.unit),
})

module.exports.SOtoFO = SO => {
	// Input object legacy: use the individual SOtoFO functions. If the old data types are removed, a simple "return new FloatUnit(SO)" would suffice.
	return new FloatUnit({
		float: floatSOtoFO(SO.float),
		unit: unitSOtoFO(SO.unit),
	})
}
