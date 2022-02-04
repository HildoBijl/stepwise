const strToSI = require('./strToSI')
const SItoFO = require('./SItoFO')

function strToFO(str, settings) {
	return SItoFO(strToSI(str, settings), settings)
}
module.exports = strToFO
