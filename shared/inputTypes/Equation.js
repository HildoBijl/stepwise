// An Equation is an input type containing two expressions with an equals sign in-between.
 
const { pickFromDefaults, omitDefaults } = require('@step-wise/utils')
const { stringToInputValue, defaultInterpretationSettings, defaultExpressionSettings } = require('@step-wise/math-input-value')
const { Equation, asEquation, serializeExpression, deserializeEquation } = require('@step-wise/cas')
 
module.exports.Equation = Equation
module.exports.SOtoFO = (SO, equationSettings) => Equation.fromStorageValue(SO, equationSettings)
module.exports.SItoFO = (value, expressionInterpretationSettings) => asEquation({
	type: 'Equation',
	value,
	interpretationSettings: omitDefaults(pickFromDefaults(expressionInterpretationSettings ?? {}, defaultInterpretationSettings), defaultInterpretationSettings),
	expressionSettings: omitDefaults(pickFromDefaults(expressionInterpretationSettings ?? {}, defaultExpressionSettings), defaultExpressionSettings),
})
module.exports.FOtoSI = (equation) => stringToInputValue(equation.toString(), equation.getInterpretationSettings(), equation.settings).value
module.exports.FOtoSO = (equation) => equation.toStorageValue()
