const { SItoFO: floatSItoFO } = require('../Float')
const { SItoFO: unitSItoFO } = require('../Unit')

const { FloatUnit } = require('./FloatUnit')

module.exports.SItoFO = ({ float, unit }) => {
	return new FloatUnit({
		float: floatSItoFO(float || {}),
		unit: unitSItoFO(unit || {}),
	})
}

module.exports.FOtoSI = FO => FO.SI

module.exports.SOtoFO = SO => new FloatUnit(SO)
