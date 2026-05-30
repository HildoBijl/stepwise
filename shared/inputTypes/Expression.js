// The Expression class represents any type of mathematical expression, including with brackets, fractions, functions, variables with subscripts, powers and more. It does NOT include an equals sign or other form of comparison: that would make it an equation or inequality.

const { pickFromDefaults, omitDefaults } = require('@step-wise/utils')
const { stringToInputValue, defaultInterpretationSettings, defaultExpressionSettings } = require('@step-wise/math-input-value')
const { Expression, asExpression, serializeExpression, deserializeExpression } = require('@step-wise/cas')

module.exports.Expression = Expression
module.exports.SOtoFO = (SO, expressionSettings) => Expression.fromStorageValue(SO, expressionSettings)
module.exports.SItoFO = (value, expressionInterpretationSettings) => asExpression({
	type: 'Expression',
	value,
	interpretationSettings: omitDefaults(pickFromDefaults(expressionInterpretationSettings ?? {}, defaultInterpretationSettings), defaultInterpretationSettings),
	expressionSettings: omitDefaults(pickFromDefaults(expressionInterpretationSettings ?? {}, defaultExpressionSettings), defaultExpressionSettings),
})
module.exports.FOtoSI = (expression) => stringToInputValue(expression.toString(), expression.getInterpretationSettings(), expression.settings).value
module.exports.FOtoSO = (expression) => expression.toStorageValue()
