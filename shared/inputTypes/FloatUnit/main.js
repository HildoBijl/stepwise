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
	float: FO.float.SI,
	unit: FO.unit.SI,
})

module.exports.SOtoFO = SO => FloatUnit(SO)
