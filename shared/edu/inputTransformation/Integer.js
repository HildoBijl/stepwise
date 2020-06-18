const { isInt } = require('../../util/number')

function isFOofType(param) {
	return typeof param === 'number' && isInt(param)
}

function FOtoIO(num) {
	return {
		type: 'Integer',
		value: param.toString(),
	}
}

function IOtoFO(value) {
	if (value === '' || value === '-')
		return 0
	return parseInt(value)
}

module.exports = {
	FOtoIO,
	IOtoFO,
	isFOofType,
}