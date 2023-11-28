// Input object legacy: in the past Strings were stored as { type: 'String', value: 'someString' } or even { type: 'String', value: { value: 'someString' } } but this was overkill. The function below turns these old types into a simple string 'someString'. It can be entirely deleted once old data types are cleared out.

module.exports.SOtoFO = SI => {
	if (typeof SI === 'string')
		return SI
	if (typeof SI === 'object' && typeof SI.value === 'string')
		return SI.value
	throw new Error(`Invalid String destructuring case: could not figure out how to turn the parameter of type "String" into an actual string. Given was "${JSON.stringify(SI)}".`)
}
