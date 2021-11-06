const strToIO = require('./strToIO')
const IOtoFO = require('./IOtoFO')

function strToFO(str) {
	return IOtoFO(strToIO(str))
}
module.exports = strToFO
