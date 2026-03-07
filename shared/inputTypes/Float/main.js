const { InterpretationError } = require('../../util')

const { getSignificantDigits } = require('./util')
const { Float } = require('./Float')

module.exports.SItoFO = (value) => {
	let { number, power } = value

	// Check for boundary cases.
	if (number === '' || number === undefined)
		throw new InterpretationError('Could not interpret an empty string into a number.', `Empty`)
	if (number === '-' || number === '-.')
		throw new InterpretationError('Could not interpret a number consisting of only a minus sign.', `MinusSign`)
	if (number === '.')
		throw new InterpretationError('Could not interpret a number consisting of only a decimal separator.', `DecimalSeparator`)
	if (power === '-')
		throw new InterpretationError('Could not interpret a number consisting of only a decimal separator.', `DecimalSeparator`)

	// Set up a float with the given properties.
	power = (power === undefined || power === '' ? 0 : parseInt(power))
	return new Float({
		number: parseFloat(number) * Math.pow(10, power),
		significantDigits: getSignificantDigits(number),
		power,
	})
}

module.exports.FOtoSI = (float) => {
	const power = float.getDisplayPower()
	return {
		number: float.getDisplayNumber(power),
		power: power === 0 ? '' : power.toString(),
	}
}

module.exports.SOtoFO = SO => new Float(SO)
