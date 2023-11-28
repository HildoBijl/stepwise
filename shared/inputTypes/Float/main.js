const { InterpretationError } = require('../../util')

const { getSignificantDigits } = require('./util')
const { Float } = require('./Float')

module.exports.SItoFO = (value) => {
	let { number, power } = value

	// Check for boundary cases.
	if (number === '' || number === undefined)
		throw new InterpretationError(`Empty`, undefined, 'Could not interpret an empty string into a number.')
	if (number === '-' || number === '-.')
		throw new InterpretationError(`MinusSign`, undefined, 'Could not interpret a number consisting of only a minus sign.')
	if (number === '.')
		throw new InterpretationError(`DecimalSeparator`, undefined, 'Could not interpret a number consisting of only a decimal separator.')
	if (power === '-')
		throw new InterpretationError(`DecimalSeparator`, undefined, 'Could not interpret a number consisting of only a decimal separator.')

	// Input object legacy: in older data formats an empty power was stored as an empty string. Convert this.
	if (power === '')
		power = undefined

	// Set up a float with the given properties.
	return new Float({
		number: parseFloat(number) * Math.pow(10, power || 0),
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

module.exports.SOtoFO = SO => {
	// Input object legacy: if the number is a string, the SO is actually an SI. This is the old way of storing floats from the state.
	if (typeof SO.number === 'string')
		return module.exports.SItoFO(SO)

	// Input object legacy: if the power is an empty string, turn it into undefined.
	if (SO.power === '')
		SO = { ...SO, power: undefined }

	// The regular way of getting the FO.
	return new Float(SO)
}
