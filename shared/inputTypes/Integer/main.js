const { InterpretationError } = require('../../util')

// An Integer coming from an input field is stored as a string. In this way we can remember what exactly the user put in. It is transformed into an integer on the SItoFO transformation.
module.exports.SItoFO = (value) => {
	if (value === '' || value === undefined)
		throw new InterpretationError(`Empty`, undefined, 'Could not interpret an empty string into a number.')
	if (value === '-')
		throw new InterpretationError(`MinusSign`, undefined, 'Could not interpret a number consisting of only a minus sign.')
	return parseInt(value)
}

module.exports.FOtoSI = (integer) => {
	return integer.toString()
}

// Input object legacy: the integer used to be stored inside an object, even for the state. The function below unpacks it. It can be removed once the old exercise data is deleted.
module.exports.SOtoFO = module.exports.SItoFO
