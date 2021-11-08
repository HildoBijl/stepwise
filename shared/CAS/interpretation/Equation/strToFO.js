const strToIO = require('./strToIO')
const IOtoFO = require('./IOtoFO')

function strToFO(str, settings) {
	return IOtoFO(strToIO(str, settings), settings)
}
module.exports = strToFO
